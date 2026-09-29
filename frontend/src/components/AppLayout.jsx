import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChefHat,
  Home,
  LogOut,
  Search,
  Settings,
  Sparkles,
  Users,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { IconButton } from "./ui/Button";
import Avatar from "./ui/Avatar";

const nav = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
  { to: "/ai", icon: Sparkles, label: "AI Chef" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/profile", icon: User, label: "Profile" },
];

const titles = {
  "/home": "Home",
  "/recipes": "Recipe Explorer",
  "/search": "Search",
  "/random": "Surprise Me",
  "/ai": "AI Kitchen",
  "/ai/create": "Create with AI",
  "/ai/result": "Your Recipe",
  "/recipes/upload": "Upload Dish",
  "/community": "Community",
  "/community/create": "Create Post",
  "/profile": "Profile",
  "/profile/edit": "Edit Profile",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

function titleFor(pathname) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/ai/result/")) return "Your Recipe";
  if (pathname.startsWith("/dish/")) return "Recipe";
  if (pathname.startsWith("/community/post/")) return "Post";
  return "FOODAI";
}

// New page => start at the top (the browser would otherwise keep the old scroll).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = titleFor(pathname);
  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  const doLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh lg:pl-[272px]">
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[272px] flex-col bg-[#17110D] text-white px-5 py-6 z-40">
        <div className="flex items-center gap-3 px-1 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-[22px] leading-none tracking-wide">FOODAI</p>
            <p className="text-[10px] tracking-[0.22em] text-white/70 mt-1">COOK • CREATE • SHARE</p>
          </div>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3.5 min-h-12 rounded-2xl text-[14px] font-medium transition ${
                isActive(to) ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3.5 min-h-12 rounded-2xl text-[14px] text-white/75 hover:bg-white/5 hover:text-white"
          >
            <Settings size={18} aria-hidden="true" /> Settings
          </button>
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-3 px-3.5 min-h-12 rounded-2xl text-[14px] text-red-200 hover:bg-white/5"
          >
            <LogOut size={18} aria-hidden="true" /> Logout
          </button>
          <div className="mt-3 flex items-center gap-3 px-2 py-3 rounded-2xl bg-white/5">
            <Avatar name={user?.name || user?.username} size={36} className="!bg-orange-500/30 !text-white" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{user?.name || "Foodie"}</p>
              <p className="text-[11px] text-white/65 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#F7F1E8]/85 border-b border-(--color-line)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white shrink-0">
              <ChefHat size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.18em] text-ink-soft hidden sm:block">COOK • CREATE • SHARE</p>
              <h1 className="text-[16px] sm:text-[18px] font-semibold text-ink truncate">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/ai/create")}
              className="hidden sm:inline-flex items-center gap-2 px-4 min-h-11 rounded-full bg-orange-700 text-white text-[13px] font-semibold hover:bg-orange-800 transition"
            >
              <Sparkles size={14} aria-hidden="true" /> Create with AI
            </button>
            <IconButton label="Search" icon={Search} onClick={() => navigate("/search")} />
            <IconButton label="Settings" icon={Settings} onClick={() => navigate("/settings")} className="lg:hidden" />
            <button
              onClick={() => navigate("/notifications")}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              className="icon-btn relative"
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-orange-700 text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom padding clears the mobile tab bar plus the phone's safe area. */}
      <main
        id="main"
        tabIndex={-1}
        className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-10 outline-none"
      >
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Primary"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-(--color-line) px-1 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))] flex items-center justify-between"
      >
        {nav.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-14 rounded-xl">
              <Icon size={22} className={active ? "text-orange-700" : "text-ink-soft"} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              <span className={`text-[11px] ${active ? "text-orange-700 font-bold" : "text-ink-soft font-medium"}`}>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
