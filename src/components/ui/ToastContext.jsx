import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Floating Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
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

const ToastItem = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />;
      default:
        return <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return '#a7f3d0';
      case 'error': return '#fca5a5';
      case 'warning': return '#fde68a';
      default: return '#bfdbfe';
    }
  };

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
      className="animate-slide-in-right"
    >
      {getIcon()}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
            }}
          >
            {toast.title}
          </h4>
        )}
        {toast.message && (
          <p
            style={{
              fontSize: '12px',
              color: '#475569',
              margin: '2px 0 0 0',
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
