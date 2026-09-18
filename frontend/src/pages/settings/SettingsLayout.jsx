import { NavLink, Outlet } from "react-router-dom";
import { ShieldCheck, MessageSquareHeart, AlertTriangle, Code2 } from "lucide-react";
import { cx } from "../../lib/utils";

const tabs = [
  { to: "/settings/security", label: "Security", icon: ShieldCheck },
  { to: "/settings/feedback", label: "Feedback", icon: MessageSquareHeart },
  { to: "/settings/complaint", label: "Complaint", icon: AlertTriangle },
  { to: "/settings/contact-developer", label: "Contact Dev", icon: Code2 },
];

export default function SettingsLayout() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Account</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Settings</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-full border border-slate-200 bg-white p-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cx(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive ? "bg-primary text-white" : "text-muted hover:text-ink"
              )
            }
          >
            <Icon size={14} /> {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
