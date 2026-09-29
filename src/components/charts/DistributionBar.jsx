import EmptyState from '../common/EmptyState';
import './charts.css';

/**
 * segments: [{ label, value, color }] — value in same unit (e.g. district count or %)
 * Renders a single stacked horizontal bar plus a breakdown list.
 */
export default function DistributionBar({ segments }) {
  const valid = (segments || []).filter((s) => typeof s.value === 'number' && s.value > 0);
  if (valid.length === 0) return <EmptyState title="Not available in source" />;

  const total = valid.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="distribution">
      <div className="distribution__bar">
        {valid.map((s) => (
          <div
            key={s.label}
            className="distribution__segment"
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <ul className="distribution__list">
        {valid.map((s) => (
          <li key={s.label}>
            <span className="distribution__swatch" style={{ background: s.color }} />
            <span className="distribution__label">{s.label}</span>
            <span className="distribution__value">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
