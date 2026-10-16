import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const hasBoth = title && message;
    const content = hasBoth ? (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 text-[13px] leading-tight">{title}</span>
        <span className="text-slate-600 text-xs leading-snug">{message}</span>
      </div>
    ) : (
      title || message || ''
    );

    const options = { duration };

    switch (type) {
      case 'success':
        return toast.success(content, options);
      case 'error':
        return toast.error(content, options);
      case 'warning':
        return toast(content, {
          ...options,
          icon: '⚠️',
        });
      case 'loading':
        return toast.loading(content, options);
      case 'info':
      default:
        return toast(content, {
          ...options,
          icon: (
            <svg
              className="w-4 h-4 text-indigo-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" d="M12 16v-4m0-4h.01" />
            </svg>
          ),
        });
    }
  }, []);

  const removeToast = useCallback((id) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          className: 'react-hot-toast-container',
          style: {
            background: '#ffffff',
            color: '#0f172a',
            fontFamily: "'Google Sans', 'Google Sans Text', system-ui, sans-serif",
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
            padding: '10px 14px',
            maxWidth: '380px',
          },
          success: {
            duration: 3500,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4500,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Re-export toast directly for convenient direct calls throughout the app
export { toast, Toaster };
