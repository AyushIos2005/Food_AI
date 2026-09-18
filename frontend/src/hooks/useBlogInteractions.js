import toast from "react-hot-toast";
import { likeBlog, saveBlog, shareBlog, deleteBlog } from "../api/blog.api";
import { getErrorMessage } from "../lib/errorMessage";
import { useAuth } from "../context/AuthContext";

// Shared like / save / share / delete / comment-count logic for any screen
// that renders blogs. Optimistic first, then reconciled with the exact
// counts the backend returns (likeCount / saveCount / shareCount).
export function useBlogInteractions(setBlogs) {
  const { user } = useAuth();

  const has = (list) => !!list?.some((u) => (u._id || u) === user?.id);
  const isLiked = (blog) => has(blog.likes);
  const isSaved = (blog) => has(blog.savedBy);
  const isShared = (blog) => has(blog.shares);

  function updateBlog(id, updater) {
    setBlogs((prev) => prev.map((b) => (b._id === id ? updater(b) : b)));
  }

  // Rebuild an id list so its length matches the count the server reports.
  function syncList(list, active, count) {
    const withoutMe = (list || []).filter((u) => (u._id || u) !== user?.id);
    const next = active ? [...withoutMe, { _id: user.id }] : withoutMe;
    if (typeof count !== "number") return next;
    if (next.length === count) return next;
    return Array.from({ length: count }, (_, i) => next[i] || { _id: `other-${i}` });
  }

  async function toggle(blog, field, apiCall, flagKey, countKey, messages) {
    const active = has(blog[field]);
    updateBlog(blog._id, (b) => ({ ...b, [field]: syncList(b[field], !active) }));
    try {
      const { data } = await apiCall(blog._id);
      updateBlog(blog._id, (b) => ({
        ...b,
        [field]: syncList(b[field], data[flagKey], data[countKey]),
      }));
      if (messages) toast.success(data[flagKey] ? messages.on : messages.off);
      return data;
    } catch (err) {
      updateBlog(blog._id, () => blog); // revert
      toast.error(getErrorMessage(err, "Couldn't update that."));
      return null;
    }
  }

  const handleLike = (blog) => toggle(blog, "likes", likeBlog, "liked", "likeCount");

  const handleSave = (blog) =>
    toggle(blog, "savedBy", saveBlog, "saved", "saveCount", {
      on: "Saved",
      off: "Removed from saved",
    });

  async function handleShare(blog) {
    const result = await toggle(blog, "shares", shareBlog, "shared", "shareCount");
    if (!result) return;
    const url = `${window.location.origin}/community/post/${blog._id}`;
    if (navigator.share) {
      navigator.share({ title: "Check out this post on FoodAI", url }).catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.success("Post shared");
      }
    }
  }

  async function handleDelete(blog, onDeleted) {
    try {
      await deleteBlog(blog._id);
      setBlogs((prev) => prev.filter((b) => b._id !== blog._id));
      toast.success("Post deleted successfully");
      onDeleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this post."));
    }
  }

  function bumpCommentCount(blogId, delta) {
    updateBlog(blogId, (b) => ({
      ...b,
      comments: delta > 0 ? [...(b.comments || []), {}] : (b.comments || []).slice(0, -1),
    }));
  }

  return { isLiked, isSaved, isShared, handleLike, handleSave, handleShare, handleDelete, bumpCommentCount };
}
