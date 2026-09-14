import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as blogService from "../services/blogService";
import { getErrorMessage } from "../services/api";
import BottomNav from "../components/BottomNav";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

export default function BlogFeed() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await blogService.getAllBlogs();
      setBlogs(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load blogs."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLike(blogId) {
    try {
      const res = await blogService.toggleLike(blogId);
      setBlogs((prev) =>
        prev.map((b) => (b._id === blogId ? { ...b, _likeCount: res.data.likeCount, _liked: res.data.liked } : b))
      );
    } catch {
      // Silently ignore — a failed like shouldn't disrupt the feed.
    }
  }

  const filtered = blogs.filter((b) => {
    if (query.trim() && !b.description?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="app-shell pb-24">
      <div className="px-5 pt-6">
        <h1 className="font-display font-bold text-xl text-ink mb-4">Food Community</h1>
        <input
          className="input-field"
          placeholder="Search blogs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {["all", "recipes", "reviews", "food stories", "tips"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip ${filter === f ? "chip-active" : ""}`}
            >
              {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-4">
        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No stories yet"
            description="Be the first to share a food story with the community."
            action={
              <button onClick={() => navigate("/create-post")} className="btn-primary px-6 py-2 text-sm mt-2">
                Write a story
              </button>
            }
          />
        )}

        {!loading &&
          !error &&
          filtered.map((blog) => (
            <div key={blog._id} className="card overflow-hidden">
              {blog.media?.[0]?.url && (
                <img src={blog.media[0].url} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <p className="font-display font-semibold text-ink line-clamp-1">
                  {blog.description}
                </p>
                <p className="text-xs text-ink-faint mt-1">
                  {blog.createdBy?.username ? `@${blog.createdBy.username}` : "Unknown"}
                  {" · "}
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-5 mt-3 text-sm text-ink-soft">
                  <button onClick={() => handleLike(blog._id)} className="flex items-center gap-1">
                    ❤️ {blog._likeCount ?? blog.likes?.length ?? 0}
                  </button>
                  <span className="flex items-center gap-1">💬 {blog.comments?.length ?? 0}</span>
                  <button
                    onClick={() => blogService.toggleShare(blog._id)}
                    className="flex items-center gap-1"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
