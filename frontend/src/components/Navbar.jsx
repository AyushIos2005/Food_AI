import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { initials } from "../lib/utils";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/recipes${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  }

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Couldn't log out — please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
      <div className="lg:hidden">
        <Logo size="sm" />
      </div>

      <form onSubmit={handleSearch} className="ml-auto flex max-w-md flex-1 items-center gap-2 rounded-full border border-slate-200 bg-bg px-3.5 py-2 lg:ml-0">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes..."
          className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </form>

      <button
        onClick={() => navigate("/notifications")}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-muted transition-all duration-200 hover:bg-bg hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <div className="relative shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 transition-all duration-200 hover:bg-bg"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
            {initials(user?.name || user?.username || "U")}
          </span>
          <ChevronDown size={14} className="hidden text-muted sm:block" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-md animate-float-up">
            <div className="px-3.5 py-2">
              <p className="truncate text-sm font-semibold text-ink">{user?.name || user?.username}</p>
              <p className="truncate text-xs capitalize text-muted">{user?.role}</p>
            </div>
            <div className="my-1 border-t border-slate-100" />
            <MenuLink to="/profile" icon={UserIcon} label="Profile" onClick={() => setMenuOpen(false)} navigate={navigate} />
            <MenuLink to="/settings/security" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} navigate={navigate} />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-danger transition-all duration-200 hover:bg-danger/5"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, onClick, navigate }) {
  return (
    <button
      onClick={() => {
        onClick();
        navigate(to);
      }}
      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-ink/80 transition-all duration-200 hover:bg-bg"
    >
      <Icon size={15} /> {label}
    </button>
  );
}
