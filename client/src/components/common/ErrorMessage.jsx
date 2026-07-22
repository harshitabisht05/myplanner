import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorMessage = ({ message = 'Failed to load data', onRetry, className = '' }) => {
  return (
    <div className={`p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center flex flex-col items-center gap-3 my-4 ${className}`}>
      <AlertCircle className="w-8 h-8 text-rose-500" />
      <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
