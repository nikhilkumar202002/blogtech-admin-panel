import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({
  activeTab = 'dashboard',
  onTabChange,
  sidebarCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  badgeCounts,
  user,
  onLogoutClick,
  onOpenCommandPalette,
  notifications,
  onNotificationClick,
  onPublishClick,
  publishingStatus,
  onToggleMobileSidebar,
  children,
}) => {
  return (
    <div className="h-screen w-full flex bg-slate-50 relative overflow-hidden">
      {/* Common Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={onCloseMobile}
        badgeCounts={badgeCounts}
        user={user}
        onLogoutClick={onLogoutClick}
      />

      {/* Main Responsive Container */}
      <div
        className={`h-screen flex-1 flex flex-col min-w-0 max-w-full transition-[margin] duration-200 ease-in-out ml-0 ${
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
        }`}
      >
        {/* Common Sticky Header */}
        <Header
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={onToggleCollapse}
          onOpenCommandPalette={onOpenCommandPalette}
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          user={user}
          onLogoutClick={onLogoutClick}
          onTabChange={onTabChange}
          onPublishClick={onPublishClick}
          publishingStatus={publishingStatus}
          onToggleMobileSidebar={onToggleMobileSidebar}
        />

        {/* Dynamic Page Area (Content Area Only Scrollable) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-y-auto overflow-x-hidden box-border">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;