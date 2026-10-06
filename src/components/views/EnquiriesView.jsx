import React, { useState } from 'react';
import {
  Mail,
  Search,
  Star,
  Archive,
  CheckCircle2,
  Send,
  CornerUpLeft,
  User,
  Building,
  Phone,
  Clock,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/ToastContext';

export const EnquiriesView = ({
  enquiries = [],
  onUpdateEnquiry,
  onDeleteEnquiry,
}) => {
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected message for details pane
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(enquiries[0]?.id || null);

  // Reply Composer state
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Confirm delete dialog
  const [deleteEnquiryId, setDeleteEnquiryId] = useState(null);

  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  // Toggle Star
  const handleToggleStar = (e, enq) => {
    e.stopPropagation();
    onUpdateEnquiry({ ...enq, isStarred: !enq.isStarred });
    addToast({
      title: enq.isStarred ? 'Unstarred' : 'Starred',
      message: `Enquiry from ${enq.senderName} ${enq.isStarred ? 'removed from' : 'added to'} starred.`,
      type: 'info',
    });
  };

  // Mark as Read
  const handleMarkAsRead = (enq) => {
    if (enq.status === 'Unread') {
      onUpdateEnquiry({ ...enq, status: 'Read' });
    }
  };

  // Submit Reply
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

      onUpdateEnquiry({
        ...selectedEnquiry,
        status: 'Replied',
        history: updatedHistory,
      });

      setIsSendingReply(false);
      setReplyText('');
      addToast({
        title: 'Reply Sent',
        message: `Email reply dispatched to ${selectedEnquiry.email}.`,
        type: 'success',
      });
    }, 400);
  };

  // Canned response selection
  const handleCannedResponse = (template) => {
    if (template === 'sales') {
      setReplyText(
        `Hi ${selectedEnquiry?.senderName || 'there'},\n\nThank you for reaching out to ApexCorp. I would be happy to schedule an enterprise demo with our solutions engineering team.\n\nBest regards,\nSarah Jenkins`
      );
    } else if (template === 'careers') {
      setReplyText(
        `Hi ${selectedEnquiry?.senderName || 'there'},\n\nThank you for your interest in joining ApexCorp. Our talent team has received your inquiry and will review your profile.\n\nBest regards,\nRecruiting Team`
      );
    }
  };

  // Filtered list
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.senderName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.company.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'Starred' ? e.isStarred : e.status === statusFilter);
    const matchesCategory = !categoryFilter || e.category.includes(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const unreadCount = enquiries.filter((e) => e.status === 'Unread').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Unread Enquiries</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {unreadCount}
          </div>
        </div>
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Inbox Volume</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {enquiries.length}
          </div>
        </div>
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>Response Rate</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            98.4%
          </div>
        </div>
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4338ca' }}>Avg Response Time</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            1.2 Hours
          </div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search sender, email, company, subject..."
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Mail Statuses"
            options={['Unread', 'Read', 'Replied', 'Archived', 'Starred']}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="All Categories"
            options={['Sales', 'Careers', 'Partnerships', 'Technical Support', 'Press']}
          />
        </div>

        <Button
          variant="secondary"
          icon={Download}
          onClick={() =>
            addToast({ title: 'Export Initiated', message: 'Enquiries CSV report downloaded.', type: 'success' })
          }
        >
          Export CSV
        </Button>
      </div>

      {/* Split-View Mail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
          gap: '20px',
          minHeight: '580px',
        }}
      >
        {/* Left Pane: Inbox Message List */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Messages ({filteredEnquiries.length})</span>
            {unreadCount > 0 && <Badge status="unread">{unreadCount} Unread</Badge>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredEnquiries.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No enquiries found matching filters.
              </div>
            ) : (
              filteredEnquiries.map((enq) => {
                const isSelected = selectedEnquiry?.id === enq.id;
                return (
                  <div
                    key={enq.id}
                    onClick={() => {
                      setSelectedEnquiryId(enq.id);
                      handleMarkAsRead(enq);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#eef2ff' : enq.status === 'Unread' ? '#fafafa' : '#ffffff',
                      borderLeft: isSelected ? '3px solid #4f46e5' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          enq.status === 'Unread' ? '#fafafa' : '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, enq)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: enq.isStarred ? '#f59e0b' : '#cbd5e1',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                          }}
                        >
                          <Star size={15} fill={enq.isStarred ? '#f59e0b' : 'none'} />
                        </button>
                        <span style={{ fontSize: '13.5px', fontWeight: enq.status === 'Unread' ? 700 : 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {enq.senderName}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                        {enq.receivedAt.split(' ')[1]}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', fontWeight: enq.status === 'Unread' ? 600 : 500, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {enq.subject}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{enq.company}</span>
                      <Badge status={enq.status}>{enq.status}</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Message Detail & Reply Composer */}
        {selectedEnquiry ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Sender Detail Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {selectedEnquiry.subject}
                  </h3>
                  <Badge status={selectedEnquiry.status}>{selectedEnquiry.status}</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12.5px', color: '#475569' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={14} style={{ color: '#94a3b8' }} /> {selectedEnquiry.senderName} ({selectedEnquiry.email})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building size={14} style={{ color: '#94a3b8' }} /> {selectedEnquiry.company}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Archive}
                  onClick={() => {
                    onUpdateEnquiry({ ...selectedEnquiry, status: 'Archived' });
                    addToast({ title: 'Archived', message: 'Enquiry archived.', type: 'info' });
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => setDeleteEnquiryId(selectedEnquiry.id)}
                  style={{ color: '#dc2626' }}
                />
              </div>
            </div>

            {/* Message Body Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: '#0f172a',
                  whiteSpace: 'pre-line',
                  backgroundColor: '#fafafa',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                }}
              >
                {selectedEnquiry.message}
              </div>

              {/* History Log */}
              {selectedEnquiry.history && selectedEnquiry.history.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', margin: '0 0 10px 0' }}>
                    Communication History
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedEnquiry.history.map((h, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>[{h.timestamp}]</span>
                        <span>{h.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Composer Widget */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CornerUpLeft size={16} style={{ color: '#4f46e5' }} /> Reply to {selectedEnquiry.senderName}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleCannedResponse('sales')}
                      style={{ fontSize: '11px', color: '#4f46e5', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Insert Sales Demo Template
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCannedResponse('careers')}
                      style={{ fontSize: '11px', color: '#4f46e5', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      + Insert Careers Template
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendReply}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Compose your response email..."
                    rows={4}
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
                      marginBottom: '12px',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Send}
                      isLoading={isSendingReply}
                      isDisabled={!replyText.trim()}
                    >
                      Dispatch Email Reply
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Select an enquiry message from the left list to view content.
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteEnquiryId}
        onClose={() => setDeleteEnquiryId(null)}
        onConfirm={() => {
          onDeleteEnquiry(deleteEnquiryId);
          setDeleteEnquiryId(null);
          addToast({ title: 'Enquiry Deleted', message: 'Enquiry record removed.', type: 'info' });
        }}
        title="Delete Contact Enquiry?"
        message="Are you sure you want to delete this enquiry message permanently?"
        type="danger"
      />
    </div>
  );
};
