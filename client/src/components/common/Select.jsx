import React, { forwardRef, useId } from 'react';

const Select = forwardRef(
  ({ label, error, options = [], className = '', containerClassName = '', id: customId, ...props }, ref) => {
    const defaultId = useId();
    const selectId = customId || defaultId;
    const errorId = `${selectId}-error`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-planner-muted uppercase tracking-wider select-none">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary px-3.5 py-2.5 min-h-[44px] sm:min-h-[40px] cursor-pointer ${
            error ? 'border-rose-400 focus:ring-rose-400/40 focus:border-rose-500' : 'border-planner-border/50'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        {error && <span id={errorId} className="text-xs text-rose-500 font-semibold leading-tight">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
