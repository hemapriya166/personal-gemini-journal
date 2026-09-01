import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss
}) => {
  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/60 p-4 text-xs text-red-200 shadow-lg backdrop-blur-md animate-in slide-in-from-top-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold text-red-300">Operation Error</p>
            <p className="mt-0.5 text-red-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-1 rounded-lg border border-red-800 bg-red-900/50 px-2.5 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-900 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          )}
          <button
            onClick={onDismiss}
            className="rounded p-1 text-red-400 hover:text-red-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
