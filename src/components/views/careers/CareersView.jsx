import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Globe,
  EyeOff,
  Building2,
  Tag,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/SearchInput';
import { Select } from '../../ui/Select';
import { DataTable } from '../../ui/DataTable';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { useToast } from '../../ui/ToastContext';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { CreateCareer } from './CreateCareer';
import { CarrerStatusUpdate } from '../../ui/CarrerStatusUpdate';
import {
  getCareers,
  publishCareer,
  unpublishCareer,
  closeCareer,
  reopenCareer,
  deleteCareer,
} from '../../../utils/career.service';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unscheduled';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const getSkillsArray = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') {
    return skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export const CareersView = ({
  isCreateOpen = false,
  onCloseCreateOpen,
}) => {
  const { addToast } = useToast();

  // Mode: 'list' (Table view) | 'form' (Create / Edit Job view) | 'details' (Job Details Review Page view)
  const [viewMode, setViewMode] = useState('list');

  // Real API Data State
  const [careers, setCareers] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Job state for Form / Details / Delete
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusActionLoading, setStatusActionLoading] = useState({});

  // Filters State for List view
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Table Selection & Pagination State
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Fetch careers list from API: GET /admin/careers
  const fetchCareersList = async () => {
    setIsLoading(true);
    try {
      const res = await getCareers();
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.careers)) {
        list = res.careers;
      }

      setCareers(list);
      setPaginationMeta(res?.meta || res?.data?.meta || null);
    } catch (err) {
      console.warn('Could not load careers from /admin/careers:', err?.message || err);
      addToast({
        title: 'Network Warning',
        message: 'Could not sync latest careers from server.',
        type: 'warning',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareersList();
  }, []);

  // Sync external trigger for `isCreateOpen`
  useEffect(() => {
    if (isCreateOpen) {
      handleOpenCreate();
    }
  }, [isCreateOpen]);

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingJob(null);
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setViewMode('form');
  };

  // Open Details View
  const handleOpenDetails = (job) => {
    setViewingJob(job);
    setViewMode('details');
  };

  // Toggle Job Status (Publish / Unpublish / Close / Reopen)
  const handleToggleJobStatus = async (job) => {
    const currentStatus = (job.status || 'draft').toLowerCase();
    let actionFn = publishCareer;
    let nextStatus = 'published';
    let actionLabel = 'Published';

    if (currentStatus === 'published' || currentStatus === 'active') {
      actionFn = unpublishCareer;
      nextStatus = 'draft';
      actionLabel = 'Unpublished';
    } else if (currentStatus === 'closed') {
      actionFn = reopenCareer;
      nextStatus = 'published';
      actionLabel = 'Reopened';
    } else {
      actionFn = publishCareer;
      nextStatus = 'published';
      actionLabel = 'Published';
    }

    setStatusActionLoading((prev) => ({ ...prev, [job.id]: true }));
    try {
      await actionFn(job.id);
      addToast({
        title: `Position ${actionLabel}`,
        message: `"${job.title}" status changed to ${nextStatus}.`,
        type: 'success',
      });

      // Update local item status cleanly
      setCareers((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, status: nextStatus } : item))
      );

      if (viewingJob && viewingJob.id === job.id) {
        setViewingJob((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || 'Could not update status.',
        type: 'error',
      });
    } finally {
      setStatusActionLoading((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  // Close Job Action (PATCH /admin/careers/:id/close)
  const handleCloseJob = async (job) => {
    setStatusActionLoading((prev) => ({ ...prev, [job.id]: true }));
    try {
      await closeCareer(job.id);
      addToast({
        title: 'Position Closed',
        message: `"${job.title}" is now marked as closed.`,
        type: 'info',
      });
      setCareers((prev) =>
        prev.map((item) => (item.id === job.id ? { ...item, status: 'closed' } : item))
      );
      if (viewingJob && viewingJob.id === job.id) {
        setViewingJob((prev) => ({ ...prev, status: 'closed' }));
      }
    } catch (err) {
      addToast({
        title: 'Action Failed',
        message: err?.response?.data?.message || 'Could not close position.',
        type: 'error',
      });
    } finally {
      setStatusActionLoading((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  // Confirm Delete Handler: DELETE /admin/careers/:id
  const handleConfirmDelete = async () => {
    if (!deleteJobId) return;
    setIsDeleting(true);
    try {
      await deleteCareer(deleteJobId);
      addToast({
        title: 'Career Deleted',
        message: 'The career opening has been permanently deleted.',
        type: 'success',
      });
      setCareers((prev) => prev.filter((item) => item.id !== deleteJobId));
      if (viewingJob && viewingJob.id === deleteJobId) {
        setViewingJob(null);
        setViewMode('list');
      }
      setDeleteJobId(null);
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete career opening.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Distinct departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    careers.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [careers]);

  // Filter & Sort Logic for Table
  const filteredJobs = useMemo(() => {
    return careers.filter((job) => {
      const q = search.toLowerCase();
      const skillsStr = Array.isArray(job.skills) ? job.skills.join(' ') : String(job.skills || '');
      const matchesSearch =
        !q ||
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.department && job.department.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q)) ||
        (job.qualification && job.qualification.toLowerCase().includes(q)) ||
        (job.experience && job.experience.toLowerCase().includes(q)) ||
        skillsStr.toLowerCase().includes(q);

      const jobStatus = (job.status || 'draft').toLowerCase();
      const matchesStatus =
        statusFilter === 'all' ||
        jobStatus === statusFilter.toLowerCase();

      const matchesDept = !departmentFilter || job.department === departmentFilter;
      const matchesType = !employmentTypeFilter || job.employment_type === employmentTypeFilter;

      return matchesSearch && matchesStatus && matchesDept && matchesType;
    });
  }, [careers, search, statusFilter, departmentFilter, employmentTypeFilter]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.created_at || a.published_at || '';
        const dateB = b.created_at || b.published_at || '';
        return (dateB).localeCompare(dateA) || (b.id - a.id);
      }
      if (sortBy === 'oldest') {
        const dateA = a.created_at || a.published_at || '';
        const dateB = b.created_at || b.published_at || '';
        return (dateA).localeCompare(dateB) || (a.id - b.id);
      }
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
  }, [filteredJobs, sortBy]);

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const s = String(status || 'draft').toLowerCase();
    let badgeType = 'Draft';
    if (s === 'published' || s === 'active') badgeType = 'Active';
    else if (s === 'closed' || s === 'unpublish') badgeType = 'Closed';
    else if (s === 'withdrawn') badgeType = 'Error';

    return (
      <Badge status={badgeType}>
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </Badge>
    );
  };

  // Table Columns Setup
  const columns = [
    {
      header: 'Job Position',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div
          className="max-w-[280px] cursor-pointer group"
          onClick={() => handleOpenDetails(row)}
        >
          <div className="text-[13.5px] font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {row.title}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 flex-wrap">
            <span className="font-mono font-medium">#{row.id}</span>
            <span>•</span>
            <span className="text-slate-600 font-medium">{row.department || 'General'}</span>
            {row.slug && (
              <>
                <span>•</span>
                <span className="text-slate-400 font-mono truncate max-w-[120px]">
                  /{row.slug}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Type',
      key: 'location',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[13px] text-slate-700 truncate max-w-[160px]">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{row.location || 'N/A'}</span>
          </div>
          {row.employment_type && (
            <span className="text-[10.5px] font-medium text-slate-500 capitalize">
              {row.employment_type.replace('_', ' ')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Experience',
      key: 'experience',
      sortable: true,
      render: (row) => (
        <span className="text-[12.5px] text-slate-600 whitespace-nowrap">
          {row.experience || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Skills',
      key: 'skills',
      render: (row) => {
        const skills = getSkillsArray(row.skills);
        if (skills.length === 0) return <span className="text-slate-400 text-xs">None</span>;
        return (
          <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
            {skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-100 text-indigo-700 font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-[10.5px] text-slate-500 font-medium">
                +{skills.length - 3}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Qualification',
      key: 'qualification',
      sortable: true,
      render: (row) => (
        <span
          className="text-[12.5px] text-slate-600 block truncate max-w-[160px]"
          title={row.qualification}
        >
          {row.qualification || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => (
        <CarrerStatusUpdate
          careerId={row.id}
          currentStatus={row.status || 'draft'}
          careerTitle={row.title}
          onStatusChange={(newStatus) => {
            setCareers((prev) =>
              prev.map((c) => (c.id === row.id ? { ...c, status: newStatus } : c))
            );
            if (viewingJob && viewingJob.id === row.id) {
              setViewingJob((prev) => ({ ...prev, status: newStatus }));
            }
          }}
        />
      ),
    },
    {
      header: 'Date',
      key: 'created_at',
      sortable: true,
      render: (row) => (
        <div className="text-xs text-slate-500 whitespace-nowrap">
          <div>{formatDate(row.published_at || row.created_at)}</div>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        const currentStatus = (row.status || 'draft').toLowerCase();
        const isPublished = currentStatus === 'published' || currentStatus === 'active';
        const isClosed = currentStatus === 'closed';

        return (
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="p-1.5 rounded-lg border-0 bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Options"
              >
                <MoreVertical size={16} />
              </button>
            }
            items={[
              {
                label: 'View Details',
                icon: Eye,
                onClick: () => handleOpenDetails(row),
              },
              {
                label: 'Edit Opening',
                icon: Edit2,
                onClick: () => handleOpenEdit(row),
              },
              {
                label: isPublished
                  ? 'Unpublish'
                  : isClosed
                  ? 'Reopen Position'
                  : 'Publish',
                icon: isPublished ? EyeOff : Globe,
                onClick: () => handleToggleJobStatus(row),
              },
              ...(isPublished
                ? [
                    {
                      label: 'Close Position',
                      icon: XCircle,
                      onClick: () => handleCloseJob(row),
                    },
                  ]
                : []),
              { divider: true },
              {
                label: 'Delete',
                icon: Trash2,
                danger: true,
                onClick: () => setDeleteJobId(row.id),
              },
            ]}
          />
        );
      },
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* FORM VIEW: CREATE / EDIT CAREER OPENING PAGE                              */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'form') {
    return (
      <CreateCareer
        initialCareer={editingJob}
        onBack={() => {
          setViewMode('list');
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        onSuccess={() => {
          setViewMode('list');
          fetchCareersList();
          onCloseCreateOpen && onCloseCreateOpen();
        }}
      />
    );
  }

  /* -------------------------------------------------------------------------- */
  /* DETAILS VIEW: CAREER JOB DETAILS PAGE                                     */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'details' && viewingJob) {
    const jobSkills = getSkillsArray(viewingJob.skills);
    const jobStatus = (viewingJob.status || 'draft').toLowerCase();
    const isPublished = jobStatus === 'published' || jobStatus === 'active';
    const isClosed = jobStatus === 'closed';

    return (
      <div className="flex flex-col gap-6 animate-fade-in pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Breadcrumb
              items={[
                { label: 'Dashboard', onClick: () => setViewMode('list') },
                { label: 'Careers', onClick: () => setViewMode('list') },
                { label: viewingJob.title },
              ]}
            />

            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Back to list"
              >
                <ArrowLeft size={18} />
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {viewingJob.title}
              </h1>

              <CarrerStatusUpdate
                careerId={viewingJob.id}
                currentStatus={viewingJob.status || 'draft'}
                careerTitle={viewingJob.title}
                onStatusChange={(newStatus) => {
                  setViewingJob((prev) => ({ ...prev, status: newStatus }));
                  setCareers((prev) =>
                    prev.map((c) => (c.id === viewingJob.id ? { ...c, status: newStatus } : c))
                  );
                }}
              />

              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                ID #{viewingJob.id}
              </span>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setViewMode('list')}
            >
              Back to List
            </Button>

            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => handleOpenEdit(viewingJob)}
            >
              Edit Position
            </Button>

            <Button
              variant="secondary"
              icon={isPublished ? EyeOff : Globe}
              onClick={() => handleToggleJobStatus(viewingJob)}
              isLoading={statusActionLoading[viewingJob.id]}
            >
              {isPublished ? 'Unpublish' : isClosed ? 'Reopen Position' : 'Publish'}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT / MAIN CONTENT AREA */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Briefcase size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Position Overview & Specification
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Department</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {viewingJob.department || 'Technology'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Employment Type</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 capitalize">
                    {viewingJob.employment_type ? viewingJob.employment_type.replace('_', ' ') : 'Full Time'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Required Experience</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {viewingJob.experience || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Location</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{viewingJob.location || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Qualification</div>
                  <div className="text-sm font-semibold text-slate-900 mt-1">
                    {viewingJob.qualification || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">URL Route Slug</div>
                  <div className="text-sm font-mono text-indigo-600 mt-1 truncate">
                    /careers/{viewingJob.slug || viewingJob.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Tag size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Required Skills & Technologies
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {jobSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Job Description Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Job Description & Scope
                </h2>
              </div>
              <div
                className="text-sm leading-relaxed text-slate-800 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: viewingJob.description || '<p>No description content provided.</p>',
                }}
              />
            </div>

            {/* Other Requirements Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CheckCircle2 size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Requirements & Qualifications
                </h2>
              </div>
              <div
                className="text-sm leading-relaxed text-slate-800 prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: viewingJob.requirements || '<p>No additional requirements provided.</p>',
                }}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Publishing Information Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Publishing Information
              </h3>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Lifecycle Status</span>
                  <CarrerStatusUpdate
                    careerId={viewingJob.id}
                    currentStatus={viewingJob.status || 'draft'}
                    careerTitle={viewingJob.title}
                    size="sm"
                    onStatusChange={(newStatus) => {
                      setViewingJob((prev) => ({ ...prev, status: newStatus }));
                      setCareers((prev) =>
                        prev.map((c) => (c.id === viewingJob.id ? { ...c, status: newStatus } : c))
                      );
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Created At</span>
                  <span className="text-slate-900 font-medium">
                    {formatDate(viewingJob.created_at)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Published Date</span>
                  <span className="text-slate-900 font-medium">
                    {formatDate(viewingJob.published_at)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Last Modified</span>
                  <span className="text-slate-900 font-medium">
                    {formatDate(viewingJob.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
              <Button
                variant="primary"
                icon={Edit2}
                onClick={() => handleOpenEdit(viewingJob)}
                fullWidth
              >
                Edit Career Opening
              </Button>

              <Button
                variant="secondary"
                icon={isPublished ? EyeOff : Globe}
                onClick={() => handleToggleJobStatus(viewingJob)}
                isLoading={statusActionLoading[viewingJob.id]}
                fullWidth
              >
                {isPublished ? 'Unpublish' : isClosed ? 'Reopen Position' : 'Publish'}
              </Button>

              {isPublished && (
                <Button
                  variant="secondary"
                  icon={XCircle}
                  onClick={() => handleCloseJob(viewingJob)}
                  isLoading={statusActionLoading[viewingJob.id]}
                  fullWidth
                >
                  Close Position
                </Button>
              )}

              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setDeleteJobId(viewingJob.id)}
                fullWidth
              >
                Delete Opening
              </Button>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmDialog
          isOpen={!!deleteJobId}
          onClose={() => setDeleteJobId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Career Opening?"
          message="Are you sure you want to delete this position? This action cannot be undone."
          confirmLabel="Delete Opening"
          cancelLabel="Cancel"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* LIST VIEW: CAREERS TABLE                                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Careers' }]} />
          <div className="flex items-center gap-2.5 mt-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Careers & Job Openings
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {careers.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your open career opportunities, candidate qualifications, and vacancy lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchCareersList}
            isLoading={isLoading}
          >
            Refresh
          </Button>

          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Add Career Opening
          </Button>
        </div>
      </div>

      {/* 2. FILTERS & STATUS TABS */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* Search Input */}
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by title, department, location, skills..."
            className="max-w-md w-full"
          />

          {/* Status Tabs with counts */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex-wrap">
            {[
              { id: 'all', label: 'All Openings', count: careers.length },
              {
                id: 'published',
                label: 'Published',
                count: careers.filter((c) => (c.status || '').toLowerCase() === 'published' || (c.status || '').toLowerCase() === 'active').length,
              },
              {
                id: 'draft',
                label: 'Draft',
                count: careers.filter((c) => (c.status || '').toLowerCase() === 'draft').length,
              },
              {
                id: 'closed',
                label: 'Closed',
                count: careers.filter((c) => (c.status || '').toLowerCase() === 'closed').length,
              },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10.5px] ${
                      isSelected
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          {/* Department Filter */}
          <div className="w-48">
            <Select
              fullWidth
              size="sm"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              placeholder="All Departments"
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((dept) => ({ value: dept, label: dept })),
              ]}
            />
          </div>

          {/* Employment Type Filter */}
          <div className="w-44">
            <Select
              fullWidth
              size="sm"
              value={employmentTypeFilter}
              onChange={setEmploymentTypeFilter}
              placeholder="All Work Types"
              options={[
                { value: '', label: 'All Work Types' },
                { value: 'full_time', label: 'Full Time' },
                { value: 'part_time', label: 'Part Time' },
                { value: 'contract', label: 'Contract' },
                { value: 'internship', label: 'Internship' },
                { value: 'remote', label: 'Remote' },
              ]}
            />
          </div>

          {/* Sort By Filter */}
          <div className="w-44 ml-auto">
            <Select
              fullWidth
              size="sm"
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
      </div>

      {/* 3. CAREERS DATA TABLE */}
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
        emptyTitle="No Career Openings Found"
        emptyDescription={
          search || statusFilter !== 'all' || departmentFilter || employmentTypeFilter
            ? 'No job openings match your current search or filter criteria.'
            : 'Get started by creating your first career opening.'
        }
        emptyIcon={Briefcase}
        onEmptyAction={handleOpenCreate}
        emptyActionLabel="Create Career Opening"
      />

      {/* 4. DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Career Opening?"
        message="Are you sure you want to permanently delete this career opening? This action cannot be undone."
        confirmLabel="Delete Opening"
        cancelLabel="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CareersView;
