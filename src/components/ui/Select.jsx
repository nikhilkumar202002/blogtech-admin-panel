import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  icon: Icon,
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div
      className={`relative inline-flex items-center min-w-[140px] ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${className}`}
    >
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 text-slate-500 pointer-events-none"
        />
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none ${
          Icon ? 'pl-9' : 'pl-3'
        } pr-8 ${
          size === 'sm' ? 'h-8 text-xs' : 'h-9 text-[13px]'
        } text-slate-900 bg-white border border-slate-200 rounded-lg outline-none shadow-xs transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const label = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-2.5 text-slate-500 pointer-events-none"
      />
    </div>
  );
};

export default Select;
