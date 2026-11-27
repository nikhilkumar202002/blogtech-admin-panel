import React from 'react';

/**
 * Modern SaaS Admin Status Badge Component
 * 
 * Palette:
 * - Primary (#a34b03): Deep Rust / Warm Copper (Brand accent, Super Admin, Featured)
 * - Secondary (#844414): Warm Chocolate / Bronze (Admin, Corporate)
 * - Yellow (#cb9706): Warm Amber Gold (Warning, Pending, Review, In Progress)
 * - Cream (#edd8bb): Warm Biscuit / Sand (Warm Neutral, Tier, Standard)
 * 
 * SaaS Admin Status Matrix:
 * - Active / Published / Success / Paid / Delivered / Approved / Online / Verified (Emerald)
 * - Danger / Error / Rejected / Failed / Cancelled / Refunded / Expired / Overdue (Rose)
 * - Info / Processing / In Transit / Queued / Open / New / Blue (Sky)
 * - Purple / Violet / VIP / Pro / Enterprise / Premium / AI / Beta (Purple)
 * - Teal / Cyan / Synced / Connected / Webhook / Lead (Teal)
 * - Orange / Urgent / High / Critical / Escalated (Orange)
 * - Draft / Closed / Unpublished / Inactive / Archived / Disabled / Offline / Paused (Slate)
 */
export const Badge = ({
  children,
  status = 'default',
  variant,
  size = 'md',
  dot = true,
  className = '',
}) => {
  const normalizedKey = String(variant || status || 'default').toLowerCase().trim();

  const getStyleClasses = () => {
    switch (normalizedKey) {
      // 1. PRIMARY COLOR (#a34b03)
      case 'primary':
      case 'brand':
      case 'featured':
      case 'official':
      case 'super_admin':
      case 'super-admin':
      case 'super admin':
        return {
          badge: 'bg-[#a34b03]/10 text-[#a34b03] border-[#a34b03]/25 font-semibold',
          dot: 'bg-[#a34b03]',
        };

      // 2. SECONDARY COLOR (#844414)
      case 'secondary':
      case 'bronze':
      case 'corporate':
      case 'admin':
        return {
          badge: 'bg-[#844414]/10 text-[#844414] border-[#844414]/25 font-semibold',
          dot: 'bg-[#844414]',
        };

      // 3. YELLOW COLOR (#cb9706) - WARNING, PENDING, IN-PROGRESS, REVIEW
      case 'yellow':
      case 'gold':
      case 'warning':
      case 'pending':
      case 'in_progress':
      case 'in-progress':
      case 'in progress':
      case 'review':
      case 'under_review':
      case 'under review':
      case 'trial':
      case 'attention':
      case 'scheduled':
      case 'changes pending':
      case 'changes_pending':
        return {
          badge: 'bg-[#cb9706]/15 text-[#966f03] border-[#cb9706]/35 font-semibold',
          dot: 'bg-[#cb9706]',
        };

      // 4. CREAM COLOR (#edd8bb) - WARM NEUTRAL, TIER, STANDARD
      case 'cream':
      case 'warm':
      case 'neutral-warm':
      case 'tier':
      case 'basic':
      case 'standard':
        return {
          badge: 'bg-[#edd8bb] text-[#844414] border-[#dfc49f] font-semibold',
          dot: 'bg-[#844414]',
        };

      // 5. SUCCESS / ACTIVE / PUBLISHED / PAID / DELIVERED / LIVE / VERIFIED
      case 'active':
      case 'published':
      case 'success':
      case 'paid':
      case 'completed':
      case 'complete':
      case 'delivered':
      case 'approved':
      case 'live':
      case 'online':
      case 'verified':
      case 'resolved':
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };

      // 6. DANGER / ERROR / REJECTED / FAILED / CANCELLED / REFUNDED / OVERDUE
      case 'error':
      case 'delete':
      case 'danger':
      case 'rejected':
      case 'failed':
      case 'fail':
      case 'cancelled':
      case 'canceled':
      case 'refunded':
      case 'expired':
      case 'overdue':
      case 'suspended':
      case 'blocked':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
        };

      // 7. INFO / BLUE / PROCESSING / IN TRANSIT / QUEUED / OPEN / NEW
      case 'info':
      case 'blue':
      case 'new':
      case 'processing':
      case 'in_transit':
      case 'in-transit':
      case 'queued':
      case 'open':
      case 'editor':
        return {
          badge: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
        };

      // 8. PURPLE / VIOLET / VIP / PRO / ENTERPRISE / PREMIUM / AI / BETA
      case 'purple':
      case 'violet':
      case 'pro':
      case 'premium':
      case 'vip':
      case 'enterprise':
      case 'beta':
      case 'ai':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
        };

      // 9. TEAL / CYAN / SYNCED / CONNECTED / WEBHOOK / LEAD
      case 'teal':
      case 'cyan':
      case 'synced':
      case 'connected':
      case 'webhook':
      case 'lead':
      case 'engineering':
        return {
          badge: 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-500',
        };

      // 10. ORANGE / URGENT / HIGH / CRITICAL / ESCALATED
      case 'orange':
      case 'urgent':
      case 'high':
      case 'critical':
      case 'escalated':
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
        };

      // 11. INDIGO / ACCENT / PRODUCT
      case 'accent':
      case 'indigo':
      case 'product':
        return {
          badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
        };

      // 12. NEUTRAL / DRAFT / CLOSED / UNPUBLISHED / INACTIVE / ARCHIVED / READ
      case 'draft':
      case 'closed':
      case 'unpublished':
      case 'inactive':
      case 'archived':
      case 'disabled':
      case 'offline':
      case 'paused':
      case 'read':
      case 'unread':
      case 'neutral':
      case 'slate':
      case 'gray':
      case 'default':
      default:
        return {
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const { badge, dot: dotClass } = getStyleClasses();
  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm px-3 py-1.5 gap-2'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap leading-tight transition-colors ${sizeClasses} ${badge} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${dotClass}`} />
      )}
      {children || status}
    </span>
  );
};

export default Badge;
