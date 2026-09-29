import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChefHat, Plus, Search, Shuffle, Sparkles, Users } from "lucide-react";
import { getAllFood } from "../api/food";
import { getAllBlogs } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import { useCooked } from "../hooks/useSaved";
import { usePreferences, prefLabel } from "../utils/preferences";
import { preferenceMatches } from "../utils/dishFilters";
import { firstNameOf } from "../utils/format";
import DishCard from "../components/DishCard";
import { EmptyState, ErrorState, SkeletonGrid, SkeletonList } from "../components/States";
import { Button } from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { asArray, useAsync } from "../hooks/useAsync";

// Each chip opens the Recipe Explorer with that filter already applied.
const QUICK_PICKS = [
  { label: "High Protein", to: "/recipes?tags=protein" },
  { label: "Healthy", to: "/recipes?tags=healthy" },
  { label: "Indian", to: "/recipes?cuisine=indian" },
  { label: "Quick Meals", to: "/recipes?tags=quick" },
  { label: "Vegetarian", to: "/recipes?tags=vegetarian" },
  { label: "Dessert", to: "/recipes?tags=dessert" },
];

function SectionHeading({ title, to, linkLabel = "See all" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {to && (
        <Link to={to} className="text-[14px] text-orange-800 font-semibold flex items-center gap-1 min-h-11 px-2 -mr-2">
          {linkLabel} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { user, isChef } = useAuth();
  const navigate = useNavigate();
  const [craving, setCraving] = useState("");
  const { prefs } = usePreferences();
  const { entries: cooked } = useCooked();

  // Backend contracts: food => { foods: [] }, blogs => { data: [] }
  const food = useAsync((signal) => getAllFood(null, { signal }), []);
  const blog = useAsync((signal) => getAllBlogs(null, { signal }), []);
  const dishes = useMemo(() => asArray(food.data?.foods), [food.data]);
  const blogs = asArray(blog.data?.data);

  // Personalised order: dishes that match the most saved preferences first.
  const picks = useMemo(() => {
    const scored = dishes.map((d) => ({ dish: d, hits: prefs.length ? preferenceMatches(d, prefs) : [] }));
    if (prefs.length) scored.sort((a, b) => b.hits.length - a.hits.length);
    return scored.slice(0, 8);
  }, [dishes, prefs]);
  const personalised = prefs.length > 0 && picks.some((p) => p.hits.length > 0);

  const findRecipes = (e) => {
    e.preventDefault();
    const q = craving.trim();
    navigate(q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes");
  };
  const askAi = () =>
    navigate("/ai/create", { state: { note: craving.trim() ? `Craving: ${craving.trim()}` : "" } });

  return (
    <div className="space-y-10">
      <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-[28px] bg-[#17110D] text-white p-6 sm:p-8">
        <div aria-hidden="true" className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-orange-500/30 blur-2xl" />
        <div className="relative">
          <h2 id="hero-title" className="font-display text-3xl sm:text-4xl max-w-xl">
            What are we cooking today, {firstNameOf(user)}?
          </h2>
          <p className="text-white/80 mt-2 max-w-md text-[15px]">
            Tell FOODAI what is in your kitchen and get a recipe you can start cooking right away.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button size="lg" icon={Sparkles} onClick={() => navigate("/ai/create")}>
              Create with AI
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon={Shuffle}
              className="!bg-white/10 !text-white !border-white/25 hover:!bg-white/20"
              onClick={() => navigate("/random")}
            >
              Surprise Me
            </Button>
          </div>

          <form onSubmit={findRecipes} className="mt-7 max-w-xl" role="search" aria-label="What are you craving">
            <label htmlFor="craving" className="block text-[15px] font-semibold mb-2">
              What are you craving?
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="search-field flex-1 !bg-white/10 !border-white/25 text-white">
                <Search size={18} className="text-white/70 shrink-0" aria-hidden="true" />
                <input
                  id="craving"
                  value={craving}
                  onChange={(e) => setCraving(e.target.value)}
                  placeholder="Spicy paneer, creamy pasta, something sweet..."
                  className="!text-white placeholder:!text-white/60"
                  autoComplete="off"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="outline" className="flex-1 sm:flex-none">
                  Find recipes
                </Button>
                <Button type="button" variant="ghost" className="flex-1 sm:flex-none !text-white hover:!bg-white/10" onClick={askAi}>
                  Ask AI
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Quick food preferences">
            {QUICK_PICKS.map((c) => (
              <Link key={c.label} to={c.to} className="chip chip-dark">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {cooked.length > 0 && (
        <section aria-labelledby="cooked-title">
          <SectionHeading title="Cook it again" to="/profile?tab=cooked" linkLabel="Cooking history" />
          <h3 id="cooked-title" className="sr-only">Recently cooked</h3>
          <ul className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {cooked.slice(0, 6).map((c) => (
              <li key={c.at} className="shrink-0">
                <Link
                  to={c.kind === "ai" ? `/ai/result/${c.id}` : `/dish/${c.id}`}
                  className="card card-hover flex items-center gap-3 px-4 min-h-14 max-w-[260px]"
                >
                  <ChefHat size={18} className="text-orange-700 shrink-0" aria-hidden="true" />
                  <span className="text-[14px] font-semibold text-ink truncate">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="picks-title">
        <SectionHeading title={personalised ? "Picked for you" : "Recipes to try"} to="/recipes" />
        <h3 id="picks-title" className="sr-only">{personalised ? "Recipes picked for you" : "Recipes to try"}</h3>
        {personalised && (
          <p className="text-[13px] text-ink-soft -mt-2 mb-4">
            Based on your food preferences.{" "}
            <Link to="/settings" className="text-orange-800 font-semibold underline">Change them</Link>
          </p>
        )}
        {!prefs.length && !food.loading && dishes.length > 0 && (
          <p className="text-[13px] text-ink-soft -mt-2 mb-4">
            <Link to="/preferences" className="text-orange-800 font-semibold underline">Pick your food preferences</Link>{" "}
            to see recipes that suit you first.
          </p>
        )}
        {food.loading ? (
          <SkeletonGrid count={4} label="Loading recipes..." />
        ) : food.error ? (
          <ErrorState message={food.error} onRetry={food.reload} />
        ) : dishes.length === 0 ? (
          <EmptyState
            title="No dishes yet"
            description="The kitchen is warming up. Create your own recipe with AI in the meantime."
            action={
              <Button icon={Sparkles} onClick={() => navigate("/ai/create")}>
                Create with AI
              </Button>
            }
            secondary={
              isChef ? (
                <Button variant="outline" icon={Plus} onClick={() => navigate("/recipes/upload")}>
                  Upload a dish
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {picks.map(({ dish, hits }) => (
              <DishCard key={dish._id} dish={dish} matchLabel={hits.slice(0, 2).map(prefLabel).join(", ")} />
            ))}
          </div>
        )}
      </section>

      {/* Community lives on its own tinted panel so it never blurs into the recipes above. */}
      <section aria-labelledby="community-title" className="rounded-[28px] bg-white/55 border border-(--color-line) p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="community-title" className="font-display text-2xl flex items-center gap-2">
            <Users size={22} className="text-orange-700" aria-hidden="true" /> From the community
          </h2>
          <Link to="/community" className="text-[14px] text-orange-800 font-semibold flex items-center gap-1 min-h-11 px-2 -mr-2">
            See all <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        {blog.loading ? (
          <SkeletonList count={2} label="Loading community posts..." />
        ) : blog.error ? (
          <ErrorState message={blog.error} onRetry={blog.reload} />
        ) : blogs.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Be the first to share a food story."
            action={<Button onClick={() => navigate("/community/create")}>Create post</Button>}
          />
        ) : (
          <ul className="grid md:grid-cols-2 gap-3">
            {blogs.slice(0, 4).map((b) => (
              <li key={b._id}>
                <Link to={`/community/post/${b._id}`} className="card card-hover flex items-center gap-3 p-3">
                  <div className="w-20 h-20 rounded-2xl bg-orange-50 overflow-hidden shrink-0">
                    {b.media?.[0]?.type !== "video" && b.media?.[0]?.url && (
                      <img src={b.media[0].url} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink line-clamp-2">{b.description}</p>
                    <p className="text-[13px] text-ink-soft mt-1 flex items-center gap-1.5">
                      <Avatar name={b.createdBy?.name || b.createdBy?.username} size={18} />
                      <span className="truncate">{b.createdBy?.name || b.createdBy?.username || "Someone"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{b.likes?.length || 0} likes</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
