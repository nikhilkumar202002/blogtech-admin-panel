import React from 'react';

/**
 * Modern SaaS Initials Avatar Component
 * Generates crisp initials from the user's name with a sleek gradient background.
 */
export const Avatar = ({
  name = '',
  size = 'md', // 'xs' (28px), 'sm' (32px), 'md' (36px), 'lg' (44px), 'xl' (80px), or number
  status = 'active',
  showStatus = true,
  className = '',
  style = {},
}) => {
  // Extract initials from user name (e.g. "John Doe" -> "JD", "Admin" -> "A")
  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return 'A';
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'A';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    xs: {
      wrapper: 'w-7 h-7 text-[11px]',
      status: 'w-2 h-2 ring-[1.5px]',
    },
    sm: {
      wrapper: 'w-8 h-8 text-xs',
      status: 'w-2.5 h-2.5 ring-2',
    },
    md: {
      wrapper: 'w-9 h-9 text-[13px]',
      status: 'w-2.5 h-2.5 ring-2',
    },
    lg: {
      wrapper: 'w-11 h-11 text-[15px]',
      status: 'w-3 h-3 ring-2',
    },
    xl: {
      wrapper: 'w-20 h-20 text-2xl',
      status: 'w-4 h-4 ring-[3px]',
    },
  };

  const currentSize = typeof size === 'string' && sizeClasses[size]
    ? sizeClasses[size]
    : {
        wrapper: 'w-9 h-9 text-[13px]',
        status: 'w-2.5 h-2.5 ring-2',
      };

  const customDimensions = typeof size === 'number'
    ? {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.38)}px`,
      }
    : {};

  const isOnline = status === 'active' || status === 'online';

  return (
    <div
      style={{
        ...customDimensions,
        ...style,
      }}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 text-white font-bold tracking-wider select-none shrink-0 border border-white/20 shadow-xs ${currentSize.wrapper} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{initials}</span>

      {showStatus && isOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full bg-emerald-500 ring-white shadow-xs ${currentSize.status}`}
          title="Active status"
        />
      )}
    </div>
  );
};

export default Avatar;
