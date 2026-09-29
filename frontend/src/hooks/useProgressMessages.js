import { useEffect, useState } from "react";

export const AI_STEPS = [
  { at: 0, text: "Analyzing ingredients..." },
  { at: 5000, text: "Building your recipe..." },
  { at: 14000, text: "Almost ready..." },
  { at: 35000, text: "Still working. Detailed recipes can take a little longer." },
];

// Returns the index of the AI progress message to show while `active`.
export function useProgressIndex(active) {
  const [state, setState] = useState({ active: false, index: 0 });

  // Reset during render when a new run starts (no effect-driven flash).
  if (state.active !== active) setState({ active, index: 0 });

  useEffect(() => {
    if (!active) return undefined;
    const timers = AI_STEPS.slice(1).map((s, i) => setTimeout(() => setState({ active: true, index: i + 1 }), s.at));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return state.active ? state.index : 0;
}
