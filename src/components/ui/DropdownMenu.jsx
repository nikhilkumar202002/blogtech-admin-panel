import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({
  trigger,
  items = [], // Array of { label, icon, onClick, danger, divider }
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
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: '6px',
            [align]: 0,
            width,
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
            padding: '4px',
            zIndex: 100,
          }}
          className="animate-pop-in"
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return (
                <div
                  key={`div-${idx}`}
                  style={{
                    height: '1px',
                    backgroundColor: '#f1f5f9',
                    margin: '4px 0',
                  }}
                />
              );
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
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: item.danger ? '#dc2626' : '#334155',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.danger ? '#fef2f2' : '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {Icon && <Icon size={15} style={{ flexShrink: 0 }} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
