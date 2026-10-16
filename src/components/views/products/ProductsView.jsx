import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Image as ImageIcon,
  RefreshCw,
  MoreVertical,
  Globe,
  EyeOff,
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
import { CreateProduct } from './CreateProduct';
import {
  getProducts,
  getProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
} from '../../../utils/product.service';

const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

const parseGalleryImages = (prod) => {
  if (!prod) return [];
  const urls = prod.gallery_image_urls || prod.gallery_images || prod.images || [];
  const paths = prod.gallery_image_paths || [];

  let list = urls;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [list];
    }
  }
  if (!Array.isArray(list)) return [];

  return list.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: index + 1,
        index: index + 1,
        url: formatImageUrl(item),
        path: paths[index] || null,
        raw: item,
      };
    }
    return {
      id: item.id || index + 1,
      index: index + 1,
      url: formatImageUrl(item.url || item.image_url || item.path || item.image || ''),
      path: item.path || paths[index] || null,
      raw: item,
    };
  });
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
  } catch (e) {
    return dateStr.split('T')[0];
  }
};

export const ProductsView = ({ onNavigate }) => {
  const { addToast } = useToast();

  // Mode: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [editingProduct, setEditingProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'unpublished'

  // Single Product Quick View Modal State (read-only review)
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete Product Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Action Loading tracker (id -> boolean)
  const [statusActionLoading, setStatusActionLoading] = useState({});

  // 1. Fetch products list from API: GET /admin/products
  const fetchProductsList = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.products)) {
        list = res.products;
      }

      setProducts(list);
      setPaginationMeta(res?.meta || res?.data?.meta || null);
    } catch (err) {
      console.warn('Could not load products from /admin/products:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (prod.name && prod.name.toLowerCase().includes(q)) ||
      (prod.slug && prod.slug.toLowerCase().includes(q)) ||
      (prod.short_description && prod.short_description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' ||
      (prod.status && prod.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Open Full-Page Create View
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setViewMode('create');
  };

  // Open Full-Page Edit View
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setViewMode('edit');
  };

  // Open View Details Drawer: GET /admin/products/:id
  const handleOpenViewDetails = async (product) => {
    setViewingProduct(product);
    setIsLoadingDetails(true);
    try {
      const res = await getProduct(product.id);
      const fresh = res?.data || res?.product || res;
      if (fresh) {
        setViewingProduct(fresh);
      }
    } catch (err) {
      console.warn('Could not fetch product details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Toggle Publish / Unpublish:
  // PATCH /admin/products/:id/publish OR PATCH /admin/products/:id/unpublish
  const handleTogglePublish = async (product) => {
    const isCurrentlyPublished = product.status === 'published';
    setStatusActionLoading((prev) => ({ ...prev, [product.id]: true }));

    try {
      if (isCurrentlyPublished) {
        await unpublishProduct(product.id);
        addToast({
          title: 'Product Unpublished',
          message: `"${product.name}" is now unpublished.`,
          type: 'info',
        });
      } else {
        await publishProduct(product.id);
        addToast({
          title: 'Product Published',
          message: `"${product.name}" is now live and published!`,
          type: 'success',
        });
      }

      // Update state locally & refresh
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, status: isCurrentlyPublished ? 'unpublished' : 'published' }
            : p
        )
      );
    } catch (err) {
      addToast({
        title: isCurrentlyPublished ? 'Unpublish Failed' : 'Publish Failed',
        message: err?.response?.data?.message || 'Could not update publication status.',
        type: 'error',
      });
    } finally {
      setStatusActionLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Delete Product: DELETE /admin/products/:id
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteId);
      addToast({
        title: 'Product Deleted',
        message: 'The product has been permanently removed.',
        type: 'success',
      });
      setDeleteId(null);
      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete product.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // If in create or edit mode, display the full-page CreateProduct form
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <CreateProduct
        initialProduct={editingProduct}
        onBack={() => {
          setViewMode('list');
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setViewMode('list');
          setEditingProduct(null);
          fetchProductsList();
        }}
      />
    );
  }

  // Status Counts
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const unpublishedCount = products.filter((p) => p.status === 'unpublished').length;

  // Table Columns
  const columns = [
    {
      header: 'Product',
      key: 'name',
      sortable: true,
      render: (row) => {
        const thumb = formatImageUrl(row.featured_image_url || row.featured_image);
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
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
                <Package size={22} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0">
              <div
                className="text-[13.5px] font-semibold text-slate-900 truncate max-w-xs hover:text-indigo-600 cursor-pointer"
                onClick={() => handleOpenViewDetails(row)}
                title="View product details"
              >
                {row.name}
              </div>
              {row.short_description ? (
                <div className="text-[12px] text-slate-500 truncate max-w-sm">
                  {row.short_description}
                </div>
              ) : (
                <div className="text-[11.5px] text-slate-400 font-mono truncate max-w-xs">
                  /{row.slug}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Gallery',
      key: 'gallery_images',
      align: 'center',
      render: (row) => {
        const g = parseGalleryImages(row);
        if (!g.length) {
          return <span className="text-xs text-slate-400 italic">None</span>;
        }
        return (
          <div
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
            onClick={() => handleOpenEdit(row)}
            title="Manage gallery images on edit page"
          >
            <ImageIcon size={12} className="text-indigo-600" />
            <span>
              {g.length} {g.length === 1 ? 'image' : 'images'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Order',
      key: 'sort_order',
      sortable: true,
      align: 'center',
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
      header: 'Published At',
      key: 'published_at',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
          <Calendar size={13} className="text-slate-400" />
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
            onClick={() => handleTogglePublish(row)}
            title={isPublished ? 'Click to unpublish' : 'Click to publish'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isBusy ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : isPublished ? (
              <Globe size={13} className="text-emerald-600" />
            ) : (
              <EyeOff size={13} className="text-amber-600" />
            )}
            <span>{isPublished ? 'Published' : 'Publish Now'}</span>
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
              title="Product Actions"
            >
              <MoreVertical size={16} />
            </button>
          }
          items={[
            {
              label: 'View Details',
              icon: Eye,
              onClick: () => handleOpenViewDetails(row),
            },
            {
              label: 'Edit Product',
              icon: Edit2,
              onClick: () => handleOpenEdit(row),
            },
            {
              label: row.status === 'published' ? 'Unpublish' : 'Publish',
              icon: row.status === 'published' ? EyeOff : Globe,
              onClick: () => handleTogglePublish(row),
            },
            { divider: true },
            {
              label: 'Delete Product',
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
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Products' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your software solutions, featured media, photo galleries, and publication lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchProductsList}
            isLoading={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* TOP FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search products by title, slug, or summary..."
          className="max-w-md w-full"
        />

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full shadow-xs">
          {[
            { id: 'all', label: 'All Products', count: products.length },
            { id: 'published', label: 'Published', count: publishedCount },
            { id: 'draft', label: 'Draft', count: draftCount },
            { id: 'unpublished', label: 'Unpublished', count: unpublishedCount },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10.5px] ${
                    isActive ? 'bg-indigo-700/60 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={isLoading}
        emptyTitle="No Products Found"
        emptyDescription={
          search || statusFilter !== 'all'
            ? 'No products match your active search filters.'
            : 'Get started by creating your first product item.'
        }
        emptyIcon={Package}
        emptyActionLabel="Add Product"
        onEmptyAction={handleOpenCreate}
      />

      {/* SINGLE PRODUCT DETAILS MODAL (Read-Only Review) */}
      <Modal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        title={viewingProduct?.name || 'Product Details'}
        subtitle={`Viewing full specifications for ID #${viewingProduct?.id || ''}`}
        maxWidth="740px"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => {
                const prod = viewingProduct;
                setViewingProduct(null);
                handleOpenEdit(prod);
              }}
            >
              Edit Product
            </Button>
            <Button variant="primary" onClick={() => setViewingProduct(null)}>
              Done
            </Button>
          </div>
        }
      >
        {viewingProduct && (
          <div className="flex flex-col gap-5">
            {/* Featured Image Banner */}
            <div className="w-full h-56 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center relative p-3">
              {viewingProduct.featured_image || viewingProduct.featured_image_url ? (
                <img
                  src={formatImageUrl(
                    viewingProduct.featured_image_url || viewingProduct.featured_image
                  )}
                  alt={viewingProduct.name}
                  className="max-w-full max-h-full object-contain rounded"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <Package size={36} />
                  <span className="text-xs">No featured image uploaded</span>
                </div>
              )}
            </div>

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </div>
                <div className="mt-1">
                  <Badge
                    status={
                      viewingProduct.status === 'published'
                        ? 'Active'
                        : viewingProduct.status === 'draft'
                        ? 'Draft'
                        : 'Closed'
                    }
                  >
                    {viewingProduct.status || 'Draft'}
                  </Badge>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Display Order
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  #{viewingProduct.sort_order ?? 1}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Published Date
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {formatDate(viewingProduct.published_at)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  URL Slug
                </div>
                <div className="text-xs font-mono text-slate-700 truncate mt-1">
                  /{viewingProduct.slug}
                </div>
              </div>
            </div>

            {/* Short Description */}
            {viewingProduct.short_description && (
              <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-medium leading-relaxed">
                {viewingProduct.short_description}
              </div>
            )}

            {/* Overview */}
            {viewingProduct.description && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-slate-700">Overview</div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  {viewingProduct.description}
                </div>
              </div>
            )}

            {/* Content HTML Display */}
            {viewingProduct.content && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-slate-700">Product Content</div>
                <div
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed prose prose-slate max-w-none prose-sm"
                  dangerouslySetInnerHTML={{ __html: viewingProduct.content }}
                />
              </div>
            )}

            {/* Gallery Images Strip */}
            {parseGalleryImages(viewingProduct).length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-slate-700">
                  Gallery Photos ({parseGalleryImages(viewingProduct).length})
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {parseGalleryImages(viewingProduct).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="w-24 h-24 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-2xs"
                    >
                      <img
                        src={item.url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Metadata */}
            {(viewingProduct.meta_title || viewingProduct.meta_description) && (
              <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-3">
                <div className="text-xs font-bold text-slate-700">SEO Meta</div>
                <div className="text-xs text-slate-600">
                  <strong>Title:</strong> {viewingProduct.meta_title || 'None'}
                </div>
                <div className="text-xs text-slate-600">
                  <strong>Description:</strong> {viewingProduct.meta_description || 'None'}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE DIALOG: DELETE /admin/products/:id */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product?"
        message="Are you sure you want to permanently delete this product? All gallery images and product associations will be removed."
        confirmLabel="Delete Product"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductsView;
