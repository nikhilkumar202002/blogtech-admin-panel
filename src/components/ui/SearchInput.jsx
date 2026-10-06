import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  shortcutHint = '⌘K',
  size = 'md',
  className = '',
  autoFocus = false,
  ...props
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '360px',
      }}
      className={className}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: '#94a3b8',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          paddingLeft: '36px',
          paddingRight: value ? '32px' : shortcutHint ? '48px' : '12px',
          height: size === 'sm' ? '32px' : '38px',
          fontSize: '13px',
          color: '#0f172a',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          outline: 'none',
          boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
          transition: 'all 0.15s ease',
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
      />
      {value ? (
        <button
          type="button"
          onClick={onClear ? onClear : () => onChange('')}
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
            borderRadius: '4px',
          }}
          title="Clear search"
        >
          <X size={14} />
        </button>
      ) : shortcutHint ? (
        <span
          style={{
            position: 'absolute',
            right: '10px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#94a3b8',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            padding: '1px 5px',
            pointerEvents: 'none',
          }}
        >
          {shortcutHint}
        </span>
      ) : null}
    </div>
  );
};
