import React, { useMemo } from 'react';
import {
  Briefcase,
  FileText,
  Plus,
  ArrowUpRight,
  Clock,
  TrendingUp,
  Archive,
  Edit2,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { DataTable } from '../../ui/DataTable';
import { Skeleton } from '../../ui/Skeleton';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { formatImageUrl, handleImageError } from '../../../utils/image.helper';
import { canAccessTab } from '../../../utils/rbac.helper';

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

// Relative time helper
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    if (isNaN(diffMs)) return 'Recently';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

export const DashboardView = ({
  jobs = [],
  blogs = [],
  products = [],
  services = [],
  activityLog = [],
  currentUser = null,
  onNavigate,
  onOpenNewJobModal,
  onOpenNewBlogModal,
  isLoading = false,
  onRefresh,
}) => {
  const canAccessCatalog = canAccessTab(currentUser?.role, 'products');

  // Status Normalizers
  const isItemActive = (status) => {
    const s = String(status || '').toLowerCase();
    return s === 'published' || s === 'active';
  };

  const isItemDraft = (status) => {
    const s = String(status || '').toLowerCase();
    return s === 'draft';
  };

  const isItemClosed = (status) => {
    const s = String(status || '').toLowerCase();
    return s === 'closed' || s === 'withdrawn' || s === 'unpublished';
  };

  // Metrics computation from ACTUAL live collections
  const activeJobsCount = jobs.filter((j) => isItemActive(j.status)).length;
  const closedJobsCount = jobs.filter((j) => isItemClosed(j.status) || isItemDraft(j.status)).length;
  const totalJobsCount = jobs.length;

  const publishedBlogsCount = blogs.filter((b) => isItemActive(b.status)).length;
  const draftBlogsCount = blogs.filter((b) => isItemDraft(b.status)).length;
  const totalBlogsCount = blogs.length;

  const publishedProductsCount = products.filter((p) => isItemActive(p.status)).length;
  const draftProductsCount = products.filter((p) => isItemDraft(p.status)).length;
  const totalProductsCount = products.length;

  const publishedServicesCount = services.filter((s) => isItemActive(s.status)).length;
  const draftServicesCount = services.filter((s) => isItemDraft(s.status)).length;
  const totalServicesCount = services.length;

  // Most recent 5 items for data tables
  const recentJobs = useMemo(() => jobs.slice(0, 5), [jobs]);
  const recentBlogs = useMemo(() => blogs.slice(0, 5), [blogs]);

  // Dynamic live activity log synthesized from recent updates across entities
  const liveActivityFeed = useMemo(() => {
    if (activityLog && activityLog.length > 0) {
      return activityLog;
    }

    const events = [];

    jobs.forEach((j) => {
      events.push({
        id: `career-${j.id}`,
        user: 'Career Admin',
        action: isItemActive(j.status) ? 'published career vacancy' : 'created career vacancy',
        target: j.title || `Job #${j.id}`,
        time: formatTimeAgo(j.updated_at || j.created_at || j.published_at),
        timestamp: new Date(j.updated_at || j.created_at || j.published_at || 0).getTime(),
        status: j.status,
      });
    });

    products.forEach((p) => {
      events.push({
        id: `prod-${p.id}`,
        user: 'Catalog Manager',
        action: isItemActive(p.status) ? 'published product item' : 'drafted product item',
        target: p.name || `Product #${p.id}`,
        time: formatTimeAgo(p.updated_at || p.created_at),
        timestamp: new Date(p.updated_at || p.created_at || 0).getTime(),
        status: p.status,
      });
    });

    services.forEach((s) => {
      events.push({
        id: `serv-${s.id}`,
        user: 'Service Manager',
        action: isItemActive(s.status) ? 'published service listing' : 'drafted service listing',
        target: s.name || `Service #${s.id}`,
        time: formatTimeAgo(s.updated_at || s.created_at),
        timestamp: new Date(s.updated_at || s.created_at || 0).getTime(),
        status: s.status,
      });
    });

    blogs.forEach((b) => {
      events.push({
        id: `blog-${b.id}`,
        user: b.author?.name || 'Content Editor',
        action: isItemActive(b.status) ? 'published blog article' : 'drafted blog article',
        target: b.title || `Article #${b.id}`,
        time: formatTimeAgo(b.updated_at || b.created_at || b.published_at),
        timestamp: new Date(b.updated_at || b.created_at || b.published_at || 0).getTime(),
        status: b.status,
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [jobs, products, services, blogs, activityLog]);

  // Job Table Columns
  const jobColumns = [
    {
      header: 'Position',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            ID #{row.id} • {row.department || 'Technology'}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      key: 'location',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#334155' }}>
          {row.location || 'Remote'}
        </span>
      ),
    },
    {
      header: 'Experience',
      key: 'experience',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: '#475569' }}>
          {row.experience || 'Not specified'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const rawStatus = String(row.status || '').toLowerCase();
        const label = rawStatus === 'published' ? 'Active' : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
        return <Badge status={rawStatus}>{label}</Badge>;
      },
    },
    {
      header: 'Updated',
      key: 'publishedAt',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {formatDate(row.published_at || row.updated_at || row.created_at)}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: () => (
        <Button
          size="sm"
          variant="ghost"
          icon={Edit2}
          onClick={() => onNavigate('careers')}
        >
          Manage
        </Button>
      ),
    },
  ];

  // Blog Table Columns
  const blogColumns = [
    {
      header: 'Article Title',
      key: 'title',
      sortable: true,
      render: (row) => {
        const imgSrc = formatImageUrl(row.featured_image || row.featured_image_url || row.coverImage);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={imgSrc}
              alt={row.title || 'Blog preview'}
              onError={(e) => handleImageError(e, (row.title || 'B').slice(0, 2).toUpperCase())}
              style={{
                width: '42px',
                height: '32px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '280px',
                }}
              >
                {row.title}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                Category: {row.category?.name || row.category || 'General'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Publication Date',
      key: 'publishedAt',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: '#334155' }}>
          {formatDate(row.published_at || row.created_at)}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const rawStatus = String(row.status || '').toLowerCase();
        const label = rawStatus ? rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) : 'Draft';
        return <Badge status={rawStatus}>{label}</Badge>;
      },
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: () => (
        <Button
          size="sm"
          variant="ghost"
          icon={Edit2}
          onClick={() => onNavigate('blogs')}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* HEADER BAR WITH REFRESH TRIGGER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard' }]} />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            Overview of live content, catalog offerings, and platform statistics.
          </p>
        </div>

        {onRefresh && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              iconClassName={isLoading ? 'animate-spin' : ''}
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Syncing...' : 'Refresh Data'}
            </Button>
          </div>
        )}
      </div>

      {/* TOP STATISTICS CARDS (Intelligently Adapted to Active RBAC Role) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Careers */}
        <div
          className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
          onClick={() => onNavigate('careers')}
        >
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Skeleton width="40%" height="14px" />
              <Skeleton width="60%" height="32px" />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Active Careers</span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Briefcase size={18} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                {activeJobsCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '12px', color: '#047857', fontWeight: 500 }}>
                <TrendingUp size={13} />
                <span>{totalJobsCount} total • {closedJobsCount} closed/draft</span>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Catalog Products (if permitted) OR Closed Careers (for Editor) */}
        {canAccessCatalog ? (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('products')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Live Products</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Package size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {publishedProductsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 500, marginTop: '12px' }}>
                  {totalProductsCount} total in catalog ({draftProductsCount} draft)
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('careers')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Closed Careers</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Archive size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {closedJobsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                  Withdrawn or filled positions
                </div>
              </>
            )}
          </div>
        )}

        {/* Card 3: Corporate Services (if permitted) OR Published Blogs (for Editor) */}
        {canAccessCatalog ? (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('services')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Live Services</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f5f3ff',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Layers size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {publishedServicesCount}
                </div>
                <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500, marginTop: '12px' }}>
                  {totalServicesCount} active service offerings
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('blogs')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Published Blogs</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {publishedBlogsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#4338ca', fontWeight: 500, marginTop: '12px' }}>
                  Live on public website
                </div>
              </>
            )}
          </div>
        )}

        {/* Card 4: Published Blogs (for Admins) OR Draft Blogs (for Editor) */}
        {canAccessCatalog ? (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('blogs')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Published Blogs</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {publishedBlogsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#4338ca', fontWeight: 500, marginTop: '12px' }}>
                  {totalBlogsCount} total ({draftBlogsCount} drafts pending)
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="card card-padded cursor-pointer hover:border-slate-300 transition-all"
            onClick={() => onNavigate('blogs')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="60%" height="32px" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Draft Blogs</span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#fffbeb',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {draftBlogsCount}
                </div>
                <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 500, marginTop: '12px' }}>
                  Unpublished draft articles
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TWO COLUMN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN TABLES AREA */}
        <div className="lg:col-span-2 flex flex-col gap-7">
          {/* Section 1: Recent Job Openings */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Recent Job Openings
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Latest postings published or modified in Careers ({totalJobsCount} total)
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                icon={ArrowUpRight}
                iconPosition="right"
                onClick={() => onNavigate('careers')}
              >
                View All Careers
              </Button>
            </div>

            <DataTable
              columns={jobColumns}
              data={recentJobs}
              selectable={false}
              pagination={false}
              isLoading={isLoading}
              emptyTitle="No Job Openings"
              emptyDescription="No vacancies currently created. Add your first job opening to start receiving candidates."
              onEmptyAction={onOpenNewJobModal}
              emptyActionLabel="Add Job Opening"
            />
          </div>

          {/* Section 2: Recent Blog Articles */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Recent Blog Articles
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Latest articles drafted, scheduled, or published on the blog ({totalBlogsCount} total)
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                icon={ArrowUpRight}
                iconPosition="right"
                onClick={() => onNavigate('blogs')}
              >
                View All Blogs
              </Button>
            </div>

            <DataTable
              columns={blogColumns}
              data={recentBlogs}
              selectable={false}
              pagination={false}
              isLoading={isLoading}
              emptyTitle="No Blog Articles"
              emptyDescription="No blog posts found on the server. Create your first article to publish on your website."
              onEmptyAction={onOpenNewBlogModal}
              emptyActionLabel="Create Blog Article"
            />
          </div>
        </div>

        {/* RIGHT / SECONDARY AREA */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="card card-padded">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
              Quick Actions
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Frequently used publishing controls
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button variant="primary" icon={Plus} onClick={onOpenNewJobModal} fullWidth>
                Add Job Opening
              </Button>
              <Button variant="secondary" icon={Plus} onClick={onOpenNewBlogModal} fullWidth>
                Create Blog Article
              </Button>
              {canAccessCatalog && (
                <>
                  <Button variant="secondary" icon={Package} onClick={() => onNavigate('products')} fullWidth>
                    Manage Products
                  </Button>
                  <Button variant="secondary" icon={Layers} onClick={() => onNavigate('services')} fullWidth>
                    Manage Services
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Live Recent Activity Section */}
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Recent Activity
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {liveActivityFeed.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                  No recent activity recorded yet.
                </div>
              ) : (
                liveActivityFeed.map((item) => {
                  const isSuccess = item.action.includes('published') || item.status === 'published';
                  const isWarning = item.action.includes('draft') || item.status === 'draft';
                  const dotColor = isSuccess ? '#10b981' : isWarning ? '#f59e0b' : '#6366f1';

                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '10px', fontSize: '12.5px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: dotColor,
                          marginTop: '5px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                          <strong className="text-slate-800">{item.user}</strong> {item.action}{' '}
                          <span style={{ color: '#4338ca', fontWeight: 600 }}>"{item.target}"</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
