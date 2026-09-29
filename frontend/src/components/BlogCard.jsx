import { useRef, useState } from "react";
import { Bookmark, Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import Avatar from "./ui/Avatar";
import { IconButton } from "./ui/Button";
import { hasMember } from "../hooks/useBlogActions";
import { timeAgo } from "../utils/format";

const TAG = /(#[\p{L}\p{N}_]+)/u;

// Description text with clickable #hashtags.
function RichText({ text, onHashtag }) {
  const parts = String(text || "").split(TAG);
  return (
    <p className="text-[15px] text-ink leading-relaxed whitespace-pre-line break-words">
      {parts.map((part, i) =>
        TAG.test(part) ? (
          <button
            key={i}
            type="button"
            onClick={() => onHashtag?.(part.slice(1))}
            className="text-orange-700 font-semibold hover:underline"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

function ActionButton({ label, activeText, count, active, onClick, icon: Icon, pressed, iconKey }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={typeof count === "number" ? `${label}, ${count}` : label}
      className={`flex items-center gap-1.5 min-h-11 px-2.5 -mx-1 rounded-xl text-[14px] font-medium hover:bg-orange-50 transition ${
        active ? "text-orange-700" : "text-ink-soft"
      }`}
    >
      <Icon
        key={iconKey}
        size={20}
        aria-hidden="true"
        fill={active ? "currentColor" : "none"}
        className={active ? "anim-pop" : ""}
      />
      {typeof count === "number" && <span className="tabular-nums">{count}</span>}
      <span className="hidden sm:inline">{active && activeText ? activeText : label}</span>
    </button>
  );
}

// Optimistic actions live in the parent (useBlogActions); this card only renders.
export default function BlogCard({
  blog,
  currentUserId,
  onLike,
  onSave,
  onShare,
  onOpenComments,
  onDelete,
  onHashtag,
}) {
  const liked = hasMember(blog.likes, currentUserId);
  const saved = hasMember(blog.savedBy, currentUserId);
  const shared = hasMember(blog.shares, currentUserId);
  const isOwner = Boolean(currentUserId) && blog.createdBy?._id === currentUserId;
  const media = Array.isArray(blog.media) ? blog.media : [];
  const author = blog.createdBy?.name || blog.createdBy?.username || "Someone";
  const [slide, setSlide] = useState(0);
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);

  // Double-tap (or double-click) the photo to like it, like on Instagram.
  const onMediaTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      setBurst((b) => b + 1);
      onLike?.(blog, { onlyLike: true });
    } else {
      lastTap.current = now;
    }
  };

  // Hashtags stored on the post but not already written in the text.
  const extraTags = (Array.isArray(blog.hashtags) ? blog.hashtags : []).filter(
    (h) => !String(blog.description || "").toLowerCase().includes(`#${String(h).toLowerCase()}`)
  );

  return (
    <article className="card overflow-hidden mb-5" aria-label={`Post by ${author}`}>
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Avatar name={author} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-ink truncate">{author}</p>
          <p className="text-[12px] text-ink-soft">{timeAgo(blog.createdAt) || "Community story"}</p>
        </div>
        {isOwner && onDelete && (
          <IconButton label="Delete post" icon={Trash2} onClick={() => onDelete(blog)} className="!border-transparent !bg-transparent text-ink-soft hover:!text-danger" />
        )}
      </div>

      {media.length > 0 && (
        <div className="relative select-none">
          <div
            role="region"
            aria-label={media.length > 1 ? `Post media, ${media.length} items` : "Post media"}
            tabIndex={media.length > 1 ? 0 : undefined}
            onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth || 1)))}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-orange-50"
          >
            {media.map((m, i) => (
              <div
                key={i}
                onClick={m.type === "video" ? undefined : onMediaTap}
                className="snap-center shrink-0 w-full aspect-[4/3] bg-orange-50"
              >
                {m.type === "video" ? (
                  <video src={m.url} className="w-full h-full object-cover" controls preload="metadata" aria-label={`Video ${i + 1} in ${author}'s post`} />
                ) : (
                  <img
                    src={m.url}
                    alt={`Photo ${i + 1} of ${media.length} from ${author}'s post`}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          {media.length > 1 && (
            <span className="absolute top-3 right-3 badge badge-dark" aria-hidden="true">
              {slide + 1}/{media.length}
            </span>
          )}
          {burst > 0 && (
            <div key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Heart size={96} className="text-white anim-burst drop-shadow-lg" fill="currentColor" />
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-3 pb-2">
        <RichText text={blog.description} onHashtag={onHashtag} />
        {extraTags.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-x-2">
            {extraTags.map((h) => (
              <button key={h} type="button" onClick={() => onHashtag?.(h)} className="text-[13px] text-orange-700 font-semibold hover:underline">
                #{h}
              </button>
            ))}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 px-4 pb-2 pt-1 border-t border-(--color-line) mx-0 mt-2">
        <ActionButton
          label="Like"
          activeText="Liked"
          count={blog.likes?.length || 0}
          active={liked}
          pressed={liked}
          iconKey={liked ? "on" : "off"}
          icon={Heart}
          onClick={() => onLike?.(blog)}
        />
        <ActionButton label="Comment" count={blog.comments?.length || 0} icon={MessageCircle} onClick={() => onOpenComments?.(blog)} />
        <ActionButton label="Share" count={blog.shares?.length || 0} active={shared} icon={Share2} onClick={() => onShare?.(blog)} />
        <div className="ml-auto">
          <ActionButton label="Save" activeText="Saved" active={saved} pressed={saved} iconKey={saved ? "on" : "off"} icon={Bookmark} onClick={() => onSave?.(blog)} />
        </div>
      </div>
    </article>
  );
}
