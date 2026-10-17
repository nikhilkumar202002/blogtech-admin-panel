import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Globe,
  EyeOff,
  XCircle,
  Ban,
  RotateCcw,
  ChevronDown,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useToast } from './ToastContext';
import {
  publishCareer,
  unpublishCareer,
  closeCareer,
  withdrawCareer,
  reopenCareer,
  updateCareerStatus,
} from '../../utils/career.service';

const STATUS_ACTIONS = [
  {
    action: 'publish',
    targetStatus: 'published',
    label: 'Publish',
    description: 'Make position visible on public website',
    icon: Globe,
    badgeBg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70',
    dotColor: 'bg-emerald-500',
  },
  {
    action: 'unpublish',
    targetStatus: 'draft',
    label: 'Unpublish',
    description: 'Revert position back to draft',
    icon: EyeOff,
    badgeBg: 'bg-amber-50 text-amber-700 hover:bg-amber-100/70',
    dotColor: 'bg-amber-500',
  },
  {
    action: 'close',
    targetStatus: 'closed',
    label: 'Close',
    description: 'Close position to new applicants',
    icon: XCircle,
    badgeBg: 'bg-slate-100 text-slate-700 hover:bg-slate-200/70',
    dotColor: 'bg-slate-500',
  },
  {
    action: 'withdraw',
    targetStatus: 'withdrawn',
    label: 'Withdraw',
    description: 'Cancel or revoke this job opening',
    icon: Ban,
    badgeBg: 'bg-rose-50 text-rose-700 hover:bg-rose-100/70',
    dotColor: 'bg-rose-500',
  },
  {
    action: 'reopen',
    targetStatus: 'published',
    label: 'Reopen',
    description: 'Reactivate opening back to published',
    icon: RotateCcw,
    badgeBg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/70',
    dotColor: 'bg-indigo-500',
  },
];

const getStatusBadgeConfig = (status) => {
  const s = String(status || 'draft').toLowerCase();
  switch (s) {
    case 'published':
    case 'active':
      return {
        label: 'Published',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
        dotClass: 'bg-emerald-500',
      };
    case 'closed':
      return {
        label: 'Closed',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80',
        dotClass: 'bg-slate-500',
      };
    case 'withdrawn':
      return {
        label: 'Withdrawn',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80',
        dotClass: 'bg-rose-500',
      };
    case 'draft':
    default:
      return {
        label: 'Draft',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80',
        dotClass: 'bg-amber-500',
      };
  }
};

export const CarrerStatusUpdate = ({
  careerId,
  currentStatus = 'draft',
  careerTitle = '',
  onStatusChange,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus || 'draft');

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Sync when prop updates
  useEffect(() => {
    setStatus(currentStatus || 'draft');
  }, [currentStatus]);

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 270;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const opensUp = spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow;

    let top = opensUp ? rect.top - menuHeight - 6 : rect.bottom + 6;
    if (top < 10) top = 10;
    if (top + menuHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - menuHeight - 10);
    }

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    if (left < 12) left = 12;

    setCoords({
      top,
      left,
      placement: opensUp ? 'top' : 'bottom',
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      updatePosition();
    };

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Execute status update API call
  const handleSelectStatus = async (item) => {
    const { action, targetStatus, label } = item;

    // If already in target status, just close
    if (status.toLowerCase() === targetStatus.toLowerCase()) {
      setIsOpen(false);
      return;
    }

    if (!careerId) {
      addToast({
        title: 'Error',
        message: 'No career ID specified for status update.',
        type: 'error',
      });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(false);

    try {
      // Use specific API call or generic status updater
      if (action === 'publish') {
        await publishCareer(careerId);
      } else if (action === 'unpublish') {
        await unpublishCareer(careerId);
      } else if (action === 'close') {
        await closeCareer(careerId);
      } else if (action === 'withdraw') {
        await withdrawCareer(careerId);
      } else if (action === 'reopen') {
        await reopenCareer(careerId);
      } else {
        await updateCareerStatus(careerId, action);
      }

      setStatus(targetStatus);

      addToast({
        title: `Status: ${label}`,
        message: careerTitle
          ? `"${careerTitle}" is now marked as ${targetStatus}.`
          : `Career opening status updated to ${targetStatus}.`,
        type: 'success',
      });

      if (onStatusChange) {
        onStatusChange(targetStatus, action);
      }
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || err?.message || 'Could not update career status.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const badgeConfig = getStatusBadgeConfig(status);
  const normalizedCurrentStatus = String(status || 'draft').toLowerCase();

  const menuDropdown = isOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          width: '220px',
          zIndex: 99999,
        }}
        className="bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-900/15 p-1.5 transition-all select-none animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="px-2.5 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Change Status
          </span>
          {careerId && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              #{careerId}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          {STATUS_ACTIONS.map((item) => {
            const Icon = item.icon;
            const isCurrent =
              normalizedCurrentStatus === item.targetStatus.toLowerCase() ||
              (item.action === 'unpublish' && normalizedCurrentStatus === 'draft') ||
              (item.action === 'reopen' && normalizedCurrentStatus === 'published');

            return (
              <button
                key={item.action}
                type="button"
                onClick={() => handleSelectStatus(item)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-[12.5px] font-medium rounded-lg text-left transition-colors cursor-pointer group ${
                  isCurrent
                    ? 'bg-slate-50 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.dotColor} shrink-0`} />
                  <Icon size={14} className="text-slate-400 group-hover:text-slate-700 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {isCurrent && (
                  <Check size={13} className="text-indigo-600 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all cursor-pointer leading-tight select-none ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${badgeConfig.badgeClass} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
        }`}
        title="Click to change status"
      >
        <span
          className={`rounded-full shrink-0 ${
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          } ${badgeConfig.dotClass}`}
        />
        <span>{badgeConfig.label}</span>

        {isLoading ? (
          <RefreshCw
            size={11}
            className="animate-spin text-slate-400 shrink-0 ml-0.5"
          />
        ) : (
          <ChevronDown
            size={11}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ml-0.5 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {menuDropdown}
    </div>
  );
};

export default CarrerStatusUpdate;