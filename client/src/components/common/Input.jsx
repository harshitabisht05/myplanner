import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, helperText, leftIcon: LeftIcon, rightIcon: RightIcon, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="absolute left-3 text-planner-muted pointer-events-none">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 focus:border-planner-primary placeholder:text-planner-muted/60 ${
              LeftIcon ? 'pl-10' : 'pl-4'
            } ${RightIcon ? 'pr-10' : 'pr-4'} py-2.5 ${
              error ? 'border-rose-400 focus:ring-rose-300' : 'border-planner-border'
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <div className="absolute right-3 text-planner-muted pointer-events-none">
              <RightIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-500 font-medium leading-tight">{error}</span>}
        {!error && helperText && <span className="text-xs text-planner-muted">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
