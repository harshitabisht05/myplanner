import React, { useState, memo } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';

const ErrorMessage = memo(({
  title = 'Something went wrong',
  message = 'Failed to load requested data',
  details,
  onRetry,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center flex flex-col items-center gap-3.5 my-4 animate-in fade-in-50 duration-200 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
        <AlertCircle className="w-6 h-6 stroke-[2.2]" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold text-planner-text">{title}</h4>
        <p className="text-sm text-planner-muted max-w-md leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Request
        </Button>
      )}

      {details && (
        <div className="w-full max-w-md pt-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 focus:outline-none"
          >
            {showDetails ? 'Hide technical details' : 'Show technical details'}
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 rounded-2xl bg-slate-950 text-slate-300 text-[11px] font-mono text-left overflow-x-auto border border-rose-900/50 max-h-40">
              {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
