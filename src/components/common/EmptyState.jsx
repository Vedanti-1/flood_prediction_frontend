import './EmptyState.css';

export default function EmptyState({ title = 'Not available in source', description, icon }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon || '—'}</div>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__desc">{description}</p>}
    </div>
  );
}
