import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError, type ApiError } from '@/src/api/errors';

/** Loads once on mount and exposes reload. Stale responses are ignored. */
export function useLoader<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  const run = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (id === reqId.current) setData(result);
    } catch (err) {
      if (id === reqId.current) setError(toApiError(err));
    } finally {
      if (id === reqId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, setData, error, loading, reload: run };
}
