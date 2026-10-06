import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mail,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({
  activeTab = 'dashboard',
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  badgeCounts = { enquiries: 14, jobs: 12, blogs: 45 },
  user = {
    name: 'Sarah Jenkins',
    role: 'Lead Admin & Editor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  onLogoutClick,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'careers', label: 'Careers', icon: Briefcase, badge: badgeCounts.jobs },
    { id: 'blogs', label: 'Blogs', icon: FileText, badge: badgeCounts.blogs },
    { id: 'enquiries', label: 'Enquiries', icon: Mail, badge: badgeCounts.enquiries, badgeColor: '#ef4444' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '1px 0 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '64px',
          padding: isCollapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Layers size={18} />
          </div>
          {!isCollapsed && (
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Apex<span style={{ color: '#4f46e5' }}>CMS</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                Enterprise SaaS
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div style={{ padding: '16px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={19}
                    style={{
                      color: isActive ? '#4f46e5' : '#64748b',
                      flexShrink: 0,
                    }}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? '#4f46e5' : '#f1f5f9',
                      color: isActive ? '#ffffff' : item.badgeColor || '#475569',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapse Toggle for Icon-only Mode */}
      {isCollapsed && (
        <div style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* User Profile & Logout Footer */}
      <div
        style={{
          padding: isCollapsed ? '12px 8px' : '16px 14px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#fafafa',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid #cbd5e1',
                flexShrink: 0,
              }}
            />
            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.role}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onLogoutClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
