import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

export default function BlogCard({ blog, onLike, onSave, onShare, onOpenComments, currentUserId }) {
  const liked = blog.likes?.some((u) => (u._id || u) === currentUserId);
  const saved = blog.savedBy?.some((u) => (u._id || u) === currentUserId);
  const cover = blog.media?.[0];

  return (
    <article className="card overflow-hidden mb-5">
      {cover && (
        <div className="w-full aspect-[16/10] bg-orange-50">
          {cover.type === "video" ? (
            <video src={cover.url} className="w-full h-full object-cover" controls />
          ) : (
            <img src={cover.url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
      )}
      {blog.media?.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto no-scrollbar">
          {blog.media.slice(1, 5).map((m, i) =>
            m.type === "video" ? (
              <video key={i} src={m.url} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            ) : (
              <img key={i} src={m.url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            )
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-[13px] font-semibold text-orange-700">
            {(blog.createdBy?.name || blog.createdBy?.username || "U")[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">
              {blog.createdBy?.name || blog.createdBy?.username || "Someone"}
            </p>
            <p className="text-[11px] text-ink-soft/60">Community story</p>
          </div>
        </div>
        <p className="text-[14px] text-ink leading-relaxed whitespace-pre-line">
          {blog.description}
        </p>
        {blog.hashtags?.length > 0 && (
          <p className="text-[12px] text-orange-600 mt-2">
            {blog.hashtags.map((h) => `#${h}`).join(" ")}
          </p>
        )}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-(--color-line)">
          <button onClick={() => onLike?.(blog)} className="flex items-center gap-1.5 text-[13px]">
            <Heart size={18} className={liked ? "text-orange-500 fill-orange-500" : "text-ink-soft/60"} />
            {blog.likes?.length || 0}
          </button>
          <button onClick={() => onOpenComments?.(blog)} className="flex items-center gap-1.5 text-[13px] text-ink-soft/70">
            <MessageCircle size={18} /> {blog.comments?.length || 0}
          </button>
          <button onClick={() => onShare?.(blog)} className="flex items-center gap-1.5 text-[13px] text-ink-soft/70">
            <Share2 size={18} /> {blog.shares?.length || 0}
          </button>
          <button onClick={() => onSave?.(blog)} className="ml-auto">
            <Bookmark size={18} className={saved ? "text-orange-500 fill-orange-500" : "text-ink-soft/60"} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function AiRecipeCard({ recipe, onOpen, onDelete }) {
  return (
    <div className="card p-4 text-left hover:-translate-y-0.5 transition w-full relative group">
      <button onClick={onOpen} className="w-full text-left">
        <p className="text-[11px] tracking-[0.16em] text-orange-600 font-semibold">AI RECIPE</p>
        <h3 className="font-display text-xl mt-1 text-ink pr-8">
          {recipe.recipeName || recipe.newFoodName || "Untitled recipe"}
        </h3>
        <p className="text-[13px] text-ink-soft mt-1 line-clamp-2">{recipe.description}</p>
        <div className="flex gap-3 mt-3 text-[12px] text-ink-soft">
          {recipe.servings && <span>{recipe.servings} servings</span>}
          {recipe.preparationTime && <span>{recipe.preparationTime}</span>}
          {recipe.proteinPerServing && <span>{recipe.proteinPerServing} protein</span>}
        </div>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete recipe"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white border border-(--color-line) flex items-center justify-center text-ink-soft/60 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition sm:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
