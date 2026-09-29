import { useCallback, useMemo } from "react";
import { useLocalJSON } from "../hooks/useLocalJSON";
import { asArray } from "../hooks/useAsync";

// Same key the original PreferenceSetup screen used, so existing choices survive.
export const PREFS_KEY = "dishfinder_preferences";

export const DIET_OPTIONS = [
  { key: "vegetarian", label: "Vegetarian", emoji: "🥦" },
  { key: "vegan", label: "Vegan", emoji: "🌱" },
  { key: "high-protein", label: "High Protein", emoji: "💪" },
  { key: "healthy", label: "Healthy", emoji: "🥗" },
  { key: "spicy", label: "Spicy", emoji: "🌶️" },
  { key: "quick-meals", label: "Quick Meals", emoji: "⏱️" },
  { key: "desserts", label: "Desserts", emoji: "🍰" },
];

export const CUISINE_OPTIONS = [
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "chinese", label: "Chinese", emoji: "🥡" },
  { key: "italian", label: "Italian", emoji: "🍝" },
  { key: "mexican", label: "Mexican", emoji: "🌮" },
  { key: "japanese", label: "Japanese", emoji: "🍣" },
  { key: "continental", label: "Continental", emoji: "🍽️" },
];

export const prefLabel = (key) =>
  [...DIET_OPTIONS, ...CUISINE_OPTIONS].find((o) => o.key === key)?.label || key;

export function usePreferences() {
  const [raw, set] = useLocalJSON(PREFS_KEY, []);
  const prefs = useMemo(() => asArray(raw), [raw]);
  const setPrefs = useCallback((next) => set(next), [set]);
  return { prefs, setPrefs };
}
