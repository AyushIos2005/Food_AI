import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { generateProteinRecipe, recreateFood } from "../api/ai";
import TopBar from "../components/TopBar";

function ChipInput({ items, setItems, placeholder }) {
  const [value, setValue] = useState("");
  const add = () => {
    const v = value.trim();
    if (v) setItems((prev) => [...prev, v]);
    setValue("");
  };
  return (
    <div className="input-field flex flex-wrap gap-1.5 items-center min-h-[48px]">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-[12px] px-2 py-1 rounded-full">
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

export default function AiRecipe() {
  const [mode, setMode] = useState("new"); // new | recreate
  const [ingredient, setIngredient] = useState([]);
  const [numberofperson, setNumberofperson] = useState(2);
  const [anyMedical, setAnyMedical] = useState("");
  const [existingFoodname, setExistingFoodname] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setRecipe(null);
    setLoading(true);
    try {
      if (mode === "new") {
        const res = await generateProteinRecipe({ ingredient, numberofperson, anyMedical });
        setRecipe(res.data?.recipe);
      } else {
        const res = await recreateFood({ existingFoodname, AddOnIngredient: addOns });
        setRecipe(res.data?.recipe);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <TopBar title="AI Recipe Chef" onBack={() => navigate(-1)} />

      <div className="px-5 flex gap-2 mb-4">
        {[
          { key: "new", label: "New Recipe" },
          { key: "recreate", label: "Remix Existing" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 py-2.5 rounded-2xl text-[13px] font-medium border ${
              mode === m.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-ink-soft border-(--color-line)"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="px-5 flex flex-col gap-3">
        {mode === "new" ? (
          <>
            <p className="text-[12px] font-semibold text-ink-soft">Ingredients you have</p>
            <ChipInput items={ingredient} setItems={setIngredient} placeholder="e.g. paneer, spinach, lentils" />
            <p className="text-[12px] font-semibold text-ink-soft mt-1">Number of persons</p>
            <input
              type="number"
              min={1}
              className="input-field"
              value={numberofperson}
              onChange={(e) => setNumberofperson(Number(e.target.value))}
            />
            <p className="text-[12px] font-semibold text-ink-soft mt-1">Any medical condition? (optional)</p>
            <input
              className="input-field"
              placeholder="e.g. diabetic, gluten-free"
              value={anyMedical}
              onChange={(e) => setAnyMedical(e.target.value)}
            />
          </>
        ) : (
          <>
            <p className="text-[12px] font-semibold text-ink-soft">Existing dish name</p>
            <input
              className="input-field"
              placeholder="e.g. Chicken Biryani"
              value={existingFoodname}
              onChange={(e) => setExistingFoodname(e.target.value)}
              required
            />
            <p className="text-[12px] font-semibold text-ink-soft mt-1">Add-on ingredients</p>
            <ChipInput items={addOns} setItems={setAddOns} placeholder="e.g. mushrooms, extra chili" />
          </>
        )}

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button className="btn-primary mt-2 flex items-center justify-center gap-2" disabled={loading}>
          <Sparkles size={16} /> {loading ? "Cooking up ideas..." : "Generate Recipe"}
        </button>
      </form>

      {recipe && (
        <div className="px-5 mt-6">
          <div className="card p-4">
            <h2 className="text-[16px] font-bold text-ink">
              {recipe.recipeName || recipe.newFoodName}
            </h2>
            {recipe.description && (
              <p className="text-[13px] text-ink-soft mt-1">{recipe.description}</p>
            )}
            <div className="flex gap-4 mt-3 text-[12px] text-ink-soft">
              {recipe.servings && <span>👥 {recipe.servings} servings</span>}
              {recipe.preparationTime && <span>⏱ {recipe.preparationTime}</span>}
              {recipe.proteinPerServing && <span>💪 {recipe.proteinPerServing}</span>}
            </div>

            {recipe.ingredients?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[13px] font-bold text-ink mb-1.5">Ingredients</h3>
                <ul className="list-disc list-inside text-[13px] text-ink-soft space-y-0.5">
                  {recipe.ingredients.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.instructions?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[13px] font-bold text-ink mb-1.5">Instructions</h3>
                <ol className="list-decimal list-inside text-[13px] text-ink-soft space-y-1">
                  {recipe.instructions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
