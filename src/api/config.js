// Central place to configure the backend base URL.
// Change BASE_URL when the Spring Boot backend moves (e.g. to a deployed host).
export const BASE_URL = 'http://localhost:8080';

// Existing Spring Boot endpoints. Do not add endpoints that do not exist on
// the backend yet — pages should render an empty/"not available" state
// instead of inventing a new route.
export const ENDPOINTS = {
  risk: (district) => `${BASE_URL}/api/risk/${encodeURIComponent(district)}`,
  ml: (district) => `${BASE_URL}/api/ml/${encodeURIComponent(district)}`,
  relocation: (district) => `${BASE_URL}/api/relocation/${encodeURIComponent(district)}`,
  dashboard: (district) => `${BASE_URL}/api/dashboard/${encodeURIComponent(district)}`,
};

/**
 * Thin fetch wrapper. Returns { data, error }. Never throws.
 * Pages should treat `error` as "show empty state", not a fake fallback value.
 */
export async function apiGet(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { data: null, error: `Request failed (${res.status})` };
    }
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Network error' };
  }
}
