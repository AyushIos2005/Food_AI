import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bookmark } from "lucide-react";
import { getSavedBlogs } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useBlogInteractions } from "../../hooks/useBlogInteractions";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import BlogCard from "../../components/BlogCard";
import CommentModal from "../../components/CommentModal";

export default function SavedPosts() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComment, setActiveComment] = useState(null);
  const { isLiked, isSaved, handleLike, handleSave, handleShare, bumpCommentCount } = useBlogInteractions(setBlogs);

  useEffect(() => {
    let active = true;
    getSavedBlogs()
      .then(({ data }) => active && setBlogs(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your saved posts.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <Loading full label="Loading saved posts..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Food Community</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Saved Posts</h1>
      </div>

      {blogs.length === 0 ? (
        <EmptyState icon={Bookmark} title="You haven't saved any posts yet." actionLabel="Explore Community" actionTo="/community" />
      ) : (
        <div className="space-y-5">
          {blogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              isLiked={isLiked(blog)}
              isSaved={isSaved(blog)}
              canDelete={blog.createdBy?._id === user?.id}
              onLike={() => handleLike(blog)}
              onSave={() => handleSave(blog)}
              onShare={() => handleShare(blog)}
              onComment={() => setActiveComment(blog)}
            />
          ))}
        </div>
      )}

      {activeComment && (
        <CommentModal blog={activeComment} onClose={() => setActiveComment(null)} onCountChange={(d) => bumpCommentCount(activeComment._id, d)} />
      )}
    </div>
  );
}
