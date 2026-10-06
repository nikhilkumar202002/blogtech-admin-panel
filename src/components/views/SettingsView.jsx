import React, { useState } from 'react';
import {
  Globe,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  UserPlus,
  RefreshCw,
  Sliders,
  Code,
  FileSpreadsheet,
  Key,
  Database,
  Search,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FormField } from '../ui/FormField';
import { DataTable } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/ToastContext';

export const SettingsView = ({
  publishingLogs = [],
  users = [],
  onPublishTrigger,
  onAddUser,
}) => {
  const { addToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('publishing'); // 'publishing' | 'general' | 'seo' | 'users' | 'security'

  // Publishing Trigger demo
  const [isDeploying, setIsDeploying] = useState(false);

  // Invite User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Content Editor' });

  // Settings form states
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'ApexCorp Software Solutions Inc.',
    contactEmail: 'contact@apexcorp.com',
    supportPhone: '+1 (800) 555-0199',
    copyrightText: '© 2026 ApexCorp Inc. All rights reserved.',
  });

  const [seoSettings, setSeoSettings] = useState({
    globalTitle: 'ApexCorp — Enterprise B2B SaaS Platform',
    globalDescription: 'Empowering digital transformations through scalable cloud infrastructure.',
    analyticsId: 'G-7X9102831',
    sitemapAuto: true,
  });

  const handleTriggerDeploy = () => {
    setIsDeploying(true);
    addToast({ title: 'Build Queued', message: 'Production deployment build #8f2a10 initiated.', type: 'info' });
    setTimeout(() => {
      setIsDeploying(false);
      onPublishTrigger();
      addToast({ title: 'Deploy Successful', message: 'Website changes live on global edge CDN.', type: 'success' });
    }, 2000);
  };

  const handleInviteUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    onAddUser({
      id: `USR-${Math.floor(10 + Math.random() * 90)}`,
      ...newUser,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      status: 'Active',
      lastActive: 'Just invited',
    });

    setIsUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Content Editor' });
    addToast({ title: 'Invitation Sent', message: `Admin invite sent to ${newUser.email}.`, type: 'success' });
  };

  // User table columns
  const userColumns = [
    {
      header: 'Admin User',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={row.avatar} alt={row.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{row.name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role Permission',
      key: 'role',
      render: (row) => <Badge status="accent">{row.role}</Badge>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Last Active',
      key: 'lastActive',
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b' }}>{row.lastActive}</span>,
    },
  ];

  // Publishing history columns
  const pubColumns = [
    {
      header: 'Event / Release Target',
      key: 'event',
      render: (row) => (
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{row.event}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Commit #{row.commitHash}</div>
        </div>
      ),
    },
    {
      header: 'Changes Summary',
      key: 'changes',
      render: (row) => <span style={{ fontSize: '13px', color: '#334155' }}>{row.changes}</span>,
    },
    {
      header: 'Triggered By',
      key: 'author',
      render: (row) => <span style={{ fontSize: '12.5px', color: '#475569' }}>{row.author}</span>,
    },
    {
      header: 'Timestamp',
      key: 'timestamp',
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b' }}>{row.timestamp}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status="active">{row.status}</Badge>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Nav Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          backgroundColor: '#ffffff',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          width: 'fit-content',
        }}
      >
        {[
          { id: 'publishing', label: 'Website Publishing', icon: Globe },
          { id: 'general', label: 'General Info', icon: Sliders },
          { id: 'seo', label: 'SEO & Analytics', icon: Search },
          { id: 'users', label: 'Admin Team & Roles', icon: UserPlus },
          { id: 'security', label: 'Security & Audit', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#eef2ff' : 'transparent',
                color: isActive ? '#4f46e5' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Website Publishing & Deploy */}
      {activeSubTab === 'publishing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card card-padded" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Production Deployment Engine
                </h3>
                <Badge status="active">Vercel Edge Live</Badge>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                Trigger instant static site generator rebuilds for new Job Openings & Blog articles.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              icon={isDeploying ? RefreshCw : Send}
              isLoading={isDeploying}
              onClick={handleTriggerDeploy}
            >
              {isDeploying ? 'Building Production Bundle...' : 'Trigger Production Deploy'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Recent Deployment History
            </h4>
            <DataTable columns={pubColumns} data={publishingLogs} selectable={false} pagination={false} />
          </div>
        </div>
      )}

      {/* Sub-Tab 2: General Website Content */}
      {activeSubTab === 'general' && (
        <div className="card card-padded" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            General Corporate Website Information
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToast({ title: 'Settings Saved', message: 'General settings updated.', type: 'success' });
            }}
          >
            <FormField label="Official Company Legal Name">
              <input
                type="text"
                value={generalSettings.companyName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Primary Contact Email (Forms destination)">
              <input
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Footer Copyright Text">
              <input
                type="text"
                value={generalSettings.copyrightText}
                onChange={(e) => setGeneralSettings({ ...generalSettings, copyrightText: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <Button type="submit" variant="primary">Save General Settings</Button>
          </form>
        </div>
      )}

      {/* Sub-Tab 3: SEO & Analytics */}
      {activeSubTab === 'seo' && (
        <div className="card card-padded" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            Global SEO & Analytics Tag Config
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToast({ title: 'SEO Saved', message: 'Global SEO metadata updated.', type: 'success' });
            }}
          >
            <FormField label="Global Title Tag Pattern">
              <input
                type="text"
                value={seoSettings.globalTitle}
                onChange={(e) => setSeoSettings({ ...seoSettings, globalTitle: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Global Meta Description">
              <textarea
                value={seoSettings.globalDescription}
                onChange={(e) => setSeoSettings({ ...seoSettings, globalDescription: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Inter, sans-serif' }}
              />
            </FormField>

            <FormField label="Google Analytics Measurement ID">
              <input
                type="text"
                value={seoSettings.analyticsId}
                onChange={(e) => setSeoSettings({ ...seoSettings, analyticsId: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <Button type="submit" variant="primary">Save SEO Configurations</Button>
          </form>
        </div>
      )}

      {/* Sub-Tab 4: Admin Team & Roles */}
      {activeSubTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                Admin Users & Access Control
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Manage team members who can create job postings, write blog posts, and handle mail.
              </p>
            </div>
            <Button variant="primary" icon={UserPlus} onClick={() => setIsUserModalOpen(true)}>
              Invite Team Member
            </Button>
          </div>

          <DataTable columns={userColumns} data={users} selectable={false} pagination={false} />
        </div>
      )}

      {/* Sub-Tab 5: Security & Audit */}
      {activeSubTab === 'security' && (
        <div className="card card-padded" style={{ maxWidth: '640px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            Security Controls & 2FA Enforcement
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Require TOTP authenticator for all admin sign-ins</div>
              </div>
              <Badge status="active">Enforced</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Admin Session Inactivity Timeout</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Auto logout after 30 mins of idle time</div>
              </div>
              <Badge status="active">30 Minutes</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Invite New Admin Team Member"
        subtitle="Send an invitation link with assigned permission roles"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleInviteUserSubmit}>Send Invite</Button>
          </>
        }
      >
        <form onSubmit={handleInviteUserSubmit}>
          <FormField label="Full Name" required>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. David Kim"
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </FormField>

          <FormField label="Work Email Address" required>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="david.kim@apexcorp.com"
              style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </FormField>

          <FormField label="Permission Role" required>
            <Select
              fullWidth
              value={newUser.role}
              onChange={(val) => setNewUser({ ...newUser, role: val })}
              options={['Super Admin / Lead Editor', 'Content Editor', 'Careers Manager', 'Viewer']}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
