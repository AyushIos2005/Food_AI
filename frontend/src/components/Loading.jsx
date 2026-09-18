import { ChefHat } from "lucide-react";
import { cx } from "../lib/utils";

export default function Loading({ label = "Loading...", full = false }) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-3 text-muted",
        full ? "min-h-[60vh]" : "py-16"
      )}
    >
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
          <ChefHat size={18} />
        </span>
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
