import React, { useState } from 'react';
import {
  Mail,
  Search,
  Archive,
  CheckCircle2,
  Send,
  User,
  Phone,
  Clock,
  Trash2,
  X,
  Eye,
  MoreVertical,
  BookOpen,
  Info,
  Building,
  CornerUpLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { DataTable } from '../ui/DataTable';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useToast } from '../ui/ToastContext';

export const EnquiriesView = ({
  enquiries = [],
  onUpdateEnquiry,
  onDeleteEnquiry,
}) => {
  const { addToast } = useToast();

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Unread' | 'Read' | 'Archived'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);

  // Detail Drawer State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Reply Composer inside Drawer
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Confirm Delete Dialog
  const [deleteEnquiryId, setDeleteEnquiryId] = useState(null);

  // Handlers for Drawer & Actions
  const handleOpenDrawer = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDrawerOpen(true);

    // Auto mark as Read when opened if Unread
    if (enquiry.status === 'Unread') {
      onUpdateEnquiry({ ...enquiry, status: 'Read' });
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEnquiry(null);
    setReplyText('');
  };

  const handleMarkAsRead = (enquiry) => {
    const nextStatus = enquiry.status === 'Unread' ? 'Read' : 'Unread';
    const updated = { ...enquiry, status: nextStatus };
    onUpdateEnquiry(updated);
    if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
      setSelectedEnquiry(updated);
    }
    addToast({
      title: nextStatus === 'Read' ? 'Marked as Read' : 'Marked as Unread',
      message: `Enquiry from ${enquiry.senderName} marked as ${nextStatus.toLowerCase()}.`,
      type: 'info',
    });
  };

  const handleArchive = (enquiry) => {
    const nextStatus = enquiry.status === 'Archived' ? 'Read' : 'Archived';
    const updated = { ...enquiry, status: nextStatus };
    onUpdateEnquiry(updated);
    if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
      setSelectedEnquiry(updated);
    }
    addToast({
      title: nextStatus === 'Archived' ? 'Enquiry Archived' : 'Enquiry Restored',
      message: `Enquiry from ${enquiry.senderName} ${nextStatus === 'Archived' ? 'archived' : 'restored to inbox'}.`,
      type: 'info',
    });
  };

  const handleConfirmDelete = () => {
    if (deleteEnquiryId) {
      const enqToDelete = enquiries.find((e) => e.id === deleteEnquiryId);
      onDeleteEnquiry(deleteEnquiryId);
      setDeleteEnquiryId(null);
      if (selectedEnquiry && selectedEnquiry.id === deleteEnquiryId) {
        handleCloseDrawer();
      }
      addToast({
        title: 'Enquiry Deleted',
        message: `Enquiry from ${enqToDelete?.senderName || 'contact'} was deleted permanently.`,
        type: 'info',
      });
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEnquiry) return;

    setIsSendingReply(true);
    setTimeout(() => {
      const updatedHistory = [
        ...(selectedEnquiry.history || []),
        {
          type: 'replied',
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          text: `Replied by Sarah Jenkins: "${replyText}"`,
        },
      ];

      const updated = {
        ...selectedEnquiry,
        status: 'Replied',
        history: updatedHistory,
      };

      onUpdateEnquiry(updated);
      setSelectedEnquiry(updated);
      setIsSendingReply(false);
      setReplyText('');
      addToast({
        title: 'Reply Dispatched',
        message: `Email reply sent to ${selectedEnquiry.email}.`,
        type: 'success',
      });
    }, 350);
  };

  // Filter Data
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.senderName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      (e.company && e.company.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Unread'
        ? e.status === 'Unread'
        : statusFilter === 'Read'
        ? e.status === 'Read' || e.status === 'Replied'
        : statusFilter === 'Archived'
        ? e.status === 'Archived'
        : true;

    return matchesSearch && matchesStatus;
  });

  const unreadCount = enquiries.filter((e) => e.status === 'Unread').length;
  const readCount = enquiries.filter((e) => e.status === 'Read' || e.status === 'Replied').length;
  const archivedCount = enquiries.filter((e) => e.status === 'Archived').length;

  // Table Columns Specification
  const columns = [
    {
      header: 'Name',
      key: 'senderName',
      sortable: true,
      render: (row) => (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => handleOpenDrawer(row)}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: row.status === 'Unread' ? '#e0e7ff' : '#f1f5f9',
              color: row.status === 'Unread' ? '#4f46e5' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {row.senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: '13.5px',
                fontWeight: row.status === 'Unread' ? 700 : 600,
                color: '#0f172a',
              }}
            >
              {row.senderName}
            </div>
            {row.company && (
              <div style={{ fontSize: '11px', color: '#64748b' }}>{row.company}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      key: 'email',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: '#334155' }}>{row.email}</span>
      ),
    },
    {
      header: 'Subject',
      key: 'subject',
      sortable: true,
      render: (row) => (
        <div
          style={{ maxWidth: '320px', cursor: 'pointer' }}
          onClick={() => handleOpenDrawer(row)}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: row.status === 'Unread' ? 700 : 500,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={row.subject}
          >
            {row.subject}
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      key: 'receivedAt',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>
          {row.receivedAt}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Action',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <DropdownMenu
          trigger={
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Actions Menu"
            >
              <MoreVertical size={16} />
            </button>
          }
          items={[
            {
              label: 'View',
              icon: Eye,
              onClick: () => handleOpenDrawer(row),
            },
            {
              label: row.status === 'Unread' ? 'Mark as Read' : 'Mark as Unread',
              icon: BookOpen,
              onClick: () => handleMarkAsRead(row),
            },
            {
              label: row.status === 'Archived' ? 'Unarchive' : 'Archive',
              icon: Archive,
              onClick: () => handleArchive(row),
            },
            { divider: true },
            {
              label: 'Delete',
              icon: Trash2,
              danger: true,
              onClick: () => setDeleteEnquiryId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Enquiries
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            View and manage website enquiries.
          </p>
        </div>

        {/* Persistence Status Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#475569',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Persistence Module Connected</span>
        </div>
      </div>

      {/* BACKEND PERSISTENCE MODULE NOTE BANNER */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Info size={18} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
          <strong style={{ color: '#0f172a' }}>Optional Enquiry Storage Module:</strong> If your backend only dispatches emails via SMTP and does not store enquiries in a database, this page acts as an optional inbox interface that activates automatically once enquiry persistence is enabled in API settings.
        </div>
      </div>

      {/* TOP SEARCH & FILTERS BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search enquiries..."
          />

          {/* Quick Filter Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '3px',
              gap: '2px',
            }}
          >
            {[
              { id: 'All', label: 'All', count: enquiries.length },
              { id: 'Unread', label: 'Unread', count: unreadCount },
              { id: 'Read', label: 'Read', count: readCount },
              { id: 'Archived', label: 'Archived', count: archivedCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? '#4f46e5' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#475569',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ENQUIRIES TABLE */}
      <DataTable
        columns={columns}
        data={filteredEnquiries}
        selectedRows={selectedRows}
        onSelectRow={setSelectedRows}
        onSelectAll={setSelectedRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No enquiries found"
        emptyDescription="There are no contact messages matching your active filters."
      />

      {/* ENQUIRY DETAIL DRAWER (SLIDE-OVER FROM RIGHT) */}
      {isDrawerOpen && selectedEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(3px)',
              animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={handleCloseDrawer}
          />

          {/* Right Slide-over Content Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Enquiry Details
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                  {selectedEnquiry.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body Scroll Area */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Contact Information Card */}
              <div className="card card-padded" style={{ backgroundColor: '#fafafa', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contact Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                      {selectedEnquiry.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        {selectedEnquiry.senderName}
                      </div>
                      {selectedEnquiry.company && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedEnquiry.company}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                      <Mail size={15} style={{ color: '#64748b' }} />
                      <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
                        {selectedEnquiry.email}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                      <Phone size={15} style={{ color: '#64748b' }} />
                      <span>{selectedEnquiry.phone || 'Not provided'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                      <Calendar size={15} style={{ color: '#64748b' }} />
                      <span>Received: {selectedEnquiry.receivedAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject & Status Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Subject</span>
                  <Badge status={selectedEnquiry.status}>{selectedEnquiry.status}</Badge>
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {selectedEnquiry.subject}
                </h4>
              </div>

              {/* Message Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Message Body</span>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#0f172a',
                    whiteSpace: 'pre-line',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Optional Quick Reply Composer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CornerUpLeft size={16} style={{ color: '#4f46e5' }} /> Reply via Email
                </span>
                <form onSubmit={handleSendReply}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Compose email response to ${selectedEnquiry.senderName}...`}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: 1.5,
                      marginBottom: '8px',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      icon={Send}
                      isLoading={isSendingReply}
                      isDisabled={!replyText.trim()}
                    >
                      Send Reply
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Drawer Bottom Actions Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={BookOpen}
                  onClick={() => handleMarkAsRead(selectedEnquiry)}
                >
                  {selectedEnquiry.status === 'Unread' ? 'Mark as Read' : 'Mark as Unread'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Archive}
                  onClick={() => handleArchive(selectedEnquiry)}
                >
                  {selectedEnquiry.status === 'Archived' ? 'Unarchive' : 'Archive'}
                </Button>
              </div>

              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeleteEnquiryId(selectedEnquiry.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!deleteEnquiryId}
        onClose={() => setDeleteEnquiryId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Enquiry?"
        message="Are you sure you want to permanently delete this contact enquiry?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};

