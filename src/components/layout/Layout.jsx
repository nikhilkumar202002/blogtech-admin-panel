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
    <div className="flex min-h-screen bg-slate-50">
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

      {/* Main Wrapper for Header and Dynamic Page Content */}
      <div
        className={`layout-main-container flex-1 flex flex-col min-w-0 ${
          sidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        {/* Common Sticky Header */}
        <Header
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
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

        {/* Dynamic Page Area */}
        <main className="main-content-area flex-1 p-6 md:p-8 lg:p-10 w-full box-border">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;