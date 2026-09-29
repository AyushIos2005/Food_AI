import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Sparkles, UtensilsCrossed, Users, X } from "lucide-react";
import { getAllFood } from "../api/food";
import { getAllBlogs } from "../api/blog";
import DishCard from "../components/DishCard";
import { EmptyState, SkeletonGrid } from "../components/States";
import { Button } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { asArray, useAsync } from "../hooks/useAsync";
import { matchesQuery } from "../utils/dishFilters";

// One search box across recipes and community posts, grouped so unrelated
// content is never mixed together.
export default function Search() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [value, setValue] = useState(params.get("q") || "");

  useEffect(() => {
    const id = setTimeout(() => setParams(value ? { q: value } : {}, { replace: true }), 250);
    return () => clearTimeout(id);
  }, [value, setParams]);

  const q = params.get("q") || "";
  const food = useAsync((signal) => getAllFood(null, { signal }), []);
  const blog = useAsync((signal) => getAllBlogs(null, { signal }), []);

  const dishResults = useMemo(() => asArray(food.data?.foods).filter((d) => matchesQuery(d, q)).slice(0, 6), [food.data, q]);
  const postResults = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return asArray(blog.data?.data)
      .filter((b) => b.description?.toLowerCase().includes(query) || asArray(b.hashtags).some((h) => String(h).toLowerCase().includes(query)))
      .slice(0, 6);
  }, [blog.data, q]);

  const loading = food.loading || blog.loading;
  const hasQuery = q.trim().length > 0;
  const noResults = hasQuery && !loading && dishResults.length === 0 && postResults.length === 0;

  return (
    <div className="max-w-3xl">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="search-field mb-6">
        <SearchIcon size={18} className="text-ink-soft shrink-0" aria-hidden="true" />
        <label htmlFor="global-search" className="sr-only">Search FOODAI</label>
        <input
          id="global-search"
          autoFocus
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search recipes, community posts..."
          autoComplete="off"
        />
        {value && (
          <button type="button" aria-label="Clear search" onClick={() => setValue("")} className="w-11 h-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-orange-50">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </form>

      {!hasQuery && (
        <EmptyState icon={SearchIcon} title="Search FOODAI" description="Find recipes by ingredient, or community posts by keyword or #hashtag." />
      )}

      {loading && hasQuery && <SkeletonGrid count={4} label="Searching..." />}

      {noResults && (
        <EmptyState
          icon={SearchIcon}
          title="No results"
          description={`Nothing matched "${q}". Try a different word, or ask the AI Chef to create it.`}
          action={<Button icon={Sparkles} onClick={() => navigate("/ai/create", { state: { note: `Craving: ${q}` } })}>Ask AI Chef</Button>}
        />
      )}

      {!loading && dishResults.length > 0 && (
        <section aria-labelledby="search-recipes" className="mb-8">
          <h2 id="search-recipes" className="font-display text-xl mb-3 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-orange-700" aria-hidden="true" /> Recipes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dishResults.map((d) => (
              <DishCard key={d._id} dish={d} />
            ))}
          </div>
        </section>
      )}

      {!loading && postResults.length > 0 && (
        <section aria-labelledby="search-posts">
          <h2 id="search-posts" className="font-display text-xl mb-3 flex items-center gap-2">
            <Users size={18} className="text-orange-700" aria-hidden="true" /> Community posts
          </h2>
          <ul className="space-y-2">
            {postResults.map((b) => (
              <li key={b._id}>
                <button onClick={() => navigate(`/community/post/${b._id}`)} className="card card-hover w-full flex items-center gap-3 p-3 text-left">
                  <Avatar name={b.createdBy?.name || b.createdBy?.username} size={36} />
                  <p className="text-[14px] text-ink line-clamp-2 flex-1">{b.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
