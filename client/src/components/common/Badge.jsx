import React, { memo } from 'react';

const Badge = memo(({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-planner-secondary text-planner-text border-planner-border/80',
    primary: 'bg-planner-primary/15 text-planner-primary border-planner-primary/30 font-bold',
    high: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold',
    medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold',
    low: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-bold',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 font-bold'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider',
    md: 'px-2.5 py-1 text-xs font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border transition-colors duration-150 ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
