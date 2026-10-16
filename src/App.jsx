import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { ToastProvider, useToast } from './components/ui/ToastContext';
import { CommandPalette } from './components/ui/CommandPalette';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Badge } from './components/ui/Badge';

import { DashboardView } from './components/views/DashboardView';
import { CareersView } from './components/views/CareersView';
import { BlogsView } from './components/views/BlogsView';
import { EnquiriesView } from './components/views/EnquiriesView';
import { SettingsView } from './components/views/SettingsView';
import { LoginView } from './components/views/LoginView';

import {
  INITIAL_STATS,
  INITIAL_JOBS,
  INITIAL_APPLICANTS,
  INITIAL_BLOGS,
  INITIAL_ENQUIRIES,
  INITIAL_PUBLISHING_LOGS,
  INITIAL_NOTIFICATIONS,
  ACTIVITY_LOG,
} from './mockData';
import {
  getCurrentUser,
  logout as authLogout,
  getStoredUser,
  isAuthenticated as checkIsAuthenticated,
} from './utils/auth.service';

const VALID_TABS = ['dashboard', 'careers', 'blogs', 'enquiries', 'settings'];

const getInitialTab = () => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (VALID_TABS.includes(path)) return path;
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (VALID_TABS.includes(hash)) return hash;
  const stored = localStorage.getItem('blogtech_active_tab');
  if (stored && VALID_TABS.includes(stored)) return stored;
  return 'dashboard';
};

const MainApp = () => {
  const { addToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Navigation & Layout State (Synced with clean URL pathnames and localStorage)
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    if (VALID_TABS.includes(tab)) {
      setActiveTabState(tab);
      const targetPath = tab === 'dashboard' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      localStorage.setItem('blogtech_active_tab', tab);
    }
  };

  useEffect(() => {
    // Sync initial pathname on load if root or hashed
    const initial = getInitialTab();
    const targetPath = initial === 'dashboard' ? '/' : `/${initial}`;
    if (window.location.hash) {
      window.history.replaceState({}, '', targetPath);
    }

    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() || 'dashboard';
      const active = VALID_TABS.includes(path) ? path : 'dashboard';
      setActiveTabState(active);
      localStorage.setItem('blogtech_active_tab', active);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Quick Open Modal Overrides
  const [quickCreateJob, setQuickCreateJob] = useState(false);
  const [quickCreateBlog, setQuickCreateBlog] = useState(false);

  // Core Data State
  const [stats, setStats] = useState(INITIAL_STATS);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [publishingLogs, setPublishingLogs] = useState(INITIAL_PUBLISHING_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLog, setActivityLog] = useState(ACTIVITY_LOG);

  // Authenticated User Profile (Fetched directly from API, no hardcoded dummy variables)
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredUser() || null;
  });

  // Fetch logged in user profile from /admin/me API on load
  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser()
        .then((response) => {
          const userData = response?.data || response?.user || (response?.id ? response : null) || response;
          if (userData && (userData.name || userData.email || userData.id)) {
            setCurrentUser(userData);
          }
        })
        .catch((err) => {
          console.warn('Could not sync admin profile from /admin/me:', err?.message || err);
          if (err.response?.status === 401) {
            authLogout();
            setIsAuthenticated(false);
          }
        });
    }
  }, [isAuthenticated]);

  // Helper Badge Counts for Sidebar
  const badgeCounts = {
    enquiries: enquiries.filter((e) => e.status === 'Unread').length,
    jobs: jobs.filter((j) => j.status === 'Active').length,
    blogs: blogs.filter((b) => b.status === 'Published').length,
  };

  // Job CRUD Handlers
  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
    setStats((prev) => ({
      ...prev,
      activeJobs: newJob.status === 'Active' ? prev.activeJobs + 1 : prev.activeJobs,
      totalJobs: prev.totalJobs + 1,
      publishingStatus: 'Changes Pending',
      pendingPublishCount: prev.pendingPublishCount + 1,
    }));
  };

  const handleUpdateJob = (updatedJob) => {
    setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    setStats((prev) => ({
      ...prev,
      activeJobs: jobs.filter((j) => (j.id === updatedJob.id ? updatedJob : j).status === 'Active').length,
      publishingStatus: 'Changes Pending',
    }));
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
    setStats((prev) => ({
      ...prev,
      totalJobs: Math.max(0, prev.totalJobs - 1),
      publishingStatus: 'Changes Pending',
    }));
  };

  // Blog CRUD Handlers
  const handleAddBlog = (newBlog) => {
    setBlogs([newBlog, ...blogs]);
    setStats((prev) => ({
      ...prev,
      publishedBlogs: newBlog.status === 'Published' ? prev.publishedBlogs + 1 : prev.publishedBlogs,
      draftBlogs: newBlog.status === 'Draft' ? prev.draftBlogs + 1 : prev.draftBlogs,
      publishingStatus: 'Changes Pending',
      pendingPublishCount: prev.pendingPublishCount + 1,
    }));
  };

  const handleUpdateBlog = (updatedBlog) => {
    setBlogs(blogs.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)));
    setStats((prev) => ({
      ...prev,
      publishingStatus: 'Changes Pending',
    }));
  };

  const handleDeleteBlog = (id) => {
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  // Enquiry Handlers
  const handleUpdateEnquiry = (updatedEnq) => {
    setEnquiries(enquiries.map((e) => (e.id === updatedEnq.id ? updatedEnq : e)));
  };

  const handleDeleteEnquiry = (id) => {
    setEnquiries(enquiries.filter((e) => e.id !== id));
  };

  // User Handler
  const handleAddUser = (newUser) => {
    setUsers([...users, newUser]);
  };

  // Publish Website Trigger Handler
  const handlePublishAll = () => {
    const newLog = {
      id: `PUB-${Math.floor(900 + Math.random() * 99)}`,
      event: 'Published Website Sync (Production)',
      author: currentUser.name,
      changes: 'Published pending careers & blog updates',
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Success',
      commitHash: Math.random().toString(36).substring(2, 9),
    };

    setPublishingLogs([newLog, ...publishingLogs]);
    setStats((prev) => ({
      ...prev,
      publishingStatus: 'Synced',
      lastPublishedAt: newLog.timestamp,
      lastPublishedBy: currentUser.name,
      pendingPublishCount: 0,
    }));

    setIsPublishModalOpen(false);
  };

  // Command Palette Handler
  const handleCommandAction = (actionId) => {
    if (actionId === 'new-blog') {
      setActiveTab('blogs');
      setQuickCreateBlog(true);
    } else if (actionId === 'new-job') {
      setActiveTab('careers');
      setQuickCreateJob(true);
    } else if (actionId === 'publish-site') {
      setIsPublishModalOpen(true);
    }
  };

  if (!isAuthenticated || window.location.pathname === '/login') {
    return (
      <LoginView
        onLoginSuccess={(userData) => {
          setIsAuthenticated(true);
          if (window.location.pathname === '/login') {
            window.history.pushState({}, '', '/');
          }
          const userObj = userData?.user || userData?.data?.user || (userData?.data && !userData?.data?.token ? userData.data : null);
          if (userObj) {
            setCurrentUser(userObj);
          }
          // Fetch complete profile from /admin/me
          getCurrentUser()
            .then((res) => {
              const fresh = res?.data || res?.user || (res?.id ? res : null) || res;
              if (fresh && (fresh.name || fresh.email || fresh.id)) {
                setCurrentUser(fresh);
              }
            })
            .catch(() => {});

          const adminName = userObj?.name || 'Admin';
          const rawRole = userObj?.role || 'super_admin';
          const adminRole = rawRole === 'super_admin' ? 'Super Admin' : rawRole.replace(/_/g, ' ');
          addToast({
            title: 'Welcome Back',
            message: `Signed in as ${adminName} (${adminRole}).`,
            type: 'success',
          });
        }}
      />
    );
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false);
        }}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        badgeCounts={badgeCounts}
        user={currentUser}
        onLogoutClick={() => setIsLogoutConfirmOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        notifications={notifications}
        onNotificationClick={(notif) => {
          if (notif.type === 'enquiry') setActiveTab('enquiries');
          if (notif.type === 'career') setActiveTab('careers');
          if (notif.type === 'blog') setActiveTab('blogs');
          setIsMobileOpen(false);
        }}
        onPublishClick={() => setIsPublishModalOpen(true)}
        publishingStatus={stats.publishingStatus}
        onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            jobs={jobs}
            blogs={blogs}
            enquiries={enquiries}
            publishingLogs={publishingLogs}
            activityLog={activityLog}
            onNavigate={setActiveTab}
            onOpenNewJobModal={() => {
              setActiveTab('careers');
              setQuickCreateJob(true);
            }}
            onOpenNewBlogModal={() => {
              setActiveTab('blogs');
              setQuickCreateBlog(true);
            }}
            onOpenPublishModal={() => setIsPublishModalOpen(true)}
          />
        )}

        {activeTab === 'careers' && (
          <CareersView
            jobs={jobs}
            applicants={applicants}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
            isCreateOpen={quickCreateJob}
            onCloseCreateOpen={() => setQuickCreateJob(false)}
          />
        )}

        {activeTab === 'blogs' && (
          <BlogsView
            blogs={blogs}
            onAddBlog={handleAddBlog}
            onUpdateBlog={handleUpdateBlog}
            onDeleteBlog={handleDeleteBlog}
            isCreateOpen={quickCreateBlog}
            onCloseCreateOpen={() => setQuickCreateBlog(false)}
          />
        )}

        {activeTab === 'enquiries' && (
          <EnquiriesView
            enquiries={enquiries}
            onUpdateEnquiry={handleUpdateEnquiry}
            onDeleteEnquiry={handleDeleteEnquiry}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={currentUser}
            onLogoutAll={() => setIsLogoutConfirmOpen(true)}
          />
        )}
      </Layout>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onAction={handleCommandAction}
      />

      {/* Publish Website Changes Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Website Changes to Production?"
        subtitle="Deploys static site assets and syncs latest careers & blog content to live server"
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPublishModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handlePublishAll}>
              Confirm Production Deploy
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', fontSize: '13px', color: '#3730a3' }}>
            <strong>Pending Changes Ready:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>{jobs.filter((j) => j.status === 'Active').length} Active Job Openings</li>
              <li>{blogs.filter((b) => b.status === 'Published').length} Published Blog Posts</li>
              <li>Global SEO & Header settings</li>
            </ul>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Target host: <code>https://apexcorp.com</code> (Vercel Production Region us-east1)
          </p>
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setIsLogoutConfirmOpen(false);
          try {
            await authLogout();
          } catch (err) {
            console.warn('Logout API error:', err);
          } finally {
            setIsAuthenticated(false);
            window.history.pushState({}, '', '/login');
            addToast({
              title: 'Logged Out',
              message: 'You have been safely signed out.',
              type: 'info',
            });
          }
        }}
        title="Sign Out of BLOGTECH?"
        message="Are you sure you want to end your active administrative session?"
        confirmLabel="Logout Now"
        type="warning"
      />
    </>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
