import { useRef } from "react";

// tabs: [{ key, label, count? }]. Render the matching panel yourself with
// role="tabpanel" aria-labelledby={`tab-${key}`}.
export function Tabs({ tabs, value, onChange, label, className = "" }) {
  const refs = useRef({});

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].key);
    refs.current[tabs[next].key]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`flex gap-1 overflow-x-auto no-scrollbar border-b border-(--color-line) ${className}`}
    >
      {tabs.map((t, i) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            ref={(el) => (refs.current[t.key] = el)}
            id={`tab-${t.key}`}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`shrink-0 min-h-12 px-4 text-[14px] font-semibold border-b-[3px] -mb-px whitespace-nowrap transition ${
              active ? "border-orange-700 text-orange-700" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span className={`ml-1.5 text-[12px] ${active ? "text-orange-700" : "text-ink-soft"}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
