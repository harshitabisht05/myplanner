import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({
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
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-500' : 'bg-amber-100 text-amber-500'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-planner-text">{title}</h4>
          <p className="text-sm text-planner-muted mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 w-full mt-4">
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
};

export default ConfirmationDialog;
