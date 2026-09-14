import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { getAllBlogs, toggleLike, toggleSave, toggleShare } from "../api/blog";
import { getFollowing } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BlogCard from "../components/BlogCard";
import CommentsSheet from "../components/CommentsSheet";
import { EmptyState, ErrorState, LoadingState } from "../components/States";

export default function FoodCommunity() {
  const [blogs, setBlogs] = useState([]);
  const [followingIds, setFollowingIds] = useState(null);
  const [tab, setTab] = useState("forYou");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeComments, setActiveComments] = useState(null);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const load = () =>
    getAllBlogs()
      .then((res) => setBlogs(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (tab !== "following" || followingIds || !user?.id) return;
    getFollowing(user.id)
      .then((res) => setFollowingIds((res.following || []).map((u) => u._id || u)))
      .catch(() => setFollowingIds([]));
  }, [tab, followingIds, user?.id]);

  const applyBlogUpdate = (id, patch) =>
    setBlogs((prev) => prev.map((b) => (b._id === id ? { ...b, ...patch } : b)));

  const handleLike = async (blog) => {
    try {
      const res = await toggleLike(blog._id);
      const likes = res.liked
        ? [...(blog.likes || []), user?.id]
        : (blog.likes || []).filter((u) => (u._id || u) !== user?.id);
      applyBlogUpdate(blog._id, { likes });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = async (blog) => {
    try {
      const res = await toggleSave(blog._id);
      const savedBy = res.saved
        ? [...(blog.savedBy || []), user?.id]
        : (blog.savedBy || []).filter((u) => (u._id || u) !== user?.id);
      applyBlogUpdate(blog._id, { savedBy });
      toast.success(res.saved ? "Saved" : "Removed from saved");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleShare = async (blog) => {
    try {
      const res = await toggleShare(blog._id);
      applyBlogUpdate(blog._id, { shares: new Array(res.shareCount).fill(null) });
      toast.success("Shared");
      if (navigator.share) {
        navigator.share({ title: "FoodMenu", text: blog.description }).catch(() => {});
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = blogs
    .filter(
      (b) =>
        !query ||
        b.description?.toLowerCase().includes(query.toLowerCase()) ||
        b.hashtags?.some((h) => h.includes(query.toLowerCase()))
    )
    .filter((b) => {
      if (tab !== "following") return true;
      const authorId = b.createdBy?._id || b.createdBy;
      return (followingIds || []).includes(authorId);
    });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">COMMUNITY</p>
          <h2 className="font-display text-3xl mt-1">Stories from the table</h2>
        </div>
        <button onClick={() => navigate("/community/create")} className="btn-primary flex items-center gap-2 py-3">
          <Plus size={16} /> New post
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-(--color-line) rounded-2xl px-4 py-3 mb-4">
        <Search size={16} className="text-ink-soft/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, tags..."
          className="flex-1 outline-none text-[14px] bg-transparent"
        />
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "forYou", label: "For You" },
          { key: "following", label: "Following" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-[12px] font-semibold ${
              tab === t.key ? "bg-orange-500 text-white" : "bg-white border border-(--color-line) text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorState message={error} onRetry={() => { setLoading(true); load(); }} />}
      {loading || (tab === "following" && followingIds === null) ? (
        <LoadingState label="Loading community..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={tab === "following" ? "Nobody to show yet" : "No posts yet"}
          description={
            tab === "following"
              ? "Follow chefs and food lovers to see their posts here."
              : "Share a recipe, a plate, or a kitchen story."
          }
          action={<button onClick={() => navigate("/community/create")} className="btn-primary mt-3">Create post</button>}
        />
      ) : (
        <div className="max-w-2xl">
          {filtered.map((b) => (
            <BlogCard
              key={b._id}
              blog={b}
              currentUserId={user?.id}
              onLike={handleLike}
              onSave={handleSave}
              onShare={handleShare}
              onOpenComments={setActiveComments}
            />
          ))}
        </div>
      )}

      {activeComments && (
        <CommentsSheet blog={activeComments} onClose={() => setActiveComments(null)} />
      )}
    </div>
  );
}
