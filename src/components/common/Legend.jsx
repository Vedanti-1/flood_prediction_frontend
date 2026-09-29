import { RISK_LEVELS } from '../../utils/risk';
import './Legend.css';

export default function Legend({ orientation = 'horizontal' }) {
  const ordered = [...RISK_LEVELS].reverse(); // VERY LOW -> VERY HIGH
  return (
    <ul className={`legend legend--${orientation}`}>
      {ordered.map((level) => (
        <li key={level.key}>
          <span className="legend__swatch" style={{ background: level.color }} />
          <span className="legend__label">{level.label}</span>
        </li>
      ))}
    </ul>
  );
}
