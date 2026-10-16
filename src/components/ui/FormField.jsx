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
      ) : helperText ? (
        <span className="text-xs text-slate-500">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default FormField;
