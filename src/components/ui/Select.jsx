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
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
        minWidth: '140px',
      }}
      className={className}
    >
      {Icon && (
        <Icon
          size={15}
          style={{
            position: 'absolute',
            left: '12px',
            color: '#64748b',
            pointerEvents: 'none',
          }}
        />
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          appearance: 'none',
          paddingLeft: Icon ? '34px' : '12px',
          paddingRight: '32px',
          height: size === 'sm' ? '32px' : '38px',
          fontSize: '13px',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#4f46e5';
          e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
        }}
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
        style={{
          position: 'absolute',
          right: '10px',
          color: '#64748b',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
