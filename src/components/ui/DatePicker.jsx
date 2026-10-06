import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date...',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetSelect = (presetDays) => {
    const d = new Date();
    if (presetDays !== 0) {
      d.setDate(d.getDate() + presetDays);
    }
    const isoDate = d.toISOString().split('T')[0];
    onChange(isoDate);
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 'auto',
      }}
      className={className}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Calendar
          size={15}
          style={{
            position: 'absolute',
            left: '12px',
            color: '#64748b',
            pointerEvents: 'none',
          }}
        />
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            width: '100%',
            paddingLeft: '34px',
            paddingRight: value ? '32px' : '12px',
            height: size === 'sm' ? '32px' : '38px',
            fontSize: '13px',
            color: value ? '#0f172a' : '#64748b',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
            transition: 'all 0.15s ease',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4f46e5';
            e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 1px 2px 0 rgba(16, 24, 40, 0.04)';
          }}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Clear date"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
