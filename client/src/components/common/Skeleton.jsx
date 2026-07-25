import React from 'react';

const Skeleton = ({ variant = 'text', count = 1, className = '', height, width }) => {
  const baseClass = 'bg-planner-border/60 dark:bg-planner-border/40 animate-pulse rounded-2xl';

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-3xl bg-planner-card/80 border border-planner-border/60 space-y-4 shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-5 w-1/3 bg-planner-border/60 rounded-xl animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-planner-border/60 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-planner-border/50 rounded-lg animate-pulse" />
          <div className="h-4 w-4/5 bg-planner-border/50 rounded-lg animate-pulse" />
        </div>
        <div className="pt-2 flex items-center justify-between">
          <div className="h-6 w-20 bg-planner-border/60 rounded-full animate-pulse" />
          <div className="h-4 w-12 bg-planner-border/50 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === 'task') {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-planner-card/80 border border-planner-border/60 flex items-center justify-between gap-3 ${className}`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-5 h-5 rounded-lg bg-planner-border/70 animate-pulse shrink-0" />
              <div className="space-y-1.5 w-3/4">
                <div className="h-4 bg-planner-border/70 rounded-lg animate-pulse w-2/3" />
                <div className="h-3 bg-planner-border/50 rounded-lg animate-pulse w-1/3" />
              </div>
            </div>
            <div className="h-6 w-16 bg-planner-border/60 rounded-full animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className="p-4 rounded-3xl bg-planner-card border border-planner-border space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-planner-border/60">
          <div className="h-6 w-32 bg-planner-border/60 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-xl bg-planner-border/60 animate-pulse" />
            <div className="h-8 w-8 rounded-xl bg-planner-border/60 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-20 sm:h-24 rounded-2xl bg-planner-bg/60 border border-planner-border/40 p-2 space-y-2">
              <div className="h-4 w-4 bg-planner-border/60 rounded-full animate-pulse" />
              {i % 4 === 0 && <div className="h-3 w-full bg-planner-primary/20 rounded-md animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`p-6 rounded-3xl bg-planner-card border border-planner-border space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-planner-border/60 rounded-xl animate-pulse" />
          <div className="h-7 w-24 bg-planner-border/50 rounded-xl animate-pulse" />
        </div>
        <div className="h-48 sm:h-64 w-full bg-planner-bg/60 rounded-2xl border border-planner-border/40 flex items-end justify-between p-4 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-planner-primary/20 rounded-t-xl animate-pulse"
              style={{ height: `${(i % 5 + 2) * 18}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`rounded-full bg-planner-border/70 animate-pulse ${className}`} style={{ width: width || '40px', height: height || '40px' }} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClass} ${className}`}
          style={{
            height: height || (variant === 'heading' ? '28px' : '16px'),
            width: width || (i === count - 1 && count > 1 ? '70%' : '100%')
          }}
        />
      ))}
    </div>
  );
};

export default Skeleton;
