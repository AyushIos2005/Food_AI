import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { AI_STEPS, useProgressIndex } from "../hooks/useProgressMessages";
import { Button } from "./ui/Button";

// Shown while the AI works (this can take 10-30s). Never a blank screen: it
// says what is happening, echoes what you asked for, and can be cancelled.
export default function GeneratingPanel({ active = true, title = "Creating your recipe", chips = [], onCancel }) {
  const index = useProgressIndex(active);
  const steps = AI_STEPS.slice(0, 3);

  return (
    <div role="status" aria-live="polite" className="card p-6 sm:p-8 text-center flex flex-col items-center gap-5">
      <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center glow-pulse">
        <Sparkles size={28} aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        <p className="text-[15px] text-ink mt-1 font-medium">{AI_STEPS[index].text}</p>
      </div>

      <ol className="w-full max-w-xs text-left space-y-2.5">
        {steps.map((s, i) => {
          const done = index > i;
          const current = index === i || (index >= steps.length && i === steps.length - 1);
          return (
            <li key={s.text} className={`flex items-center gap-3 text-[14px] ${done || current ? "text-ink" : "text-ink-soft"}`}>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-green-700 text-white" : current ? "bg-orange-100 text-orange-800" : "bg-cream-2 text-ink-soft"
                }`}
              >
                {done ? <Check size={14} aria-hidden="true" /> : current ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : i + 1}
              </span>
              {s.text.replace("...", "")}
              {done && <span className="sr-only"> done</span>}
            </li>
          );
        })}
      </ol>

      {chips.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
          {chips.slice(0, 10).map((c) => (
            <span key={c} className="badge">
              {c}
            </span>
          ))}
        </div>
      )}

      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
