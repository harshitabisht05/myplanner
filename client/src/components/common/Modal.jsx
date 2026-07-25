import React, { useEffect, useId, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import IconButton from './IconButton';

const Modal = memo(({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-0"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} bg-planner-card rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-cozy-lg border border-planner-border z-10 overflow-hidden my-0 sm:my-8 max-h-[90vh] flex flex-col`}
          >
            {/* Mobile Drag Indicator Bar */}
            <div className="w-12 h-1 bg-planner-border rounded-full mx-auto mb-3 sm:hidden" />

            {title && (
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-planner-border shrink-0">
                <h3 id={titleId} className="text-lg font-bold text-planner-text tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                <IconButton onClick={onClose} size="sm" title="Close modal" aria-label="Close modal">
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            )}
            <div className="overflow-y-auto custom-scrollbar flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';

export default Modal;
