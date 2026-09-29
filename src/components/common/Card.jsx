import React from 'react';

const Card = ({ title, subtitle, children, className = '' }) => {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || subtitle) && (
        <div className="card-header">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {subtitle && (
              <p className="card-subtitle">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {children}
    </section>
  );
};

export default Card;