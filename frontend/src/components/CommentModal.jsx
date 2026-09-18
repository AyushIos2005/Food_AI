import { useEffect, useState } from "react";
import { X, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { addComment, deleteComment, getComments } from "../api/blog.api";
import { getErrorMessage } from "../lib/errorMessage";
import { useAuth } from "../context/AuthContext";
import { initials, timeAgo } from "../lib/utils";
import Loading from "./Loading";

export default function CommentModal({ blog, onClose, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getComments(blog._id)
      .then(({ data }) => active && setComments(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load comments.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [blog._id]);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await addComment({ blogId: blog._id, text: text.trim() });
      const newComment = { ...data.data, user: { _id: user.id, name: user.name, username: user.username } };
      setComments((prev) => [...prev, newComment]);
      onCountChange?.(1);
      setText("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't post your comment."));
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      await deleteComment({ blogId: blog._id, commentId });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onCountChange?.(-1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete that comment."));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-md sm:rounded-3xl animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-ink">Comments</h3>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <Loading label="Loading comments..." />
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Be the first to comment.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => {
                const canDelete = c.user?._id === user?.id || blog.createdBy?._id === user?.id;
                return (
                  <li key={c._id} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-white">
                      {initials(c.user?.name || c.user?.username || "U")}
                    </span>
                    <div className="min-w-0 flex-1 rounded-2xl bg-bg px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-ink">{c.user?.name || c.user?.username}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted">{timeAgo(c.createdAt)}</span>
                          {canDelete && (
                            <button onClick={() => handleDelete(c._id)} className="text-muted hover:text-danger">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-0.5 text-sm text-ink/80">{c.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form onSubmit={handlePost} className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-full border border-slate-200 bg-bg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            disabled={posting || !text.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-all duration-200 hover:bg-primary-dark disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
