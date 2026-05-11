import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

export default function Modal({ isOpen, onClose, title, description, children, footer, size = 'md', closeButton = true }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-200 dark:bg-slate-950/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div className={`w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-xl dark:bg-slate-800 animate-scale-in`}>
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex items-start justify-between border-b border-slate-200 p-6 dark:border-slate-700">
              <div className="flex-1">
                {title && <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>}
                {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
              </div>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
