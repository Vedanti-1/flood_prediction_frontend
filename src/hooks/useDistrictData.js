import { useEffect, useState } from 'react';
import { apiGet } from '../api/config';

/**
 * Fetches data for the currently selected district from the given endpoint
 * builder (e.g. ENDPOINTS.dashboard). Returns { data, error, loading }.
 * When no district is selected, returns loading:false, data:null so pages
 * can show a "select a district" prompt instead of calling the API.
 */
export function useDistrictData(endpointFn, district) {
  const [state, setState] = useState({ data: null, error: null, loading: false });

  useEffect(() => {
    if (!district) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    apiGet(endpointFn(district)).then(({ data, error }) => {
      if (cancelled) return;
      setState({ data, error, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [district, endpointFn]);

  return state;
}
