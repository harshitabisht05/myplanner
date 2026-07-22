import React from 'react';

const IconButton = ({
  children,
  size = 'md',
  variant = 'ghost',
  className = '',
  onClick,
  title,
  disabled = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const variants = {
    ghost: 'hover:bg-planner-secondary text-planner-text',
    primary: 'bg-planner-primary text-white hover:bg-planner-primaryHover shadow-sm',
    secondary: 'bg-planner-secondary text-planner-text hover:opacity-80',
    danger: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-planner-primary/40 disabled:opacity-40 disabled:pointer-events-none ${
        sizes[size] || sizes.md
      } ${variants[variant] || variants.ghost} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
