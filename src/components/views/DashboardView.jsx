import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Archive,
  Edit2,
  Eye,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DataTable } from '../ui/DataTable';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../ui/ToastContext';

export const DashboardView = ({
  stats,
  jobs = [],
  blogs = [],
  activityLog = [],
  onNavigate,
  onOpenNewJobModal,
  onOpenNewBlogModal,
  isLoading = false,
}) => {
  const { addToast } = useToast();

  // Metrics computation according to prompt specifications
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const closedJobsCount = jobs.filter((j) => j.status === 'Closed').length;
  const publishedBlogsCount = blogs.filter((b) => b.status === 'Published').length;
  const draftBlogsCount = blogs.filter((b) => b.status === 'Draft').length;

  // Slice recent items for tables
  const recentJobs = jobs.slice(0, 5);
  const recentBlogs = blogs.slice(0, 5);

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
            {row.id} • {row.department}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      key: 'location',
      sortable: true,
      render: (row) => <span style={{ fontSize: '13px', color: '#334155' }}>{row.location}</span>,
    },
    {
      header: 'Experience',
      key: 'experience',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12.5px', color: '#475569' }}>{row.experience}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Updated',
      key: 'publishedAt',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b' }}>{row.publishedAt}</span>,
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (row) => (
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
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={row.coverImage}
            alt={row.title}
            style={{
              width: '40px',
              height: '30px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid #e2e8f0',
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
              Category: {row.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Publication Date',
      key: 'publishedAt',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12.5px', color: '#334155' }}>{row.publishedAt}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Updated',
      key: 'updated',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b' }}>Recently</span>,
    },
    {
      header: 'Action',
      key: 'action',
      align: 'right',
      render: (row) => (
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
      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
          Overview of your website content and activity.
        </p>
      </div>

      {/* TOP STATISTICS (Four Premium Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Active Careers */}
        <div className="card card-padded">
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
                <span>Currently accepting applicants</span>
              </div>
            </>
          )}
        </div>

        {/* Card 2: Closed Careers */}
        <div className="card card-padded">
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

        {/* Card 3: Published Blogs */}
        <div className="card card-padded">
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

        {/* Card 4: Draft Blogs */}
        <div className="card card-padded">
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
      </div>

      {/* TWO COLUMN DASHBOARD LAYOUT */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
          gap: '24px',
        }}
      >
        {/* LEFT / MAIN TABLES AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Section 1: Recent Job Openings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Recent Job Openings
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Latest postings published or modified in Careers
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
              emptyDescription="No job postings created yet. Add your first job opening to start receiving candidates."
              onEmptyAction={onOpenNewJobModal}
              emptyActionLabel="Add Job Opening"
            />
          </div>

          {/* Section 2: Recent Blog Articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Recent Blog Articles
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Latest articles drafted, scheduled, or published on the blog
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
              emptyDescription="No blog posts found. Create your first article to publish on your website."
              onEmptyAction={onOpenNewBlogModal}
              emptyActionLabel="Create Blog Article"
            />
          </div>
        </div>

        {/* RIGHT / SECONDARY AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            </div>
          </div>

          {/* Compact Recent Activity Section */}
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Recent Activity
              </h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>Live Feed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activityLog.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
                  No recent activity recorded.
                </div>
              ) : (
                activityLog.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', fontSize: '12.5px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor:
                          item.action.includes('created')
                            ? '#10b981'
                            : item.action.includes('published')
                            ? '#4f46e5'
                            : item.action.includes('closed')
                            ? '#64748b'
                            : '#f59e0b',
                        marginTop: '5px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                        <strong>{item.user}</strong> {item.action}{' '}
                        <span style={{ color: '#4338ca' }}>"{item.target}"</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
