import { NavLink } from "react-router-dom";
import { Home, Sparkles, BookOpen, Users, User } from "lucide-react";
import { cx } from "../lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/ai", label: "AI", icon: Sparkles, accent: true },
  { to: "/community", label: "Community", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

export default function MobileNavbar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {items.map(({ to, label, icon: Icon, accent }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cx(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
              isActive ? "text-primary" : "text-muted"
            )
          }
        >
          {({ isActive }) =>
            accent ? (
              <span
                className={cx(
                  "flex h-10 w-10 -translate-y-3 items-center justify-center rounded-full text-white shadow-md",
                  isActive ? "bg-primary-dark" : "bg-primary"
                )}
              >
                <Icon size={18} />
              </span>
            ) : (
              <>
                <Icon size={19} />
                {label}
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
