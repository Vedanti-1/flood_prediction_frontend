// Single source of truth for risk classification thresholds.
// percentage is expected as a plain number, e.g. 12.4 for 12.4%.
export const RISK_LEVELS = [
  { key: 'very-high', label: 'VERY HIGH', min: 15, color: 'var(--risk-very-high)' },
  { key: 'high', label: 'HIGH', min: 10, color: 'var(--risk-high)' },
  { key: 'moderate', label: 'MODERATE', min: 5, color: 'var(--risk-moderate)' },
  { key: 'low', label: 'LOW', min: 2, color: 'var(--risk-low)' },
  { key: 'very-low', label: 'VERY LOW', min: -Infinity, color: 'var(--risk-very-low)' },
];

/**
 * Classify a flood-affected/predicted percentage into a risk level.
 * Returns null if the value is not a finite number (caller should show
 * "Not available in source" instead of guessing a level).
 */
export function classifyRisk(percentage) {
  if (percentage === null || percentage === undefined || Number.isNaN(Number(percentage))) {
    return null;
  }
  const value = Number(percentage);
  return RISK_LEVELS.find((level) => value >= level.min) || RISK_LEVELS[RISK_LEVELS.length - 1];
}

export function riskColorFor(levelLabel) {
  const match = RISK_LEVELS.find(
    (level) => level.label.toLowerCase() === String(levelLabel || '').toLowerCase()
  );
  return match ? match.color : 'var(--risk-unknown)';
}

export const NOT_AVAILABLE = 'Not available in source';
export const NOT_VERIFIED = 'Not verified';

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return NOT_AVAILABLE;
  }
  return `${Number(value).toFixed(1)}%`;
}

export function formatValue(value, suffix = '') {
  if (value === null || value === undefined || value === '') {
    return NOT_AVAILABLE;
  }
  return `${value}${suffix}`;
}
