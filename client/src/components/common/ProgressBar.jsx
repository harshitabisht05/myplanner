import React from 'react';

const ProgressBar = ({ value = 0, max = 100, label, showPercentage = true, className = '', colorClass = 'bg-planner-primary' }) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? Math.round((value / max) * 100) : 0));

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-planner-muted">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="w-full h-3 bg-planner-secondary rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
