import EmptyState from '../common/EmptyState';
import './charts.css';

/**
 * series: [{ name, color, values: number[] }]
 * categories: string[] (x-axis labels, same length as each series.values)
 * Renders grouped vertical bars. Pass real numbers only — do not backfill
 * missing values with 0 unless 0 is the true reported value.
 */
export default function BarChart({ series, categories, height = 240, unit = '' }) {
  if (!series || series.length === 0 || !categories || categories.length === 0) {
    return <EmptyState title="Not available in source" />;
  }

  const max = Math.max(
    1,
    ...series.flatMap((s) => s.values.filter((v) => typeof v === 'number'))
  );
  const groupWidth = 100 / categories.length;
  const barWidth = Math.min(28, (groupWidth * 0.62) / series.length);

  return (
    <div className="chart">
      <svg viewBox={`0 0 100 ${height / 4}`} preserveAspectRatio="none" className="chart__svg">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2="100"
            y1={(height / 4) * (1 - t)}
            y2={(height / 4) * (1 - t)}
            className="chart__gridline"
          />
        ))}
        {categories.map((cat, ci) => {
          const groupX = ci * groupWidth;
          return series.map((s, si) => {
            const val = s.values[ci];
            if (typeof val !== 'number') return null;
            const barH = (val / max) * (height / 4) * 0.92;
            const x = groupX + groupWidth / 2 - (series.length * barWidth) / 2 + si * barWidth;
            return (
              <rect
                key={`${ci}-${si}`}
                x={x}
                y={height / 4 - barH}
                width={barWidth * 0.82}
                height={barH}
                rx="1.4"
                fill={s.color || 'var(--color-brand-500)'}
                className="chart__bar"
              />
            );
          });
        })}
      </svg>
      <div className="chart__xlabels">
        {categories.map((cat) => (
          <span key={cat} style={{ width: `${groupWidth}%` }}>{cat}</span>
        ))}
      </div>
      {series.length > 1 && (
        <div className="chart__legend">
          {series.map((s) => (
            <span key={s.name} className="chart__legend-item">
              <i style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
