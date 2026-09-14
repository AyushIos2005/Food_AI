import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Flame, HeartPulse, Users } from "lucide-react";
import { EmptyState } from "../components/States";

const RECIPE_KEY = "foodai_last_recipe";

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value).split("\n").filter(Boolean);
}

export default function AiResult() {
  const navigate = useNavigate();
  const recipe = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(RECIPE_KEY) || "null");
    } catch {
      return null;
    }
  }, []);

  if (!recipe) {
    return (
      <EmptyState
        title="No recipe yet"
        description="Generate a recipe to see it here."
        action={<button onClick={() => navigate("/ai/create")} className="btn-primary mt-3">Generate Recipe</button>}
      />
    );
  }

  const name = recipe.recipeName || recipe.newFoodName || recipe.name || "AI Recipe";
  const ingredients = asList(recipe.ingredients || recipe.ingredient);
  const instructions = asList(recipe.instructions || recipe.steps);
  const medical = recipe.medicalConsiderations || recipe.anyMedical || recipe.medical || recipe.precautions;

  return (
    <div className="max-w-3xl">
      <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">AI RESULT</p>
      <h2 className="font-display text-4xl mt-2">{name}</h2>
      {recipe.description && <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">{recipe.description}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        <div className="card p-4">
          <Users size={16} className="text-orange-600" />
          <p className="text-[11px] text-ink-soft mt-2">Servings</p>
          <p className="font-semibold">{recipe.servings || recipe.numberofperson || "—"}</p>
        </div>
        <div className="card p-4">
          <Clock size={16} className="text-orange-600" />
          <p className="text-[11px] text-ink-soft mt-2">Prep time</p>
          <p className="font-semibold">{recipe.preparationTime || recipe.prepTime || "—"}</p>
        </div>
        <div className="card p-4">
          <Flame size={16} className="text-orange-600" />
          <p className="text-[11px] text-ink-soft mt-2">Calories</p>
          <p className="font-semibold">{recipe.calories || recipe.calorie || recipe.caloriesPerServing || "—"}</p>
        </div>
        <div className="card p-4">
          <HeartPulse size={16} className="text-orange-600" />
          <p className="text-[11px] text-ink-soft mt-2">Protein</p>
          <p className="font-semibold">{recipe.proteinPerServing || recipe.protein || "—"}</p>
        </div>
      </div>

      {ingredients.length > 0 && (
        <section className="card p-5 mb-4">
          <h3 className="font-display text-2xl mb-3">Ingredients</h3>
          <ul className="space-y-2 text-[14px] text-ink-soft">
            {ingredients.map((i, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-orange-500">•</span> {typeof i === "string" ? i : i.name || JSON.stringify(i)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {instructions.length > 0 && (
        <section className="card p-5 mb-4">
          <h3 className="font-display text-2xl mb-3">Instructions</h3>
          <ol className="space-y-3 text-[14px] text-ink-soft">
            {instructions.map((s, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{typeof s === "string" ? s : s.step || JSON.stringify(s)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {medical && (
        <section className="card p-5 border-orange-200">
          <h3 className="font-display text-2xl mb-2">Medical considerations</h3>
          <p className="text-[14px] text-ink-soft">{Array.isArray(medical) ? medical.join(", ") : medical}</p>
        </section>
      )}

      <button onClick={() => navigate("/ai/create")} className="btn-primary mt-6">
        Generate another
      </button>
    </div>
  );
}
