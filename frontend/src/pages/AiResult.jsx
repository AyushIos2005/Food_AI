import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChefHat,
  Clock,
  Flame,
  HeartPulse,
  Minus,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { deleteAiHistory, generateProteinRecipe, getAiHistoryById, recreateFood, undoAiHistory } from "../api/ai";
import { getErrorMessage, isCanceled } from "../api/client";
import { aiTitle } from "../components/AiRecipeCard";
import CookingMode from "../components/CookingMode";
import GeneratingPanel from "../components/GeneratingPanel";
import { EmptyState, ErrorState, SkeletonRecipe } from "../components/States";
import { Button } from "../components/ui/Button";
import { Chip, ChipGroup } from "../components/ui/Chip";
import { useToast } from "../context/ToastContext";
import { asArray, useAsync } from "../hooks/useAsync";
import { useCooked } from "../hooks/useSaved";
import { REMIXES, baseInputs, recipeToText, remixPayload } from "../utils/ai";

// Backend: GET /ai-service/amzeFood/history/:id => { success, data: HistoryDoc }
//   data.recipe  = the AI recipe
//   protein_recipe : recipe.recipeName, ingredients[], instructions[], servings,
//                    preparationTime, proteinPerServing, caloriesPerServing,
//                    medicalConsiderations[]; inputs: data.ingredient[],
//                    data.numberofperson, data.anyMedical
//   recreated_food : recipe.newFoodName, originalFood, addedIngredients[], ...;
//                    inputs: data.existingFoodname, data.AddOnIngredient[]
export default function AiResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { entries: cooked, markCooked } = useCooked();

  const [generating, setGenerating] = useState(null); // { title, chips }
  const [busy, setBusy] = useState(false); // delete in flight
  const [cooking, setCooking] = useState(false);
  const [panel, setPanel] = useState(null); // "ingredient" | "servings" | null
  const [newIngredient, setNewIngredient] = useState("");
  const [newServings, setNewServings] = useState(2);
  const [checkedState, setCheckedState] = useState({ id: null, set: new Set() });
  const controllerRef = useRef(null);

  const { data, loading, error, status, reload } = useAsync(
    (signal) => getAiHistoryById(id, { signal }),
    [id]
  );

  // The ticked-off ingredients belong to one recipe version; a new version starts clean.
  const checked = checkedState.id === id ? checkedState.set : new Set();

  const doc = data?.data;
  const recipe = doc?.recipe;
  const recreated = doc?.historyType === "recreated_food";
  const ingredients = useMemo(() => asArray(recipe?.ingredients), [recipe]);
  const instructions = useMemo(() => asArray(recipe?.instructions).map(String), [recipe]);
  const medical = asArray(recipe?.medicalConsiderations);
  const title = doc ? aiTitle(doc) : "";
  const timesCooked = cooked.filter((c) => c.kind === "ai" && c.id === id).length;

  // Every AI action goes through here: progress panel, cancel, retry on failure.
  const run = async (panelTitle, makeRequest, chips = []) => {
    if (generating) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setGenerating({ title: panelTitle, chips });
    setPanel(null);
    try {
      const res = await makeRequest({ signal: controller.signal });
      const newId = res?.data?._id;
      if (!newId) throw new Error("missing id");
      toast.success("New version ready");
      navigate(`/ai/result/${newId}`);
    } catch (err) {
      if (isCanceled(err) || controller.signal.aborted) return;
      toast.error(getErrorMessage(err, "The AI couldn't finish that. Try again."), {
        action: { label: "Retry", onClick: () => run(panelTitle, makeRequest, chips) },
      });
    } finally {
      setGenerating(null);
    }
  };

  const remix = (r) =>
    run(`Making it: ${r.label.toLowerCase()}`, (config) => generateProteinRecipe(remixPayload(doc, { note: r.note }), config), [r.label]);

  const addIngredient = () => {
    const value = newIngredient.trim();
    if (!value) return;
    const request = recreated
      ? (config) => recreateFood({ existingFoodname: doc.existingFoodname, AddOnIngredient: [...asArray(doc.AddOnIngredient), value] }, config)
      : (config) => generateProteinRecipe(remixPayload(doc, { addIngredient: value }), config);
    setNewIngredient("");
    run(`Adding ${value}`, request, [value]);
  };

  const changeServings = () =>
    run(
      `Scaling to ${newServings} ${newServings === 1 ? "serving" : "servings"}`,
      (config) => generateProteinRecipe(remixPayload(doc, { servings: newServings }), config),
      [`${newServings} servings`]
    );

  const regenerate = () => {
    const request = recreated
      ? (config) => recreateFood({ existingFoodname: doc.existingFoodname, AddOnIngredient: asArray(doc.AddOnIngredient) }, config)
      : (config) => generateProteinRecipe(baseInputs(doc), config);
    run("Writing another version", request);
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await deleteAiHistory(doc._id);
      const deletedId = doc._id;
      toast.success(`Deleted "${title}"`, {
        duration: 10000,
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await undoAiHistory(deletedId);
              toast.success("Recipe restored");
              navigate(`/ai/result/${deletedId}`);
            } catch (err) {
              toast.error(getErrorMessage(err, "Couldn't restore it. Try again."));
            }
          },
        },
      });
      navigate("/ai", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the recipe. Try again."));
      setBusy(false);
    }
  };

  const share = async () => {
    const text = recipeToText(title, recipe);
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Recipe copied to your clipboard");
    } catch {
      toast.error("Couldn't share the recipe. Try again.");
    }
  };

  const logCooked = () => {
    markCooked({ id, kind: "ai", name: title });
    toast.success("Logged in your cooked recipes");
  };

  if (generating) {
    return (
      <div className="max-w-xl mx-auto">
        <GeneratingPanel title={generating.title} chips={generating.chips} onCancel={() => controllerRef.current?.abort()} />
      </div>
    );
  }

  if (loading && !data) return <SkeletonRecipe label="Preparing your AI recipe..." />;

  if (status === 404) {
    return (
      <EmptyState
        icon={ChefHat}
        title="Recipe not found"
        description="It may have been deleted."
        action={<Button onClick={() => navigate("/ai")}>Back to AI Kitchen</Button>}
      />
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} showBack />;

  if (!doc || !recipe) {
    return (
      <EmptyState
        title="No recipe to show"
        description="Create a recipe to see it here."
        action={<Button icon={Sparkles} onClick={() => navigate("/ai/create")}>Create with AI</Button>}
      />
    );
  }

  const stat = (Icon, label, value) => (
    <div className="card p-4">
      <Icon size={18} className="text-orange-700" aria-hidden="true" />
      <p className="text-[12px] text-ink-soft mt-2">{label}</p>
      <p className="font-semibold text-ink">{value || "Not provided"}</p>
    </div>
  );

  return (
    <div className="max-w-3xl">
      <p className="badge">{recreated ? "Remixed dish" : "AI recipe"}</p>
      <h2 className="font-display text-4xl mt-2">{title}</h2>
      {recreated && recipe.originalFood && <p className="text-[14px] text-ink-soft mt-1">Based on {recipe.originalFood}</p>}
      {recipe.description && <p className="text-ink-soft mt-3 text-[16px] leading-relaxed">{recipe.description}</p>}
      <p className="text-[13px] text-ink-soft mt-2">Saved automatically in your AI recipes.</p>
      {timesCooked > 0 && (
        <p className="mt-2 badge badge-green">
          <Check size={12} aria-hidden="true" /> Cooked {timesCooked === 1 ? "once" : `${timesCooked} times`}
        </p>
      )}

      {/* The one primary action, always first. */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button size="lg" icon={ChefHat} className="sm:flex-1" onClick={() => setCooking(true)} disabled={instructions.length === 0}>
          Start Cooking
        </Button>
        <Button size="lg" variant="outline" icon={Check} onClick={logCooked}>
          I Cooked This
        </Button>
        <Button size="lg" variant="outline" icon={Share2} onClick={share}>
          Share
        </Button>
      </div>
      {instructions.length === 0 && (
        <p className="text-[13px] text-ink-soft mt-2">This recipe has no step-by-step method, so Cooking Mode isn't available.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        {stat(Users, "Servings", recipe.servings || doc.numberofperson)}
        {stat(Clock, "Prep time", recipe.preparationTime)}
        {stat(Flame, "Calories", recipe.caloriesPerServing)}
        {stat(HeartPulse, "Protein", recipe.proteinPerServing)}
      </div>

      <section aria-labelledby="remix-title" className="card p-5 mb-5">
        <h3 id="remix-title" className="font-display text-2xl flex items-center gap-2">
          <Sparkles size={20} className="text-orange-700" aria-hidden="true" /> Remix with AI
        </h3>
        <p className="text-[13px] text-ink-soft mt-0.5 mb-3">Tap a change and the AI writes a new version. Your original stays in your AI recipes.</p>
        <ChipGroup label="Remix options">
          {REMIXES.map((r) => (
            <Chip key={r.key} onClick={() => remix(r)}>{r.label}</Chip>
          ))}
          <Chip selected={panel === "ingredient"} onClick={() => setPanel(panel === "ingredient" ? null : "ingredient")}>Add Ingredient</Chip>
          <Chip
            selected={panel === "servings"}
            onClick={() => {
              setNewServings(Number(recipe.servings?.toString().match(/\d+/)?.[0]) || doc.numberofperson || 2);
              setPanel(panel === "servings" ? null : "servings");
            }}
          >
            Change Servings
          </Chip>
        </ChipGroup>

        {panel === "ingredient" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addIngredient();
            }}
            className="flex gap-2 mt-4"
          >
            <label htmlFor="add-ingredient" className="sr-only">Ingredient to add</label>
            <input id="add-ingredient" data-autofocus autoFocus className="input-field flex-1" placeholder="e.g. mushrooms" value={newIngredient} onChange={(e) => setNewIngredient(e.target.value)} />
            <Button type="submit" icon={Plus} disabled={!newIngredient.trim()}>Add</Button>
          </form>
        )}
        {panel === "servings" && (
          <div className="flex items-center gap-3 mt-4">
            <button type="button" aria-label="Fewer servings" className="icon-btn" onClick={() => setNewServings((s) => Math.max(1, s - 1))} disabled={newServings <= 1}>
              <Minus size={18} aria-hidden="true" />
            </button>
            <p className="min-w-20 text-center font-bold text-xl tabular-nums" aria-live="polite">{newServings}</p>
            <button type="button" aria-label="More servings" className="icon-btn" onClick={() => setNewServings((s) => Math.min(50, s + 1))} disabled={newServings >= 50}>
              <Plus size={18} aria-hidden="true" />
            </button>
            <Button onClick={changeServings} className="ml-auto">Apply</Button>
          </div>
        )}
      </section>

      {ingredients.length > 0 && (
        <section aria-labelledby="ing-title" className="card p-5 mb-4">
          <div className="flex items-baseline justify-between">
            <h3 id="ing-title" className="font-display text-2xl">Ingredients</h3>
            <p className="text-[13px] text-ink-soft">{checked.size} of {ingredients.length} ready</p>
          </div>
          <ul className="mt-2">
            {ingredients.map((item, idx) => {
              const on = checked.has(idx);
              return (
                <li key={idx}>
                  <label className="flex items-start gap-3 min-h-11 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        const next = new Set(checked);
                        if (on) next.delete(idx);
                        else next.add(idx);
                        setCheckedState({ id, set: next });
                      }}
                      className="mt-0.5 w-5 h-5 accent-orange-700 shrink-0"
                    />
                    <span className={`text-[15px] ${on ? "line-through text-ink-soft" : "text-ink"}`}>{String(item)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {instructions.length > 0 && (
        <section aria-labelledby="method-title" className="card p-5 mb-4">
          <h3 id="method-title" className="font-display text-2xl mb-3">Method</h3>
          <ol className="space-y-4">
            {instructions.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-700 text-white text-[13px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-[15px] text-ink leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {medical.length > 0 && (
        <section aria-labelledby="med-title" className="card p-5 mb-4 !border-orange-300">
          <h3 id="med-title" className="font-display text-2xl mb-2">Medical considerations</h3>
          <p className="text-[15px] text-ink-soft">{medical.join(", ")}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-(--color-line)">
        <Button variant="outline" icon={RefreshCw} onClick={regenerate}>Write another version</Button>
        <Button variant="outline" onClick={() => navigate("/ai/create")}>Create a new recipe</Button>
        <Button variant="danger" icon={Trash2} onClick={remove} loading={busy}>Delete</Button>
      </div>

      {cooking && (
        <CookingMode
          title={title}
          steps={instructions}
          ingredients={ingredients}
          onExit={() => setCooking(false)}
          onFinish={logCooked}
        />
      )}
    </div>
  );
}
