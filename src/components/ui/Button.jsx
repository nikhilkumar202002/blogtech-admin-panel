import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component System
 * Variants: primary, secondary, ghost, danger, outline
 * Sizes: sm, md, lg
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base classes
  const baseStyles = `
    inline-flex items-center justify-center font-medium transition-all duration-150
    select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50
    disabled:cursor-not-allowed cursor-pointer rounded-md border
  `;

  // Variant mappings
  const variantStyles = {
    primary: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 focus:ring-slate-900 shadow-sm',
    secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400 shadow-xs',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    danger: 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 focus:ring-rose-600 shadow-sm',
    outline: 'bg-transparent text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-400',
    accent: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 shadow-sm',
  };

  // Size mappings
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
    icon: 'p-2 h-9 w-9 justify-center',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthStyle} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: size === 'sm' ? '13px' : size === 'lg' ? '15px' : '14px',
        fontWeight: 500,
        borderRadius: '8px',
        border: '1px solid',
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '10px 20px' : '8px 16px',
        height: size === 'sm' ? '32px' : size === 'lg' ? '44px' : '38px',
        transition: 'all 0.15s ease-in-out',
        cursor: (isDisabled || isLoading) ? 'not-allowed' : 'pointer',
        opacity: (isDisabled || isLoading) ? 0.6 : 1,
        ...(variant === 'primary' ? { backgroundColor: '#0f172a', borderColor: '#0f172a', color: '#ffffff' } : {}),
        ...(variant === 'secondary' ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#334155' } : {}),
        ...(variant === 'ghost' ? { backgroundColor: 'transparent', borderColor: 'transparent', color: '#475569' } : {}),
        ...(variant === 'danger' ? { backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' } : {}),
        ...(variant === 'accent' ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5', color: '#ffffff' } : {}),
      }}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 16} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 16} />}
        </>
      )}
    </button>
  );
};
