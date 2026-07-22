import React from 'react';

const PageHeader = ({ title, subtitle, action, icon: Icon }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-3 bg-planner-secondary text-planner-primary rounded-2xl shrink-0 mt-0.5">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-planner-text">{title}</h1>
          {subtitle && <p className="text-sm text-planner-muted mt-1 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
