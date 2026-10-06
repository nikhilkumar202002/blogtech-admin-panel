import React from 'react';

/**
 * Status Badge Component
 * Handles Active/Published, Draft, Closed/Unpublished, and Error/Delete states
 */
export const Badge = ({
  children,
  status = 'default', // 'active', 'published', 'draft', 'closed', 'unpublished', 'error', 'danger', 'info'
  size = 'md',
  dot = true,
  className = '',
}) => {
  // Normalize status names
  const normalizedStatus = String(status).toLowerCase();

  const getStyles = () => {
    switch (normalizedStatus) {
      case 'active':
      case 'published':
      case 'success':
      case 'synced':
        return {
          bg: '#ecfdf5',
          color: '#047857',
          border: '#a7f3d0',
          dot: '#10b981',
        };
      case 'draft':
      case 'warning':
      case 'pending':
      case 'changes pending':
      case 'scheduled':
        return {
          bg: '#fffbeb',
          color: '#b45309',
          border: '#fde68a',
          dot: '#f59e0b',
        };
      case 'closed':
      case 'unpublished':
      case 'inactive':
      case 'archived':
      case 'read':
        return {
          bg: '#f1f5f9',
          color: '#475569',
          border: '#cbd5e1',
          dot: '#64748b',
        };
      case 'error':
      case 'delete':
      case 'danger':
      case 'rejected':
      case 'unread':
        return {
          bg: '#fef2f2',
          color: '#b91c1c',
          border: '#fca5a5',
          dot: '#ef4444',
        };
      case 'accent':
      case 'engineering':
      case 'product':
        return {
          bg: '#eef2ff',
          color: '#4338ca',
          border: '#c7d2fe',
          dot: '#6366f1',
        };
      default:
        return {
          bg: '#f8fafc',
          color: '#334155',
          border: '#e2e8f0',
          dot: '#94a3b8',
        };
    }
  };

  const styleObj = getStyles();

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        backgroundColor: styleObj.bg,
        color: styleObj.color,
        border: `1px solid ${styleObj.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: styleObj.dot,
            display: 'inline-block',
          }}
        />
      )}
      {children || status}
    </span>
  );
};
