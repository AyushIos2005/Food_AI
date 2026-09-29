import { useCallback, useMemo, useSyncExternalStore } from "react";

// A tiny localStorage-backed store. Every component that reads the same key
// re-renders when any of them writes it (and when another tab changes it), so
// "saved" / "cooked" / "preferences" can never disagree between pages.
const listeners = new Map(); // key -> Set<() => void>

const emit = (key) => listeners.get(key)?.forEach((fn) => fn());

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable: keep the UI working, just don't persist */
  }
  emit(key);
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  emit(key);
}

export function useLocalJSON(key, fallback) {
  const subscribe = useCallback(
    (onChange) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(onChange);
      const onStorage = (e) => {
        if (e.key === key || e.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.get(key)?.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key]
  );

  // The snapshot is the raw string: it is referentially stable between writes.
  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const value = useMemo(() => {
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback((next) => writeJSON(key, next), [key]);

  return [value, set];
}
