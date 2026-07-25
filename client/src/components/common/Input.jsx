import React, { forwardRef, useId } from 'react';

const Input = forwardRef(
  ({ label, error, helperText, leftIcon: LeftIcon, rightIcon: RightIcon, className = '', containerClassName = '', id: customId, ...props }, ref) => {
    const defaultId = useId();
    const inputId = customId || defaultId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-planner-muted uppercase tracking-wider select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3.5 text-planner-muted pointer-events-none">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary placeholder:text-planner-muted/50 min-h-[44px] sm:min-h-[40px] ${
              LeftIcon ? 'pl-10' : 'pl-4'
            } ${RightIcon ? 'pr-10' : 'pr-4'} py-2.5 ${
              error ? 'border-rose-400 focus:ring-rose-400/40 focus:border-rose-500' : 'border-planner-border'
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3.5 text-planner-muted pointer-events-none">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && <span id={errorId} className="text-xs text-rose-500 font-semibold leading-tight flex items-center gap-1 mt-0.5">{error}</span>}
        {!error && helperText && <span id={helperId} className="text-xs text-planner-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
