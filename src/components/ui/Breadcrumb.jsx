import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export const Breadcrumb = ({ items = [], showHomeIcon = true, className = '' }) => {
  if (!items || items.length === 0) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumb-container ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '13px',
        color: '#64748b',
        lineHeight: 1.4,
        marginBottom: '6px',
      }}
    >
      {items.map((item, index) => {
        const isCurrent = index === lastIndex;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
            )}

            {isCurrent ? (
              <span
                style={{
                  color: '#0f172a',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
                aria-current="page"
              >
                {index === 0 && showHomeIcon && item.label === 'Dashboard' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Home size={14} style={{ color: '#0f172a' }} />
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
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#64748b',
                  fontWeight: 400,
                  cursor: item.onClick ? 'pointer' : 'default',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'color 0.15s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (item.onClick) e.currentTarget.style.color = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  if (item.onClick) e.currentTarget.style.color = '#64748b';
                }}
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
