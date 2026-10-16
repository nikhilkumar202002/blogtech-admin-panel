import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Mail,
  Settings,
  LogOut,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export const Sidebar = ({
  activeTab = 'dashboard',
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  badgeCounts = { enquiries: 14, jobs: 12, blogs: 45 },
  user = {
    id: 55,
    name: 'Nikhil Kumar',
    email: 'nikhilkumars12343@gmail.com',
    role: 'super_admin',
    status: 'active',
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
        { id: 'careers', label: 'Careers', icon: Briefcase, badge: badgeCounts?.jobs },
        { id: 'blogs', label: 'Blogs', icon: FileText, badge: badgeCounts?.blogs },
        { id: 'enquiries', label: 'Enquiries', icon: Mail, badge: badgeCounts?.enquiries, badgeColor: '#ef4444' },
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-200 shadow-xs ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${isMobileOpen ? 'mobile-drawer-open' : ''}`}
      >
        {/* BRAND HEADER */}
        <div
          className={`h-[68px] flex items-center border-b border-slate-100 shrink-0 ${
            isCollapsed ? 'px-3 justify-center' : 'px-4 justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={isCollapsed ? '/fav-icon.jpg' : '/MAIN-LOGO.png'}
              alt="BLOGTECH Logo"
              className={`transition-all duration-200 object-contain ${
                isCollapsed ? 'h-8 w-8 rounded-lg' : 'h-9 w-auto max-w-[140px]'
              }`}
            />
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <div className="text-[10.5px] font-bold text-slate-400 tracking-wider px-2.5 pb-1.5 uppercase">
                  {section.title}
                </div>
              ) : (
                idx > 0 && <div className="h-px bg-slate-100 my-1 mx-2" />
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
                    className={`w-full flex items-center rounded-lg border-0 text-[13.5px] cursor-pointer transition-colors relative ${
                      isCollapsed ? 'justify-center py-2.5 px-0' : 'justify-between py-2.5 px-3'
                    } ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                        : 'bg-transparent text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-[18%] bottom-[18%] w-[3.5px] rounded-r bg-indigo-600" />
                    )}

                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={18}
                        className={`shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          item.badgeColor
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* USER PROFILE & LOGOUT FOOTER */}
        <div
          className={`border-t border-slate-100 bg-white flex items-center shrink-0 gap-2.5 ${
            isCollapsed ? 'p-2.5 px-2 justify-center' : 'p-3.5 px-4 justify-between'
          }`}
        >
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1"
            onClick={() => onTabChange && onTabChange('settings')}
            title="View Account Settings"
          >
            <Avatar
              name={user?.name || 'Nikhil Kumar'}
              size="md"
              status={user?.status || 'active'}
              showStatus={true}
            />
            {!isCollapsed && (
              <div className="overflow-hidden text-left leading-tight min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 truncate">
                  {user?.name || 'Nikhil Kumar'}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email || 'nikhilkumars12343@gmail.com'}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onLogoutClick}
              title="Sign Out of BLOGTECH"
              className="w-8 h-8 rounded-md border-0 bg-transparent text-slate-500 cursor-pointer flex items-center justify-center shrink-0 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
