import { useEffect, useRef, useState } from "react";
import { CornerDownRight, Send, Trash2 } from "lucide-react";
import { getComments, addComment, deleteComment } from "../api/blog";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { asArray, useAsync } from "../hooks/useAsync";
import { timeAgo } from "../utils/format";
import { BottomSheet } from "./ui/Sheet";
import Avatar from "./ui/Avatar";
import { IconButton } from "./ui/Button";
import { Skeleton } from "./States";

const nameOf = (u) => u?.name || u?.username || "Someone";

// Bottom sheet on phones, dialog on desktop. Comments appear the moment you
// send them and are rolled back (with your text restored) if the request fails.
export default function CommentsSheet({ blog, onClose, onCommentsChange }) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState([]); // optimistic comments not yet confirmed
  const [removingId, setRemovingId] = useState(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  // Backend contract: { success, count, data: Comment[] } where each comment
  // is { _id, text, user: { _id, name, username }, createdAt }.
  const { data, setData, loading, error, reload } = useAsync(
    (signal) => getComments(blog._id, { signal }),
    [blog._id]
  );
  const comments = [...asArray(data?.data), ...sending];

  // Keep the comment count on the feed card in sync.
  useEffect(() => {
    if (data) onCommentsChange?.(asArray(data.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const startReply = (comment) => {
    const handle = comment.user?.username || comment.user?.name;
    if (!handle) return;
    setReplyTo(nameOf(comment.user));
    setText((t) => (t.startsWith(`@${handle} `) ? t : `@${handle} ${t}`));
    inputRef.current?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const temp = {
      _id: `sending-${Date.now()}`,
      text: value,
      user: { _id: user?.id, name: user?.name, username: user?.username },
      createdAt: new Date().toISOString(),
      sending: true,
    };
    setSending((s) => [...s, temp]);
    setText("");
    setReplyTo(null);

    try {
      const res = await addComment(blog._id, value);
      const saved = res?.data;
      if (saved?._id) {
        // Show the saved comment right away, using what we know about the author.
        const author = saved.user && typeof saved.user === "object" && saved.user.name ? saved.user : temp.user;
        setData((prev) => ({ ...prev, data: [...asArray(prev?.data), { ...saved, user: author }] }));
      } else {
        reload();
      }
      toast.success("Comment added");
    } catch (err) {
      setText(value); // give the text back so nothing is lost
      toast.error(getErrorMessage(err, "Couldn't post your comment. Try again."));
    } finally {
      setSending((s) => s.filter((c) => c._id !== temp._id));
    }
  };

  const remove = async (commentId) => {
    if (removingId) return;
    setRemovingId(commentId);
    try {
      await deleteComment(blog._id, commentId);
      setData((prev) => ({ ...prev, data: asArray(prev?.data).filter((c) => c._id !== commentId) }));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the comment. Try again."));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={`Comments${comments.length ? ` (${comments.length})` : ""}`}
      footer={
        <form onSubmit={submit}>
          {replyTo && (
            <p className="flex items-center gap-1.5 text-[13px] text-ink-soft mb-2">
              <CornerDownRight size={14} aria-hidden="true" /> Replying to {replyTo}
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setText("");
                }}
                className="ml-auto text-orange-700 font-semibold min-h-8 px-2"
              >
                Cancel
              </button>
            </p>
          )}
          <div className="flex items-center gap-2">
            <label htmlFor="comment-input" className="sr-only">
              Add a comment
            </label>
            <input
              id="comment-input"
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              maxLength={1000}
              autoComplete="off"
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              aria-label="Send comment"
              className="w-12 h-12 rounded-full bg-orange-700 flex items-center justify-center text-white shrink-0 disabled:opacity-50 hover:bg-orange-800 transition"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      }
    >
      {loading && !data ? (
        <div role="status" aria-busy="true" aria-label="Loading comments..." className="space-y-4">
          <span className="sr-only">Loading comments...</span>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-2.5" aria-hidden="true">
              <Skeleton className="w-9 h-9 !rounded-full shrink-0" />
              <Skeleton className="h-14 flex-1 !rounded-2xl" />
            </div>
          ))}
        </div>
      ) : error && !data ? (
        <div role="alert" className="text-center py-8">
          <p className="text-[14px] text-ink mb-3">{error}</p>
          <button type="button" onClick={reload} className="btn-outline btn-sm">
            Try again
          </button>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[14px] text-ink-soft text-center py-10">No comments yet. Be the first to say something.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const canDelete = !c.sending && (c.user?._id === user?.id || blog.createdBy?._id === user?.id);
            return (
              <li key={c._id} className={`flex items-start gap-2.5 ${c.sending ? "opacity-60" : ""}`}>
                <Avatar name={nameOf(c.user)} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="bg-cream rounded-2xl px-3.5 py-2.5">
                    <p className="text-[13px] font-semibold text-ink">{nameOf(c.user)}</p>
                    <p className="text-[14px] text-ink break-words whitespace-pre-line">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-2 text-[12px] text-ink-soft">
                    <span>{c.sending ? "Sending..." : timeAgo(c.createdAt)}</span>
                    {!c.sending && c.user?.username && (
                      <button type="button" onClick={() => startReply(c)} className="font-semibold hover:text-ink min-h-8">
                        Reply
                      </button>
                    )}
                  </div>
                </div>
                {canDelete && (
                  <IconButton
                    label="Delete comment"
                    icon={Trash2}
                    size={16}
                    onClick={() => remove(c._id)}
                    disabled={removingId === c._id}
                    className="!border-transparent !bg-transparent text-ink-soft hover:!text-danger"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
