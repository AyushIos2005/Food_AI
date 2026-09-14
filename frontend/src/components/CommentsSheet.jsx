import { useEffect, useState } from "react";
import { X, Send, Trash2 } from "lucide-react";
import { getComments, addComment, deleteComment } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CommentsSheet({ blog, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  const load = () =>
    getComments(blog._id)
      .then((res) => setComments(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog._id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addComment(blog._id, text.trim());
      setText("");
      toast.success("Comment added");
      load();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const remove = async (commentId) => {
    try {
      await deleteComment(blog._id, commentId);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl lg:rounded-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-(--color-line)">
          <h2 className="text-[15px] font-bold text-ink">Comments</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}
          {loading ? (
            <div className="space-y-3">
              <div className="h-12 skeleton" />
              <div className="h-12 skeleton" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[13px] text-ink-soft text-center py-10">
              No comments yet. Start the conversation.
            </p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex items-start gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[11px] font-semibold text-orange-700 shrink-0">
                  {(c.user?.name || c.user?.username || "U")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 bg-cream rounded-2xl px-3 py-2">
                  <p className="text-[12px] font-semibold text-ink">
                    {c.user?.name || c.user?.username}
                  </p>
                  <p className="text-[13px] text-ink-soft">{c.text}</p>
                </div>
                {(c.user?._id === user?.id || blog.createdBy?._id === user?.id) && (
                  <button onClick={() => remove(c._id)} className="text-ink-soft/40 mt-2">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 border-t border-(--color-line)">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="input-field flex-1"
          />
          <button type="submit" className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
