import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ChevronRight, Sparkles, Wand2 } from "lucide-react";
import { getGeneratedRecipes, getRecreatedFoods } from "../api/ai";
import { AiRecipeCard } from "../components/BlogCard";
import { EmptyState, LoadingState } from "../components/States";

const RECIPE_KEY = "foodai_last_recipe";

export default function AiHub() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([getGeneratedRecipes(), getRecreatedFoods()])
      .then((results) => {
        const list = [];
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const payload = r.value?.data || r.value?.recipes || r.value;
            if (Array.isArray(payload)) list.push(...payload);
            else if (payload?.recipe) list.push(payload.recipe);
          }
        });
        setRecipes(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const openRecipe = (recipe) => {
    sessionStorage.setItem(RECIPE_KEY, JSON.stringify(recipe));
    navigate("/ai/result");
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-5">AI Hub</h1>

      <div className="rounded-[26px] bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} />
          <p className="text-[12px] tracking-[0.16em] font-semibold">INGREDIENT TO RECIPE</p>
        </div>
        <h2 className="font-display text-2xl leading-snug">
          Enter ingredients you have and get recipe suggestions
        </h2>
        <button
          onClick={() => navigate("/ai/create")}
          className="mt-5 bg-white text-emerald-700 font-semibold rounded-2xl px-5 py-3 flex items-center gap-2"
        >
          <Wand2 size={16} /> Generate
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mb-8">
        <button
          onClick={() => navigate("/ai/create")}
          className="card flex items-center gap-3.5 p-4 text-left"
        >
          <span className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Sparkles size={19} />
          </span>
          <span className="flex-1">
            <p className="text-[14px] font-semibold text-ink">Recipe Improvement</p>
            <p className="text-[12px] text-ink-soft">Add ingredients to make your recipe better</p>
          </span>
          <ChevronRight size={18} className="text-ink-soft/40" />
        </button>

        <button
          onClick={() => navigate("/ai/create")}
          className="card flex items-center gap-3.5 p-4 text-left"
        >
          <span className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <ChefHat size={19} />
          </span>
          <span className="flex-1">
            <p className="text-[14px] font-semibold text-ink">Cooking Assistant</p>
            <p className="text-[12px] text-ink-soft">Step by step cooking guidance</p>
          </span>
          <ChevronRight size={18} className="text-ink-soft/40" />
        </button>
      </div>

      <h3 className="font-display text-xl mb-4">Your generated recipes</h3>
      {loading ? (
        <LoadingState label="Loading AI recipes..." />
      ) : recipes.length === 0 ? (
        <EmptyState
          title="No AI recipes yet"
          description="Generate your first protein-smart recipe."
          action={<button onClick={() => navigate("/ai/create")} className="btn-primary mt-3">Create recipe</button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {recipes.map((r, i) => (
            <AiRecipeCard key={r._id || i} recipe={r.recipe || r} onOpen={() => openRecipe(r.recipe || r)} />
          ))}
        </div>
      )}
    </div>
  );
}
