import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { RefreshCw, Flame } from "lucide-react";
import { getRecreatedHistory } from "../../api/ai.api";
import { getErrorMessage } from "../../lib/errorMessage";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function RecreatedHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getRecreatedHistory()
      .then(({ data }) => active && setItems(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your recreated dishes.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading full label="Loading your recreated dishes..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">FoodAI</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Recreated History</h1>
        </div>
        <Link to="/ai/recreate" className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          + Recreate Food
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No recreated dishes yet." actionLabel="Recreate Food" actionTo="/ai/recreate" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((food) => {
            const r = food.recipe || {};
            return (
              <button
                key={food._id}
                onClick={() => navigate("/ai/recreate/result", { state: { food } })}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <h3 className="font-display text-base font-semibold text-ink">{r.newFoodName}</h3>
                <p className="mt-1 text-xs text-muted">Based on {r.originalFood || food.existingFoodname}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(r.addedIngredients || food.AddOnIngredient || []).slice(0, 4).map((i) => (
                    <span key={i} className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-secondary">
                      {i}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Flame size={12} /> {r.proteinPerServing || "—"}</span>
                  <span className="ml-auto text-[11px]">{new Date(food.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
