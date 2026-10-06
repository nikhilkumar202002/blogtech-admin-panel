import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, Briefcase, FileText, Mail, Settings, Plus, Send, X } from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onNavigate, onAction }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally if provided
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commandItems = [
    { type: 'nav', id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { type: 'nav', id: 'careers', label: 'Go to Careers / Job Openings', icon: Briefcase, category: 'Navigation' },
    { type: 'nav', id: 'blogs', label: 'Go to Blog Articles', icon: FileText, category: 'Navigation' },
    { type: 'nav', id: 'enquiries', label: 'Go to Contact Enquiries Inbox', icon: Mail, category: 'Navigation' },
    { type: 'nav', id: 'settings', label: 'Go to Website Publishing & Settings', icon: Settings, category: 'Navigation' },

    { type: 'action', id: 'new-blog', label: 'Create New Blog Article', icon: Plus, category: 'Quick Action' },
    { type: 'action', id: 'new-job', label: 'Create New Job Opening', icon: Plus, category: 'Quick Action' },
    { type: 'action', id: 'publish-site', label: 'Publish Website Updates to Production', icon: Send, category: 'Quick Action' },
  ];

  const filteredItems = commandItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      className="animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(16, 24, 40, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
        className="animate-pop-in"
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search pages..."
            autoFocus
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#0f172a',
              backgroundColor: 'transparent',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No matching commands or pages found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'nav') {
                      onNavigate(item.id);
                    } else if (item.type === 'action') {
                      onAction(item.id);
                    }
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#94a3b8',
                      backgroundColor: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
