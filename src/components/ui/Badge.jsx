import React from 'react';

/**
 * Status Badge Component styled with Tailwind CSS
 * Handles Active/Published, Draft, Closed/Unpublished, and Error/Delete states
 */
export const Badge = ({
  children,
  status = 'default',
  size = 'md',
  dot = true,
  className = '',
}) => {
  const normalizedStatus = String(status).toLowerCase();

  const getStyleClasses = () => {
    switch (normalizedStatus) {
      case 'active':
      case 'published':
      case 'success':
      case 'synced':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'draft':
      case 'warning':
      case 'pending':
      case 'changes pending':
      case 'scheduled':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'closed':
      case 'unpublished':
      case 'inactive':
      case 'archived':
      case 'read':
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-500',
        };
      case 'error':
      case 'delete':
      case 'danger':
      case 'rejected':
      case 'unread':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'accent':
      case 'engineering':
      case 'product':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const { badge, dot: dotClass } = getStyleClasses();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap leading-tight ${sizeClasses} ${badge} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass}`} />
      )}
      {children || status}
    </span>
  );
};

export default Badge;
