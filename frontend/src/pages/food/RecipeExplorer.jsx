import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, ChefHat } from "lucide-react";
import { getAllFood } from "../../api/food.api";
import { getErrorMessage } from "../../lib/errorMessage";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import FoodCard from "../../components/FoodCard";
import { inputClass } from "../../components/FormField";

export default function RecipeExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const serverSearch = searchParams.get("q") || "";

  // The backend supports ?search= on /get-all, so searching is done
  // server-side; the memo below only smooths typing between requests.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllFood(serverSearch ? { search: serverSearch } : undefined)
      .then(({ data }) => active && setFoods(data.foods || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load recipes.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [serverSearch]);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!query.trim()) return foods;
    const q = query.trim().toLowerCase();
    return foods.filter(
      (f) =>
        f.foodName?.toLowerCase().includes(q) ||
        f.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
        f.chef?.username?.toLowerCase().includes(q)
    );
  }, [foods, query]);

  if (loading) return <Loading full label="Loading recipes..." />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Recipe Explorer</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Discover chef recipes</h1>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 sm:max-w-sm">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          placeholder="Search recipes..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ChefHat} title="No recipes found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((f) => (
            <FoodCard key={f._id} food={f} />
          ))}
        </div>
      )}
    </div>
  );
}
