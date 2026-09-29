import React from 'react';

const StatsCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'blue',
}) => {
  return (
    <div className="stats-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-3)',
        }}
      >
        <div>
          <div className="label">{label}</div>
          <div className="value">{value}</div>
        </div>

        {Icon && (
          <div className={`icon-wrapper ${iconColor}`}>
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;