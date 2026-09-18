import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, Plus } from "lucide-react";
import { getAllBlogs } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useBlogInteractions } from "../../hooks/useBlogInteractions";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import BlogCard from "../../components/BlogCard";
import CommentModal from "../../components/CommentModal";

export default function CommunityFeed() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComment, setActiveComment] = useState(null);
  const { isLiked, isSaved, handleLike, handleSave, handleShare, handleDelete, bumpCommentCount } =
    useBlogInteractions(setBlogs);

  useEffect(() => {
    let active = true;
    getAllBlogs()
      .then(({ data }) => active && setBlogs(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load the community feed.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading full label="Loading the community feed..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Food Community</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Community Feed</h1>
        </div>
        <Link
          to="/community/create"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
        >
          <Plus size={15} /> Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <EmptyState icon={Users} title="No posts found." actionLabel="Create Post" actionTo="/community/create" />
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
              onDelete={() => handleDelete(blog)}
            />
          ))}
        </div>
      )}

      {activeComment && (
        <CommentModal
          blog={activeComment}
          onClose={() => setActiveComment(null)}
          onCountChange={(delta) => bumpCommentCount(activeComment._id, delta)}
        />
      )}
    </div>
  );
}
