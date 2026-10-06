import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
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
  SYSTEM_USERS,
  INITIAL_NOTIFICATIONS,
  ACTIVITY_LOG,
} from './mockData';

const MainApp = () => {
  const { addToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [users, setUsers] = useState(SYSTEM_USERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLog, setActivityLog] = useState(ACTIVITY_LOG);

  // User Profile
  const currentUser = users[0]; // Sarah Jenkins

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

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          addToast({
            title: 'Welcome Back',
            message: 'Signed in as Sarah Jenkins (Super Admin).',
            type: 'success',
          });
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        badgeCounts={badgeCounts}
        user={currentUser}
        onLogoutClick={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Top Header */}
        <Header
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          notifications={notifications}
          onNotificationClick={(notif) => {
            if (notif.type === 'enquiry') setActiveTab('enquiries');
            if (notif.type === 'career') setActiveTab('careers');
            if (notif.type === 'blog') setActiveTab('blogs');
          }}
          user={currentUser}
          onLogoutClick={() => setIsLogoutConfirmOpen(true)}
          onPublishClick={() => setIsPublishModalOpen(true)}
          publishingStatus={stats.publishingStatus}
        />

        {/* View Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: '24px 32px 48px 32px',
            marginLeft: sidebarCollapsed ? '72px' : '240px',
            transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '1600px',
            width: '100%',
            boxSizing: 'border-box',
          }}
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
        </main>
      </div>

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
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          setIsAuthenticated(false);
          addToast({ title: 'Logged Out', message: 'You have been safely signed out.', type: 'info' });
        }}
        title="Sign Out of ApexCMS?"
        message="Are you sure you want to end your active administrative session?"
        confirmLabel="Logout Now"
        type="warning"
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
