import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = "Nothing here yet",
  message = "Your day is a blank page ✨",
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-planner-card/50 rounded-3xl border border-dashed border-planner-border/80 my-4 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-planner-secondary text-planner-primary flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-planner-text">{title}</h3>
      <p className="text-sm text-planner-muted max-w-sm mt-1 mb-6 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
