import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { DataTable } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { RichTextEditor } from '../ui/RichTextEditor';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/ToastContext';

export const CareersView = ({
  jobs = [],
  applicants = [],
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  isCreateOpen = false,
  onCloseCreateOpen,
}) => {
  const { addToast } = useToast();

  // Filters state
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Table selection & pagination
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit job state
  const [editingJob, setEditingJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete dialog state
  const [deleteJobId, setDeleteJobId] = useState(null);

  // View Applicants drawer state
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experience: 'Senior (5+ yrs)',
    salary: '$140,000 - $180,000',
    status: 'Active',
    description: '',
    requirements: '',
  });

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote (US)',
      type: 'Full-time',
      experience: 'Mid-Senior',
      salary: '$130,000 - $160,000',
      status: 'Active',
      description: 'We are seeking an experienced candidate to join our core team...',
      requirements: 'Proven background in tech SaaS products, strong communication skills.',
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      experience: job.experience,
      salary: job.salary,
      status: job.status,
      description: job.description || '',
      requirements: job.requirements || '',
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({ title: 'Validation Error', message: 'Job title is required', type: 'error' });
      return;
    }

    if (editingJob) {
      onUpdateJob({
        ...editingJob,
        ...formData,
      });
      addToast({ title: 'Job Updated', message: `Job "${formData.title}" saved successfully.`, type: 'success' });
    } else {
      const newJob = {
        id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        applicantsCount: 0,
        publishedAt: new Date().toISOString().split('T')[0],
      };
      onAddJob(newJob);
      addToast({ title: 'Job Created', message: `Job posting "${formData.title}" published as ${formData.status}.`, type: 'success' });
    }

    setIsModalOpen(false);
  };

  // Confirm delete action
  const handleConfirmDelete = () => {
    if (deleteJobId) {
      onDeleteJob(deleteJobId);
      addToast({ title: 'Job Deleted', message: 'Job opening was permanently removed.', type: 'info' });
      setDeleteJobId(null);
    }
  };

  // Toggle status directly from row
  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'Active' ? 'Closed' : job.status === 'Closed' ? 'Draft' : 'Active';
    onUpdateJob({ ...job, status: nextStatus });
    addToast({ title: 'Status Changed', message: `Job status updated to ${nextStatus}.`, type: 'info' });
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !departmentFilter || job.department === departmentFilter;
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesStatus = !statusFilter || job.status === statusFilter;
    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  const totalApplicantsCount = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);

  // Table Columns Setup
  const columns = [
    {
      header: 'Job Opening Title & ID',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {row.id} • Posted {row.publishedAt}
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      key: 'department',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
          {row.department}
        </span>
      ),
    },
    {
      header: 'Location & Type',
      key: 'location',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontSize: '13px', color: '#0f172a' }}>{row.location}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{row.type}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Applicants',
      key: 'applicantsCount',
      sortable: true,
      align: 'center',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingApplicantsJob(row)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: '#eef2ff',
            color: '#4338ca',
            fontSize: '12px',
            fontWeight: 600,
            border: '1px solid #c7d2fe',
            cursor: 'pointer',
          }}
        >
          <Users size={13} />
          {row.applicantsCount || 0} candidates
        </button>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={Edit2}
            onClick={() => handleOpenEdit(row)}
            title="Edit Posting"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(row)}
            title="Cycle Status"
          >
            {row.status === 'Active' ? 'Close' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => setDeleteJobId(row.id)}
            title="Delete Job"
            style={{ color: '#dc2626' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Job Postings</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {jobs.length}
          </div>
        </div>
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>Active Openings</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {jobs.filter((j) => j.status === 'Active').length}
          </div>
        </div>
        <div className="card card-padded">
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4338ca' }}>Total Applicants</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {totalApplicantsCount}
          </div>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
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
            placeholder="Search job title, ID, or dept..."
          />
          <Select
            value={departmentFilter}
            onChange={setDepartmentFilter}
            placeholder="All Departments"
            options={['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Customer Operations', 'Infrastructure']}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Employment Type"
            options={['Full-time', 'Part-time', 'Contract', 'Remote']}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={['Active', 'Draft', 'Closed']}
          />
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          New Job Opening
        </Button>
      </div>

      {/* Main Jobs Data Table */}
      <DataTable
        columns={columns}
        data={filteredJobs}
        selectedRows={selectedRows}
        onSelectRow={setSelectedRows}
        onSelectAll={setSelectedRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        emptyTitle="No Job Openings Found"
        emptyDescription="No career postings match your current filter parameters."
        onEmptyAction={handleOpenAdd}
        emptyActionLabel="Create First Job Opening"
      />

      {/* Create / Edit Job Opening Modal */}
      <Modal
        isOpen={isModalOpen || isCreateOpen}
        onClose={() => {
          setIsModalOpen(false);
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        title={editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}
        subtitle={editingJob ? `Update details for ${editingJob.id}` : 'Fill in position parameters and publishing status'}
        maxWidth="680px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                onCloseCreateOpen && onCloseCreateOpen();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingJob ? 'Save Changes' : 'Publish Job Opening'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormField label="Job Position Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Full Stack Engineer"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Department" required>
              <Select
                fullWidth
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                options={['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Customer Operations', 'Infrastructure']}
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA (Hybrid)"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Employment Type">
              <Select
                fullWidth
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                options={['Full-time', 'Part-time', 'Contract', 'Remote']}
              />
            </FormField>

            <FormField label="Experience Level">
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. Senior (5+ yrs)"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Salary Band">
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. $150,000 - $180,000"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>
          </div>

          <FormField label="Publishing Status" required>
            <Select
              fullWidth
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={[
                { value: 'Active', label: 'Active (Visible on Careers Page)' },
                { value: 'Draft', label: 'Draft (Internal Saved Draft)' },
                { value: 'Closed', label: 'Closed (No longer accepting applications)' },
              ]}
            />
          </FormField>

          <FormField label="Job Description & Responsibilities">
            <RichTextEditor
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Detail job overview, core duties, and team context..."
              minHeight="140px"
            />
          </FormField>

          <FormField label="Candidate Requirements & Qualifications">
            <RichTextEditor
              value={formData.requirements}
              onChange={(val) => setFormData({ ...formData, requirements: val })}
              placeholder="Detail required skills, experience, and tech stack..."
              minHeight="120px"
            />
          </FormField>
        </form>
      </Modal>

      {/* View Applicants Drawer Modal */}
      <Modal
        isOpen={!!viewingApplicantsJob}
        onClose={() => setViewingApplicantsJob(null)}
        title={`Applicants for ${viewingApplicantsJob?.title}`}
        subtitle={`Candidate submissions received for posting ${viewingApplicantsJob?.id}`}
        maxWidth="720px"
        footer={<Button variant="secondary" onClick={() => setViewingApplicantsJob(null)}>Close</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {applicants.filter((a) => a.jobId === viewingApplicantsJob?.id).length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
              No submitted resumes received yet for this position.
            </div>
          ) : (
            applicants
              .filter((a) => a.jobId === viewingApplicantsJob?.id)
              .map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                        {app.name}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {app.email} • {app.phone}
                      </div>
                    </div>
                    <Badge status={app.status === 'Shortlisted' ? 'active' : 'draft'}>{app.status}</Badge>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '10px' }}>
                    <strong>Experience:</strong> {app.experience} | Submitted: {app.submittedAt}
                  </div>
                  {app.notes && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#334155',
                        backgroundColor: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        marginTop: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <strong>Recruiter Note:</strong> {app.notes}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Opening?"
        message="Are you sure you want to permanently remove this job posting? Incoming applicant links will be disabled."
        confirmLabel="Yes, Delete Job"
        type="danger"
      />
    </div>
  );
};
