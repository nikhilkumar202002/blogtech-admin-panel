import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '560px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
      }}
      className="animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
        className="animate-pop-in"
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#0f172a',
                margin: 0,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '4px 0 0 0',
                }}
              >
                {subtitle}
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
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
