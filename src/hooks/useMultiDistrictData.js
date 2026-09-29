import { useEffect, useState } from 'react';
import { apiGet } from '../api/config';

/**
 * Fetches the same endpoint for several districts in parallel, for
 * side-by-side comparisons. Returns { results, loading } where results is
 * keyed by district name: { [district]: { data, error } }.
 */
export function useMultiDistrictData(endpointFn, districts) {
  const [state, setState] = useState({ results: {}, loading: false });

  useEffect(() => {
    if (!districts || districts.length === 0) {
      setState({ results: {}, loading: false });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    Promise.all(
      districts.map((d) => apiGet(endpointFn(d)).then((res) => [d, res]))
    ).then((pairs) => {
      if (cancelled) return;
      const results = Object.fromEntries(pairs);
      setState({ results, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [districts.join('|'), endpointFn]);

  return state;
}
