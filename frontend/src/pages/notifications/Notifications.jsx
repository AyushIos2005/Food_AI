import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, UserPlus, Share2, Bookmark, ChefHat, Info, CheckCheck } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { timeAgo, cx } from "../../lib/utils";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

const iconByType = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  SHARE: Share2,
  SAVE: Bookmark,
  RECIPE: ChefHat,
  BLOG: MessageCircle,
  SYSTEM: Info,
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  function open(n) {
    if (!n.isRead) markRead(n._id);
    if (n.entityType === "BLOG" && n.entityId) navigate(`/community/post/${n.entityId}`);
    else if (n.entityType === "FOOD" && n.entityId) navigate(`/recipes/${n.entityId}`);
  }

  if (loading && notifications.length === 0) return <Loading full label="Loading notifications..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Activity</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-bg"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here yet." subtitle="Likes, comments and follows will show up here." />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = iconByType[n.type] || Bell;
            return (
              <li key={n._id}>
                <button
                  onClick={() => open(n)}
                  className={cx(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-md",
                    n.isRead ? "border-slate-200 bg-white" : "border-accent/30 bg-accent/5"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                    <p className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
