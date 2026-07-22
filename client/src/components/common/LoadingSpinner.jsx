import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-planner-primary">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-3 border-planner-secondary"></div>
        <div className="absolute inset-0 rounded-full border-3 border-planner-primary border-t-transparent animate-spin"></div>
      </div>
      {message && <p className="text-sm font-medium text-planner-muted">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center w-full">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
