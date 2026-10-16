import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component System styled with Tailwind CSS
 * Variants: primary, secondary, ghost, danger, outline, accent
 * Sizes: sm, md, lg, icon
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Variant mappings
  const variantStyles = {
    primary: 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 focus:ring-slate-900 shadow-xs',
    secondary: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-300 shadow-xs',
    ghost: 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 focus:ring-rose-600 shadow-xs',
    outline: 'bg-transparent text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300',
    accent: 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 shadow-xs',
  };

  // Size mappings
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-9',
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

export default Button;
