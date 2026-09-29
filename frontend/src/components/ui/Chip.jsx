import { Check } from "lucide-react";

// Toggle chip. Pass `selected` for an on/off chip (aria-pressed + a check icon,
// so state is not shown by colour alone). Without `selected` it is a plain button.
export function Chip({ selected, onClick, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected === undefined ? undefined : Boolean(selected)}
      onClick={onClick}
      className={`chip ${className}`}
      {...rest}
    >
      {selected ? <Check size={14} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

// A labelled group of chips.
export function ChipGroup({ label, children, className = "" }) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
}
