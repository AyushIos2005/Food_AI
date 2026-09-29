import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Shuffle, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { getAllFood } from "../api/food";
import DishCard from "../components/DishCard";
import { useAuth } from "../context/AuthContext";
import { asArray, useAsync } from "../hooks/useAsync";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/States";
import { Button } from "../components/ui/Button";
import { Chip, ChipGroup } from "../components/ui/Chip";
import { BottomSheet } from "../components/ui/Sheet";
import { CUISINES, LEVELS, TAGS, matchesFilters } from "../utils/dishFilters";

const QUICK_TAGS = ["vegetarian", "protein", "quick"];

// Search + filters live in the URL (?q=&tags=&cuisine=&level=), so they survive
// opening a recipe and pressing Back, refreshing, or sharing the link.
export default function Explore() {
  const navigate = useNavigate();
  const { isChef } = useAuth();
  const [params, setParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const q = params.get("q") || "";
  const tags = useMemo(() => (params.get("tags") || "").split(",").filter(Boolean), [params]);
  const cuisine = params.get("cuisine") || "";
  const level = params.get("level") || "";

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      const value = Array.isArray(v) ? v.join(",") : v;
      if (value) next.set(k, value);
      else next.delete(k);
    });
    setParams(next, { replace: true });
  };
  const toggleTag = (key) => update({ tags: tags.includes(key) ? tags.filter((t) => t !== key) : [...tags, key] });
  const clearAll = () => setParams({}, { replace: true });

  // Backend contract: { message, foods: Food[] }
  const { data, loading, error, reload } = useAsync((signal) => getAllFood(null, { signal }), []);
  const dishes = useMemo(() => asArray(data?.foods), [data]);

  const filtered = useMemo(
    () => dishes.filter((d) => matchesFilters(d, { q, tags, cuisine, level })),
    [dishes, q, tags, cuisine, level]
  );

  const activeCount = tags.length + (cuisine ? 1 : 0) + (level ? 1 : 0);
  const hasCriteria = activeCount > 0 || Boolean(q.trim());
  const labelOf = (list, key) => list.find((x) => x.key === key)?.label || key;

  const askAi = () => navigate("/ai/create", { state: { note: q.trim() ? `Craving: ${q.trim()}` : "" } });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl">Find your next plate</h2>
          <p className="text-[15px] text-ink-soft mt-1">Search chef recipes, or let the AI cook something new.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isChef && (
            <Button variant="outline" icon={Plus} onClick={() => navigate("/recipes/upload")}>
              Upload dish
            </Button>
          )}
          <Button variant="outline" icon={Sparkles} onClick={() => navigate("/ai/create")}>
            Ask AI Chef
          </Button>
          <Button icon={Shuffle} onClick={() => navigate("/random")}>
            Surprise Me
          </Button>
        </div>
      </div>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="search-field mb-3">
        <Search size={18} className="text-ink-soft shrink-0" aria-hidden="true" />
        <label htmlFor="recipe-search" className="sr-only">Search dishes and ingredients</label>
        <input
          id="recipe-search"
          type="search"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder="Search dishes, ingredients..."
          autoComplete="off"
        />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => update({ q: "" })} className="w-11 h-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-orange-50">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-4" role="group" aria-label="Quick filters">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`chip shrink-0 ${activeCount ? "!border-orange-700 !text-orange-800" : ""}`}
        >
          <SlidersHorizontal size={15} aria-hidden="true" /> Filters{activeCount ? ` (${activeCount})` : ""}
        </button>
        {QUICK_TAGS.map((k) => (
          <Chip key={k} selected={tags.includes(k)} onClick={() => toggleTag(k)} className="shrink-0">
            {labelOf(TAGS, k)}
          </Chip>
        ))}
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4" aria-label="Active filters">
          {tags.filter((t) => !QUICK_TAGS.includes(t)).map((t) => (
            <Chip key={t} selected onClick={() => toggleTag(t)} aria-label={`Remove filter ${labelOf(TAGS, t)}`}>
              {labelOf(TAGS, t)}
            </Chip>
          ))}
          {cuisine && (
            <Chip selected onClick={() => update({ cuisine: "" })} aria-label={`Remove filter ${labelOf(CUISINES, cuisine)} cuisine`}>
              {labelOf(CUISINES, cuisine)}
            </Chip>
          )}
          {level && (
            <Chip selected onClick={() => update({ level: "" })} aria-label={`Remove filter ${labelOf(LEVELS, level)} difficulty`}>
              {labelOf(LEVELS, level)}
            </Chip>
          )}
          <button type="button" onClick={clearAll} className="text-[13px] font-semibold text-orange-800 underline min-h-11 px-2">
            Clear all
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonGrid label="Loading recipes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        hasCriteria ? (
          <EmptyState
            icon={Search}
            title="No recipes found"
            description="Nothing matches that yet. Ask the AI Chef to invent one, or loosen your filters."
            action={<Button icon={Sparkles} onClick={askAi}>Ask AI Chef</Button>}
            secondary={<Button variant="outline" onClick={clearAll}>Clear Filters</Button>}
          />
        ) : (
          <EmptyState
            title="No dishes yet"
            description="Chefs haven't added any dishes yet. The AI Chef can start you off."
            action={<Button icon={Sparkles} onClick={() => navigate("/ai/create")}>Ask AI Chef</Button>}
          />
        )
      ) : (
        <>
          <p className="text-[13px] text-ink-soft mb-3" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d) => (
              <DishCard key={d._id} dish={d} />
            ))}
          </div>
        </>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clearAll} disabled={!activeCount}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            </Button>
          </div>
        }
      >
        <p className="text-[13px] text-ink-soft mb-4">
          Recipes don't carry official labels yet, so these filters are estimated from each dish's name, description and ingredients.
        </p>
        <fieldset className="mb-5">
          <legend className="text-[14px] font-bold text-ink mb-2">Diet & style</legend>
          <ChipGroup label="Diet and style">
            {TAGS.map((t) => (
              <Chip key={t.key} selected={tags.includes(t.key)} onClick={() => toggleTag(t.key)}>
                {t.label}
              </Chip>
            ))}
          </ChipGroup>
        </fieldset>
        <fieldset className="mb-5">
          <legend className="text-[14px] font-bold text-ink mb-2">Difficulty</legend>
          <ChipGroup label="Difficulty">
            {LEVELS.map((l) => (
              <Chip key={l.key} selected={level === l.key} onClick={() => update({ level: level === l.key ? "" : l.key })} title={l.hint}>
                {l.label}
              </Chip>
            ))}
          </ChipGroup>
          <p className="text-[12px] text-ink-soft mt-2">Easy is 5 ingredients or fewer; Medium is 6 to 9; Involved is 10+.</p>
        </fieldset>
        <fieldset>
          <legend className="text-[14px] font-bold text-ink mb-2">Cuisine</legend>
          <ChipGroup label="Cuisine">
            {CUISINES.map((c) => (
              <Chip key={c.key} selected={cuisine === c.key} onClick={() => update({ cuisine: cuisine === c.key ? "" : c.key })}>
                {c.label}
              </Chip>
            ))}
          </ChipGroup>
        </fieldset>
      </BottomSheet>
    </div>
  );
}
