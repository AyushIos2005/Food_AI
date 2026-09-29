import { LoaderCircle } from "lucide-react";

const VARIANTS = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

// variant: primary | outline | ghost | danger     size: sm | (default) | lg
// `loading` disables the button (no duplicate submits) and shows a spinner.
export function Button({
  variant = "primary",
  size,
  loading = false,
  icon: Icon,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}) {
  const classes = [VARIANTS[variant], size === "sm" && "btn-sm", size === "lg" && "btn-lg", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...rest}>
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

// Icon-only buttons must have a label: it becomes the aria-label and tooltip.
export function IconButton({ label, icon: Icon, size = 18, glass = false, filled = false, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn ${glass ? "icon-btn-glass" : ""} ${className}`}
      {...rest}
    >
      <Icon size={size} aria-hidden="true" fill={filled ? "currentColor" : "none"} />
    </button>
  );
}
