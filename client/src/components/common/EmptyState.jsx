import React, { memo } from 'react';
import { Sparkles, CheckSquare, Target, BookOpen, Calendar, Folder, FileText, MessageSquare } from 'lucide-react';
import Button from './Button';

const ICON_MAP = {
  tasks: CheckSquare,
  goals: Target,
  notes: BookOpen,
  events: Calendar,
  workspace: Folder,
  files: FileText,
  messages: MessageSquare,
  default: Sparkles
};

const EmptyState = memo(({
  type = 'default',
  icon: CustomIcon,
  title,
  message,
  actionText,
  onAction,
  className = ''
}) => {
  const IconComponent = CustomIcon || ICON_MAP[type] || ICON_MAP.default;

  const defaultTitles = {
    tasks: 'No Tasks Scheduled',
    goals: 'No Goals Set Yet',
    notes: 'No Notes Written',
    events: 'No Upcoming Events',
    workspace: 'No Workspaces Found',
    files: 'No Files Uploaded',
    messages: 'No Messages Yet',
    default: 'Nothing Here Yet'
  };

  const defaultMessages = {
    tasks: 'Your task list is clear! Enjoy your day or add a new focus item.',
    goals: 'Set meaningful milestones and track your progress daily.',
    notes: 'Capture ideas, daily thoughts, or quick notes anytime.',
    events: 'Schedule meetings, deadlines, or personal events to stay organized.',
    workspace: 'Create or join a workspace to collaborate with your team.',
    files: 'Upload documents, assets, or reference files for your projects.',
    messages: 'Start a conversation with your workspace team members.',
    default: 'Your day is a blank page waiting for your plan. ✨'
  };

  const finalTitle = title || defaultTitles[type] || defaultTitles.default;
  const finalMessage = message || defaultMessages[type] || defaultMessages.default;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-planner-card/60 rounded-3xl border border-dashed border-planner-border/80 my-4 transition-all duration-200 animate-in fade-in-50 duration-300 ${className}`}>
      {/* Decorative Glow Ring */}
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-planner-primary/20 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-planner-primary/20 to-planner-secondary text-planner-primary flex items-center justify-center border border-planner-primary/30 shadow-cozy">
          <IconComponent className="w-8 h-8 stroke-[2.2]" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-planner-text tracking-tight">{finalTitle}</h3>
      <p className="text-sm text-planner-muted max-w-md mt-1.5 mb-6 leading-relaxed">{finalMessage}</p>

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction} className="shadow-cozy hover:shadow-cozy-lg">
          {actionText}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
