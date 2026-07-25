import React, { memo } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border ${isDanger ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' : 'bg-amber-500/15 text-amber-500 border-amber-500/30'}`}>
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-planner-text tracking-tight">{title}</h4>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed max-w-xs mx-auto">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 w-full mt-2">
          <Button variant="outline" onClick={onClose} fullWidth disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;
