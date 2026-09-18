import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Bookmark, Trash2, PlayCircle } from "lucide-react";
import { cx, initials, timeAgo } from "../lib/utils";

export default function BlogCard({
  blog,
  isLiked,
  isSaved,
  canDelete,
  onLike,
  onSave,
  onShare,
  onComment,
  onDelete,
  detailed = false,
}) {
  const author = blog.createdBy || {};
  const media = blog.media?.[0];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 pt-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
          {initials(author.name || author.username || "U")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{author.name || author.username}</p>
          <p className="text-xs capitalize text-muted">@{author.username} · {timeAgo(blog.createdAt)}</p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete?.(blog)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all duration-200 hover:bg-danger/10 hover:text-danger"
            aria-label="Delete post"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className="px-4 pt-3">
        <p className={cx("text-sm text-ink/90 whitespace-pre-line", !detailed && "line-clamp-3")}>
          {blog.description}
        </p>
        {blog.hashtags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {blog.hashtags.map((tag) => (
              <Link key={tag} to={`/hashtag/${tag}`} className="text-xs font-medium text-secondary hover:underline">
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {media && (
        <div className="mt-3 overflow-hidden bg-bg">
          {media.type === "video" ? (
            <video src={media.url} controls className="max-h-[420px] w-full object-cover" />
          ) : (
            <img src={media.url} alt="" className="max-h-[420px] w-full object-cover" />
          )}
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-2">
        <ActionButton
          icon={Heart}
          active={isLiked}
          activeClass="text-danger fill-danger"
          count={blog.likes?.length}
          onClick={onLike}
          label="Like"
        />
        <ActionButton icon={MessageCircle} count={blog.comments?.length} onClick={onComment} label="Comment" />
        <ActionButton icon={Share2} count={blog.shares?.length} onClick={onShare} label="Share" />
        <div className="ml-auto">
          <ActionButton
            icon={Bookmark}
            active={isSaved}
            activeClass="text-secondary fill-secondary"
            onClick={onSave}
            label={isSaved ? "Saved" : "Save"}
          />
        </div>
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, active, activeClass, count, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:bg-bg",
        active ? activeClass : "text-muted"
      )}
    >
      <Icon size={16} className={active ? activeClass : ""} />
      {typeof count === "number" ? count : label}
    </button>
  );
}

export { PlayCircle };
