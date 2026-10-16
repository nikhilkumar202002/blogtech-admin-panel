import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Avatar } from '../ui/Avatar';

const formatRole = (role) => {
  if (!role) return 'Super Admin';
  if (role === 'super_admin') return 'Super Admin';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const Header = ({
  activeTab = 'dashboard',
  sidebarCollapsed = false,
  onOpenCommandPalette,
  notifications = [],
  onNotificationClick,
  user = {
    id: 55,
    name: 'Nikhil Kumar',
    role: 'super_admin',
    email: 'nikhilkumars12343@gmail.com',
    status: 'active',
  },
  onLogoutClick,
  onTabChange,
  onPublishClick,
  publishingStatus = 'Synced',
  onToggleMobileSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="header-responsive h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Left: Mobile Hamburger Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="show-on-mobile bg-transparent border-0 text-slate-800 cursor-pointer p-2 rounded-lg flex items-center justify-center min-w-[40px] min-h-[40px] hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right Controls: Quick Search, Site Status, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Command Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 text-[13px] text-slate-500 cursor-pointer h-9 transition-colors"
          title="Search or jump to (Cmd+K)"
        >
          <Search size={15} className="text-slate-400" />
          <span className="hide-on-mobile pr-2">Search or jump to...</span>
          <kbd className="hide-on-mobile text-[11px] font-semibold bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-600 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer flex items-center justify-center relative transition-colors"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-pop-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-[13px] font-semibold text-slate-900">
                  Notifications ({unreadNotifsCount})
                </span>
                <span className="text-[11px] text-indigo-600 cursor-pointer font-medium hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-5 text-center text-slate-400 text-[13px]">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNotificationClick && onNotificationClick(n);
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 px-4 cursor-pointer transition-colors hover:bg-slate-100 ${
                        n.read ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <div className="text-[13px] font-semibold text-slate-900">
                        {n.title}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 leading-snug">
                        {n.message}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {n.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown (Synced with /admin/me & /admin/logout) */}
        <DropdownMenu
          width="268px"
          trigger={
            <div className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Avatar
                name={user?.name || 'Nikhil Kumar'}
                size="md"
                status={user?.status || 'active'}
                showStatus={true}
              />
              <div className="hide-on-mobile text-left leading-tight">
                <div className="text-[13px] font-semibold text-slate-900">
                  {user?.name || 'Nikhil Kumar'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatRole(user?.role)}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 hide-on-mobile" />
            </div>
          }
          headerContent={
            <div className="flex gap-3 items-start">
              <Avatar
                name={user?.name || 'Nikhil Kumar'}
                size="lg"
                status={user?.status || 'active'}
                showStatus={true}
              />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[13.5px] font-bold text-slate-900 truncate">
                    {user?.name || 'Nikhil Kumar'}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-wider whitespace-nowrap">
                    {formatRole(user?.role)}
                  </span>
                </div>
                <div className="text-xs text-slate-500 break-all">
                  {user?.email || 'nikhilkumars12343@gmail.com'}
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-dashed border-slate-100">
                  <div
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      user?.status === 'active' || !user?.status ? 'text-emerald-600' : 'text-slate-500'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>
                      {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                    </span>
                  </div>
                  {user?.id && (
                    <span className="text-[10.5px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      ID #{user.id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          }
          items={[
            {
              label: 'Account & Workspace Settings',
              icon: User,
              onClick: () => onTabChange && onTabChange('settings'),
            },
            {
              label: 'Admin Security Credentials',
              icon: Shield,
              onClick: () => onTabChange && onTabChange('settings'),
            },
            {
              label: 'CMS Help & Documentation',
              icon: HelpCircle,
              onClick: () => {
                alert('BLOGTECH Knowledge Base & API Docs available under Settings > System.');
              },
            },
            { divider: true },
            {
              label: 'Log Out of BLOGTECH',
              icon: LogOut,
              danger: true,
              onClick: onLogoutClick,
            },
          ]}
        />
      </div>
    </header>
  );
};

export default Header;
