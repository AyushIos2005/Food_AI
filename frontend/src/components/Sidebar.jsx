import { NavLink } from "react-router-dom";
import {
  Home,
  Sparkles,
  BookOpen,
  Users,
  Bookmark,
  Bell,
  User,
  Settings,
  ChefHat,
  PlusCircle,
} from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { cx } from "../lib/utils";

const baseItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/ai", label: "AI Recipe", icon: Sparkles },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/community", label: "Community", icon: Users },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings/security", label: "Settings", icon: Settings },
];

const chefItems = [
  { to: "/chef/recipes", label: "Chef Recipes", icon: ChefHat },
  { to: "/chef/recipes/create", label: "Create Recipe", icon: PlusCircle },
];

export default function Sidebar() {
  const { isChef } = useAuth();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:px-4 lg:py-6">
      <div className="px-2 pb-6">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {baseItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {isChef && (
          <>
            <div className="mt-5 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted/70">
              Chef Tools
            </div>
            {chefItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-bg px-4 py-3 text-xs text-muted">
        <p className="font-semibold text-ink">Cook • Create • Share</p>
        <p className="mt-1">Turn your ingredients into something amazing.</p>
      </div>
    </aside>
  );
}

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-ink/80 hover:bg-bg hover:text-ink"
        )
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}
