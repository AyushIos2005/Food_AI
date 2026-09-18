import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChefHat, ShieldAlert, ArrowLeft } from "lucide-react";
import { getAllFood } from "../../api/food.api";
import { getErrorMessage } from "../../lib/errorMessage";
import Loading from "../../components/Loading";

export default function RecipeDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [food, setFood] = useState(location.state?.food || null);
  const [loading, setLoading] = useState(!location.state?.food);

  useEffect(() => {
    if (food) return;
    // No dedicated GET /api/food/:id on the backend — fall back to
    // loading the full list and picking this recipe out of it.
    let active = true;
    getAllFood()
      .then(({ data }) => {
        if (!active) return;
        const match = (data.foods || []).find((f) => f._id === id);
        setFood(match || null);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load this recipe.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, food]);

  if (loading) return <Loading full label="Loading recipe..." />;

  if (!food) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-lg text-ink">We couldn't find that recipe.</p>
        <Link to="/recipes" className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline">
          Back to recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/recipes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to recipes
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[16/9] w-full bg-bg">
          {food.foodImage ? (
            <img src={food.foodImage} alt={food.foodName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ChefHat size={32} />
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{food.foodName}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
            <ChefHat size={14} /> {food.chef?.username || "FoodAI Chef"}
          </p>

          {food.description && <p className="mt-4 text-sm text-ink/80">{food.description}</p>}

          {food.ingredients?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-ink">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {food.ingredients.map((i) => (
                  <span key={i} className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-ink/80 border border-slate-200">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {food.precautions && (
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-warning/10 px-4 py-3">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warning" />
              <p className="text-sm text-ink/80">{food.precautions}</p>
            </div>
          )}

          <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark">
            Start Cooking
          </button>
        </div>
      </div>
    </div>
  );
}
