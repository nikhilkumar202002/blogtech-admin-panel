import React from 'react';

export const FormField = ({
  label,
  required = false,
  helperText,
  hint,
  error,
  children,
  className = '',
  id,
}) => {
  const helpText = helperText || hint;
  return (
    <div className={`flex flex-col gap-1.5 w-full mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[13px] font-medium text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      {children}

      {error ? (
        <span className="text-xs text-rose-600 font-medium">
          {error}
        </span>
      ) : helpText ? (
        <span className="text-xs text-slate-500">
          {helpText}
        </span>
      ) : null}
    </div>
  );
};

export default FormField;
