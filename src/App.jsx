import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { ToastProvider, useToast } from './components/ui/ToastContext';
import { CommandPalette } from './components/ui/CommandPalette';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Badge } from './components/ui/Badge';
import { canAccessTab, formatRoleLabel, isEditor } from './utils/rbac.helper';

import {
  DashboardView,
  CareersView,
  BlogsView,
  EnquiriesView,
  ProductsView,
  ServicesView,
  SettingsView,
  LoginView,
} from './components/views';

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
import { getCareers } from './utils/career.service';
import { getBlogs, createBlog, updateBlog, deleteBlog } from './utils/blog.service';
import { getProducts } from './utils/product.service';
import { getServices } from './utils/ourservice.service';

const VALID_TABS = ['dashboard', 'products', 'services', 'careers', 'blogs', 'enquiries', 'settings'];

const getInitialTab = () => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (VALID_TABS.includes(path)) return path;
  if (path === 'service') return 'services';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (VALID_TABS.includes(hash)) return hash;
  if (hash === 'service') return 'services';
  const stored = localStorage.getItem('blogtech_active_tab');
  if (stored && VALID_TABS.includes(stored)) return stored;
  return 'dashboard';
};

const AccessDeniedNotice = ({ role, moduleName = 'this catalog section', onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[460px] p-6 text-center animate-fade-in bg-white border border-slate-200 rounded-2xl shadow-xs my-6">
    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
      <ShieldAlert size={32} />
    </div>
    <h2 className="text-xl font-bold text-slate-900 mb-1.5">Access Restricted</h2>
    <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
      Your account role (<strong className="text-slate-800">{formatRoleLabel(role)}</strong>) does not have permission to view or manage {moduleName}.
    </p>
    <Button variant="primary" icon={ArrowLeft} onClick={onBack}>
      Return to Dashboard
    </Button>
  </div>
);

const MainApp = () => {
  const { addToast } = useToast();

  // Authentication State (Requires valid token; redirect to login if unauthenticated)
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkIsAuthenticated());

  // Authenticated User Profile (Fetched directly from API, no hardcoded dummy variables)
  const [currentUser, setCurrentUser] = useState(() => {
    return getStoredUser() || null;
  });

  // Listen for global authentication & API security events
  useEffect(() => {
    const handleUnauthorized = (e) => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      addToast({
        title: 'Session Expired',
        message: e?.detail?.message || 'Your session has expired. Please sign in again.',
        type: 'warning',
      });
    };

    const handleForbidden = (e) => {
      addToast({
        title: 'Access Denied',
        message: e?.detail?.message || 'You do not have permission to perform this action.',
        type: 'warning',
      });
    };

    const handleRateLimited = (e) => {
      addToast({
        title: 'Rate Limit Exceeded',
        message: e?.detail?.message || 'Too many requests. Please wait a moment before trying again.',
        type: 'error',
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:forbidden', handleForbidden);
    window.addEventListener('api:ratelimited', handleRateLimited);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:forbidden', handleForbidden);
      window.removeEventListener('api:ratelimited', handleRateLimited);
    };
  }, [addToast]);

  // Navigation & Layout State (Synced with clean URL pathnames and localStorage)
  const [activeTab, setActiveTabState] = useState(getInitialTab);

  const setActiveTab = (tab) => {
    // RBAC: Check role permission before navigating
    if (currentUser?.role && !canAccessTab(currentUser.role, tab)) {
      addToast({
        title: 'Access Restricted',
        message: `The ${formatRoleLabel(currentUser.role)} role does not have permission to access this module.`,
        type: 'warning',
      });
      return;
    }

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
      if (currentUser?.role && !canAccessTab(currentUser.role, active)) {
        setActiveTabState('dashboard');
        localStorage.setItem('blogtech_active_tab', 'dashboard');
        return;
      }
      setActiveTabState(active);
      localStorage.setItem('blogtech_active_tab', active);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser?.role]);

  // If user role is loaded and currently on an unauthorized tab (e.g. Editor directly visiting /products), bounce to dashboard
  useEffect(() => {
    if (currentUser?.role && !canAccessTab(currentUser.role, activeTab)) {
      setActiveTabState('dashboard');
      localStorage.setItem('blogtech_active_tab', 'dashboard');
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [currentUser?.role, activeTab]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Quick Open Modal Overrides
  const [quickCreateJob, setQuickCreateJob] = useState(false);
  const [quickCreateBlog, setQuickCreateBlog] = useState(false);

  // Core Live Data State
  const [stats, setStats] = useState(INITIAL_STATS);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [blogs, setBlogs] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [publishingLogs, setPublishingLogs] = useState(INITIAL_PUBLISHING_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activityLog, setActivityLog] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Synchronize actual live platform collections across all modules
  const refreshAllData = async () => {
    if (!checkIsAuthenticated()) return;
    setIsDataLoading(true);
    try {
      const results = await Promise.allSettled([
        getCareers(),
        getBlogs(),
        canAccessTab(currentUser?.role, 'products') ? getProducts() : Promise.resolve([]),
        canAccessTab(currentUser?.role, 'services') ? getServices() : Promise.resolve([]),
      ]);

      // 1. Careers (GET /admin/careers)
      if (results[0].status === 'fulfilled') {
        const res = results[0].value;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setJobs(list);
      }

      // 2. Blogs (GET /admin/blogs)
      if (results[1].status === 'fulfilled') {
        const res = results[1].value;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setBlogs(list);
      }

      // 3. Products (GET /admin/products)
      if (results[2].status === 'fulfilled') {
        const res = results[2].value;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setProductsList(list);
      }

      // 4. Services (GET /admin/services)
      if (results[3].status === 'fulfilled') {
        const res = results[3].value;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setServicesList(list);
      }
    } catch (err) {
      console.warn('Could not sync live platform collections:', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  // Fetch authoritative user profile from /admin/me API on load
  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser()
        .then((response) => {
          const userData = response?.data || response?.user || (response?.id ? response : null) || response;
          if (userData && (userData.name || userData.email || userData.id)) {
            // Security Check: If administrator account has been deactivated/suspended on backend
            if (userData.status === 'inactive') {
              authLogout();
              setIsAuthenticated(false);
              setCurrentUser(null);
              addToast({
                title: 'Account Deactivated',
                message: 'Your administrator account has been deactivated. Please contact the super administrator.',
                type: 'error',
              });
              return;
            }
            setCurrentUser(userData);
          }
        })
        .catch((err) => {
          console.warn('Could not sync admin profile from /admin/me:', err?.message || err);
          // Only clear session on 401 Unauthorized (session dead), never on 403 Forbidden
          if (err.response?.status === 401) {
            authLogout();
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        });

      // Fetch live actual collections
      refreshAllData();
    }
  }, [isAuthenticated, addToast]);

  // Re-sync catalog when role changes
  useEffect(() => {
    if (isAuthenticated && currentUser?.role) {
      refreshAllData();
    }
  }, [currentUser?.role]);

  // Helper Badge Counts for Sidebar from actual counts
  const badgeCounts = {
    enquiries: 0,
    jobs: jobs.filter((j) => (j.status || '').toLowerCase() === 'published' || (j.status || '').toLowerCase() === 'active').length,
    blogs: blogs.filter((b) => (b.status || '').toLowerCase() === 'published').length,
    products: productsList.length,
    services: servicesList.length,
  };

  // Job CRUD Handlers
  const handleAddJob = (newJob) => {
    setJobs([newJob, ...jobs]);
    refreshAllData();
  };

  const handleUpdateJob = (updatedJob) => {
    setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    refreshAllData();
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
    refreshAllData();
  };

  // Blog CRUD Handlers
  const handleAddBlog = async (newBlog) => {
    try {
      const response = await createBlog(newBlog);
      const created = response?.data || response;
      setBlogs((prev) => [created, ...prev]);
      addToast({
        title: 'Blog Article Saved',
        message: `Article "${newBlog.title || ''}" was saved to server successfully.`,
        type: 'success',
      });
      refreshAllData();
    } catch (err) {
      console.warn('Could not save blog to API, keeping local copy:', err?.message || err);
      const authorName = currentUser?.name || getStoredUser()?.name || 'Administrator';
      const blogWithAuthor = { ...newBlog, author: authorName };
      setBlogs((prev) => [blogWithAuthor, ...prev]);
    }
  };

  const handleUpdateBlog = async (updatedBlog) => {
    try {
      if (updatedBlog?.id && !String(updatedBlog.id).startsWith('BLOG-')) {
        const response = await updateBlog(updatedBlog.id, updatedBlog);
        const updated = response?.data || updatedBlog;
        setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        setBlogs((prev) => prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)));
      }
      refreshAllData();
    } catch (err) {
      console.warn('Could not update blog on API, updating local copy:', err?.message || err);
      setBlogs((prev) => prev.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)));
    }
  };

  const handleDeleteBlog = async (id) => {
    try {
      if (id && !String(id).startsWith('BLOG-')) {
        await deleteBlog(id);
      }
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      refreshAllData();
    } catch (err) {
      console.warn('Could not delete blog on API, removing local copy:', err?.message || err);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    }
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
            .catch(() => { });

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
            jobs={jobs}
            blogs={blogs}
            products={productsList}
            services={servicesList}
            activityLog={activityLog}
            currentUser={currentUser}
            isLoading={isDataLoading}
            onRefresh={refreshAllData}
            onNavigate={setActiveTab}
            onOpenNewJobModal={() => {
              setActiveTab('careers');
              setQuickCreateJob(true);
            }}
            onOpenNewBlogModal={() => {
              setActiveTab('blogs');
              setQuickCreateBlog(true);
            }}
          />
        )}

        {activeTab === 'products' && (
          canAccessTab(currentUser?.role, 'products') ? (
            <ProductsView onNavigate={setActiveTab} />
          ) : (
            <AccessDeniedNotice
              role={currentUser?.role}
              moduleName="Products catalog"
              onBack={() => setActiveTab('dashboard')}
            />
          )
        )}

        {activeTab === 'services' && (
          canAccessTab(currentUser?.role, 'services') ? (
            <ServicesView onNavigate={setActiveTab} />
          ) : (
            <AccessDeniedNotice
              role={currentUser?.role}
              moduleName="Services catalog"
              onBack={() => setActiveTab('dashboard')}
            />
          )
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
            currentUser={currentUser}
            onAddBlog={handleAddBlog}
            onUpdateBlog={handleUpdateBlog}
            onDeleteBlog={handleDeleteBlog}
            isCreateOpen={quickCreateBlog}
            onCloseCreateOpen={() => setQuickCreateBlog(false)}
          />
        )}

        {activeTab === 'enquiries' && (
          canAccessTab(currentUser?.role, 'enquiries') ? (
            <EnquiriesView
              enquiries={enquiries}
              onUpdateEnquiry={handleUpdateEnquiry}
              onDeleteEnquiry={handleDeleteEnquiry}
            />
          ) : (
            <AccessDeniedNotice
              role={currentUser?.role}
              moduleName="Customer enquiries"
              onBack={() => setActiveTab('dashboard')}
            />
          )
        )}

        {activeTab === 'settings' && (
          <SettingsView
            user={currentUser}
            onUserUpdated={(updated) => setCurrentUser(updated)}
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
        userRole={currentUser?.role}
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
            setCurrentUser(null);
            setActiveTabState('dashboard');
            localStorage.setItem('blogtech_active_tab', 'dashboard');
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
