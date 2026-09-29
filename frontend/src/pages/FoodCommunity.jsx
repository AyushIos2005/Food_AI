import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { deleteBlog, getAllBlogs } from "../api/blog";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BlogCard from "../components/BlogCard";
import CommentsSheet from "../components/CommentsSheet";
import { ConfirmDialog } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { EmptyState, ErrorState, SkeletonPosts } from "../components/States";
import { asArray, useAsync } from "../hooks/useAsync";
import { useBlogActions } from "../hooks/useBlogActions";

export default function FoodCommunity() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [activeComments, setActiveComments] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Backend contract: { success, count, data: Blog[] }
  const { data, setData, loading, error, reload } = useAsync((signal) => getAllBlogs(null, { signal }), []);
  const blogs = asArray(data?.data);

  const update = (id, patch) =>
    setData((prev) => ({
      ...prev,
      data: asArray(prev?.data).map((b) => (b._id === id ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b)),
    }));

  const { like, save, share } = useBlogActions({ update, userId: user?.id });

  const setQuery = (value) => setParams(value ? { q: value } : {}, { replace: true });

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return blogs;
    return blogs.filter(
      (b) =>
        b.description?.toLowerCase().includes(query) ||
        asArray(b.hashtags).some((h) => String(h).toLowerCase().includes(query.replace(/^#/, "")))
    );
  }, [blogs, q]);

  const confirmDelete = async () => {
    if (!toDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteBlog(toDelete._id);
      setData((prev) => ({ ...prev, data: asArray(prev?.data).filter((b) => b._id !== toDelete._id) }));
      toast.success("Post deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the post. Try again."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-3xl">Stories from the table</h2>
          <p className="text-[15px] text-ink-soft mt-1">See what the community is cooking.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/community/create")}>
          New post
        </Button>
      </div>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="search-field mb-6">
        <Search size={18} className="text-ink-soft shrink-0" aria-hidden="true" />
        <label htmlFor="community-search" className="sr-only">Search posts and tags</label>
        <input id="community-search" type="search" value={q} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts, #tags..." autoComplete="off" />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="w-11 h-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-orange-50">
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </form>

      {loading ? (
        <SkeletonPosts label="Loading community..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={blogs.length === 0 ? "No posts yet" : "No matching posts"}
          description={blogs.length === 0 ? "Share a recipe, a plate, or a kitchen story." : "Try a different search."}
          action={
            blogs.length === 0 ? (
              <Button onClick={() => navigate("/community/create")}>Create post</Button>
            ) : (
              <Button variant="outline" onClick={() => setQuery("")}>Clear search</Button>
            )
          }
        />
      ) : (
        <div className="max-w-2xl">
          {filtered.map((b) => (
            <BlogCard
              key={b._id}
              blog={b}
              currentUserId={user?.id}
              onLike={like}
              onSave={save}
              onShare={share}
              onDelete={setToDelete}
              onOpenComments={setActiveComments}
              onHashtag={setQuery}
            />
          ))}
        </div>
      )}

      {activeComments && (
        <CommentsSheet
          blog={activeComments}
          onClose={() => setActiveComments(null)}
          onCommentsChange={(comments) => {
            update(activeComments._id, { comments });
            setActiveComments((c) => (c ? { ...c, comments } : c));
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        busy={deleting}
        title="Delete this post?"
        message="This post and its comments will be removed for everyone. This can't be undone."
        confirmLabel="Delete post"
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
