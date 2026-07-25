import React, { memo } from 'react';

const IconButton = memo(({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  onClick,
  title,
  'aria-label': ariaLabel,
  disabled = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8 min-w-[36px] min-h-[36px] text-xs',
    md: 'w-10 h-10 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] text-sm',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px] text-base'
  };

  const variants = {
    ghost: 'hover:bg-planner-secondary/80 text-planner-text focus-visible:ring-planner-primary',
    primary: 'bg-planner-primary text-white hover:bg-planner-primaryHover shadow-sm hover:shadow-cozy focus-visible:ring-planner-primary',
    secondary: 'bg-planner-secondary text-planner-text hover:bg-planner-primary/10 border border-planner-border/50 focus-visible:ring-planner-primary',
    danger: 'text-rose-500 hover:bg-rose-500/10 focus-visible:ring-rose-400'
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-planner-bg disabled:opacity-40 disabled:pointer-events-none select-none ${
        sizes[size] || sizes.md
      } ${variants[variant] || variants.ghost} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
