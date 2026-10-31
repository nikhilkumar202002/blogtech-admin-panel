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
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { useToast } from '../../ui/ToastContext';
import { CreateProduct } from './CreateProduct';
import { ViewDetails } from './ViewDetails';
import {
  getProducts,
  getProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
} from '../../../utils/product.service';
import { API_BASE_URL } from '../../../utils/main.service';
import { formatImageUrl, handleImageError } from '../../../utils/image.helper';

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

  // Open Full-Page View Details: GET /admin/products/:id
  const handleOpenViewDetails = (product) => {
    setViewingProduct(product);
    setViewMode('details');
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

  // If in details mode, display the full-page ViewDetails view
  if (viewMode === 'details' && viewingProduct) {
    return (
      <ViewDetails
        product={viewingProduct}
        onBack={() => {
          setViewMode('list');
          setViewingProduct(null);
        }}
        onEdit={(prod) => {
          setEditingProduct(prod);
          setViewMode('edit');
        }}
        onRefresh={fetchProductsList}
      />
    );
  }

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
        const thumb = formatImageUrl(
          row.featured_image_path || row.featured_image_url || row.featured_image
        );
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {thumb ? (
                <img
                  src={thumb}
                  alt={row.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const initials = (row.name || 'P')
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    handleImageError(e, initials);
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
