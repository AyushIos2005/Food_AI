import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getAllBlogs } from "../api/blog";
import BlogCard from "../components/BlogCard";
import CommentsSheet from "../components/CommentsSheet";
import { EmptyState, ErrorState, SkeletonPosts } from "../components/States";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { asArray, useAsync } from "../hooks/useAsync";
import { useBlogActions } from "../hooks/useBlogActions";

// Deep link target for a single post (shared links, notifications). The
// backend has no "get one post" route, so it's found in the full list.
export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const { data, setData, loading, error, reload } = useAsync((signal) => getAllBlogs(null, { signal }), [id]);
  const blog = asArray(data?.data).find((b) => b._id === id);

  const update = (blogId, patch) =>
    setData((prev) => ({
      ...prev,
      data: asArray(prev?.data).map((b) => (b._id === blogId ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) } : b)),
    }));
  const { like, save, share } = useBlogActions({ update, userId: user?.id });

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => navigate("/community")} className="-ml-3 mb-3">
        Back to Community
      </Button>

      {loading ? (
        <SkeletonPosts count={1} label="Loading post..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !blog ? (
        <EmptyState title="Post not found" description="It may have been deleted." action={<Button onClick={() => navigate("/community")}>Browse community</Button>} />
      ) : (
        <>
          <BlogCard
            blog={blog}
            currentUserId={user?.id}
            onLike={like}
            onSave={save}
            onShare={share}
            onOpenComments={() => setShowComments(true)}
            onHashtag={(tag) => navigate(`/community?q=${encodeURIComponent(tag)}`)}
          />
          {showComments && (
            <CommentsSheet blog={blog} onClose={() => setShowComments(false)} onCommentsChange={(comments) => update(id, { comments })} />
          )}
        </>
      )}
    </div>
  );
}
