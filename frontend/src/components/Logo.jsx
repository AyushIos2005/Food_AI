import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { cx } from "../lib/utils";

export default function Logo({ to = "/", size = "md", className }) {
  const dims = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <Link to={to} className={cx("flex items-center gap-2 shrink-0", className)}>
      <span className={cx("flex items-center justify-center rounded-xl bg-primary text-white", dims)}>
        <ChefHat size={size === "sm" ? 16 : 18} />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        Food<span className="text-secondary">AI</span>
      </span>
    </Link>
  );
}
