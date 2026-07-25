import React, { memo } from 'react';

const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-planner-primary focus-visible:ring-offset-2 focus-visible:ring-offset-planner-bg rounded-2xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none min-h-[42px] sm:min-h-[38px]';

  const variants = {
    primary: 'bg-planner-primary text-white hover:bg-planner-primaryHover focus-visible:ring-planner-primary shadow-cozy hover:shadow-cozy-lg hover:-translate-y-0.5',
    secondary: 'bg-planner-secondary text-planner-text hover:bg-planner-primary/10 focus-visible:ring-planner-primary border border-planner-border/50',
    outline: 'border border-planner-border text-planner-text hover:bg-planner-secondary/80 focus-visible:ring-planner-primary hover:border-planner-primary/40',
    ghost: 'text-planner-text hover:bg-planner-secondary/60 focus-visible:ring-planner-primary',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-400 shadow-sm hover:shadow-rose-500/20 hover:-translate-y-0.5'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px] sm:min-h-[40px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[48px]'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
