import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Bookmark, ChefHat, Check, ChevronLeft, Drumstick, Leaf, MapPin, Share2, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import { deleteFood, getAllFood } from "../api/food";
import { getErrorMessage } from "../api/client";
import { EmptyState, ErrorState, Skeleton } from "../components/States";
import { Button, IconButton } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/Sheet";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { asArray, useAsync } from "../hooks/useAsync";
import { useCooked, useSavedDishes } from "../hooks/useSaved";
import { isVegetarian, levelOf, LEVELS } from "../utils/dishFilters";

export default function DishDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { isSaved, toggle } = useSavedDishes();
  const { entries: cooked, markCooked } = useCooked();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checked, setChecked] = useState(() => new Set());

  // Backend has no "get single dish" route: use the dish handed over by the
  // list page, otherwise fetch the list ({ foods: [] }) and find it.
  const stateDish = location.state?.dish || null;
  const { data, loading, error, reload } = useAsync(
    (signal) => (stateDish ? Promise.resolve(null) : getAllFood(null, { signal })),
    [id]
  );
  const dish = stateDish || asArray(data?.foods).find((f) => f._id === id) || null;
  const ingredients = asArray(dish?.ingredients).map(String);
  const saved = isSaved(id);
  const canDelete = Boolean(user?.id) && (dish?.chef?._id || dish?.chef) === user.id;
  const timesCooked = cooked.filter((c) => c.kind === "dish" && c.id === id).length;

  const onSave = () => {
    const now = toggle(id);
    toast.success(now ? "Recipe saved" : "Removed from saved recipes");
  };

  const share = async () => {
    const url = `${window.location.origin}/dish/${id}`;
    const shareData = { title: dish.foodName, text: `Check out ${dish.foodName} on FOODAI!`, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link. Try again.");
    }
  };

  const removeDish = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteFood(dish._id);
      toast.success(`Deleted "${dish.foodName}"`);
      navigate("/recipes", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the dish. Try again."));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const cookWithAi = () =>
    navigate("/ai/create", {
      state: { mode: "new", ingredients: ingredients.slice(0, 12), note: `I'd like to make ${dish.foodName}.` },
    });
  const remixWithAi = () =>
    navigate("/ai/create", { state: { mode: "recreate", existingFoodname: dish.foodName } });

  if (loading && !dish) {
    return (
      <div role="status" aria-busy="true" aria-label="Loading recipe..." className="max-w-4xl grid md:grid-cols-2 gap-6">
        <span className="sr-only">Loading recipe...</span>
        <Skeleton className="aspect-[4/3] !rounded-[28px]" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  if (error && !dish) return <ErrorState message={error} onRetry={reload} showBack />;

  if (!dish) {
    return (
      <EmptyState
        icon={ChefHat}
        title="We couldn't find this recipe"
        description="It may have been removed by the chef."
        action={<Button onClick={() => navigate("/recipes")}>Browse recipes</Button>}
      />
    );
  }

  const veg = isVegetarian(dish);
  const level = LEVELS.find((l) => l.key === levelOf(dish));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => navigate(-1)} className="-ml-3">
          Back
        </Button>
        <div className="flex items-center gap-2">
          {canDelete && (
            <IconButton label="Delete dish" icon={Trash2} onClick={() => setConfirmDelete(true)} className="!text-danger" />
          )}
          <IconButton label="Share recipe" icon={Share2} onClick={share} />
          <IconButton
            label={saved ? "Remove from saved recipes" : "Save recipe"}
            icon={Bookmark}
            filled={saved}
            aria-pressed={saved}
            onClick={onSave}
            className={saved ? "!text-orange-700 !border-orange-300" : ""}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Fixed aspect box: the layout doesn't jump while the photo loads. */}
        <div className="aspect-[4/3] rounded-[28px] overflow-hidden bg-orange-50 card">
          {dish.foodImage ? (
            <img src={dish.foodImage} className="w-full h-full object-cover" alt={`${dish.foodName}, served`} decoding="async" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl" aria-hidden="true">🍽️</div>
          )}
        </div>

        <div>
          <h2 className="font-display text-3xl sm:text-4xl">{dish.foodName}</h2>
          <p className="text-[14px] text-ink-soft mt-1">By {dish.chef?.username || "a FOODAI chef"}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`badge ${veg ? "badge-green" : ""}`}>
              {veg ? <Leaf size={12} aria-hidden="true" /> : <Drumstick size={12} aria-hidden="true" />}
              {veg ? "Vegetarian" : "Contains meat or egg"}
            </span>
            {ingredients.length > 0 && <span className="badge">{ingredients.length} ingredients</span>}
            {level && <span className="badge" title={level.hint}>{level.label}</span>}
            {timesCooked > 0 && (
              <span className="badge badge-green">
                <Check size={12} aria-hidden="true" /> Cooked {timesCooked === 1 ? "once" : `${timesCooked} times`}
              </span>
            )}
          </div>

          {dish.description && <p className="text-[15px] text-ink-soft leading-relaxed mt-4">{dish.description}</p>}

          <div className="mt-6 flex flex-col gap-3">
            <Button size="lg" icon={ChefHat} onClick={cookWithAi}>
              Cook with AI
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" icon={Sparkles} onClick={remixWithAi}>
                Remix with AI
              </Button>
              <Button
                variant="outline"
                icon={Check}
                onClick={() => {
                  markCooked({ id, kind: "dish", name: dish.foodName });
                  toast.success("Logged in your cooked recipes");
                }}
              >
                I Cooked This
              </Button>
            </div>
            <p className="text-[13px] text-ink-soft">
              Cook with AI turns this dish's ingredients into a step-by-step recipe you can follow in Cooking Mode.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        {ingredients.length > 0 && (
          <section aria-labelledby="dish-ing" className="card p-5">
            <div className="flex items-baseline justify-between">
              <h3 id="dish-ing" className="font-display text-2xl">Ingredients</h3>
              <p className="text-[13px] text-ink-soft">{checked.size} of {ingredients.length} ready</p>
            </div>
            <ul className="mt-2">
              {ingredients.map((ing, i) => {
                const on = checked.has(i);
                return (
                  <li key={i}>
                    <label className="flex items-center gap-3 min-h-11 py-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          setChecked((prev) => {
                            const next = new Set(prev);
                            if (on) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        className="w-5 h-5 accent-orange-700 shrink-0"
                      />
                      <span className={`text-[15px] ${on ? "line-through text-ink-soft" : "text-ink"}`}>{ing}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="space-y-4">
          {dish.precautions && (
            <section aria-labelledby="dish-prec" className="card p-5 !border-orange-300 !bg-orange-50/70">
              <h3 id="dish-prec" className="font-display text-xl flex items-center gap-2">
                <ShieldAlert size={18} className="text-orange-800" aria-hidden="true" /> Dietary notes
              </h3>
              <p className="text-[14px] text-ink-soft mt-1">{dish.precautions}</p>
            </section>
          )}
          <section aria-labelledby="dish-where" className="card p-5">
            <h3 id="dish-where" className="font-display text-xl">Where to eat</h3>
            <p className="text-[14px] text-ink-soft mt-1 mb-3">Find restaurants near you serving this dish.</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dish.foodName} restaurant near me`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full"
            >
              <MapPin size={16} aria-hidden="true" /> Find nearby<span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        danger
        busy={deleting}
        title="Delete this dish?"
        message={`"${dish.foodName}" will be removed for everyone. This can't be undone.`}
        confirmLabel="Delete dish"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={removeDish}
      />
    </div>
  );
}
