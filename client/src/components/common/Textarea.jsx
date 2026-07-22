import React, { forwardRef } from 'react';

const Textarea = forwardRef(
  ({ label, error, helperText, rows = 3, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary placeholder:text-planner-muted/60 p-3.5 ${
            error ? 'border-rose-400 focus:ring-rose-300' : 'border-planner-border'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 font-medium leading-tight">{error}</span>}
        {!error && helperText && <span className="text-xs text-planner-muted">{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
