import React, { memo } from 'react';

const PageHeader = memo(({ title, subtitle, action, icon: Icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex items-start sm:items-center gap-3.5">
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-planner-primary/20 to-planner-secondary text-planner-primary rounded-2xl shrink-0 border border-planner-primary/20 shadow-sm">
            <Icon className="w-6 h-6 stroke-[2.2]" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-planner-text">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-planner-muted mt-0.5 leading-relaxed font-medium">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
