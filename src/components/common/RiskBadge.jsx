import React from 'react';

const normalizeLevel = (level) => {
  if (!level) {
    return 'UNKNOWN';
  }

  return String(level).trim().toUpperCase().replace(/[-_]+/g, ' ');
};

const RiskBadge = ({ level = 'UNKNOWN' }) => {
  const normalizedLevel = normalizeLevel(level);

  const className = normalizedLevel
    .toLowerCase()
    .replace(/\s+/g, '-');

  const label =
    normalizedLevel === 'UNKNOWN'
      ? 'Not available in source'
      : normalizedLevel;

  return (
    <span className={`risk-badge ${className}`}>
      <span className="dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default RiskBadge;