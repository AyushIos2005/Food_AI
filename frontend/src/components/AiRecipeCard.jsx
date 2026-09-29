import { Trash2 } from "lucide-react";
import { IconButton } from "./ui/Button";

// One AI history entry as returned by GET /ai-service/amzeFood/history:
//   { _id, historyType: "protein_recipe" | "recreated_food", recipe: {...} }
export function aiTitle(item) {
  const r = item?.recipe || {};
  return r.recipeName || r.newFoodName || item?.existingFoodname || "Untitled recipe";
}

export default function AiRecipeCard({ item, onOpen, onDelete, deleting }) {
  const recipe = item?.recipe || {};
  const recreated = item?.historyType === "recreated_food";
  return (
    <div className="card card-hover p-4 relative">
      <button type="button" onClick={onOpen} className="text-left w-full pr-12 rounded-2xl">
        <span className={`badge ${recreated ? "" : "badge-green"}`}>{recreated ? "Remixed dish" : "AI recipe"}</span>
        <h3 className="font-display text-xl mt-2 text-ink">{aiTitle(item)}</h3>
        {recipe.description && <p className="text-[14px] text-ink-soft mt-1 line-clamp-2">{recipe.description}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[13px] text-ink-soft">
          {recipe.servings ? <span>{recipe.servings} servings</span> : null}
          {recipe.preparationTime ? <span>{recipe.preparationTime}</span> : null}
          {recipe.proteinPerServing ? <span>{recipe.proteinPerServing} protein</span> : null}
        </div>
      </button>
      {onDelete && (
        <IconButton
          label={`Delete ${aiTitle(item)}`}
          icon={Trash2}
          size={16}
          onClick={onDelete}
          disabled={deleting}
          className="!absolute top-2 right-2 !border-transparent !bg-transparent text-ink-soft hover:!text-danger"
        />
      )}
    </div>
  );
}
