import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus, Sparkles, X } from "lucide-react";
import { generateProteinRecipe, recreateFood } from "../api/ai";
import { getErrorMessage, isCanceled } from "../api/client";
import { useToast } from "../context/ToastContext";
import { readJSON, removeKey, writeJSON } from "../hooks/useLocalJSON";
import { useUserKey } from "../hooks/useSaved";
import { buildMedicalNote } from "../utils/ai";
import GeneratingPanel from "../components/GeneratingPanel";
import { Button } from "../components/ui/Button";
import { Chip, ChipGroup } from "../components/ui/Chip";

const INGREDIENT_IDEAS = ["Paneer", "Chicken", "Eggs", "Tofu", "Lentils", "Chickpeas", "Spinach", "Broccoli", "Rice", "Oats", "Yogurt", "Mushrooms"];
const DIET_CHIPS = ["Vegetarian", "Vegan", "High protein", "Low carb", "Low oil", "Gluten-free"];
const ALLERGY_CHIPS = ["Nuts", "Dairy", "Gluten", "Eggs", "Shellfish", "Soy"];

const has = (list, value) => list.some((x) => x.toLowerCase() === value.toLowerCase());
const toggleIn = (list, value) => (has(list, value) ? list.filter((x) => x.toLowerCase() !== value.toLowerCase()) : [...list, value]);

// Free-text chip entry (type + Enter/comma), with tap-to-add suggestions above.
function ChipInput({ id, items, setItems, placeholder, label }) {
  const [value, setValue] = useState("");
  const add = () => {
    const v = value.trim();
    if (v && !has(items, v)) setItems((prev) => [...prev, v]);
    setValue("");
  };
  return (
    <div className="input-field flex flex-wrap gap-1.5 items-center min-h-[52px] focus-within:border-orange-700 focus-within:shadow-[0_0_0_3px_var(--color-orange-100)]">
      {items.map((item) => (
        <span key={item} className="flex items-center gap-1 bg-orange-100 text-orange-800 text-[13px] font-medium pl-3 pr-1 py-0.5 rounded-full">
          {item}
          <button
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() => setItems(items.filter((x) => x !== item))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-200"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        aria-label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !value && items.length) {
            setItems(items.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={items.length === 0 ? placeholder : "Add another..."}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-[16px] min-h-10"
      />
    </div>
  );
}

function Section({ title, hint, children, id }) {
  return (
    <section aria-labelledby={id} className="card p-5 sm:p-6">
      <h2 id={id} className="font-display text-xl">{title}</h2>
      {hint && <p className="text-[13px] text-ink-soft mt-0.5 mb-3">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </section>
  );
}

export default function AiCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const draftKey = useUserKey("ai_draft");
  const prefill = location.state || {};

  // Start from (in order): what a previous page handed over, then any unsent draft.
  const [initial] = useState(() => {
    const draft = readJSON(draftKey, {});
    const fromPage = Object.keys(prefill).length > 0;
    const base = fromPage ? {} : draft;
    return {
      mode: prefill.mode || base.mode || "new",
      ingredient: prefill.ingredients || base.ingredient || [],
      servings: prefill.servings || base.servings || 2,
      diet: prefill.diet || base.diet || [],
      allergies: base.allergies || [],
      note: prefill.note ?? base.note ?? "",
      existingFoodname: prefill.existingFoodname || base.existingFoodname || "",
      addOns: prefill.addOns || base.addOns || [],
    };
  });

  const [mode, setMode] = useState(initial.mode);
  const [ingredient, setIngredient] = useState(initial.ingredient);
  const [servings, setServings] = useState(initial.servings);
  const [diet, setDiet] = useState(initial.diet);
  const [allergies, setAllergies] = useState(initial.allergies);
  const [note, setNote] = useState(initial.note);
  const [existingFoodname, setExistingFoodname] = useState(initial.existingFoodname);
  const [addOns, setAddOns] = useState(initial.addOns);

  const [phase, setPhase] = useState("form"); // form | generating | error
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const controllerRef = useRef(null);
  const errorRef = useRef(null);

  // Keep the draft so a refresh or a failed request never loses what was typed.
  useEffect(() => {
    writeJSON(draftKey, { mode, ingredient, servings, diet, allergies, note, existingFoodname, addOns });
  }, [draftKey, mode, ingredient, servings, diet, allergies, note, existingFoodname, addOns]);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (fieldError) errorRef.current?.focus();
  }, [fieldError]);

  const summaryChips = useMemo(
    () => (mode === "new" ? [...ingredient, ...diet] : [existingFoodname, ...addOns].filter(Boolean)),
    [mode, ingredient, diet, existingFoodname, addOns]
  );

  const submit = async (e) => {
    e?.preventDefault();
    if (phase === "generating") return; // no duplicate submissions
    setFieldError("");
    setError("");

    let request;
    if (mode === "new") {
      if (ingredient.length === 0) return setFieldError("Add at least one ingredient so the AI has something to cook with.");
      if (!Number.isInteger(servings) || servings < 1 || servings > 50) return setFieldError("Servings must be between 1 and 50.");
      const anyMedical = buildMedicalNote({ diet, allergies, note });
      request = (config) => generateProteinRecipe({ ingredient, numberofperson: servings, anyMedical }, config);
    } else {
      if (!existingFoodname.trim()) return setFieldError("Enter the dish you want to remix.");
      if (addOns.length === 0) return setFieldError("Add at least one ingredient to mix in.");
      request = (config) => recreateFood({ existingFoodname: existingFoodname.trim(), AddOnIngredient: addOns }, config);
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setPhase("generating");
    try {
      // Backend contract: { success, message, data: HistoryDoc }; recipe is data.recipe.
      const res = await request({ signal: controller.signal });
      const id = res?.data?._id;
      if (!id) throw new Error("missing id");
      removeKey(draftKey);
      toast.success("Recipe generated");
      navigate(`/ai/result/${id}`);
    } catch (err) {
      if (isCanceled(err) || controller.signal.aborted) return;
      // Inputs stay exactly as they were, so retry is one tap.
      setError(getErrorMessage(err, "The AI couldn't finish that recipe."));
      setPhase("error");
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
    setPhase("form");
  };

  if (phase === "generating") {
    return (
      <div className="max-w-xl mx-auto">
        <GeneratingPanel
          title={mode === "new" ? "Creating your recipe" : "Remixing your dish"}
          chips={summaryChips}
          onCancel={cancel}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-2xl" noValidate>
      <h2 className="font-display text-3xl">{mode === "new" ? "What's in your kitchen?" : "Which dish shall we remix?"}</h2>
      <p className="text-[15px] text-ink-soft mt-1 mb-5">
        {mode === "new"
          ? "Answer a few quick questions and FOODAI will write you a full recipe."
          : "Pick a dish and the ingredients you want to mix in."}
      </p>

      <div role="tablist" aria-label="Recipe type" className="grid grid-cols-2 gap-2 mb-5 p-1 bg-cream-2 rounded-2xl">
        {[
          { key: "new", label: "New recipe" },
          { key: "recreate", label: "Remix a dish" },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            role="tab"
            aria-selected={mode === m.key}
            onClick={() => setMode(m.key)}
            className={`min-h-11 rounded-xl text-[14px] font-semibold transition ${
              mode === m.key ? "bg-white text-orange-800 shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {phase === "error" && (
        <div role="alert" className="card !border-red-300 p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-ink">We couldn't create your recipe</p>
            <p className="text-[14px] text-ink-soft">{error} Your answers are still here.</p>
          </div>
          <Button icon={Sparkles} onClick={submit}>Try again</Button>
        </div>
      )}

      <div className="space-y-4">
        {mode === "new" ? (
          <>
            <Section id="s-ingredients" title="What do you have?" hint="Type an ingredient and press Enter, or tap a suggestion.">
              <ChipInput id="ingredients" label="Ingredients" items={ingredient} setItems={setIngredient} placeholder="e.g. paneer, spinach, lentils" />
              <ChipGroup label="Ingredient ideas" className="mt-3">
                {INGREDIENT_IDEAS.map((i) => (
                  <Chip key={i} selected={has(ingredient, i)} onClick={() => setIngredient((prev) => toggleIn(prev, i))}>
                    {i}
                  </Chip>
                ))}
              </ChipGroup>
            </Section>

            <Section id="s-servings" title="How many are eating?">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Fewer servings"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  disabled={servings <= 1}
                  className="icon-btn !w-12 !h-12"
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <div className="min-w-24 text-center" aria-live="polite">
                  <p className="text-3xl font-bold tabular-nums">{servings}</p>
                  <p className="text-[13px] text-ink-soft">{servings === 1 ? "serving" : "servings"}</p>
                </div>
                <button
                  type="button"
                  aria-label="More servings"
                  onClick={() => setServings((s) => Math.min(50, s + 1))}
                  disabled={servings >= 50}
                  className="icon-btn !w-12 !h-12"
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </Section>

            <Section id="s-diet" title="Any diet preferences?" hint="Choose all that apply.">
              <ChipGroup label="Dietary preferences">
                {DIET_CHIPS.map((d) => (
                  <Chip key={d} selected={has(diet, d)} onClick={() => setDiet((prev) => toggleIn(prev, d))}>
                    {d}
                  </Chip>
                ))}
              </ChipGroup>
            </Section>

            <Section id="s-allergies" title="Anything to avoid?" hint="Allergies are treated as strict exclusions.">
              <ChipGroup label="Allergies">
                {ALLERGY_CHIPS.map((a) => (
                  <Chip key={a} selected={has(allergies, a)} onClick={() => setAllergies((prev) => toggleIn(prev, a))}>
                    {a}
                  </Chip>
                ))}
              </ChipGroup>
              <div className="mt-3">
                <ChipInput id="other-allergies" label="Other allergies" items={allergies.filter((a) => !has(ALLERGY_CHIPS, a))} setItems={(next) => {
                  const resolved = typeof next === "function" ? next(allergies.filter((a) => !has(ALLERGY_CHIPS, a))) : next;
                  setAllergies([...allergies.filter((a) => has(ALLERGY_CHIPS, a)), ...resolved]);
                }} placeholder="Something else? Type it here" />
              </div>
            </Section>

            <Section id="s-note" title="Anything else we should know?" hint="Optional: a medical or dietary note, or what you're craving.">
              <label htmlFor="note" className="sr-only">Optional medical or dietary note</label>
              <textarea
                id="note"
                className="input-field min-h-[88px] resize-none"
                placeholder="e.g. diabetic-friendly, low sodium, kid-friendly"
                value={note}
                maxLength={300}
                onChange={(e) => setNote(e.target.value)}
              />
            </Section>
          </>
        ) : (
          <Section id="s-remix" title="Your dish" hint="For example: Chicken Biryani">
            <label htmlFor="dish-name" className="text-[14px] font-semibold text-ink block mb-1.5">Dish name</label>
            <input
              id="dish-name"
              className="input-field"
              placeholder="e.g. Chicken Biryani"
              value={existingFoodname}
              onChange={(e) => setExistingFoodname(e.target.value)}
            />
            <p className="text-[14px] font-semibold text-ink mt-4 mb-1.5">Ingredients to mix in</p>
            <ChipInput id="addons" label="Ingredients to mix in" items={addOns} setItems={setAddOns} placeholder="e.g. mushrooms, extra chili" />
          </Section>
        )}
      </div>

      {fieldError && (
        <p ref={errorRef} tabIndex={-1} role="alert" className="text-[14px] font-medium text-danger mt-4 outline-none">
          {fieldError}
        </p>
      )}

      {/* Sticky on phones so the main action is always within thumb reach. */}
      <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] lg:bottom-4 z-20 mt-6 py-3 bg-gradient-to-t from-cream via-cream/95 to-transparent">
        <Button type="submit" size="lg" icon={Sparkles} className="w-full">
          {mode === "new" ? "Create My Recipe" : "Remix My Dish"}
        </Button>
      </div>
    </form>
  );
}
