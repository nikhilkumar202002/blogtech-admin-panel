import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  shortcutHint = null,
  size = 'md',
  className = '',
  autoFocus = false,
  ...props
}) => {
  return (
    <div className={`relative inline-flex items-center w-full max-w-sm ${className}`}>
      <Search
        size={16}
        className="absolute left-3 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full pl-9 ${
          value ? 'pr-8' : shortcutHint ? 'pr-12' : 'pr-3'
        } ${
          size === 'sm' ? 'h-8 text-xs' : 'h-9 text-[13px]'
        } text-slate-900 bg-white border border-slate-200 rounded-lg outline-none shadow-xs transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20`}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear ? onClear : () => onChange('')}
          className="absolute right-2.5 bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded flex items-center"
          title="Clear search"
        >
          <X size={14} />
        </button>
      ) : shortcutHint ? (
        <kbd className="absolute right-2.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 pointer-events-none">
          {shortcutHint}
        </kbd>
      ) : null}
    </div>
  );
};

export default SearchInput;
