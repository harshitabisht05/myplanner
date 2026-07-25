import React, { forwardRef, useId } from 'react';

const Textarea = forwardRef(
  ({ label, error, helperText, rows = 3, className = '', containerClassName = '', id: customId, ...props }, ref) => {
    const defaultId = useId();
    const textareaId = customId || defaultId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={textareaId} className="text-xs font-bold text-planner-muted uppercase tracking-wider select-none">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary placeholder:text-planner-muted/50 p-3.5 ${
            error ? 'border-rose-400 focus:ring-rose-400/40 focus:border-rose-500' : 'border-planner-border'
          } ${className}`}
          {...props}
        />
        {error && <span id={errorId} className="text-xs text-rose-500 font-semibold leading-tight">{error}</span>}
        {!error && helperText && <span id={helperId} className="text-xs text-planner-muted">{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
