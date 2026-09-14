import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { deleteFood, getFoodAdmin } from "../api/food";
import ConfirmModal from "../components/ConfirmModal";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/States";
import { useToast } from "../context/ToastContext";

export default function ChefRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getFoodAdmin()
      .then((res) => setRecipes(res.foods || []))
      .catch((err) => setError(err.message || "Could not load your recipes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteFood(pending._id);
      setRecipes((prev) => prev.filter((r) => r._id !== pending._id));
      toast.success("Recipe deleted");
      setPending(null);
    } catch (err) {
      toast.error(err.message || "Could not delete this recipe.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <h2 className="font-display text-3xl">My Recipes</h2>
        <button onClick={() => navigate("/chef/recipes/create")} className="btn-primary">
          Create Recipe
        </button>
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? (
        <SkeletonGrid />
      ) : recipes.length === 0 ? (
        <EmptyState title="No recipes yet" description="Create your first recipe to appear here." />
      ) : (
        <div className="grid gap-3">
          {recipes.map((r) => (
            <div key={r._id} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="w-full sm:w-28 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-cream-2 shrink-0">
                {r.foodImage && <img src={r.foodImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{r.foodName}</p>
                <p className="text-[13px] text-ink-soft line-clamp-2 mt-1">{r.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/recipes/${r._id}`, { state: { dish: r } })} className="btn-outline text-sm py-2">
                  View
                </button>
                <button onClick={() => setPending(r)} className="btn-outline text-sm py-2 text-red-500 border-red-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {pending && (
        <ConfirmModal
          title="Delete recipe?"
          message={`“${pending.foodName}” will be removed. This cannot be undone.`}
          loading={deleting}
          onClose={() => setPending(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
