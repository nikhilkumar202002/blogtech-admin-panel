import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Archive,
  RefreshCw,
  MoreVertical,
  UploadCloud,
  X,
  Globe,
  EyeOff,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DataTable } from '../ui/DataTable';
import { SearchInput } from '../ui/SearchInput';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Breadcrumb } from '../ui/Breadcrumb';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useToast } from '../ui/ToastContext';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  uploadFeaturedImage,
  deleteFeaturedImage,
  uploadGalleryImages,
  deleteGalleryImage,
} from '../../utils/product.service';

const generateSlug = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

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
  let rawList = prod.gallery_images || prod.images || [];
  if (typeof rawList === 'string') {
    try {
      rawList = JSON.parse(rawList);
    } catch (e) {
      rawList = [rawList];
    }
  }
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: index + 1,
        url: formatImageUrl(item),
        raw: item,
      };
    }
    return {
      id: item.id || index + 1,
      url: formatImageUrl(item.url || item.image_url || item.path || item.image || ''),
      raw: item,
    };
  });
};

export const ProductsView = ({ onNavigate }) => {
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft' | 'unpublished'

  // Modal State for Create / Edit / Media Manager
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('details'); // 'details' | 'featured' | 'gallery'
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    content: '',
    status: 'published',
    featured_image: '',
    published_at: new Date().toISOString().split('T')[0],
  });
  const [formErrors, setFormErrors] = useState({});

  // Media upload & delete states
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [isDeletingFeatured, setIsDeletingFeatured] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deletingGalleryId, setDeletingGalleryId] = useState(null);

  // Single Product Quick View State
  const [viewingProduct, setViewingProduct] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete Product Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Action Loading tracker (id -> boolean)
  const [statusActionLoading, setStatusActionLoading] = useState({});

  const featuredFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  // 1. Fetch products list from API: GET /admin/products
  const fetchProductsList = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      const list = res?.data || res?.products || (Array.isArray(res) ? res : []);
      setProducts(list);
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
    const matchesSearch =
      !search ||
      (prod.name && prod.name.toLowerCase().includes(search.toLowerCase())) ||
      (prod.slug && prod.slug.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (prod.status && prod.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setActiveModalTab('details');
    setFormData({
      name: '',
      slug: '',
      content: '',
      status: 'published',
      featured_image: '',
      published_at: new Date().toISOString().split('T')[0],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit & Media Modal: Fetches fresh product details via GET /admin/products/:id
  const handleOpenEdit = async (product, initialTab = 'details') => {
    setActiveModalTab(initialTab);
    setFormErrors({});
    setIsModalOpen(true);

    // Populate initial state immediately
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      content: product.content || '',
      status: product.status || 'published',
      featured_image: product.featured_image || product.featured_image_url || '',
      published_at: product.published_at ? product.published_at.split('T')[0] : '',
    });

    // Fetch single product details directly via GET /admin/products/:id
    try {
      const res = await getProduct(product.id);
      const fresh = res?.data || res?.product || res;
      if (fresh && fresh.id) {
        setEditingProduct(fresh);
        setFormData({
          name: fresh.name || '',
          slug: fresh.slug || '',
          content: fresh.content || '',
          status: fresh.status || 'published',
          featured_image: fresh.featured_image || fresh.featured_image_url || '',
          published_at: fresh.published_at ? fresh.published_at.split('T')[0] : '',
        });
      }
    } catch (err) {
      console.warn('Could not load fresh product details via /admin/products/:id:', err?.message || err);
    }
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

  // Save Product (Create via POST /admin/products or Update via PUT /admin/products/:id)
  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setActiveModalTab('details');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.name),
      };

      if (editingProduct?.id) {
        // PUT /admin/products/:id
        const res = await updateProduct(editingProduct.id, payload);
        const updated = res?.data || res?.product || { ...editingProduct, ...payload };
        setEditingProduct(updated);

        addToast({
          title: 'Product Updated',
          message: `"${formData.name}" has been updated successfully.`,
          type: 'success',
        });
      } else {
        // POST /admin/products
        const res = await createProduct(payload);
        const created = res?.data || res?.product || null;

        addToast({
          title: 'Product Created',
          message: `"${formData.name}" has been created successfully.`,
          type: 'success',
        });

        if (created?.id) {
          // Switch to edit mode with media tabs available
          setEditingProduct(created);
        } else {
          setIsModalOpen(false);
        }
      }

      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: err?.response?.data?.message || 'Failed to save product details.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish / Unpublish:
  // PATCH /admin/products/:id/publish OR PATCH /admin/products/:id/unpublish
  const handleTogglePublish = async (product) => {
    const isCurrentlyPublished = product.status === 'published';
    setStatusActionLoading((prev) => ({ ...prev, [product.id]: true }));

    try {
      if (isCurrentlyPublished) {
        // PATCH /admin/products/:id/unpublish
        await unpublishProduct(product.id);
        addToast({
          title: 'Product Unpublished',
          message: `"${product.name}" is now unpublished.`,
          type: 'info',
        });
      } else {
        // PATCH /admin/products/:id/publish
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

      if (editingProduct?.id === product.id) {
        setEditingProduct((prev) => ({
          ...prev,
          status: isCurrentlyPublished ? 'unpublished' : 'published',
        }));
        setFormData((prev) => ({
          ...prev,
          status: isCurrentlyPublished ? 'unpublished' : 'published',
        }));
      }
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

  // Upload Featured Image: POST /admin/products/:id/featured-image
  const handleFeaturedImageUpload = async (file) => {
    if (!file || !editingProduct?.id) return;

    setIsUploadingFeatured(true);
    try {
      const res = await uploadFeaturedImage(editingProduct.id, file);
      const updatedProduct = res?.data || res?.product || null;

      addToast({
        title: 'Featured Image Uploaded',
        message: 'Product featured image updated successfully.',
        type: 'success',
      });

      if (updatedProduct) {
        setEditingProduct(updatedProduct);
        setFormData((prev) => ({
          ...prev,
          featured_image: updatedProduct.featured_image || updatedProduct.featured_image_url || '',
        }));
      } else {
        // Re-fetch product
        const freshRes = await getProduct(editingProduct.id);
        const fresh = freshRes?.data || freshRes?.product || freshRes;
        if (fresh) {
          setEditingProduct(fresh);
        }
      }
      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Upload Failed',
        message: err?.response?.data?.message || 'Failed to upload featured image.',
        type: 'error',
      });
    } finally {
      setIsUploadingFeatured(false);
      if (featuredFileInputRef.current) featuredFileInputRef.current.value = '';
    }
  };

  // Delete Featured Image: DELETE /admin/products/:id/featured-image
  const handleDeleteFeaturedImage = async () => {
    if (!editingProduct?.id) return;

    setIsDeletingFeatured(true);
    try {
      await deleteFeaturedImage(editingProduct.id);
      addToast({
        title: 'Featured Image Removed',
        message: 'The featured image has been deleted.',
        type: 'success',
      });

      setEditingProduct((prev) => ({
        ...prev,
        featured_image: null,
        featured_image_url: null,
      }));
      setFormData((prev) => ({
        ...prev,
        featured_image: '',
      }));
      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete featured image.',
        type: 'error',
      });
    } finally {
      setIsDeletingFeatured(false);
    }
  };

  // Upload Gallery Images: POST /admin/products/:id/images
  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0 || !editingProduct?.id) return;

    setIsUploadingGallery(true);
    try {
      const res = await uploadGalleryImages(editingProduct.id, files);
      addToast({
        title: 'Gallery Images Uploaded',
        message: `${files.length} image(s) added to product gallery.`,
        type: 'success',
      });

      // Refresh product details
      const freshRes = await getProduct(editingProduct.id);
      const fresh = freshRes?.data || freshRes?.product || freshRes;
      if (fresh) {
        setEditingProduct(fresh);
      }
      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Gallery Upload Failed',
        message: err?.response?.data?.message || 'Failed to upload gallery images.',
        type: 'error',
      });
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  // Delete Gallery Image: DELETE /admin/products/:productId/images/:imageId
  const handleDeleteGalleryImage = async (imageId) => {
    if (!editingProduct?.id || !imageId) return;

    setDeletingGalleryId(imageId);
    try {
      await deleteGalleryImage(editingProduct.id, imageId);
      addToast({
        title: 'Image Removed',
        message: 'Gallery image removed successfully.',
        type: 'success',
      });

      // Update gallery locally
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const currentList = parseGalleryImages(prev);
        const filtered = currentList.filter((img) => img.id !== imageId && img.raw?.id !== imageId);
        return {
          ...prev,
          gallery_images: filtered.map((i) => i.raw || i.url),
        };
      });

      // Sync fresh details
      const freshRes = await getProduct(editingProduct.id);
      const fresh = freshRes?.data || freshRes?.product || freshRes;
      if (fresh) setEditingProduct(fresh);

      fetchProductsList();
    } catch (err) {
      addToast({
        title: 'Remove Failed',
        message: err?.response?.data?.message || 'Could not remove gallery image.',
        type: 'error',
      });
    } finally {
      setDeletingGalleryId(null);
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

  // Status Counts
  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const unpublishedCount = products.filter((p) => p.status === 'unpublished').length;

  const currentGalleryList = parseGalleryImages(editingProduct);

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
            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
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
                <Package size={20} className="text-slate-400" />
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
              <div className="text-[11.5px] text-slate-500 font-mono truncate max-w-xs">
                /{row.slug}
              </div>
            </div>
          </div>
        );
      },
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
      header: 'Publication Date',
      key: 'published_at',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.published_at ? row.published_at.split('T')[0] : 'Not scheduled'}
        </span>
      ),
    },
    {
      header: 'Quick Publish',
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
              label: 'Edit Details',
              icon: Edit2,
              onClick: () => handleOpenEdit(row, 'details'),
            },
            {
              label: 'Manage Media & Images',
              icon: ImageIcon,
              onClick: () => handleOpenEdit(row, 'featured'),
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
      {/* Hidden file inputs for programmatic triggering */}
      <input
        type="file"
        ref={featuredFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFeaturedImageUpload(e.target.files[0]);
          }
        }}
      />
      <input
        type="file"
        ref={galleryFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleGalleryUpload(e.target.files);
          }
        }}
      />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: 'Dashboard' }, { label: 'Products' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Products Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your catalog items, featured images, gallery photos, and publishing lifecycle.
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
          placeholder="Search products by title or slug..."
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

      {/* CREATE / EDIT / MEDIA MANAGER MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
        subtitle={
          editingProduct
            ? 'Update product details, upload featured media, or manage photo gallery.'
            : 'Create a new product item in your catalog.'
        }
        maxWidth="760px"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              {editingProduct?.id && (
                <span className="font-mono">ID: #{editingProduct.id}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              {activeModalTab === 'details' && (
                <Button
                  variant="primary"
                  onClick={handleSaveProduct}
                  isLoading={isSaving}
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Tabs header for existing products */}
          {editingProduct?.id ? (
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              {[
                { id: 'details', label: 'Product Details', icon: FileText },
                { id: 'featured', label: 'Featured Image', icon: ImageIcon },
                {
                  id: 'gallery',
                  label: `Gallery (${currentGalleryList.length})`,
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveModalTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* TAB 1: DETAILS */}
          {activeModalTab === 'details' && (
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <FormField label="Product Name" required error={formErrors.name}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      name: val,
                      slug: editingProduct ? formData.slug : generateSlug(val),
                    });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                  placeholder="e.g. Smart Watch Series 7"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </FormField>

              <FormField label="URL Slug" hint="Unique URL identifier for routing to this product.">
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                  <span className="px-3 text-xs text-slate-500 bg-slate-100 border-r border-slate-200 select-none">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: generateSlug(e.target.value) })
                    }
                    placeholder="smart-watch-series-7"
                    className="w-full px-3 py-2 text-sm text-slate-900 bg-white outline-none focus:bg-white"
                  />
                </div>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Publishing Status" required>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </FormField>

                <FormField label="Publication Date">
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </FormField>
              </div>

              <FormField label="Product Description / Content">
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide detailed specifications, features, or description..."
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-sans"
                />
              </FormField>
            </form>
          )}

          {/* TAB 2: FEATURED IMAGE */}
          {activeModalTab === 'featured' && editingProduct && (
            <div className="flex flex-col gap-4">
              <div className="text-xs text-slate-500">
                Upload or manage the primary display image for{' '}
                <strong className="text-slate-700">{editingProduct.name}</strong>.
              </div>

              {editingProduct.featured_image || editingProduct.featured_image_url ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col relative group">
                  <div className="h-64 w-full flex items-center justify-center overflow-hidden bg-slate-950">
                    <img
                      src={formatImageUrl(
                        editingProduct.featured_image_url || editingProduct.featured_image
                      )}
                      alt={editingProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">
                        Current Featured Image
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">
                        {editingProduct.featured_image || editingProduct.featured_image_url}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={UploadCloud}
                        onClick={() => featuredFileInputRef.current?.click()}
                        isLoading={isUploadingFeatured}
                      >
                        Replace Image
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={handleDeleteFeaturedImage}
                        isLoading={isDeletingFeatured}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => featuredFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-indigo-50/40 transition-colors cursor-pointer text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600">
                    {isUploadingFeatured ? (
                      <RefreshCw size={22} className="animate-spin" />
                    ) : (
                      <UploadCloud size={24} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {isUploadingFeatured ? 'Uploading...' : 'Click to Upload Featured Image'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WebP (Max 5MB)
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={UploadCloud}
                    isLoading={isUploadingFeatured}
                  >
                    Select Image File
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GALLERY IMAGES */}
          {activeModalTab === 'gallery' && editingProduct && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">
                    Photo gallery for <strong className="text-slate-700">{editingProduct.name}</strong>.
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  icon={UploadCloud}
                  onClick={() => galleryFileInputRef.current?.click()}
                  isLoading={isUploadingGallery}
                >
                  Upload Gallery Photos
                </Button>
              </div>

              {currentGalleryList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {currentGalleryList.map((item, idx) => {
                    const isDeletingThis = deletingGalleryId === item.id;
                    return (
                      <div
                        key={item.id || idx}
                        className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-square flex items-center justify-center shadow-2xs hover:shadow-md transition-shadow"
                      >
                        <img
                          src={item.url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Top index badge */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/70 text-[10px] text-white font-mono">
                          #{idx + 1}
                        </div>

                        {/* Delete overlay button */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isDeletingThis}
                            onClick={() => handleDeleteGalleryImage(item.id)}
                            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                            title="Delete this gallery photo"
                          >
                            {isDeletingThis ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-indigo-50/40 transition-colors cursor-pointer text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600">
                    {isUploadingGallery ? (
                      <RefreshCw size={22} className="animate-spin" />
                    ) : (
                      <Layers size={24} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      No Gallery Images Yet
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Upload multiple product angle shots or lifestyle photos
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={UploadCloud}
                    isLoading={isUploadingGallery}
                  >
                    Select Photos to Upload
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* SINGLE PRODUCT DETAILS MODAL (GET /admin/products/:id) */}
      <Modal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        title={viewingProduct?.name || 'Product Details'}
        subtitle={`Viewing full specifications for ID #${viewingProduct?.id || ''}`}
        maxWidth="680px"
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
            <div className="w-full h-48 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {viewingProduct.featured_image || viewingProduct.featured_image_url ? (
                <img
                  src={formatImageUrl(
                    viewingProduct.featured_image_url || viewingProduct.featured_image
                  )}
                  alt={viewingProduct.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <Package size={32} />
                  <span className="text-xs">No featured image uploaded</span>
                </div>
              )}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  Publication Date
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {viewingProduct.published_at
                    ? viewingProduct.published_at.split('T')[0]
                    : 'Unscheduled'}
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

            {/* Description */}
            {viewingProduct.content && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-bold text-slate-700">Description</div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {viewingProduct.content}
                </div>
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
                      className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-slate-100"
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
