import { Link } from "react-router-dom";
import { Bookmark, Leaf, Drumstick } from "lucide-react";
import { useSavedDishes } from "../hooks/useSaved";
import { useToast } from "../context/ToastContext";
import { asArray } from "../hooks/useAsync";
import { IconButton } from "./ui/Button";
import { isVegetarian } from "../utils/dishFilters";

// The whole card is one link (stretched ::after), and the save button sits
// above it, so there are never nested interactive elements.
export default function DishCard({ dish, matchLabel }) {
  const { isSaved, toggle } = useSavedDishes();
  const toast = useToast();
  const saved = isSaved(dish._id);
  const veg = isVegetarian(dish);
  const ingredients = asArray(dish.ingredients);

  const onSave = () => {
    const now = toggle(dish._id);
    toast.success(now ? "Recipe saved" : "Removed from saved recipes");
  };

  return (
    <article className="card overflow-hidden group relative card-hover">
      <div className="aspect-[4/3] overflow-hidden bg-orange-50 relative">
        {dish.foodImage ? (
          <img
            src={dish.foodImage}
            alt={dish.foodName ? `${dish.foodName}` : "Dish"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl" aria-hidden="true">🍽️</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />
        <span className={`absolute left-3 bottom-3 badge ${veg ? "badge-green" : ""}`}>
          {veg ? <Leaf size={12} aria-hidden="true" /> : <Drumstick size={12} aria-hidden="true" />}
          {veg ? "Veg" : "Non-veg"}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="text-[15px] font-semibold text-ink truncate">
          <Link
            to={`/dish/${dish._id}`}
            state={{ dish }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-[22px]"
          >
            {dish.foodName}
          </Link>
        </h3>
        <p className="text-[13px] text-ink-soft mt-1 line-clamp-2 min-h-[2.6em]">
          {dish.description || ingredients.slice(0, 3).join(" · ") || "Chef special"}
        </p>
        <div className="flex items-center justify-between mt-3 text-[12px] text-ink-soft">
          <span className="truncate">by {dish.chef?.username || "FOODAI"}</span>
          {ingredients.length > 0 && <span>{ingredients.length} ingredients</span>}
        </div>
        {matchLabel && <p className="mt-2 text-[12px] font-semibold text-orange-800">Matches: {matchLabel}</p>}
      </div>

      <IconButton
        label={saved ? `Remove ${dish.foodName} from saved` : `Save ${dish.foodName}`}
        icon={Bookmark}
        glass
        filled={saved}
        aria-pressed={saved}
        onClick={onSave}
        className={`!absolute top-2.5 right-2.5 z-10 ${saved ? "!text-orange-700" : ""}`}
      />
    </article>
  );
}
