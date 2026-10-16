import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ items = [], showHomeIcon = true, className = '' }) => {
  if (!items || items.length === 0) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumb-container flex items-center flex-wrap gap-1.5 text-[13px] text-slate-500 leading-normal mb-1.5 ${className}`}
    >
      {items.map((item, index) => {
        const isCurrent = index === lastIndex;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={13} className="text-slate-300 shrink-0" />
            )}

            {isCurrent ? (
              <span
                className="text-slate-900 font-semibold tracking-tight"
                aria-current="page"
              >
                {index === 0 && showHomeIcon && item.label === 'Dashboard' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Home size={14} className="text-slate-900" />
                    <span>{item.label}</span>
                  </span>
                ) : (
                  item.label
                )}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={`bg-transparent border-0 p-0 text-slate-500 font-normal inline-flex items-center gap-1.5 transition-colors no-underline ${
                  item.onClick ? 'cursor-pointer hover:text-indigo-600' : 'cursor-default'
                }`}
              >
                {index === 0 && showHomeIcon && item.label === 'Dashboard' && (
                  <Home size={14} />
                )}
                <span>{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
