import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSavedBlogs, toggleLike, toggleSave, toggleShare } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BlogCard from "../components/BlogCard";
import CommentsSheet from "../components/CommentsSheet";
import { EmptyState, ErrorState, LoadingState } from "../components/States";

export default function Saved() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBlog, setActiveBlog] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    getSavedBlogs()
      .then((res) => setBlogs(res.data || res.blogs || []))
      .catch((err) => setError(err.message || "Couldn't load your saved recipes"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const patch = (blogId, updater) =>
    setBlogs((list) => list.map((b) => (b._id === blogId ? updater(b) : b)));

  const onLike = async (blog) => {
    try {
      const res = await toggleLike(blog._id);
      patch(blog._id, (b) => ({ ...b, likes: res.likes ?? b.likes }));
    } catch (err) {
      toast.error(err.message || "Couldn't update like");
    }
  };

  const onSave = async (blog) => {
    try {
      await toggleSave(blog._id);
      setBlogs((list) => list.filter((b) => b._id !== blog._id));
      toast.success("Removed from saved");
    } catch (err) {
      toast.error(err.message || "Couldn't update save");
    }
  };

  const onShare = async (blog) => {
    try {
      const res = await toggleShare(blog._id);
      patch(blog._id, (b) => ({ ...b, shares: res.shares ?? b.shares }));
    } catch {
      /* non-critical */
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-5">Saved Recipes</h1>

      {loading && <LoadingState label="Loading your saved recipes..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && blogs.length === 0 && (
        <EmptyState
          title="Nothing saved yet"
          description="Tap the bookmark icon on any post to save it here for later."
          action={
            <button onClick={() => navigate("/community")} className="btn-primary mt-3">
              Explore community
            </button>
          }
        />
      )}
      {!loading && !error && blogs.length > 0 && (
        <div className="md:grid md:grid-cols-2 md:gap-4">
          {blogs.map((b) => (
            <BlogCard
              key={b._id}
              blog={b}
              currentUserId={user?._id}
              onLike={onLike}
              onSave={onSave}
              onShare={onShare}
              onOpenComments={setActiveBlog}
            />
          ))}
        </div>
      )}

      {activeBlog && (
        <CommentsSheet blog={activeBlog} onClose={() => setActiveBlog(null)} />
      )}
    </div>
  );
}
