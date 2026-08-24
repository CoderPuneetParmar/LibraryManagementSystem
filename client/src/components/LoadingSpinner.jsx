import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-t-amber-500 border-navy ${sizeClasses[size]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        {spinner}
        <p className="mt-3 text-slate-600 font-medium text-sm">Loading Campus Library...</p>
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{spinner}</div>;
};

export default LoadingSpinner;
