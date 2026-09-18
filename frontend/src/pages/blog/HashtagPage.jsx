import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Hash, ArrowLeft } from "lucide-react";
import { getBlogsByHashtag } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { useBlogInteractions } from "../../hooks/useBlogInteractions";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import BlogCard from "../../components/BlogCard";
import CommentModal from "../../components/CommentModal";

export default function HashtagPage() {
  const { tag } = useParams();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComment, setActiveComment] = useState(null);
  const { isLiked, isSaved, handleLike, handleSave, handleShare, handleDelete, bumpCommentCount } =
    useBlogInteractions(setBlogs);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getBlogsByHashtag(tag)
      .then(({ data }) => active && setBlogs(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load posts for this hashtag.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [tag]);

  if (loading) return <Loading full label={`Loading #${tag}...`} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={15} /> Back to community
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Hash size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">#{tag}</h1>
          <p className="text-sm text-muted">{blogs.length} post{blogs.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {blogs.length === 0 ? (
        <EmptyState icon={Hash} title={`No posts with #${tag} yet.`} actionLabel="Create Post" actionTo="/community/create" />
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
        <CommentModal blog={activeComment} onClose={() => setActiveComment(null)} onCountChange={(d) => bumpCommentCount(activeComment._id, d)} />
      )}
    </div>
  );
}
