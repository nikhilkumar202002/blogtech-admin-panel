import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  MoreVertical,
  Globe,
  EyeOff,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { DataTable } from '../../ui/DataTable';
import { SearchInput } from '../../ui/SearchInput';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { useToast } from '../../ui/ToastContext';
import { CreateService } from './CreateService';
import {
  getServices,
  getService,
  publishService,
  unpublishService,
  deleteService,
} from '../../../utils/ourservice.service';

const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

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

const INITIAL_SERVICES = [
  {
    id: 1,
    name: 'Web Development',
    slug: 'web-development',
    short_description: 'Modern, responsive websites built for scale, performance, and conversions.',
    description: 'We provide professional website development services using modern React, Next.js, and high-throughput backend APIs.',
    content: '<h2>Professional Web Development</h2><p>Custom websites and web applications built with cutting-edge engineering standards.</p>',
    featured_image_url: '',
    status: 'published',
    sort_order: 1,
    published_at: '2026-10-16T08:00:00Z',
    created_at: '2026-10-16T08:00:00Z',
    updated_at: '2026-10-16T08:00:00Z',
  },
  {
    id: 2,
    name: 'Custom ERP Solutions',
    slug: 'custom-erp-solutions',
    short_description: 'Streamline business operations with an integrated enterprise ERP software.',
    description: 'Tailored ERP software designed to manage inventory, billing, sales pipelines, and financial ledgers.',
    content: '<h2>Enterprise ERP Architecture</h2><p>Designed for multi-branch retailers, wholesalers, and manufacturers.</p>',
    featured_image_url: '',
    status: 'published',
    sort_order: 2,
    published_at: '2026-10-16T08:15:00Z',
    created_at: '2026-10-16T08:15:00Z',
    updated_at: '2026-10-16T08:15:00Z',
  },
  {
    id: 3,
    name: 'Cloud Infrastructure & DevOps',
    slug: 'cloud-infrastructure-devops',
    short_description: 'Scalable AWS & GCP architectures with automated CI/CD and zero downtime.',
    description: 'Modernize server infrastructure with Kubernetes, automated scaling, continuous deployments, and disaster recovery.',
    content: '<h2>Cloud & DevOps Engineering</h2><p>Automate deployments and maintain 99.99% uptime SLAs.</p>',
    featured_image_url: '',
    status: 'draft',
    sort_order: 3,
    published_at: null,
    created_at: '2026-10-16T08:30:00Z',
    updated_at: '2026-10-16T08:30:00Z',
  },
];

export const ServiceList = ({ onNavigate }) => {
  const { addToast } = useToast();

  // View Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingService, setEditingService] = useState(null);

  const [services, setServices] = useState(INITIAL_SERVICES);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'unpublished'

  // Read-only Details Review Modal State: GET /admin/services/:id
  const [viewingService, setViewingService] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete Confirm State: DELETE /admin/services/:id
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Action Loading tracker (id -> boolean)
  const [statusActionLoading, setStatusActionLoading] = useState({});

  // 1. Fetch services list from API: GET /admin/services
  const fetchServicesList = async () => {
    setIsLoading(true);
    try {
      const res = await getServices();
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.services)) {
        list = res.services;
      }

      if (list && list.length > 0) {
        setServices(list);
      }
    } catch (err) {
      console.warn('Could not sync /admin/services:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesList();
  }, []);

  // Open Full-Page Create View
  const handleOpenCreate = () => {
    setEditingService(null);
    setViewMode('create');
  };

  // Open Full-Page Edit View
  const handleOpenEdit = (service) => {
    setEditingService(service);
    setViewMode('edit');
  };

  // Open Details Modal: GET /admin/services/:id
  const handleOpenDetails = async (service) => {
    setViewingService(service);
    setIsLoadingDetails(true);
    try {
      const res = await getService(service.id);
      const fresh = res?.data || res?.service || res;
      if (fresh) {
        setViewingService(fresh);
      }
    } catch (err) {
      console.warn('Could not fetch service details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Toggle publish / unpublish:
  // PATCH /admin/services/:id/publish OR PATCH /admin/services/:id/unpublish
  const handleToggleStatus = async (service) => {
    const isPublished = service.status === 'published';
    setStatusActionLoading((prev) => ({ ...prev, [service.id]: true }));

    try {
      if (isPublished) {
        await unpublishService(service.id);
        addToast({
          title: 'Service Unpublished',
          message: `"${service.name}" is now unpublished.`,
          type: 'info',
        });
      } else {
        await publishService(service.id);
        addToast({
          title: 'Service Published',
          message: `"${service.name}" is now live and published!`,
          type: 'success',
        });
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id
            ? { ...s, status: isPublished ? 'draft' : 'published' }
            : s
        )
      );
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || 'Could not update publication status.',
        type: 'error',
      });
    } finally {
      setStatusActionLoading((prev) => ({ ...prev, [service.id]: false }));
    }
  };

  // Delete Service: DELETE /admin/services/:id
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteService(deleteId);
      addToast({
        title: 'Service Deleted',
        message: 'The service has been permanently deleted.',
        type: 'success',
      });
      setServices((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete service.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // If in create or edit mode, display the dedicated full-page CreateService form
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <CreateService
        initialService={editingService}
        onBack={() => {
          setViewMode('list');
          setEditingService(null);
        }}
        onSuccess={() => {
          setViewMode('list');
          setEditingService(null);
          fetchServicesList();
        }}
      />
    );
  }

  // Filtered Services List
  const filteredServices = services.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.slug && s.slug.toLowerCase().includes(q)) ||
      (s.short_description && s.short_description.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' || (s.status && s.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Table Columns
  const columns = [
    {
      header: 'Service Offering',
      key: 'name',
      sortable: true,
      render: (row) => {
        const thumb = formatImageUrl(row.featured_image_url || row.featured_image);
        return (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {thumb ? (
                <img
                  src={thumb}
                  alt={row.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <Wrench size={20} className="text-indigo-600" />
              )}
            </div>
            <div className="min-w-0">
              <div
                className="text-[13.5px] font-semibold text-slate-900 truncate max-w-xs hover:text-indigo-600 cursor-pointer"
                onClick={() => handleOpenDetails(row)}
                title="Click to view full service details"
              >
                {row.name}
              </div>
              <div className="text-[12px] text-slate-500 truncate max-w-sm">
                {row.short_description || row.description || `/${row.slug || ''}`}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Order',
      key: 'sort_order',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          #{row.sort_order ?? 1}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const s = (row.status || 'draft').toLowerCase();
        let badgeType = 'default';
        if (s === 'published') badgeType = 'Active';
        else if (s === 'draft') badgeType = 'Draft';
        else if (s === 'unpublished') badgeType = 'Closed';

        return (
          <Badge status={badgeType}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Published Schedule',
      key: 'published_at',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
          <Clock size={13} className="text-slate-400" />
          <span>{formatDate(row.published_at)}</span>
        </div>
      ),
    },
    {
      header: 'Quick Action',
      key: 'quick_status',
      align: 'center',
      render: (row) => {
        const isPublished = row.status === 'published';
        const isBusy = statusActionLoading[row.id];

        return (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isBusy ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : isPublished ? (
              <Globe size={13} />
            ) : (
              <EyeOff size={13} />
            )}
            <span>{isPublished ? 'Published' : 'Publish'}</span>
          </button>
        );
      },
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Service Actions"
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
              label: 'Edit Service',
              icon: Edit2,
              onClick: () => handleOpenEdit(row),
            },
            {
              label: row.status === 'published' ? 'Unpublish' : 'Publish',
              icon: row.status === 'published' ? EyeOff : Globe,
              onClick: () => handleToggleStatus(row),
            },
            { divider: true },
            {
              label: 'Delete Service',
              icon: Trash2,
              danger: true,
              onClick: () => setDeleteId(row.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Services' }]} />
          <div className="flex items-center gap-2.5 mt-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Services Catalog
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {services.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your service offerings, descriptions, content specifications, and publication lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchServicesList}
            isLoading={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Add Service
          </Button>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search services by title, summary, or description..."
          className="max-w-md w-full"
        />

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          {[
            { id: 'all', label: 'All Services', count: services.length },
            { id: 'published', label: 'Published', count: services.filter((s) => s.status === 'published').length },
            { id: 'draft', label: 'Draft', count: services.filter((s) => s.status === 'draft').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] ${
                  statusFilter === tab.id
                    ? 'bg-indigo-700/60 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredServices}
        isLoading={isLoading}
        emptyTitle="No Services Found"
        emptyDescription={
          search || statusFilter !== 'all'
            ? 'No service offerings match your active search filter.'
            : 'Get started by creating your first service offering.'
        }
        emptyIcon={Wrench}
        emptyActionLabel="Add Service"
        onEmptyAction={handleOpenCreate}
      />

      {/* READ-ONLY DETAILS REVIEW MODAL: GET /admin/services/:id */}
      <Modal
        isOpen={Boolean(viewingService)}
        onClose={() => setViewingService(null)}
        title={viewingService?.name || 'Service Details'}
        subtitle={`Viewing specifications for ID #${viewingService?.id || ''}`}
        maxWidth="740px"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => {
                const s = viewingService;
                setViewingService(null);
                handleOpenEdit(s);
              }}
            >
              Edit Service
            </Button>
            <Button variant="primary" onClick={() => setViewingService(null)}>
              Done
            </Button>
          </div>
        }
      >
        {viewingService && (
          <div className="flex flex-col gap-5">
            {/* Featured Image Hero */}
            {viewingService.featured_image || viewingService.featured_image_url ? (
              <div className="w-full h-56 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center p-3 relative">
                <img
                  src={formatImageUrl(
                    viewingService.featured_image_url || viewingService.featured_image
                  )}
                  alt={viewingService.name}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            ) : null}

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
                <div className="mt-1">
                  <Badge
                    status={
                      viewingService.status === 'published'
                        ? 'Active'
                        : viewingService.status === 'draft'
                        ? 'Draft'
                        : 'Closed'
                    }
                  >
                    {viewingService.status || 'Draft'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Sort Order
                </span>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  #{viewingService.sort_order ?? 1}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Published Date
                </span>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {formatDate(viewingService.published_at)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Route Slug
                </span>
                <div className="text-xs font-mono text-slate-700 truncate mt-1">
                  /{viewingService.slug || 'n/a'}
                </div>
              </div>
            </div>

            {/* Short Description */}
            {viewingService.short_description && (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 font-medium leading-relaxed">
                  {viewingService.short_description}
                </div>
              </div>
            )}

            {/* Full Description */}
            {viewingService.description && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Service Description
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {viewingService.description}
                </p>
              </div>
            )}

            {/* Rendered HTML Content */}
            {viewingService.content && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Content & Scope
                </span>
                <div
                  className="product-rich-content bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs"
                  dangerouslySetInnerHTML={{ __html: viewingService.content }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE DIALOG: DELETE /admin/services/:id */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Service?"
        message="Are you sure you want to permanently delete this service offering? This action cannot be undone."
        confirmLabel="Delete Service"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ServiceList;