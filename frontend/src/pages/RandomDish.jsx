import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChefHat, Shuffle, Sparkles } from "lucide-react";
import { getAllFood } from "../api/food";
import TopBar from "../components/TopBar";
import { Button, IconButton } from "../components/ui/Button";
import { asArray, useAsync } from "../hooks/useAsync";
import { useSavedDishes } from "../hooks/useSaved";
import { useToast } from "../context/ToastContext";

const pickRandom = (list, excludeId) => {
  const pool = list.length > 1 ? list.filter((d) => d._id !== excludeId) : list;
  return pool[Math.floor(Math.random() * pool.length)] || null;
};

export default function RandomDish() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isSaved, toggle } = useSavedDishes();
  const { data, error, loading, reload } = useAsync((signal) => getAllFood(null, { signal }), []);
  const dishes = useMemo(() => asArray(data?.foods), [data]);
  const [pickedId, setPickedId] = useState(null);
  const [initial, setInitial] = useState(null);
  const [seenData, setSeenData] = useState(null);

  if (data !== seenData) {
    setSeenData(data);
    setInitial(pickRandom(dishes, null));
    setPickedId(null);
  }

  const current = dishes.find((d) => d._id === pickedId) || initial;
  const saved = current ? isSaved(current._id) : false;

  const tryAnother = () => {
    const next = pickRandom(dishes, current?._id);
    if (next) setPickedId(next._id);
  };

  return (
    <div className="min-h-dvh -mx-4 sm:-mx-6 -mt-6 bg-dark text-white flex flex-col">
      <TopBar title="Surprise Me" onBack={() => navigate(-1)} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <p className="uppercase tracking-[3px] text-[12px] text-orange-300 flex items-center gap-1.5">
          <Sparkles size={13} aria-hidden="true" /> Surprise Me!
        </p>

        {loading && <p className="text-[14px] text-white/60">Finding a surprise dish...</p>}
        {error && (
          <div role="alert" className="flex flex-col items-center gap-3">
            <p className="text-[14px] text-white/85">{error}</p>
            <Button variant="outline" size="sm" onClick={reload} className="!bg-transparent !text-white !border-white/30">
              Try again
            </Button>
          </div>
        )}
        {!loading && !error && !current && (
          <p className="text-[14px] text-white/60">No dishes have been added yet.</p>
        )}

        {current && (
          <>
            <div key={current._id} className="w-56 h-56 rounded-[28px] bg-white/5 overflow-hidden fade-in relative">
              {current.foodImage ? (
                <img src={current.foodImage} className="w-full h-full object-cover" alt={current.foodName || ""} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl" aria-hidden="true">🍲</div>
              )}
              <IconButton
                label={saved ? "Remove from saved recipes" : "Save recipe"}
                icon={Bookmark}
                filled={saved}
                onClick={() => {
                  const now = toggle(current._id);
                  toast.success(now ? "Recipe saved" : "Removed from saved recipes");
                }}
                className="!absolute top-2 right-2 !bg-white/90 !border-transparent"
              />
            </div>
            <h2 className="text-xl font-bold mt-2">{current.foodName}</h2>
            <p className="text-[14px] text-white/65 max-w-[280px]">
              {current.description || "A dish worth discovering, curated just for you."}
            </p>
          </>
        )}
      </div>

      <div className="px-8 pb-[max(24px,env(safe-area-inset-bottom))] flex flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          icon={Shuffle}
          onClick={tryAnother}
          disabled={dishes.length < 2}
          className="!bg-transparent !text-white !border-white/25 hover:!bg-white/10"
        >
          Try Another
        </Button>
        <Button
          size="lg"
          icon={ChefHat}
          disabled={!current}
          onClick={() => current && navigate(`/dish/${current._id}`, { state: { dish: current } })}
        >
          View Dish
        </Button>
      </div>
    </div>
  );
}
