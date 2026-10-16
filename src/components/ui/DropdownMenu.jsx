import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({
  trigger,
  items = [], // Array of { label, icon, onClick, danger, divider }
  headerContent,
  footerContent,
  align = 'right',
  width = '180px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{ width }}
          className={`absolute top-full mt-1.5 ${
            align === 'left' ? 'left-0' : 'right-0'
          } max-w-[calc(100vw-24px)] bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1.5 z-50 animate-pop-in`}
        >
          {headerContent && (
            <div className="p-2.5 pb-2.5 border-b border-slate-100 mb-1">
              {headerContent}
            </div>
          )}
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
          {footerContent && (
            <div className="p-1.5 border-t border-slate-100 mt-1">
              {footerContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
