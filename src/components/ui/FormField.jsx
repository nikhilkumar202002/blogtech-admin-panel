import React from 'react';

export const FormField = ({
  label,
  required = false,
  helperText,
  error,
  children,
  className = '',
  id,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        marginBottom: '16px',
      }}
      className={className}
    >
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}

      {children}

      {error ? (
        <span
          style={{
            fontSize: '12px',
            color: '#dc2626',
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
