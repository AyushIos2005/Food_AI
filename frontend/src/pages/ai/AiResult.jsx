import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Flame, Users2, Clock, Leaf } from "lucide-react";
import RecipeResult from "../../components/RecipeResult";

export default function AiResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const food = location.state?.food;

  if (!food) return <Navigate to="/ai/history" replace />;

  const r = food.recipe || {};
  const badges = [];
  if (food.anyMedical) badges.push(food.anyMedical);
  if (r.preparationTime) badges.push(r.preparationTime);
  badges.push("AI Generated");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <RecipeResult
        name={r.recipeName}
        description={r.description}
        badges={badges}
        nutrition={[
          { label: "Protein", value: r.proteinPerServing, icon: Flame },
          { label: "Calories", value: r.caloriesPerServing, icon: Flame },
          { label: "Servings", value: r.servings || food.numberofperson, icon: Users2 },
          { label: "Prep Time", value: r.preparationTime, icon: Clock },
        ]}
        ingredients={r.ingredients}
        proteinSources={r.proteinSources}
        medicalConsiderations={r.medicalConsiderations}
        instructions={r.instructions}
        context={
          <div className="flex flex-wrap gap-1.5">
            {(food.ingredient || []).map((ing) => (
              <span key={ing} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink/70 border border-slate-200">
                <Leaf size={10} className="mr-1 inline text-accent" />
                {ing}
              </span>
            ))}
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
            onClick={() => navigate("/ai/create")}
            className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Generate Another
          </button>
          <button
            onClick={() => navigate("/ai/history")}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            My AI Recipes
          </button>
        </div>
      </RecipeResult>
    </div>
  );
}
