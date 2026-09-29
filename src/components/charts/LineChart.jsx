import EmptyState from '../common/EmptyState';
import './charts.css';

/**
 * series: [{ name, color, dashed?, values: number[] }]
 * categories: string[] labels for x-axis (e.g. years)
 * Use `dashed` to visually distinguish predicted series from historical.
 */
export default function LineChart({ series, categories, height = 240 }) {
  if (!series || series.length === 0 || !categories || categories.length === 0) {
    return <EmptyState title="Not available in source" />;
  }

  const h = height / 4;
  const allVals = series.flatMap((s) => s.values.filter((v) => typeof v === 'number'));
  const max = Math.max(1, ...allVals);
  const min = Math.min(0, ...allVals);
  const range = max - min || 1;
  const stepX = 100 / Math.max(1, categories.length - 1);

  const toPoints = (values) =>
    values
      .map((v, i) => {
        if (typeof v !== 'number') return null;
        const x = i * stepX;
        const y = h - ((v - min) / range) * h * 0.9;
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');

  return (
    <div className="chart">
      <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="chart__svg">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="0" x2="100" y1={h * (1 - t)} y2={h * (1 - t)} className="chart__gridline" />
        ))}
        {series.map((s) => (
          <polyline
            key={s.name}
            points={toPoints(s.values)}
            fill="none"
            stroke={s.color || 'var(--color-brand-500)'}
            strokeWidth="1.6"
            strokeDasharray={s.dashed ? '3 2.5' : undefined}
            vectorEffect="non-scaling-stroke"
            className="chart__line"
          />
        ))}
        {series.map((s) =>
          s.values.map((v, i) => {
            if (typeof v !== 'number') return null;
            const x = i * stepX;
            const y = h - ((v - min) / range) * h * 0.9;
            return (
              <circle key={`${s.name}-${i}`} cx={x} cy={y} r="1.6" fill={s.color || 'var(--color-brand-500)'} />
            );
          })
        )}
      </svg>
      <div className="chart__xlabels chart__xlabels--even">
        {categories.map((cat) => (
          <span key={cat}>{cat}</span>
        ))}
      </div>
      <div className="chart__legend">
        {series.map((s) => (
          <span key={s.name} className="chart__legend-item">
            <i style={{ background: s.color, ...(s.dashed ? { borderRadius: 0, height: 2 } : {}) }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
