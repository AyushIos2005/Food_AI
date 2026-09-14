import { useNavigate } from "react-router-dom";
import { Clock, Flame } from "lucide-react";

export default function DishCard({ dish }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/dish/${dish._id}`, { state: { dish } })}
      className="card overflow-hidden text-left w-full group hover:-translate-y-0.5 transition"
    >
      <div className="aspect-[4/3] overflow-hidden bg-orange-50 relative">
        {dish.foodImage ? (
          <img
            src={dish.foodImage}
            alt={dish.foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="p-3.5">
        <p className="text-[15px] font-semibold text-ink truncate">{dish.foodName}</p>
        <p className="text-[12px] text-ink-soft/80 mt-1 line-clamp-2">
          {dish.description || dish.ingredients?.slice(0, 3).join(" · ") || "Chef special"}
        </p>
        <div className="flex items-center justify-between mt-3 text-[11px] text-ink-soft">
          <span className="truncate">by {dish.chef?.username || "FoodMenu"}</span>
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <Flame size={12} /> Fresh
          </span>
        </div>
        {dish.precautions && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-soft/70">
            <Clock size={11} /> {dish.precautions}
          </p>
        )}
      </div>
    </button>
  );
}
