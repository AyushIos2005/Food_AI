import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, ChefHat, Trash2, X } from "lucide-react";
import { getMyFood, deleteFood } from "../../api/food.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import FoodCard from "../../components/FoodCard";

export default function ChefManageRecipes() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getMyFood()
      .then(({ data }) => {
        if (!active) return;
        const all = data.foods || [];
        // The backend's /get endpoint returns every chef's recipes, not
        // just the caller's — filter down to the signed-in chef's own.
        setFoods(all.filter((f) => f.chef?._id === user?.id));
      })
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your recipes.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await deleteFood(confirmTarget._id);
      setFoods((prev) => prev.filter((f) => f._id !== confirmTarget._id));
      toast.success("Recipe deleted successfully");
      setConfirmTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this recipe."));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <Loading full label="Loading your recipes..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Chef Tools</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">My Recipes</h1>
        </div>
        <Link
          to="/chef/recipes/create"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
        >
          <Plus size={15} /> Create Recipe
        </Link>
      </div>

      {foods.length === 0 ? (
        <EmptyState icon={ChefHat} title="No recipes found." actionLabel="Create Recipe" actionTo="/chef/recipes/create" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {foods.map((f) => (
            <FoodCard key={f._id} food={f} manage onDelete={setConfirmTarget} />
          ))}
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm" onClick={() => setConfirmTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md animate-float-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink">Delete this recipe?</h3>
              <button onClick={() => setConfirmTarget(null)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">"{confirmTarget.foodName}" will be permanently removed.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-ink hover:bg-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-danger py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
