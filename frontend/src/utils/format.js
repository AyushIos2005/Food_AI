export function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// "simmer for 10-15 minutes" -> 900 (the upper end of a range, to be safe).
// Returns 0 when the step has no timed action.
export function parseTimerSeconds(text) {
  const re = /(\d+(?:\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/i;
  const m = re.exec(String(text || ""));
  if (!m) return 0;
  const n = Number(m[2] || m[1]);
  const unit = m[3].toLowerCase();
  const mult = unit.startsWith("h") ? 3600 : unit.startsWith("m") ? 60 : 1;
  const secs = Math.round(n * mult);
  return secs > 0 && secs <= 3 * 3600 ? secs : 0;
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(r).padStart(2, "0")}`;
}

export const firstNameOf = (user) =>
  String(user?.name || user?.username || "chef").trim().split(/\s+/)[0];

// Servings come back from the AI as "2", 2 or "2 servings".
export const parseServings = (value, fallback = 2) => {
  const n = parseInt(String(value ?? "").match(/\d+/)?.[0], 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 50) : fallback;
};
