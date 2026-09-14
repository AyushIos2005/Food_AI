import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChefHat,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Users,
  Search,
  Bookmark,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/recipes", icon: Search, label: "Explore" },
  { to: "/ai", icon: Sparkles, label: "AI Hub" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/saved", icon: Bookmark, label: "Saved" },
  { to: "/profile", icon: User, label: "Profile" },
];

const titles = {
  "/home": "Home",
  "/recipes": "Explore",
  "/ai": "AI Hub",
  "/ai/create": "Generate Recipe",
  "/ai/result": "Your Recipe",
  "/community": "Community",
  "/community/create": "Create Post",
  "/saved": "Saved Recipes",
  "/profile": "Profile",
  "/profile/edit": "Edit Profile",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = titles[pathname] || "FoodMenu";

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh lg:pl-[272px]">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[272px] flex-col bg-[#17110D] text-white px-5 py-6 z-40">
        <div className="flex items-center gap-3 px-1 mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat size={22} />
          </div>
          <div>
            <p className="font-display text-[22px] leading-none tracking-wide">FoodMenu</p>
            <p className="text-[10px] tracking-[0.22em] text-white/50 mt-1">DISCOVER · COOK · SHARE · GROW</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] font-medium transition ${
                  isActive || pathname.startsWith(to + "/")
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] text-white/55 hover:bg-white/5 hover:text-white"
          >
            <Settings size={18} /> Settings
          </button>
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[14px] text-red-300/80 hover:bg-white/5"
          >
            <LogOut size={18} /> Logout
          </button>
          <div className="mt-3 flex items-center gap-3 px-2 py-3 rounded-2xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-orange-500/30 flex items-center justify-center text-sm font-semibold">
              {(user?.name || user?.username || "U")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate">{user?.name || "Foodie"}</p>
              <p className="text-[11px] text-white/45 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#F7F1E8]/80 border-b border-(--color-line)">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
              <ChefHat size={18} />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] text-ink-soft/70 hidden sm:block">DISCOVER · COOK · SHARE · GROW</p>
              <h1 className="text-[16px] sm:text-[18px] font-semibold text-ink">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/ai/create")}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-orange-500 text-white text-[12px] font-semibold"
            >
              <Sparkles size={14} /> Generate
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="w-10 h-10 rounded-full bg-white border border-(--color-line) flex items-center justify-center"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-10 page-enter">
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-(--color-line) px-2 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] flex items-center justify-between">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="flex flex-col items-center gap-1 flex-1 py-1">
            {({ isActive }) => (
              <>
                <Icon
                  size={21}
                  className={isActive || pathname.startsWith(to + "/") ? "text-orange-500" : "text-ink-soft/45"}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive || pathname.startsWith(to + "/") ? "text-orange-500" : "text-ink-soft/55"
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
