import React, { useState } from 'react';
import {
  Bell,
  Search,
  Send,
  ChevronRight,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { Badge } from '../ui/Badge';

export const Header = ({
  activeTab = 'dashboard',
  sidebarCollapsed = false,
  onOpenCommandPalette,
  notifications = [],
  onNotificationClick,
  user = {
    name: 'Sarah Jenkins',
    role: 'Lead Admin & Editor',
    email: 'sarah.jenkins@apexcorp.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  onLogoutClick,
  onPublishClick,
  publishingStatus = 'Synced',
  onToggleMobileSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard', path: ['BLOGTECH', 'Dashboard'] };
      case 'careers':
        return { title: 'Careers', path: ['BLOGTECH', 'Careers', 'Jobs'] };
      case 'blogs':
        return { title: 'Blogs', path: ['BLOGTECH', 'Content', 'Blogs'] };
      case 'enquiries':
        return { title: 'Enquiries', path: ['BLOGTECH', 'Inbox', 'Enquiries'] };
      case 'settings':
        return { title: 'Settings', path: ['BLOGTECH', 'System', 'Settings'] };
      default:
        return { title: 'Dashboard', path: ['BLOGTECH', 'Dashboard'] };
    }
  };

  const { title, path } = getBreadcrumbs();
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="header-responsive"
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Left: Hamburger (Mobile) + Page Title & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Hamburger Button (Min 44px Touch Target) */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#0f172a',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
          }}
          className="show-on-mobile"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }} className="hide-on-mobile">
            {path.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={12} style={{ color: '#cbd5e1' }} />}
                <span style={{ color: index === path.length - 1 ? '#0f172a' : '#64748b', fontWeight: index === path.length - 1 ? 500 : 400 }}>
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Quick Search, Site Status, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick Command Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '13px',
            color: '#64748b',
            cursor: 'pointer',
            height: '36px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
        >
          <Search size={15} style={{ color: '#94a3b8' }} />
          <span style={{ paddingRight: '8px' }}>Search or jump to...</span>
          <kbd
            style={{
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '1px 5px',
              color: '#475569',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Website Sync Status Button */}
        <Button
          size="sm"
          variant={publishingStatus === 'Changes Pending' ? 'accent' : 'secondary'}
          icon={Send}
          onClick={onPublishClick}
        >
          {publishingStatus === 'Changes Pending' ? 'Publish Site Changes' : 'Site Synced'}
        </Button>

        {/* View Live Site Link */}
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#4f46e5',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2ff')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span>Live Site</span>
          <ExternalLink size={14} />
        </a>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadNotifsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  border: '2px solid #ffffff',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -4px rgba(16, 24, 40, 0.05)',
                zIndex: 100,
                overflow: 'hidden',
              }}
              className="animate-pop-in"
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  Notifications ({unreadNotifsCount})
                </span>
                <span style={{ fontSize: '11px', color: '#4f46e5', cursor: 'pointer', fontWeight: 500 }}>
                  Mark all read
                </span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
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
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: n.read ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f8fafc')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {n.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <DropdownMenu
          trigger={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
          }
          items={[
            { label: user.name, icon: User, onClick: () => {} },
            { label: 'Admin Security', icon: Shield, onClick: () => {} },
            { label: 'CMS Documentation', icon: HelpCircle, onClick: () => {} },
            { divider: true },
            { label: 'Logout', icon: LogOut, danger: true, onClick: onLogoutClick },
          ]}
        />
      </div>
    </header>
  );
};
