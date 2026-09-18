import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Flame, Clock } from "lucide-react";
import RecipeResult from "../../components/RecipeResult";

export default function RecreateResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const food = location.state?.food;

  if (!food) return <Navigate to="/ai/recreated" replace />;

  const r = food.recipe || {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <RecipeResult
        eyebrow="Your New Creation"
        name={r.newFoodName}
        description={r.description}
        badges={[r.preparationTime, "Recreated"].filter(Boolean)}
        nutrition={[
          { label: "Protein / Serving", value: r.proteinPerServing, icon: Flame },
          { label: "Calories / Serving", value: r.caloriesPerServing, icon: Flame },
          { label: "Prep Time", value: r.preparationTime, icon: Clock },
        ]}
        ingredients={r.ingredients}
        proteinSources={r.proteinSources}
        instructions={r.instructions}
        context={
          <div className="space-y-1.5 text-sm">
            <p className="text-ink/70">
              Based on <span className="font-semibold text-ink">{r.originalFood || food.existingFoodname}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted">Added:</span>
              {(r.addedIngredients || food.AddOnIngredient || []).map((i) => (
                <span key={i} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                  {i}
                </span>
              ))}
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-bg"
          >
            Back
          </button>
          <button
            onClick={() => navigate("/ai/recreate")}
            className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Recreate Another
          </button>
          <button
            onClick={() => navigate("/ai/recreated")}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Recreated History
          </button>
        </div>
      </RecipeResult>
    </div>
  );
}
