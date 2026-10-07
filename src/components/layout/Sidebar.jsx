import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mail,
  Settings,
  LogOut,
  Activity,
} from 'lucide-react';

export const Sidebar = ({
  activeTab = 'dashboard',
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  badgeCounts = { enquiries: 14, jobs: 12, blogs: 45 },
  user = {
    name: 'Sarah Jenkins',
    role: 'Lead Admin & Editor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  onLogoutClick,
}) => {
  const navSections = [
    {
      title: 'MAIN',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'careers', label: 'Careers', icon: Briefcase, badge: badgeCounts.jobs },
        { id: 'blogs', label: 'Blogs', icon: FileText, badge: badgeCounts.blogs },
        { id: 'enquiries', label: 'Enquiries', icon: Mail, badge: badgeCounts.enquiries, badgeColor: '#ef4444' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ id: 'settings', label: 'Settings', icon: Settings }],
    },
  ];

  const handleNavClick = (id) => {
    onTabChange(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={isMobileOpen ? 'mobile-drawer-open' : ''}
        style={{
          width: isCollapsed ? '72px' : '256px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 100,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '2px 0 8px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* BRAND HEADER */}
        <div
          style={{
            height: '68px',
            padding: isCollapsed ? '0 12px' : '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={isCollapsed ? '/fav-icon.jpg' : '/MAIN-LOGO.png'}
              alt="BLOGTECH Logo"
              style={{
                height: isCollapsed ? '32px' : '36px',
                width: isCollapsed ? '32px' : 'auto',
                maxWidth: isCollapsed ? '32px' : '140px',
                borderRadius: isCollapsed ? '8px' : '0px',
                objectFit: 'contain',
                transition: 'all 0.2s ease',
              }}
            />
          </div>




        </div>

        {/* NAVIGATION SECTIONS */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {navSections.map((section, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!isCollapsed ? (
                <div
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#94a3b8',
                    letterSpacing: '0.08em',
                    padding: '0 10px 6px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {section.title}
                </div>
              ) : (
                idx > 0 && <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 8px 8px 8px' }} />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      padding: isCollapsed ? '10px 0' : '9px 12px',
                      borderRadius: '8px',
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
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '18%',
                          bottom: '18%',
                          width: '3.5px',
                          borderRadius: '0 4px 4px 0',
                          backgroundColor: '#4f46e5',
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <Icon
                        size={18}
                        style={{
                          color: isActive ? '#4f46e5' : '#64748b',
                          flexShrink: 0,
                        }}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>


                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* USER PROFILE & FOOTER */}
        <div
          style={{
            padding: '12px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: isCollapsed ? '6px' : '10px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid #cbd5e1',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '2px solid #ffffff',
                  }}
                  title="Online"
                />
              </div>

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

          {!isCollapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px',
                padding: '0 4px',
                fontSize: '10.5px',
                color: '#94a3b8',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={12} style={{ color: '#10b981' }} />
                <span>Operational</span>
              </div>
              <span>v2.4.0</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
