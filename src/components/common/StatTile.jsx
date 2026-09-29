import './StatTile.css';

/**
 * A single indicator tile: label, big value, optional unit/hint.
 * Pass `pending` while a request is in flight, and leave `value` null/
 * undefined for "Not available in source" instead of a fake number.
 */
export default function StatTile({ label, value, unit, hint, pending, tone = 'default' }) {
  const showEmpty = !pending && (value === null || value === undefined || value === '');
  return (
    <div className={`stat-tile stat-tile--${tone}`}>
      <p className="stat-tile__label">{label}</p>
      {pending ? (
        <div className="stat-tile__skeleton" />
      ) : showEmpty ? (
        <p className="stat-tile__empty">Not available in source</p>
      ) : (
        <p className="stat-tile__value">
          {value}
          {unit && <span className="stat-tile__unit">{unit}</span>}
        </p>
      )}
      {hint && !showEmpty && <p className="stat-tile__hint">{hint}</p>}
    </div>
  );
}
