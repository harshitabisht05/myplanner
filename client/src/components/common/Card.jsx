import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-planner-card rounded-3xl p-5 border border-planner-border shadow-cozy transition-all duration-200 ${
        hover ? 'hover:shadow-cozy-lg hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
