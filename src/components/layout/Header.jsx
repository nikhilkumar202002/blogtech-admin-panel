import React from 'react';
import {
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
  onToggleCollapse,
  onOpenCommandPalette,
  notifications = [],
  onNotificationClick,
  user = null,
  onLogoutClick,
  onTabChange,
  onPublishClick,
  publishingStatus = 'Synced',
  onToggleMobileSidebar,
}) => {
  return (
    <header className="header-responsive h-16 shrink-0 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6">
    
      <div className="flex items-center gap-1.5 sm:gap-2">
       
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="flex md:hidden text-slate-700 cursor-pointer p-2 rounded-lg items-center justify-center hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex text-slate-500 hover:text-slate-800 cursor-pointer p-2 rounded-lg items-center justify-center hover:bg-slate-100 transition-colors"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 sm:px-3 py-1.5 text-[13px] text-slate-500 cursor-pointer h-9 transition-colors"
          title="Search or jump to"
        >
          <Search size={15} className="text-slate-400 shrink-0" />
          <span className="hidden sm:inline-block">Search or jump to...</span>
        </button>


        <div className="w-px h-6 bg-slate-200 mx-0.5 sm:mx-1" />

        <DropdownMenu
          width="268px"
          trigger={
            <div className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Avatar
                name={user?.name || 'Admin'}
                size="md"
                status={user?.status || 'active'}
                showStatus={true}
              />
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[13px] font-semibold text-slate-900 truncate max-w-[120px]">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {formatRole(user?.role)}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </div>
          }
          headerContent={
            <div className="flex gap-3 items-start">
              <Avatar
                name={user?.name || 'Admin'}
                size="lg"
                status={user?.status || 'active'}
                showStatus={true}
              />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[13.5px] font-bold text-slate-900 truncate">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase tracking-wider whitespace-nowrap">
                    {formatRole(user?.role)}
                  </span>
                </div>
                {user?.email && (
                  <div className="text-xs text-slate-500 break-all">
                    {user.email}
                  </div>
                )}
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
