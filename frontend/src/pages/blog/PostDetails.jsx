import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Link2 } from "lucide-react";
import { getAllBlogs } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useBlogInteractions } from "../../hooks/useBlogInteractions";
import Loading from "../../components/Loading";
import BlogCard from "../../components/BlogCard";
import CommentModal from "../../components/CommentModal";

export default function PostDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [blog, setBlog] = useState(location.state?.blog || null);
  const [loading, setLoading] = useState(!location.state?.blog);
  const [showComments, setShowComments] = useState(false);

  const setBlogList = (updater) => {
    setBlog((prev) => {
      if (!prev) return prev;
      const [updated] = updater([prev]);
      return updated;
    });
  };
  const { isLiked, isSaved, handleLike, handleSave, handleShare, bumpCommentCount } = useBlogInteractions(setBlogList);

  useEffect(() => {
    if (blog) return;
    let active = true;
    getAllBlogs()
      .then(({ data }) => {
        if (!active) return;
        setBlog((data.data || []).find((b) => b._id === id) || null);
      })
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load this post.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, blog]);

  if (loading) return <Loading full label="Loading post..." />;

  if (!blog) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-lg text-ink">We couldn't find that post.</p>
        <Link to="/community" className="mt-3 inline-block text-sm font-semibold text-secondary hover:underline">
          Back to community
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to community
      </Link>

      <BlogCard
        blog={blog}
        detailed
        isLiked={isLiked(blog)}
        isSaved={isSaved(blog)}
        onLike={() => handleLike(blog)}
        onSave={() => handleSave(blog)}
        onShare={() => handleShare(blog)}
        onComment={() => setShowComments(true)}
      />

      {blog.socialLinks?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-ink">Social Links</h3>
          <ul className="space-y-1.5">
            {blog.socialLinks.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
                >
                  <Link2 size={13} /> {s.platform}: {s.platformId}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showComments && (
        <CommentModal
          blog={blog}
          onClose={() => setShowComments(false)}
          onCountChange={(delta) => bumpCommentCount(blog._id, delta)}
        />
      )}
    </div>
  );
}
