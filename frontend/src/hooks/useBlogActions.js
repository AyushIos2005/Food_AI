import { useCallback, useRef } from "react";
import { toggleLike, toggleSave, toggleShare } from "../api/blog";
import { useToast } from "../context/ToastContext";
import { asArray } from "./useAsync";

const idOf = (u) => u?._id || u;
export const hasMember = (list, uid) => Boolean(uid) && asArray(list).some((u) => idOf(u) === uid);
const setMember = (list, uid, present) => {
  const others = asArray(list).filter((u) => idOf(u) !== uid);
  return present ? [...others, uid] : others;
};

export const postUrl = (blog, extra = "") => `${window.location.origin}/community/post/${blog._id}${extra}`;

// Optimistic like / save / share for community posts.
//   update(blogId, (blog) => patch)  applies a local change to the list state
// The UI changes immediately; if the request fails the change is rolled back
// and the user gets a plain-language message. One request per post+action at a
// time, so rapid taps can't send duplicates.
export function useBlogActions({ update, userId }) {
  const toast = useToast();
  const pending = useRef(new Set());

  const guarded = useCallback(async (blogId, action, fn) => {
    const key = `${blogId}:${action}`;
    if (pending.current.has(key)) return;
    pending.current.add(key);
    try {
      await fn();
    } finally {
      pending.current.delete(key);
    }
  }, []);

  const like = useCallback(
    (blog, { onlyLike = false } = {}) =>
      guarded(blog._id, "like", async () => {
        const was = hasMember(blog.likes, userId);
        if (onlyLike && was) return; // double-tap never un-likes
        const target = !was;
        update(blog._id, (b) => ({ likes: setMember(b.likes, userId, target) }));
        try {
          const res = await toggleLike(blog._id);
          if (typeof res?.liked === "boolean" && res.liked !== target) {
            update(blog._id, (b) => ({ likes: setMember(b.likes, userId, res.liked) }));
          }
        } catch {
          update(blog._id, (b) => ({ likes: setMember(b.likes, userId, was) }));
          toast.error("Couldn't update your like. Try again.");
        }
      }),
    [guarded, update, userId, toast]
  );

  const save = useCallback(
    (blog) =>
      guarded(blog._id, "save", async () => {
        const was = hasMember(blog.savedBy, userId);
        const target = !was;
        update(blog._id, (b) => ({ savedBy: setMember(b.savedBy, userId, target) }));
        toast.success(target ? "Post saved" : "Removed from saved");
        try {
          const res = await toggleSave(blog._id);
          if (typeof res?.saved === "boolean" && res.saved !== target) {
            update(blog._id, (b) => ({ savedBy: setMember(b.savedBy, userId, res.saved) }));
          }
        } catch {
          update(blog._id, (b) => ({ savedBy: setMember(b.savedBy, userId, was) }));
          toast.error("Couldn't update. Try again.");
        }
      }),
    [guarded, update, userId, toast]
  );

  // Shares the post's deep link (native share sheet, else copy to clipboard),
  // and counts it once per person on the backend.
  const share = useCallback(
    (blog) =>
      guarded(blog._id, "share", async () => {
        const url = postUrl(blog);
        const author = blog.createdBy?.name || blog.createdBy?.username || "someone";
        let delivered = false;

        if (navigator.share) {
          try {
            await navigator.share({ title: "FOODAI", text: `A food story from ${author} on FOODAI`, url });
            delivered = true;
          } catch (err) {
            if (err?.name === "AbortError") return; // they closed the share sheet
          }
        }
        if (!delivered) {
          try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied");
            delivered = true;
          } catch {
            toast.error("Couldn't copy the link. Try again.");
            return;
          }
        }

        if (hasMember(blog.shares, userId)) return; // already counted
        update(blog._id, (b) => ({ shares: setMember(b.shares, userId, true) }));
        try {
          await toggleShare(blog._id);
        } catch {
          update(blog._id, (b) => ({ shares: setMember(b.shares, userId, false) }));
        }
      }),
    [guarded, update, userId, toast]
  );

  return { like, save, share };
}
