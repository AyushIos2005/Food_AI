import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Heart, MessageCircle, Share2, Bookmark, UserPlus, Utensils, BookOpen, Info } from "lucide-react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import { getErrorMessage, isCanceled } from "../api/client";
import { EmptyState, ErrorState, SkeletonList } from "../components/States";
import { Button } from "../components/ui/Button";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
import { asArray } from "../hooks/useAsync";
import { timeAgo } from "../utils/format";

const PAGE_SIZE = 20;

const ICONS = { LIKE: Heart, COMMENT: MessageCircle, SHARE: Share2, SAVE: Bookmark, FOLLOW: UserPlus, RECIPE: Utensils, BLOG: BookOpen, SYSTEM: Info };

const actionLabel = (type) =>
  ({ LIKE: "View Post", COMMENT: "View Comment", SHARE: "View Post", SAVE: "View Post", RECIPE: "View Recipe", BLOG: "View Post" }[type] || "View");

// Backend: GET /notifications => { success, data: Notification[], unreadCount, pagination: { page, limit, hasMore } }
export default function Notifications() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setUnreadCount, subscribe } = useNotifications();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const inFlight = useRef(new Set());

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const res = await getNotifications({ page: 1, limit: PAGE_SIZE }, { signal });
        setItems(asArray(res?.data));
        setPage(1);
        setHasMore(Boolean(res?.pagination?.hasMore));
        setUnreadCount(Number(res?.unreadCount) || 0);
      } catch (err) {
        if (isCanceled(err)) return;
        setError(getErrorMessage(err));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [setUnreadCount]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(
    () => subscribe((n) => setItems((prev) => (prev.some((x) => x._id === n._id) ? prev : [n, ...prev]))),
    [subscribe]
  );

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getNotifications({ page: page + 1, limit: PAGE_SIZE });
      const more = asArray(res?.data);
      setItems((prev) => [...prev, ...more.filter((n) => !prev.some((x) => x._id === n._id))]);
      setPage((p) => p + 1);
      setHasMore(Boolean(res?.pagination?.hasMore));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const open = async (n) => {
    if (n.entityType === "FOOD" && n.entityId) navigate(`/dish/${n.entityId}`);
    else if (n.entityType === "BLOG") navigate(n.entityId ? `/community/post/${n.entityId}` : "/community");
    else navigate("/community");

    if (n.isRead || inFlight.current.has(n._id)) return;
    inFlight.current.add(n._id);
    setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(n._id);
    } catch {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: false } : x)));
      setUnreadCount((c) => c + 1);
    } finally {
      inFlight.current.delete(n._id);
    }
  };

  const unreadHere = items.filter((n) => !n.isRead).length;

  const markAll = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't mark all as read. Try again."));
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) return <SkeletonList count={5} label="Loading notifications..." />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;
  if (items.length === 0) {
    return (
      <EmptyState icon={Bell} title="You're all caught up" description="New likes, comments and recipes will show up here." />
    );
  }

  return (
    <div className="max-w-xl space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] text-ink-soft" aria-live="polite">
          {unreadHere > 0 ? `${unreadHere} unread` : "Everything is read"}
        </p>
        <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAll} disabled={unreadHere === 0} loading={markingAll} className="!text-orange-800">
          Mark all as read
        </Button>
      </div>

      <ul className="space-y-2">
        {items.map((n) => {
          const Icon = ICONS[n.type] || Bell;
          return (
            <li key={n._id}>
              <button
                onClick={() => open(n)}
                className={`card w-full flex items-center gap-3 p-4 text-left ${n.isRead ? "" : "!border-orange-300 bg-orange-50/50"}`}
              >
                <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center text-orange-700 shrink-0">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-ink font-semibold truncate">{n.title}</p>
                  <p className="text-[14px] text-ink-soft line-clamp-2">{n.message}</p>
                  <p className="text-[12px] text-ink-soft mt-0.5 flex items-center gap-2">
                    {timeAgo(n.createdAt)}
                    <span className="text-orange-800 font-semibold">{actionLabel(n.type)}</span>
                  </p>
                </div>
                {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" aria-label="Unread" />}
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <Button variant="outline" className="w-full mt-2" onClick={loadMore} loading={loadingMore}>
          Load more
        </Button>
      )}
    </div>
  );
}
