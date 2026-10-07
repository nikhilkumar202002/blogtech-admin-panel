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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
        className={`layout-main-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
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
          onPublishClick={onPublishClick}
          publishingStatus={publishingStatus}
          onToggleMobileSidebar={onToggleMobileSidebar}
        />

        {/* Dynamic Page Area */}
        <main
          className="main-content-area"
          style={{
            flex: 1,
            padding: '24px 32px 48px 32px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;