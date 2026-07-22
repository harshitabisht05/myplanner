import React, { forwardRef } from 'react';

const Select = forwardRef(
  ({ label, error, options = [], className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary px-3.5 py-2.5 ${
            error ? 'border-rose-400 focus:ring-rose-300' : 'border-planner-border'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-500 font-medium leading-tight">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
