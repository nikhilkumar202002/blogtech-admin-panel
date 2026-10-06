import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  Mail,
  Send,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/ToastContext';

export const DashboardView = ({
  stats,
  jobs,
  blogs,
  enquiries,
  publishingLogs,
  activityLog,
  onNavigate,
  onOpenNewJobModal,
  onOpenNewBlogModal,
  onOpenPublishModal,
}) => {
  const { addToast } = useToast();
  const [quickDraftTitle, setQuickDraftTitle] = useState('');
  const [quickDraftContent, setQuickDraftContent] = useState('');

  const handleSaveQuickDraft = (e) => {
    e.preventDefault();
    if (!quickDraftTitle.trim()) return;
    addToast({
      title: 'Draft Saved',
      message: `Blog draft "${quickDraftTitle}" saved successfully.`,
      type: 'success',
    });
    setQuickDraftTitle('');
    setQuickDraftContent('');
  };

  const unreadEnquiriesList = enquiries.filter((e) => e.status === 'Unread').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Quick Actions */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px 0 rgba(16, 24, 40, 0.04)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Welcome back, Sarah
            </h2>
            <Badge status="active">Super Admin</Badge>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
            ApexCorp CMS is fully synchronized. You have <strong>{stats.pendingPublishCount}</strong> changes ready for production deployment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="secondary" icon={Plus} onClick={onOpenNewJobModal}>
            Post Job Opening
          </Button>
          <Button variant="secondary" icon={Plus} onClick={onOpenNewBlogModal}>
            Write Article
          </Button>
          <Button variant="accent" icon={Send} onClick={onOpenPublishModal}>
            Publish Changes
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Careers */}
        <div
          className="card card-padded"
          onClick={() => onNavigate('careers')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Active Job Openings</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {stats.activeJobs}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            <span>{stats.totalJobs} total postings</span>
            <span style={{ color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={13} /> +3 this month
            </span>
          </div>
        </div>

        {/* Metric 2: Blogs */}
        <div
          className="card card-padded"
          onClick={() => onNavigate('blogs')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Published Blog Posts</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {stats.publishedBlogs}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            <span>{stats.draftBlogs} drafts pending</span>
            <span style={{ color: '#4338ca', fontWeight: 600 }}>13.2k readers</span>
          </div>
        </div>

        {/* Metric 3: Enquiries */}
        <div
          className="card card-padded"
          onClick={() => onNavigate('enquiries')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Unread Enquiries</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
            {stats.unreadEnquiries}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            <span>{stats.totalEnquiries} total received</span>
            <span style={{ color: '#b91c1c', fontWeight: 600 }}>Needs attention</span>
          </div>
        </div>

        {/* Metric 4: Website Sync Status */}
        <div className="card card-padded">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Publishing Engine</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
              <Globe size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge status={stats.publishingStatus}>{stats.publishingStatus}</Badge>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '14px', lineHeight: 1.4 }}>
            Last build: <strong>{stats.lastPublishedAt}</strong>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Two Columns) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '24px',
        }}
      >
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent Unread Mail / Enquiries Card */}
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Recent Contact Enquiries
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Unread messages received from official site forms
                </p>
              </div>
              <Button size="sm" variant="ghost" icon={ArrowUpRight} iconPosition="right" onClick={() => onNavigate('enquiries')}>
                View All ({stats.unreadEnquiries})
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unreadEnquiriesList.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => onNavigate('enquiries')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                >
                  <div style={{ minWidth: 0, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        {enq.senderName}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>({enq.company})</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {enq.subject}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <Badge status="unread">{enq.category}</Badge>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{enq.receivedAt.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Draft Blog Widget */}
          <div className="card card-padded">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
              Quick Article Draft
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
              Jot down quick article thoughts to refine and publish later
            </p>
            <form onSubmit={handleSaveQuickDraft} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Article Headline Title..."
                value={quickDraftTitle}
                onChange={(e) => setQuickDraftTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                }}
              />
              <textarea
                placeholder="Key bullet points or summary..."
                value={quickDraftContent}
                onChange={(e) => setQuickDraftContent(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" size="sm" variant="secondary" isDisabled={!quickDraftTitle.trim()}>
                  Save as Draft
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card card-padded">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
              Recent Activity Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activityLog.map((act) => (
                <div key={act.id} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#4f46e5',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>
                      <strong>{act.user}</strong> {act.action}{' '}
                      <span style={{ color: '#4338ca' }}>"{act.target}"</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
