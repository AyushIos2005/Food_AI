import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { EmptyState, ErrorState, LoadingState } from "../components/States";

const iconByType = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  NEW_POST: Bell,
  SYSTEM: Bell,
};

const tabs = [
  { key: "all", label: "All" },
  { key: "LIKE", label: "Likes" },
  { key: "COMMENT", label: "Comments" },
  { key: "FOLLOW", label: "Follows" },
];

function timeAgo(date) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    getNotifications()
      .then((res) => setItems(res.notifications || []))
      .catch((err) => setError(err.message || "Couldn't load notifications"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((n) => n.type === tab)),
    [items, tab]
  );

  const markRead = async (n) => {
    if (n.read) return;
    setItems((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    try {
      await markNotificationRead(n._id);
    } catch {
      /* non-critical — will re-sync on next load */
    }
  };

  const openNotification = (n) => {
    markRead(n);
    if (n.blog) navigate("/community");
  };

  const markAll = async () => {
    setItems((list) => list.map((x) => ({ ...x, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      /* non-critical */
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAll} className="flex items-center gap-1.5 text-[12px] font-semibold text-orange-600">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap ${
              tab === t.key ? "bg-orange-500 text-white" : "bg-white border border-(--color-line) text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <LoadingState label="Loading notifications..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="You're all caught up" description="No new activity yet." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = iconByType[n.type] || Bell;
            return (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={`card w-full flex items-center gap-3 p-4 text-left ${
                  !n.read ? "border-orange-200 bg-orange-50/40" : ""
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-ink">
                    <span className="font-semibold">
                      {n.sender?.name || n.sender?.username || "Someone"}
                    </span>{" "}
                    {n.message}
                  </p>
                  <p className="text-[11px] text-ink-soft/50">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
