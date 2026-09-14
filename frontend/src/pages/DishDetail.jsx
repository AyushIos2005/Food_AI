import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Bookmark, ChefHat, Share2, Tag } from "lucide-react";
import { getFoodById } from "../api/food";
import TopBar from "../components/TopBar";
import { EmptyState, LoadingState } from "../components/States";

function useSavedDishes() {
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dishfinder_saved_dishes") || "[]");
    } catch {
      return [];
    }
  });
  const toggle = (id) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("dishfinder_saved_dishes", JSON.stringify(next));
      return next;
    });
  };
  return { saved, toggle };
}

export default function DishDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dish, setDish] = useState(location.state?.dish || null);
  const [loading, setLoading] = useState(!location.state?.dish);
  const [notFound, setNotFound] = useState(false);
  const { saved, toggle } = useSavedDishes();

  useEffect(() => {
    if (dish) return;
    getFoodById(id)
      .then((res) => setDish(res.food))
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isSaved = saved.includes(id);

  const share = async () => {
    const shareData = {
      title: dish?.foodName,
      text: `Check out ${dish?.foodName} on FoodMenu!`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled share */
      }
    } else {
      navigator.clipboard?.writeText(shareData.text);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-cream">
        <TopBar title="Dish Detail" />
        <LoadingState label="Loading dish..." />
      </div>
    );
  }

  if (!dish || notFound) {
    return (
      <div className="min-h-dvh bg-cream flex flex-col">
        <TopBar title="Dish Detail" />
        <div className="px-5">
          <EmptyState
            title="Dish not found"
            description="This dish may have been removed or the link is invalid."
            action={
              <button onClick={() => navigate("/recipes")} className="btn-primary mt-3">
                Back to Explore
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream pb-10">
      <div className="relative">
        <div className="w-full aspect-[4/3] bg-orange-50">
          {dish.foodImage ? (
            <img src={dish.foodImage} className="w-full h-full object-cover" alt={dish.foodName} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
          )}
        </div>
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
          >
            ←
          </button>
          <div className="flex gap-2">
            <button
              onClick={share}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => toggle(id)}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"
            >
              <Bookmark size={16} className={isSaved ? "fill-orange-500 text-orange-500" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl text-ink">{dish.foodName}</h1>
        </div>
        <p className="flex items-center gap-1.5 text-[13px] text-ink-soft mt-1.5">
          <ChefHat size={14} /> By {dish.chef?.username || "FoodMenu Chef"}
        </p>

        {dish.description && (
          <p className="text-[13px] text-ink-soft leading-relaxed mt-4">{dish.description}</p>
        )}

        {dish.ingredients?.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[14px] font-bold text-ink mb-2 flex items-center gap-1.5">
              <Tag size={14} className="text-orange-500" /> Ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {dish.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-[12px] font-medium"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {dish.precautions && (
          <div className="mt-5 card p-4 bg-orange-50/50">
            <h2 className="text-[13px] font-bold text-ink mb-1">Precautions</h2>
            <p className="text-[12px] text-ink-soft">{dish.precautions}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/recipes")}
            className="flex-1 btn-outline text-[13px]"
          >
            More dishes
          </button>
          <button
            onClick={() => navigate("/ai/create")}
            className="flex-1 btn-primary text-[13px]"
          >
            Cook this with AI
          </button>
        </div>
      </div>
    </div>
  );
}
