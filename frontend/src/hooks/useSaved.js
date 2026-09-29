import { useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { readJSON, useLocalJSON, writeJSON } from "./useLocalJSON";
import { asArray } from "./useAsync";

const LEGACY_SAVED_KEY = "dishfinder_saved_dishes";
const EMPTY = [];

// The backend has no "save dish" endpoint (only community posts can be saved
// server-side), so saved dishes, the cooked log and AI-recipe bookmarks live in
// this browser. Keys are per user so two people sharing a device don't see each
// other's lists. Everything goes through one store, so Recipe Detail, the cards
// and Profile always agree.
export function useUserKey(name) {
  const { user } = useAuth();
  return `foodai_${name}:${user?.id || "guest"}`;
}

export function useSavedDishes() {
  const key = useUserKey("saved_dishes");
  const [raw, set] = useLocalJSON(key, EMPTY);
  const ids = useMemo(() => asArray(raw), [raw]);

  // One-time migration from the old, un-namespaced list.
  useEffect(() => {
    if (localStorage.getItem(key) !== null) return;
    const legacy = readJSON(LEGACY_SAVED_KEY, null);
    if (Array.isArray(legacy) && legacy.length) writeJSON(key, legacy);
  }, [key]);

  const isSaved = useCallback((id) => ids.includes(id), [ids]);

  // Returns the new saved state so callers can toast the right message.
  const toggle = useCallback(
    (id) => {
      const nowSaved = !ids.includes(id);
      set(nowSaved ? [...ids, id] : ids.filter((x) => x !== id));
      return nowSaved;
    },
    [ids, set]
  );

  return { ids, isSaved, toggle };
}

// Cooked log: [{ id, kind: "dish" | "ai", name, at }], newest first.
export function useCooked() {
  const key = useUserKey("cooked");
  const [raw, set] = useLocalJSON(key, EMPTY);
  const entries = useMemo(() => asArray(raw), [raw]);

  const markCooked = useCallback(
    (entry) => {
      const next = [{ ...entry, at: new Date().toISOString() }, ...entries].slice(0, 100);
      set(next);
    },
    [entries, set]
  );

  const remove = useCallback((at) => set(entries.filter((e) => e.at !== at)), [entries, set]);

  return { entries, markCooked, remove };
}
