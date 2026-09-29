import './Tag.css';

/**
 * tone: 'named' | 'candidate' | 'neutral' | 'warning'
 */
export default function Tag({ children, tone = 'neutral' }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}
