import { FC } from 'react';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({
  message = 'Loading...',
  showSpinner = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      {showSpinner && (
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <p className="text-gray-700">{message}</p>
    </div>
  );
};

export default LoadingState;
