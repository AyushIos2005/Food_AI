import { useEffect, useMemo, useState } from "react";
import { Search, Shuffle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllFood } from "../api/food";
import DishCard from "../components/DishCard";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/States";

const filters = ["All", "Veg", "Non-Veg", "Popular"];

export default function Explore() {
  const [dishes, setDishes] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getAllFood()
      .then((res) => setDishes(res.foods || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return dishes.filter((d) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        d.foodName?.toLowerCase().includes(q) ||
        d.ingredients?.some((i) => i.toLowerCase().includes(q)) ||
        d.description?.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (filter === "Veg") return /veg|paneer|dal|salad|tofu/i.test(`${d.foodName} ${d.description}`);
      if (filter === "Non-Veg") return /chicken|mutton|fish|egg|prawn|beef/i.test(`${d.foodName} ${d.description}`);
      return true;
    });
  }, [dishes, query, filter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">EXPLORE</p>
          <h2 className="font-display text-3xl mt-1">Find your next plate</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/ai")} className="btn-outline flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-orange-500" /> AI Hub
          </button>
          <button onClick={() => navigate("/random")} className="btn-primary flex items-center gap-2 text-sm py-3">
            <Shuffle size={16} /> Surprise me
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-(--color-line) rounded-2xl px-4 py-3 mb-4">
        <Search size={16} className="text-ink-soft/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, ingredients..."
          className="flex-1 outline-none text-[14px] bg-transparent"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap ${
              filter === f ? "bg-orange-500 text-white" : "bg-white border border-(--color-line) text-ink-soft"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No dishes found"
          description="Try adjusting your search or filters."
          action={
            (query || filter !== "All") && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("All");
                }}
                className="btn-primary mt-3"
              >
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d) => (
            <DishCard key={d._id} dish={d} />
          ))}
        </div>
      )}
    </div>
  );
}
