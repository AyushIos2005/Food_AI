import { NavLink } from "react-router-dom";
import { Home, Search, PlusCircle, Newspaper, User } from "lucide-react";

const items = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/explore", icon: Search, label: "Explore" },
  { to: "/create", icon: PlusCircle, label: "Create", accent: true },
  { to: "/community", icon: Newspaper, label: "Blogs" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-(--color-line) px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 flex items-center justify-between z-40">
      {items.map(({ to, icon: Icon, label, accent }) => (
        <NavLink
          key={to}
          to={to}
          className="flex flex-col items-center gap-1 flex-1 py-1"
        >
          {({ isActive }) =>
            accent ? (
              <div className="w-11 h-11 -mt-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40">
                <Icon size={22} className="text-white" strokeWidth={2.2} />
              </div>
            ) : (
              <>
                <Icon
                  size={22}
                  className={isActive ? "text-orange-500" : "text-ink-soft/50"}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-orange-500" : "text-(--color-ink-soft)/60"
                  }`}
                >
                  {label}
                </span>
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
