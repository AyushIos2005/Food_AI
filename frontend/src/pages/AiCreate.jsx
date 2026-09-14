import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { generateProteinRecipe, recreateFood } from "../api/ai";
import { useToast } from "../context/ToastContext";

const RECIPE_KEY = "foodai_last_recipe";

function ChipInput({ items, setItems, placeholder }) {
  const [value, setValue] = useState("");
  const add = () => {
    const v = value.trim();
    if (v) setItems((prev) => [...prev, v]);
    setValue("");
  };
  return (
    <div className="input-field flex flex-wrap gap-1.5 items-center min-h-[52px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-[12px] px-2.5 py-1 rounded-full">
          {item}
          <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={items.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] outline-none bg-transparent text-[13px]"
      />
    </div>
  );
}

export default function AiCreate() {
  const [mode, setMode] = useState("new");
  const [ingredient, setIngredient] = useState([]);
  const [numberofperson, setNumberofperson] = useState(2);
  const [anyMedical, setAnyMedical] = useState("");
  const [existingFoodname, setExistingFoodname] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let recipe;
      if (mode === "new") {
        if (ingredient.length === 0) {
          setError("Add at least one ingredient.");
          setLoading(false);
          return;
        }
        const res = await generateProteinRecipe({ ingredient, numberofperson, anyMedical });
        recipe = res.data?.recipe || res.recipe || res.data;
      } else {
        const res = await recreateFood({ existingFoodname, AddOnIngredient: addOns });
        recipe = res.data?.recipe || res.recipe || res.data;
      }
      sessionStorage.setItem(RECIPE_KEY, JSON.stringify(recipe));
      toast.success("Recipe generated");
      navigate("/ai/result");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">GENERATE</p>
      <h2 className="font-display text-3xl mt-1 mb-6">Build a recipe with AI</h2>

      <div className="flex gap-2 mb-5">
        {[
          { key: "new", label: "New Recipe" },
          { key: "recreate", label: "Remix Existing" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 py-2.5 rounded-2xl text-[13px] font-medium border ${
              mode === m.key ? "bg-orange-500 text-white border-orange-500" : "bg-white text-ink-soft border-(--color-line)"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="card p-5 sm:p-6 flex flex-col gap-4">
        {mode === "new" ? (
          <>
            <label className="text-[13px] font-semibold text-ink">Ingredients</label>
            <ChipInput items={ingredient} setItems={setIngredient} placeholder="e.g. paneer, spinach, lentils" />
            <label className="text-[13px] font-semibold text-ink">Number of people</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={numberofperson}
              onChange={(e) => setNumberofperson(Number(e.target.value))}
            />
            <label className="text-[13px] font-semibold text-ink">Medical consideration (optional)</label>
            <input
              className="input-field"
              placeholder="e.g. diabetic, gluten-free"
              value={anyMedical}
              onChange={(e) => setAnyMedical(e.target.value)}
            />
          </>
        ) : (
          <>
            <label className="text-[13px] font-semibold text-ink">Existing dish name</label>
            <input
              className="input-field"
              placeholder="e.g. Chicken Biryani"
              value={existingFoodname}
              onChange={(e) => setExistingFoodname(e.target.value)}
              required
            />
            <label className="text-[13px] font-semibold text-ink">Add-on ingredients</label>
            <ChipInput items={addOns} setItems={setAddOns} placeholder="e.g. mushrooms, extra chili" />
          </>
        )}

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button className="btn-primary mt-1 flex items-center justify-center gap-2" disabled={loading}>
          <Sparkles size={16} /> {loading ? "Cooking up ideas..." : "Generate Recipe"}
        </button>
      </form>
    </div>
  );
}
