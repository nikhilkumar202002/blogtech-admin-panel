import React, { useState, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  X,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { DataTable } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { RichTextEditor } from '../ui/RichTextEditor';
import { DatePicker } from '../ui/DatePicker';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useToast } from '../ui/ToastContext';
import { Breadcrumb } from '../ui/Breadcrumb';

export const CareersView = ({
  jobs = [],
  applicants = [],
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  isCreateOpen = false,
  onCloseCreateOpen,
  isLoading = false,
}) => {
  const { addToast } = useToast();

  // Mode: 'list' (Table view) | 'form' (Create / Edit Job view) | 'details' (Job Details Review Page view)
  const [viewMode, setViewMode] = useState('list');

  // Filters State for List view
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Table Selection & Pagination State
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Job state for Form / Details / Delete
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    experience: 'Senior (5+ yrs)',
    qualification: 'B.S. Computer Science / 5+ yrs experience',
    salary: '$150,000 - $180,000',
    status: 'Active',
    publishedAt: new Date().toISOString().split('T')[0],
    description: '',
    requirements: '',
  });

  // Skills as tags state
  const [skillsList, setSkillsList] = useState(['React', 'Node.js', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  // Sync external trigger for `isCreateOpen`
  useEffect(() => {
    if (isCreateOpen) {
      handleOpenCreate();
    }
  }, [isCreateOpen]);

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: 'Senior (5+ yrs)',
      qualification: 'Degree in CS or equivalent experience',
      salary: '$140,000 - $170,000',
      status: 'Active',
      publishedAt: new Date().toISOString().split('T')[0],
      description: '<h2>Role Overview</h2><p>We are seeking an experienced developer to join our team...</p>',
      requirements: '<h2>Requirements</h2><ul><li>5+ years building web applications</li><li>Strong TypeScript background</li></ul>',
    });
    setSkillsList(['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
    setErrors({});
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department || 'Engineering',
      location: job.location || '',
      type: job.type || 'Full-time',
      experience: job.experience || '',
      qualification: job.qualification || '',
      salary: job.salary || '',
      status: job.status || 'Active',
      publishedAt: job.publishedAt || new Date().toISOString().split('T')[0],
      description: job.description || '',
      requirements: job.requirements || '',
    });
    const parsedSkills = job.skills
      ? job.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['React', 'TypeScript'];
    setSkillsList(parsedSkills);
    setErrors({});
    setViewMode('form');
  };

  // Open Details View
  const handleOpenDetails = (job) => {
    setViewingJob(job);
    setViewMode('details');
  };

  // Skill Tags Handlers
  const handleAddSkillTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = skillInput.trim().replace(',', '');
      if (trimmed && !skillsList.includes(trimmed)) {
        setSkillsList([...skillsList, trimmed]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkillTag = (tagToRemove) => {
    setSkillsList(skillsList.filter((tag) => tag !== tagToRemove));
  };

  // Inline Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job position title is required.';
    if (!formData.location.trim()) newErrors.location = 'Job location is required.';
    if (!formData.experience.trim()) newErrors.experience = 'Required experience level is required.';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required.';
    if (skillsList.length === 0) newErrors.skills = 'Please add at least one required skill tag.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit
  const handleFormSubmit = (e, isDraft = false) => {
    e.preventDefault();

    if (!isDraft && !validateForm()) {
      addToast({
        title: 'Validation Error',
        message: 'Please resolve the highlighted form errors before saving.',
        type: 'error',
      });
      return;
    }

    const finalStatus = isDraft ? 'Closed' : formData.status;
    const skillsString = skillsList.join(', ');

    if (editingJob) {
      const updated = {
        ...editingJob,
        ...formData,
        skills: skillsString,
        status: finalStatus,
      };
      onUpdateJob(updated);
      if (viewingJob && viewingJob.id === updated.id) {
        setViewingJob(updated);
      }
      addToast({
        title: 'Job Updated',
        message: `Job opening "${formData.title}" updated successfully.`,
        type: 'success',
      });
    } else {
      const newJob = {
        id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
        ...formData,
        skills: skillsString,
        status: finalStatus,
        applicantsCount: 0,
      };
      onAddJob(newJob);
      addToast({
        title: 'Job Opening Created',
        message: `New career opening "${formData.title}" published as ${finalStatus}.`,
        type: 'success',
      });
    }

    setViewMode('list');
    onCloseCreateOpen && onCloseCreateOpen();
  };

  // Toggle Job Status (Close / Reopen)
  const handleToggleJobStatus = (job) => {
    const nextStatus = job.status === 'Active' ? 'Closed' : 'Active';
    const updated = { ...job, status: nextStatus };
    onUpdateJob(updated);
    if (viewingJob && viewingJob.id === job.id) {
      setViewingJob(updated);
    }
    addToast({
      title: nextStatus === 'Active' ? 'Position Reopened' : 'Position Closed',
      message: `Job "${job.title}" status changed to ${nextStatus}.`,
      type: 'info',
    });
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (deleteJobId) {
      onDeleteJob(deleteJobId);
      addToast({ title: 'Job Deleted', message: 'Job opening has been deleted.', type: 'info' });
      setDeleteJobId(null);
      if (viewingJob && viewingJob.id === deleteJobId) {
        setViewingJob(null);
        setViewMode('list');
      }
    }
  };

  // Filter & Sort Logic for Table
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      (job.skills && job.skills.toLowerCase().includes(search.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesLocation = !locationFilter || job.location.includes(locationFilter);
    const matchesExp = !experienceFilter || job.experience.includes(experienceFilter);

    return matchesSearch && matchesStatus && matchesLocation && matchesExp;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') return (b.publishedAt || '').localeCompare(a.publishedAt || '');
    if (sortBy === 'oldest') return (a.publishedAt || '').localeCompare(b.publishedAt || '');
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    return 0;
  });

  // Table Columns Setup
  const columns = [
    {
      header: 'Job Position',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: '240px', cursor: 'pointer' }} onClick={() => handleOpenDetails(row)}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={row.title}
          >
            {row.title}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            {row.id} • {row.department || 'General'}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      key: 'location',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: '13px',
            color: '#334155',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '140px',
          }}
          title={row.location}
        >
          {row.location}
        </span>
      ),
    },
    {
      header: 'Experience',
      key: 'experience',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: '12.5px',
            color: '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '130px',
          }}
          title={row.experience}
        >
          {row.experience}
        </span>
      ),
    },
    {
      header: 'Skills',
      key: 'skills',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: '12.5px',
            color: '#334155',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '180px',
          }}
          title={row.skills || 'N/A'}
        >
          {row.skills || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Qualification',
      key: 'qualification',
      sortable: true,
      render: (row) => (
        <span
          style={{
            fontSize: '12.5px',
            color: '#475569',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: '160px',
          }}
          title={row.qualification || 'N/A'}
        >
          {row.qualification || 'N/A'}
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
      header: 'Updated',
      key: 'publishedAt',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{row.publishedAt}</span>,
    },
    {
      header: 'Actions',
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
            { label: 'View Position', icon: Eye, onClick: () => handleOpenDetails(row) },
            { label: 'Edit Position', icon: Edit2, onClick: () => handleOpenEdit(row) },
            {
              label: row.status === 'Active' ? 'Close Position' : 'Reopen Position',
              icon: row.status === 'Active' ? XCircle : CheckCircle,
              onClick: () => handleToggleJobStatus(row),
            },
            { divider: true },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => setDeleteJobId(row.id) },
          ]}
        />
      ),
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* DETAILS VIEW: CAREER JOB DETAILS PAGE                                     */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'details' && viewingJob) {
    const jobSkills = viewingJob.skills
      ? viewingJob.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : ['React', 'TypeScript'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', onClick: () => setViewMode('list') },
            { label: 'Careers', onClick: () => setViewMode('list') },
            { label: viewingJob.title },
          ]}
        />

        {/* HEADER BAR */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 1px 3px 0 rgba(16, 24, 40, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {viewingJob.title}
            </h1>
            <Badge status={viewingJob.status}>{viewingJob.status}</Badge>
          </div>

          {/* Action Buttons Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => handleOpenEdit(viewingJob)}
            >
              Edit
            </Button>

            <Button
              variant="secondary"
              icon={viewingJob.status === 'Active' ? XCircle : CheckCircle}
              onClick={() => handleToggleJobStatus(viewingJob)}
            >
              {viewingJob.status === 'Active' ? 'Close Position' : 'Reopen Position'}
            </Button>

            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setDeleteJobId(viewingJob.id)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* PAGE CONTENT LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
            gap: '24px',
          }}
        >
          {/* LEFT / MAIN CONTENT AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Overview Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
                Position Overview
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Position ID</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {viewingJob.id}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Location</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {viewingJob.location}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Experience</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {viewingJob.experience}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Qualification</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                    {viewingJob.qualification || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Status</div>
                  <div style={{ marginTop: '4px' }}>
                    <Badge status={viewingJob.status}>{viewingJob.status}</Badge>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Created Date</div>
                  <div style={{ fontSize: '13.5px', color: '#334155', marginTop: '2px' }}>
                    {viewingJob.publishedAt || '2026-09-28'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Last Updated</div>
                  <div style={{ fontSize: '13.5px', color: '#334155', marginTop: '2px' }}>
                    Recently
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                Required Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {jobSkills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: '1px solid #c7d2fe',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Description Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                Job Description
              </h3>
              <div
                style={{ fontSize: '14px', lineHeight: 1.65, color: '#0f172a' }}
                dangerouslySetInnerHTML={{
                  __html: viewingJob.description || '<p>No description content provided.</p>',
                }}
              />
            </div>

            {/* Other Requirements Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                Other Requirements & Qualifications
              </h3>
              <div
                style={{ fontSize: '14px', lineHeight: 1.65, color: '#0f172a' }}
                dangerouslySetInnerHTML={{
                  __html: viewingJob.requirements || '<p>No additional requirements provided.</p>',
                }}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Publishing Information Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 14px 0' }}>
                Publishing Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Status</span>
                  <Badge status={viewingJob.status}>{viewingJob.status}</Badge>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Created</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{viewingJob.publishedAt || '2026-09-28'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Last Updated</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>Recently</span>
                </div>
              </div>
            </div>

            {/* Admin Actions Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 14px 0' }}>
                Admin Actions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button
                  variant="primary"
                  icon={Edit2}
                  onClick={() => handleOpenEdit(viewingJob)}
                  fullWidth
                >
                  Edit Job
                </Button>

                <Button
                  variant="secondary"
                  icon={viewingJob.status === 'Active' ? XCircle : CheckCircle}
                  onClick={() => handleToggleJobStatus(viewingJob)}
                  fullWidth
                >
                  {viewingJob.status === 'Active' ? 'Close Position' : 'Reopen Position'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmDialog
          isOpen={!!deleteJobId}
          onClose={() => setDeleteJobId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Job Opening?"
          message="This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          type="danger"
        />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* FORM VIEW: CREATE / EDIT JOB OPENING PAGE                                  */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'form') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        {/* Breadcrumb & Header */}
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: () => setViewMode('list') },
              { label: 'Careers', onClick: () => setViewMode('list') },
              { label: editingJob ? 'Edit Job Opening' : 'Create Job Opening' },
            ]}
          />

          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
            {editingJob ? 'Edit Job Opening' : 'Create Job Opening'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            {editingJob ? 'Update the details of your career opportunity.' : 'Add the details required to publish a new career opportunity.'}
          </p>
        </div>

        {/* TWO-COLUMN DESKTOP FORM LAYOUT */}
        <form onSubmit={handleFormSubmit} noValidate>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
              gap: '28px',
            }}
          >
            {/* LEFT / MAIN COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Job Position / Title */}
              <div className="card card-padded">
                <FormField label="Job Position / Title" required error={errors.title}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: null });
                    }}
                    placeholder="e.g. Senior Full Stack Engineer (React & Node.js)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: errors.title ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
                    }}
                  />
                </FormField>
              </div>

              {/* Job Description (Rich Text Editor) */}
              <div className="card card-padded">
                <FormField label="Job Description" required>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Detail position overview, core duties, and team context..."
                    minHeight="220px"
                  />
                </FormField>
              </div>

              {/* Required Skills (Add skills as tags) */}
              <div className="card card-padded">
                <FormField label="Required Skills" required error={errors.skills} helperText="Type skill name and press Enter or comma to add tag">
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: errors.skills ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      alignItems: 'center',
                      minHeight: '44px',
                    }}
                  >
                    {skillsList.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#eef2ff',
                          color: '#4338ca',
                          fontSize: '12.5px',
                          fontWeight: 500,
                          border: '1px solid #c7d2fe',
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillTag(skill)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            borderRadius: '50%',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkillTag}
                      placeholder={skillsList.length === 0 ? 'Type skill (e.g. React) and press Enter...' : 'Add another skill...'}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '13px',
                        color: '#0f172a',
                        flex: 1,
                        minWidth: '160px',
                      }}
                    />
                  </div>
                </FormField>
              </div>

              {/* Other Requirements (Rich Text Editor) */}
              <div className="card card-padded">
                <FormField label="Other Requirements">
                  <RichTextEditor
                    value={formData.requirements}
                    onChange={(val) => setFormData({ ...formData, requirements: val })}
                    placeholder="Detail technical qualifications, certifications, or education..."
                    minHeight="180px"
                  />
                </FormField>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Job Parameters Card */}
              <div className="card card-padded">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Vacancy Parameters
                </h3>

                <FormField label="Required Experience" required error={errors.experience}>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      if (errors.experience) setErrors({ ...errors, experience: null });
                    }}
                    placeholder="e.g. Senior (5+ yrs)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13.5px',
                      borderRadius: '8px',
                      border: errors.experience ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField label="Job Location" required error={errors.location}>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (errors.location) setErrors({ ...errors, location: null });
                    }}
                    placeholder="e.g. San Francisco, CA or Remote"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13.5px',
                      borderRadius: '8px',
                      border: errors.location ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField label="Qualification" required error={errors.qualification}>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => {
                      setFormData({ ...formData, qualification: e.target.value });
                      if (errors.qualification) setErrors({ ...errors, qualification: null });
                    }}
                    placeholder="e.g. B.S. Computer Science"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13.5px',
                      borderRadius: '8px',
                      border: errors.qualification ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField label="Publication Date">
                  <DatePicker
                    value={formData.publishedAt}
                    onChange={(date) => setFormData({ ...formData, publishedAt: date })}
                  />
                </FormField>
              </div>

              {/* SIDEBAR CARD: Publishing Status */}
              <div className="card card-padded">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                  Publishing Status
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: formData.status === 'Active' ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      backgroundColor: formData.status === 'Active' ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="jobStatus"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      style={{ accentColor: '#059669', marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#047857' }}>Active</div>
                      <div style={{ fontSize: '12px', color: '#065f46', marginTop: '2px' }}>
                        This position is currently visible on the website.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: formData.status === 'Closed' ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                      backgroundColor: formData.status === 'Closed' ? '#f1f5f9' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="jobStatus"
                      value="Closed"
                      checked={formData.status === 'Closed'}
                      onChange={() => setFormData({ ...formData, status: 'Closed' })}
                      style={{ accentColor: '#475569', marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>Closed</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        This position is hidden from active vacancies.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* BOTTOM ACTION BAR */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'flex-end',
                  marginTop: '8px',
                }}
              >
                <Button
                  variant="secondary"
                  onClick={() => {
                    setViewMode('list');
                    onCloseCreateOpen && onCloseCreateOpen();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="ghost"
                  onClick={(e) => handleFormSubmit(e, true)}
                >
                  Save as Draft
                </Button>

                <Button type="submit" variant="primary">
                  {editingJob ? 'Save Changes' : 'Save Job'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* LIST VIEW: JOB OPENINGS TABLE                                              */
  /* -------------------------------------------------------------------------- */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: () => setViewMode('list') },
              { label: 'Careers' },
            ]}
          />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
            Careers
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            Manage current job openings and vacancy status.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Add Job Opening
        </Button>
      </div>

      {/* TOOLBAR */}
      <div
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
            minWidth: 0,
            flexWrap: 'nowrap',
          }}
        >
          <div style={{ width: '220px', flexShrink: 0 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search job openings..."
            />
          </div>

          <div style={{ width: '135px', flexShrink: 0 }}>
            <Select
              fullWidth
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />
          </div>

          <div style={{ width: '145px', flexShrink: 0 }}>
            <Select
              fullWidth
              value={locationFilter}
              onChange={setLocationFilter}
              placeholder="All Locations"
              options={['San Francisco, CA', 'Remote', 'Austin, TX', 'New York, NY']}
            />
          </div>

          <div style={{ width: '145px', flexShrink: 0 }}>
            <Select
              fullWidth
              value={experienceFilter}
              onChange={setExperienceFilter}
              placeholder="All Experience"
              options={['Senior', 'Mid-Level', 'Lead / Principal', 'Entry']}
            />
          </div>
        </div>

        <div style={{ width: '165px', flexShrink: 0 }}>
          <Select
            fullWidth
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Sort: Newest First' },
              { value: 'oldest', label: 'Sort: Oldest First' },
              { value: 'title-asc', label: 'Sort: Title A-Z' },
              { value: 'title-desc', label: 'Sort: Title Z-A' },
            ]}
          />
        </div>
      </div>

      {/* CAREERS TABLE */}
      <DataTable
        columns={columns}
        data={sortedJobs}
        selectedRows={selectedRows}
        onSelectRow={setSelectedRows}
        onSelectAll={setSelectedRows}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        emptyTitle="No job openings found"
        emptyDescription="No vacancies match your current search or filter parameters."
        onEmptyAction={handleOpenCreate}
        emptyActionLabel="Create your first job opening"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Opening?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};
