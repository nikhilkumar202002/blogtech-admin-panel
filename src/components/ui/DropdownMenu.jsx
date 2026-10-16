import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export const DropdownMenu = ({
  trigger,
  items = [], // Array of { label, icon, onClick, danger, divider }
  headerContent,
  footerContent,
  align = 'right',
  width = '190px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidthNum = parseInt(width, 10) || 190;
    
    // Calculate approximate or measured height
    const menuEl = menuRef.current;
    const menuHeight = menuEl ? menuEl.offsetHeight : items.length * 38 + 24;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Flip upwards if not enough space below, but more space above
    const opensUp = spaceBelow < menuHeight + 10 && spaceAbove > spaceBelow;

    let top = opensUp ? rect.top - menuHeight - 6 : rect.bottom + 6;
    if (top < 10) top = 10;
    if (top + menuHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - menuHeight - 10);
    }

    let left = align === 'right' ? rect.right - menuWidthNum : rect.left;
    if (left + menuWidthNum > window.innerWidth - 12) {
      left = window.innerWidth - menuWidthNum - 12;
    }
    if (left < 12) {
      left = 12;
    }

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

    // Reposition on resize and scroll
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

  const menuDropdown = isOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          width,
          zIndex: 99999,
        }}
        className={`max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-900/15 p-1.5 transition-all select-none animate-in fade-in zoom-in-95 duration-100 ${
          coords.placement === 'top' ? 'origin-bottom-right' : 'origin-top-right'
        }`}
      >
        {headerContent && (
          <div className="p-2.5 pb-2.5 border-b border-slate-100 mb-1">
            {headerContent}
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={`div-${idx}`} className="h-px bg-slate-100 my-1" />;
            }

            const Icon = item.icon;
            return (
              <button
                key={item.label || idx}
                type="button"
                onClick={() => {
                  item.onClick && item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-lg text-left transition-colors cursor-pointer ${
                  item.danger
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon size={15} className="shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {footerContent && (
          <div className="p-1.5 border-t border-slate-100 mt-1">
            {footerContent}
          </div>
        )}
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer inline-flex items-center justify-center"
      >
        {trigger}
      </div>

      {menuDropdown}
    </div>
  );
};

export default DropdownMenu;
