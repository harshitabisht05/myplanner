import React, { memo } from 'react';

const Card = memo(({ children, className = '', hover = false, onClick, role, tabIndex, ...props }) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={role || (isClickable ? 'button' : undefined)}
      tabIndex={tabIndex ?? (isClickable ? 0 : undefined)}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      className={`bg-planner-card rounded-3xl p-5 border border-planner-border/50 shadow-cozy transition-all duration-200 ${
        hover || isClickable
          ? 'hover:shadow-cozy-lg hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planner-primary'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
