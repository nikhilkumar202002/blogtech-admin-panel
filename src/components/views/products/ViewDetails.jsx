import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Calendar,
  Clock,
  Package,
  Layers,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  FileText,
  Hash,
  RefreshCw,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { useToast } from '../../ui/ToastContext';
import {
  getProduct,
  publishProduct,
  unpublishProduct,
  deleteProduct,
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

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unscheduled';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return '';
  }
};

export const ViewDetails = ({
  product: initialProduct,
  onBack,
  onEdit,
  onRefresh,
}) => {
  const { addToast } = useToast();

  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Content display mode: 'rendered' | 'source'
  const [contentViewMode, setContentViewMode] = useState('rendered');

  // Raw API JSON Inspector toggle
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  // Interactive Lightbox State
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    currentIndex: 0,
    items: [],
  });

  // 1-Click Copy state
  const [hasCopiedSlug, setHasCopiedSlug] = useState(false);

  // Parse Gallery Images into structured objects
  const rawGalleryUrls = product?.gallery_image_urls || product?.gallery_images || [];
  const rawGalleryPaths = product?.gallery_image_paths || [];
  const galleryItems = Array.isArray(rawGalleryUrls)
    ? rawGalleryUrls.map((url, idx) => ({
        url: formatImageUrl(typeof url === 'string' ? url : url?.url || ''),
        path: rawGalleryPaths[idx] || (typeof url === 'object' ? url?.path : null) || `gallery-image-${idx + 1}.jpg`,
        index: idx + 1,
      }))
    : [];

  const featuredImage = formatImageUrl(product?.featured_image_url || product?.featured_image);

  // All viewable media items for lightbox (featured + gallery)
  const allMediaItems = [];
  if (featuredImage) {
    allMediaItems.push({
      url: featuredImage,
      title: 'Featured Image (Hero)',
      path: product?.featured_image_path || 'Featured Image',
    });
  }
  galleryItems.forEach((g, idx) => {
    allMediaItems.push({
      url: g.url,
      title: `Gallery Photo #${idx + 1}`,
      path: g.path,
    });
  });

  const openLightbox = (index = 0) => {
    if (allMediaItems.length === 0) return;
    setLightboxState({
      isOpen: true,
      currentIndex: Math.max(0, Math.min(index, allMediaItems.length - 1)),
      items: allMediaItems,
    });
  };

  const closeLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const nextLightboxImage = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.items.length,
    }));
  };

  const prevLightboxImage = () => {
    setLightboxState((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.items.length) % prev.items.length,
    }));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxState.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxImage();
      if (e.key === 'ArrowLeft') prevLightboxImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxState.isOpen, lightboxState.items.length]);

  // Fetch latest fresh product details from API: GET /admin/products/:id
  const refreshDetails = async () => {
    if (!product?.id) return;
    setIsLoading(true);
    try {
      const res = await getProduct(product.id);
      const fresh = res?.data || res?.product || res;
      if (fresh && fresh.id) {
        setProduct(fresh);
        addToast({
          title: 'Details Synced',
          message: 'Product specifications refreshed from server.',
          type: 'info',
        });
      }
    } catch (err) {
      console.warn('Could not sync fresh product details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (initialProduct?.id) {
      getProduct(initialProduct.id)
        .then((res) => {
          if (!isMounted) return;
          const fresh = res?.data || res?.product || res;
          if (fresh && fresh.id) {
            setProduct(fresh);
          }
        })
        .catch((err) => {
          console.warn('Could not sync fresh product details:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [initialProduct?.id]);

  // Toggle Publish / Unpublish: PATCH /admin/products/:id/publish OR unpublish
  const handleTogglePublish = async () => {
    if (!product?.id) return;
    const isCurrentlyPublished = product.status === 'published';
    setIsStatusBusy(true);

    try {
      if (isCurrentlyPublished) {
        await unpublishProduct(product.id);
        addToast({
          title: 'Product Unpublished',
          message: `"${product.name}" is now unpublished.`,
          type: 'info',
        });
        setProduct((prev) => ({ ...prev, status: 'unpublished' }));
      } else {
        await publishProduct(product.id);
        addToast({
          title: 'Product Published',
          message: `"${product.name}" is now live and published!`,
          type: 'success',
        });
        setProduct((prev) => ({ ...prev, status: 'published' }));
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      addToast({
        title: isCurrentlyPublished ? 'Unpublish Failed' : 'Publish Failed',
        message: err?.response?.data?.message || 'Failed to update publication status.',
        type: 'error',
      });
    } finally {
      setIsStatusBusy(false);
    }
  };

  // Delete product: DELETE /admin/products/:id
  const handleDeleteProduct = async () => {
    if (!product?.id) return;
    setIsDeleting(true);
    try {
      await deleteProduct(product.id);
      addToast({
        title: 'Product Deleted',
        message: 'The product has been permanently deleted.',
        type: 'success',
      });
      setIsConfirmDeleteOpen(false);
      if (onRefresh) onRefresh();
      if (onBack) onBack();
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

  // Copy slug helper
  const handleCopySlug = () => {
    if (!product?.slug) return;
    const fullUrl = `https://blogtech.com/products/${product.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setHasCopiedSlug(true);
    setTimeout(() => setHasCopiedSlug(false), 2000);
    addToast({
      title: 'Link Copied',
      message: 'Product URL copied to clipboard.',
      type: 'info',
    });
  };

  // Copy Raw JSON helper
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(product, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
    addToast({
      title: 'JSON Copied',
      message: 'Product payload copied to clipboard.',
      type: 'info',
    });
  };

  // Status Badge Logic
  const statusLabel = (product?.status || 'draft').toLowerCase();
  let badgeType = 'default';
  if (statusLabel === 'published') badgeType = 'Active';
  else if (statusLabel === 'draft') badgeType = 'Draft';
  else if (statusLabel === 'unpublished') badgeType = 'Closed';

  // Calculate approximate word count & read time from HTML content
  const cleanContentText = (product?.content || '').replace(/<[^>]*>/g, ' ').trim();
  const wordCount = cleanContentText ? cleanContentText.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: onBack },
              { label: 'Products', onClick: onBack },
              { label: product?.name || 'Product Details' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to products list"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {product?.name || 'Product Specifications'}
            </h1>

            <Badge status={badgeType}>
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusLabel === 'published'
                      ? 'bg-emerald-500 animate-pulse'
                      : statusLabel === 'draft'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
              </span>
            </Badge>

            {product?.id && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                ID #{product.id}
              </span>
            )}

            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              Order #{product?.sort_order ?? 1}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={refreshDetails}
            isLoading={isLoading}
            title="Refresh details from API"
          >
            Refresh
          </Button>

          <Button
            variant={product?.status === 'published' ? 'secondary' : 'primary'}
            icon={product?.status === 'published' ? EyeOff : Globe}
            onClick={handleTogglePublish}
            isLoading={isStatusBusy}
          >
            {product?.status === 'published' ? 'Unpublish' : 'Publish Product'}
          </Button>

          <Button
            variant="secondary"
            icon={Edit2}
            onClick={() => onEdit && onEdit(product)}
          >
            Edit Product
          </Button>

          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setIsConfirmDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY & KPI STATS RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Lifecycle Status
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                product?.status === 'published'
                  ? 'bg-emerald-500 ring-2 ring-emerald-200'
                  : product?.status === 'draft'
                  ? 'bg-amber-500 ring-2 ring-amber-200'
                  : 'bg-slate-400 ring-2 ring-slate-200'
              }`}
            />
            <span className="text-sm font-bold text-slate-800 capitalize">
              {product?.status || 'Draft'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {product?.status === 'published' ? 'Live on catalog' : 'Hidden from public'}
          </span>
        </div>

        {/* Catalog Sort Order */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Listing Order
          </span>
          <div className="flex items-center gap-1.5">
            <Hash size={16} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-800 font-mono">
              Position #{product?.sort_order ?? 1}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Controls catalog hierarchy</span>
        </div>

        {/* Media Assets Count */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Media Assets
          </span>
          <div className="flex items-center gap-1.5">
            <ImageIcon size={16} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">
              {allMediaItems.length} Total {allMediaItems.length === 1 ? 'Asset' : 'Assets'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            1 Hero + {galleryItems.length} Gallery
          </span>
        </div>

        {/* Public Route URL with 1-Click Copy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Public Route Slug
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-800 truncate max-w-[140px]">
              /{product?.slug}
            </span>
            <button
              type="button"
              onClick={handleCopySlug}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy public route URL"
            >
              {hasCopiedSlug ? (
                <Check size={14} className="text-emerald-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <span className="text-[11px] text-slate-400 truncate">
            https://blogtech.com/products/...
          </span>
        </div>
      </div>

      {/* 3. TWO COLUMN MAIN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY DETAILS (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* SHORT DESCRIPTION BANNER */}
          {product?.short_description && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-indigo-50/50 to-white border border-indigo-100 flex items-start gap-3.5 shadow-xs">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs">
                <Sparkles size={16} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                  Elevator Pitch / Tagline
                </span>
                <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            </div>
          )}

          {/* OVERVIEW / SUMMARY CARD */}
          {product?.description && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText size={17} className="text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Executive Summary & Solution Overview
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-medium">Core Description</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>
          )}

          {/* DETAILED CONTENT HTML CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={17} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Product Content & Features Guide
                </h2>
              </div>

              {/* View Switcher: Formatted / HTML Source */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {wordCount} words • ~{readTimeMin} min read
                </span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setContentViewMode('rendered')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      contentViewMode === 'rendered'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Visual Output
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentViewMode('source')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      contentViewMode === 'source'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Code2 size={12} />
                    <span>HTML</span>
                  </button>
                </div>
              </div>
            </div>

            {product?.content ? (
              contentViewMode === 'rendered' ? (
                <div
                  className="product-rich-content bg-slate-50/60 p-6 rounded-xl border border-slate-200/80 shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              ) : (
                <div className="relative">
                  <pre className="text-xs font-mono bg-slate-900 text-emerald-300 p-4 rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                    {product.content}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(product.content);
                      addToast({
                        title: 'HTML Copied',
                        message: 'Raw HTML markup copied to clipboard.',
                        type: 'info',
                      });
                    }}
                    className="absolute top-3 right-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>Copy HTML</span>
                  </button>
                </div>
              )
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No formatted content written for this product yet.
              </div>
            )}
          </div>

          {/* PHOTO GALLERY SHOWCASE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Photo Gallery ({galleryItems.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">Click any image to enlarge</span>
            </div>

            {galleryItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {galleryItems.map((item, idx) => {
                  const mediaIndex = featuredImage ? idx + 1 : idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => openLightbox(mediaIndex)}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square cursor-pointer hover:shadow-md transition-all shadow-2xs"
                    >
                      <img
                        src={item.url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Image+Not+Found';
                        }}
                      />

                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/75 text-[10px] text-white font-mono backdrop-blur-xs">
                        #{idx + 1}
                      </div>

                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                        <div className="p-2 rounded-full bg-slate-900/80 text-white">
                          <Maximize2 size={18} />
                        </div>
                      </div>

                      {item.path && (
                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-slate-950/75 backdrop-blur-xs text-[10px] text-slate-300 font-mono truncate">
                          {item.path.split('/').pop()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center gap-1.5">
                <ImageIcon size={24} className="text-slate-300" />
                <span>No gallery images attached to this product.</span>
              </div>
            )}
          </div>

          {/* RAW API RESPONSE INSPECTOR */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Raw API Payload Inspector
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {hasCopiedJson ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{hasCopiedJson ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonInspector(!showJsonInspector)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {showJsonInspector ? 'Hide Payload' : 'Show Payload'}
                </button>
              </div>
            </div>

            {showJsonInspector && (
              <div className="animate-fade-in">
                <pre className="text-[11px] font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                  {JSON.stringify(
                    {
                      success: true,
                      message: 'Product retrieved successfully',
                      data: product,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: FEATURED MEDIA, SEO & AUDIT (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* FEATURED MEDIA HERO CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={15} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Featured Media Hero</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Catalog Cover</span>
            </div>

            {featuredImage ? (
              <div className="flex flex-col gap-2.5">
                <div
                  onClick={() => openLightbox(0)}
                  className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-950 h-56 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  <img
                    src={featuredImage}
                    alt={product?.name}
                    className="max-w-full max-h-full object-contain p-2 group-hover:scale-102 transition-transform duration-200"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Image+Not+Available';
                    }}
                  />

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <div className="p-2.5 rounded-full bg-slate-900/80 text-white">
                      <Maximize2 size={22} />
                    </div>
                  </div>
                </div>

                {product?.featured_image_path && (
                  <div className="text-[11px] text-slate-500 font-mono truncate bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="truncate">{product.featured_image_path}</span>
                    <a
                      href={featuredImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors ml-1 shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Package size={32} className="text-slate-300" />
                <span className="text-xs">No featured image uploaded</span>
              </div>
            )}
          </div>

          {/* GOOGLE SEARCH (SERP) PREVIEW CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Globe size={15} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Google SERP Snippet</h3>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                Live Preview
              </span>
            </div>

            <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">
                  B
                </div>
                <span className="truncate font-sans">blogtech.com › products › {product?.slug}</span>
              </div>

              <div className="text-sm font-semibold text-indigo-700 hover:underline cursor-pointer line-clamp-1">
                {product?.meta_title || `${product?.name} | BLOGTECH`}
              </div>

              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {product?.meta_description ||
                  product?.short_description ||
                  'Enterprise software solution and technical architecture.'}
              </div>
            </div>

            {/* Detailed SEO Tag Values */}
            <div className="flex flex-col gap-2 pt-1 text-xs text-slate-600">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  Meta Title ({product?.meta_title ? product.meta_title.length : 0}/60 chars):
                </span>
                <span className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 font-medium">
                  {product?.meta_title || 'Not specified'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 mt-1">
                <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                  Meta Description ({product?.meta_description ? product.meta_description.length : 0}/160 chars):
                </span>
                <span className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 leading-relaxed font-medium">
                  {product?.meta_description || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT & SYSTEM TIMESTAMPS CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">System Timestamps</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Audit Log</span>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Created At</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{formatDate(product?.created_at)}</div>
                  <div className="text-[10px] text-slate-400">{formatRelativeTime(product?.created_at)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Last Modified</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{formatDate(product?.updated_at)}</div>
                  <div className="text-[10px] text-slate-400">{formatRelativeTime(product?.updated_at)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Published Schedule</span>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{formatDate(product?.published_at)}</div>
                  <div className="text-[10px] text-slate-400">{formatRelativeTime(product?.published_at)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE LIGHTBOX MODAL */}
      {lightboxState.isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 text-white">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {lightboxState.items[lightboxState.currentIndex]?.title}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {lightboxState.currentIndex + 1} of {lightboxState.items.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={lightboxState.items[lightboxState.currentIndex]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Open full size in new tab"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                  title="Close lightbox (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Stage with Next / Prev */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 min-h-[50vh]">
              {lightboxState.items.length > 1 && (
                <button
                  type="button"
                  onClick={prevLightboxImage}
                  className="absolute left-4 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer z-10 shadow-lg"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                src={lightboxState.items[lightboxState.currentIndex]?.url}
                alt="Enlarged view"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />

              {lightboxState.items.length > 1 && (
                <button
                  type="button"
                  onClick={nextLightboxImage}
                  className="absolute right-4 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-colors cursor-pointer z-10 shadow-lg"
                  title="Next image (Right Arrow)"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Lightbox Footer Bar with Path */}
            <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono truncate max-w-md">
                Path: {lightboxState.items[lightboxState.currentIndex]?.path || 'Unknown'}
              </span>
              <span className="text-[11px] text-slate-500">
                Use Left / Right arrow keys to navigate
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product?"
        message={`Are you sure you want to permanently delete "${product?.name}"? All associated gallery assets and technical specifications will be permanently removed.`}
        confirmLabel="Delete Product"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ViewDetails;