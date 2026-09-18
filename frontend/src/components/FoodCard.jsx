import { Link } from "react-router-dom";
import { ChefHat, Trash2 } from "lucide-react";

export default function FoodCard({ food, manage = false, onDelete }) {
  const ingredients = Array.isArray(food.ingredients) ? food.ingredients : [];

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-bg">
        {food.foodImage ? (
          <img
            src={food.foodImage}
            alt={food.foodName}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ChefHat size={28} />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-display text-base font-semibold text-ink">{food.foodName}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <ChefHat size={12} /> {food.chef?.username || "FoodAI Chef"}
        </p>

        {ingredients.length > 0 && (
          <p className="mt-2 line-clamp-2 text-xs text-ink/70">{ingredients.join(", ")}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/recipes/${food._id}`}
            state={{ food }}
            className="flex-1 rounded-full bg-primary py-2 text-center text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            View Recipe
          </Link>
          {manage && (
            <button
              onClick={() => onDelete?.(food)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-danger transition-all duration-200 hover:bg-danger/10"
              aria-label="Delete recipe"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
