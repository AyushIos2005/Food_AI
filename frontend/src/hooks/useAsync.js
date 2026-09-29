import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage, isCanceled } from "../api/client";

// Runs `fn(signal)` on mount and whenever `deps` change (or reload() is
// called). Handles the boring parts once, for every page:
//   - loading / error state
//   - aborting the in-flight request on unmount or when deps change
//     (so no state updates after unmount, no stale responses overwriting
//      newer ones)
//   - no duplicate/looping requests: `fn` itself is NOT a dependency
//
// `fn` must return a promise and should pass `signal` to the api call:
//   const { data, loading, error } = useAsync((signal) => getAllFood(null, { signal }), []);
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: "", status: null, loading: true });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: "", status: null }));

    Promise.resolve()
      .then(() => fnRef.current(controller.signal))
      .then((data) => {
        if (controller.signal.aborted) return;
        setState({ data, error: "", status: 200, loading: false });
      })
      .catch((err) => {
        if (controller.signal.aborted || isCanceled(err)) return;
        setState((s) => ({
          ...s,
          error: getErrorMessage(err),
          status: err?.status ?? null,
          loading: false,
        }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  // Local (optimistic) edits to the loaded data.
  const setData = useCallback(
    (updater) =>
      setState((s) => ({
        ...s,
        data: typeof updater === "function" ? updater(s.data) : updater,
      })),
    []
  );

  return { ...state, reload, setData };
}

// Safe array getter for backend list fields: asArray(res?.foods)
export const asArray = (value) => (Array.isArray(value) ? value : []);
