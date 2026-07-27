import React, { memo } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle, Calendar, Trash2, Repeat } from 'lucide-react';

const DeleteTaskModal = memo(({
  isOpen,
  onClose,
  onConfirm,
  task,
  date,
  isLoading = false
}) => {
  if (!task) return null;

  const isRecurring = !!task.isRecurringDaily;

  const formattedDateStr = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : 'this date';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div
          className={`w-14 h-14 rounded-3xl flex items-center justify-center border ${
            isRecurring
              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
              : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
          }`}
        >
          {isRecurring ? (
            <Repeat className="w-7 h-7 stroke-[2.2]" />
          ) : (
            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
          )}
        </div>

        <div>
          <h4 className="text-lg font-bold text-planner-text tracking-tight">
            {isRecurring ? 'Delete Recurring Task' : 'Delete Task'}
          </h4>
          <p className="text-sm font-semibold text-planner-primary mt-1 truncate max-w-xs mx-auto">
            "{task.title}"
          </p>
          {isRecurring ? (
            <p className="text-xs text-planner-muted mt-2 max-w-xs mx-auto leading-relaxed">
              This is a daily recurring task. How would you like to delete it?
            </p>
          ) : (
            <p className="text-xs text-planner-muted mt-2 max-w-xs mx-auto leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
          )}
        </div>

        {isRecurring ? (
          <div className="space-y-2.5 w-full mt-2">
            <button
              onClick={() => onConfirm('single')}
              disabled={isLoading}
              className="w-full p-3 rounded-2xl border border-planner-border bg-planner-card hover:bg-planner-secondary/40 text-left flex items-center gap-3 transition-all group disabled:opacity-50"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-planner-text">
                  Delete for {formattedDateStr} only
                </p>
                <p className="text-[11px] text-planner-muted truncate">
                  Hide task for this day, keep recurring on other days
                </p>
              </div>
            </button>

            <button
              onClick={() => onConfirm('all')}
              disabled={isLoading}
              className="w-full p-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-left flex items-center gap-3 transition-all group disabled:opacity-50"
            >
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 group-hover:bg-rose-500/25">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                  Delete entire recurring series
                </p>
                <p className="text-[11px] text-rose-500/80 truncate">
                  Permanently delete this task and all occurrences
                </p>
              </div>
            </button>

            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
              disabled={isLoading}
              className="mt-1"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 w-full mt-2">
            <Button variant="outline" onClick={onClose} fullWidth disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => onConfirm('all')}
              isLoading={isLoading}
              fullWidth
            >
              Delete Task
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
});

DeleteTaskModal.displayName = 'DeleteTaskModal';

export default DeleteTaskModal;
