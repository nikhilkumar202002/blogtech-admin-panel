import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  UploadCloud,
  RefreshCw,
  Globe,
  Calendar,
  FileText,
  Layers,
  Eye,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Save,
  Image as ImageIcon,
  Clock,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useToast } from '../../ui/ToastContext';
import {
  createProduct,
  updateProduct,
  getProduct,
  uploadFeaturedImage,
  deleteFeaturedImage,
  uploadGalleryImages,
  deleteGalleryImage,
  publishProduct,
  unpublishProduct,
} from '../../../utils/product.service';

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

export const CreateProduct = ({
  initialProduct = null,
  onBack,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialProduct?.id);

  // Form State
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    slug: initialProduct?.slug || '',
    short_description: initialProduct?.short_description || '',
    description: initialProduct?.description || '',
    content: initialProduct?.content || '',
    status: initialProduct?.status || 'published',
    sort_order: initialProduct?.sort_order ?? 1,
    meta_title: initialProduct?.meta_title || '',
    meta_description: initialProduct?.meta_description || '',
    featured_image: initialProduct?.featured_image || initialProduct?.featured_image_url || '',
    published_at: initialProduct?.published_at
      ? initialProduct.published_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Active product details (keeps sync with fresh server data)
  const [activeProduct, setActiveProduct] = useState(initialProduct);

  // Staged files for initial creation (if created before having an ID)
  const [stagedFeaturedFile, setStagedFeaturedFile] = useState(null);
  const [stagedFeaturedPreview, setStagedFeaturedPreview] = useState(null);
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState([]);
  const [stagedGalleryPreviews, setStagedGalleryPreviews] = useState([]);

  // Existing Gallery list from server
  const [galleryList, setGalleryList] = useState([]);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);
  const [isDeletingFeatured, setIsDeletingFeatured] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deletingGalleryId, setDeletingGalleryId] = useState(null);

  const featuredInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sync gallery list from product object
  const syncGallery = (prod) => {
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
        };
      }
      return {
        id: item.id || index + 1,
        index: index + 1,
        url: formatImageUrl(item.url || item.image_url || item.path || item.image || ''),
        path: item.path || paths[index] || null,
      };
    });
  };

  useEffect(() => {
    if (initialProduct?.id) {
      setActiveProduct(initialProduct);
      setGalleryList(syncGallery(initialProduct));

      // Fetch fresh details from GET /admin/products/:id
      getProduct(initialProduct.id)
        .then((res) => {
          const fresh = res?.data || res?.product || res;
          if (fresh && fresh.id) {
            setActiveProduct(fresh);
            setGalleryList(syncGallery(fresh));
            setFormData({
              name: fresh.name || '',
              slug: fresh.slug || '',
              short_description: fresh.short_description || '',
              description: fresh.description || '',
              content: fresh.content || '',
              status: fresh.status || 'published',
              sort_order: fresh.sort_order ?? 1,
              meta_title: fresh.meta_title || '',
              meta_description: fresh.meta_description || '',
              featured_image: fresh.featured_image || fresh.featured_image_url || '',
              published_at: fresh.published_at ? fresh.published_at.split('T')[0] : '',
            });
          }
        })
        .catch((err) => console.warn('Could not sync fresh product:', err));
    }
  }, [initialProduct]);

  // Handle Featured Image Selection
  const handleSelectFeaturedFile = async (file) => {
    if (!file) return;

    if (isEditing && activeProduct?.id) {
      // Direct API upload: POST /admin/products/:id/featured-image
      setIsUploadingFeatured(true);
      try {
        const res = await uploadFeaturedImage(activeProduct.id, file);
        const updated = res?.data || res?.product || null;

        addToast({
          title: 'Featured Image Uploaded',
          message: 'Product featured image updated successfully.',
          type: 'success',
        });

        if (updated) {
          setActiveProduct(updated);
          setFormData((prev) => ({
            ...prev,
            featured_image: updated.featured_image || updated.featured_image_url || '',
          }));
        } else {
          const fresh = await getProduct(activeProduct.id);
          const f = fresh?.data || fresh?.product || fresh;
          if (f) {
            setActiveProduct(f);
            setFormData((prev) => ({
              ...prev,
              featured_image: f.featured_image || f.featured_image_url || '',
            }));
          }
        }
      } catch (err) {
        addToast({
          title: 'Upload Failed',
          message: err?.response?.data?.message || 'Failed to upload featured image.',
          type: 'error',
        });
      } finally {
        setIsUploadingFeatured(false);
      }
    } else {
      // Staged for creation
      setStagedFeaturedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setStagedFeaturedPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Delete Featured Image
  const handleDeleteFeaturedImage = async () => {
    if (isEditing && activeProduct?.id) {
      // Direct API delete: DELETE /admin/products/:id/featured-image
      setIsDeletingFeatured(true);
      try {
        await deleteFeaturedImage(activeProduct.id);
        addToast({
          title: 'Featured Image Removed',
          message: 'The featured image has been deleted.',
          type: 'success',
        });
        setActiveProduct((prev) => ({
          ...prev,
          featured_image: null,
          featured_image_url: null,
          featured_image_path: null,
        }));
        setFormData((prev) => ({ ...prev, featured_image: '' }));
      } catch (err) {
        addToast({
          title: 'Delete Failed',
          message: err?.response?.data?.message || 'Could not delete featured image.',
          type: 'error',
        });
      } finally {
        setIsDeletingFeatured(false);
      }
    } else {
      setStagedFeaturedFile(null);
      setStagedFeaturedPreview(null);
    }
  };

  // Handle Gallery Selection
  const handleSelectGalleryFiles = async (files) => {
    if (!files || files.length === 0) return;

    if (isEditing && activeProduct?.id) {
      // Direct API upload: POST /admin/products/:id/images
      setIsUploadingGallery(true);
      try {
        await uploadGalleryImages(activeProduct.id, files);
        addToast({
          title: 'Gallery Uploaded',
          message: `${files.length} photo(s) added to gallery.`,
          type: 'success',
        });
        const fresh = await getProduct(activeProduct.id);
        const f = fresh?.data || fresh?.product || fresh;
        if (f) {
          setActiveProduct(f);
          setGalleryList(syncGallery(f));
        }
      } catch (err) {
        addToast({
          title: 'Upload Failed',
          message: err?.response?.data?.message || 'Failed to upload gallery photos.',
          type: 'error',
        });
      } finally {
        setIsUploadingGallery(false);
      }
    } else {
      // Staged for creation
      const newFiles = Array.from(files);
      setStagedGalleryFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setStagedGalleryPreviews((prev) => [...prev, { name: file.name, url: e.target.result }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Delete single Gallery Image
  const handleDeleteGalleryImage = async (item) => {
    if (isEditing && activeProduct?.id) {
      setDeletingGalleryId(item.id || item.index);
      try {
        await deleteGalleryImage(activeProduct.id, item.id || item.index);
        addToast({
          title: 'Image Deleted',
          message: 'Gallery image removed.',
          type: 'success',
        });
        const fresh = await getProduct(activeProduct.id);
        const f = fresh?.data || fresh?.product || fresh;
        if (f) {
          setActiveProduct(f);
          setGalleryList(syncGallery(f));
        }
      } catch (err) {
        addToast({
          title: 'Remove Failed',
          message: err?.response?.data?.message || 'Failed to remove gallery photo.',
          type: 'error',
        });
      } finally {
        setDeletingGalleryId(null);
      }
    } else {
      // Remove from staged
      setStagedGalleryFiles((prev) => prev.filter((_, idx) => idx !== item.index));
      setStagedGalleryPreviews((prev) => prev.filter((_, idx) => idx !== item.index));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      addToast({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        slug: formData.slug.trim() || generateSlug(formData.name),
        sort_order: Number(formData.sort_order) || 1,
      };

      if (isEditing && activeProduct?.id) {
        // PUT /admin/products/:id
        await updateProduct(activeProduct.id, payload);
        addToast({
          title: 'Product Updated',
          message: `"${formData.name}" has been updated successfully.`,
          type: 'success',
        });
        if (onSuccess) onSuccess();
      } else {
        // POST /admin/products
        const res = await createProduct(payload);
        const created = res?.data || res?.product || null;

        addToast({
          title: 'Product Created',
          message: `"${formData.name}" has been created successfully.`,
          type: 'success',
        });

        // If user staged featured image or gallery photos, upload them to newly created product
        if (created?.id) {
          if (stagedFeaturedFile) {
            try {
              await uploadFeaturedImage(created.id, stagedFeaturedFile);
            } catch (imgErr) {
              console.warn('Featured image upload error on create:', imgErr);
            }
          }

          if (stagedGalleryFiles.length > 0) {
            try {
              await uploadGalleryImages(created.id, stagedGalleryFiles);
            } catch (galErr) {
              console.warn('Gallery upload error on create:', galErr);
            }
          }
        }

        if (onSuccess) onSuccess();
      }
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

  const currentFeaturedUrl =
    stagedFeaturedPreview ||
    formatImageUrl(activeProduct?.featured_image_url || activeProduct?.featured_image);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={featuredInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSelectFeaturedFile(e.target.files[0]);
          }
        }}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSelectGalleryFiles(e.target.files);
          }
        }}
      />

      {/* TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: onBack },
              { label: 'Products', onClick: onBack },
              { label: isEditing ? 'Edit Product' : 'Create Product' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2.5">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to products"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit: ${activeProduct?.name}` : 'Create New Product'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing
              ? 'Update catalog specifications, manage media assets, and adjust publishing status.'
              : 'Add a new software solution or catalog item with specifications, media, and SEO.'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="secondary" onClick={onBack} disabled={isSaving}>
            Discard
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN FORM LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY DETAILS (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* CARD 1: GENERAL INFORMATION */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">General Information</h2>
            </div>

            <FormField label="Product Title" required error={formErrors.name}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    name: val,
                    slug: isEditing ? formData.slug : generateSlug(val),
                    meta_title: isEditing ? formData.meta_title : `${val} | BLOGTECH`,
                  });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                }}
                placeholder="e.g. Jewellery ERP Software"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
              />
            </FormField>

            <FormField label="URL Slug" hint="Unique address slug for public catalog route">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                <span className="px-3.5 py-2 text-xs text-slate-500 bg-slate-100 border-r border-slate-200 select-none font-mono">
                  /products/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="jewellery-erp-software"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white outline-none font-mono"
                />
              </div>
            </FormField>

            <FormField
              label="Short Description"
              hint="Concise 1-2 sentence summary displayed on catalog cards and previews"
            >
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
                placeholder="Simplify jewellery business operations with an integrated ERP solution."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </FormField>

            <FormField label="Overview / Description" hint="General overview of the product capabilities">
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A comprehensive jewellery ERP solution designed to streamline inventory, billing, sales, and operations..."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed"
              />
            </FormField>
          </div>

          {/* CARD 2: DETAILED PRODUCT CONTENT (MS WORD-STYLE WYSIWYG) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600" />
                <h2 className="text-base font-semibold text-slate-900">Product Content</h2>
              </div>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Word Editor
              </span>
            </div>

            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="Start typing product specifications, benefits, headings, and details just like in Microsoft Word..."
              minHeight="320px"
            />
          </div>

          {/* CARD 3: SEO & METADATA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe size={18} className="text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Search Engine Optimization (SEO)</h2>
            </div>

            <FormField label="Meta Title" hint="Search engine title tag">
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Jewellery ERP Software | BLOGTECH"
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </FormField>

            <FormField label="Meta Description" hint="Search result snippet summary">
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                placeholder="Manage jewellery inventory, billing, sales, and customers efficiently with BLOGTECH."
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-sans"
              />
            </FormField>

            {/* SERP Search Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Google Search Engine Result Snippet
              </div>
              <div className="text-sm font-medium text-indigo-700 truncate">
                {formData.meta_title || `${formData.name || 'Product'} | BLOGTECH`}
              </div>
              <div className="text-xs text-emerald-700 font-mono">
                https://blogtech.com/products/{formData.slug || 'product-slug'}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                {formData.meta_description ||
                  formData.short_description ||
                  'Enterprise software solution designed and provided by BLOGTECH.'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PUBLISHING & MEDIA ASSETS (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* CARD A: PUBLISHING SETTINGS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
              Publishing Settings
            </h3>

            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </FormField>

            <FormField label="Catalog Sort Order" hint="Display sequence rank">
              <input
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </FormField>

            <FormField label="Publication Date">
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </FormField>

            <Button
              variant="primary"
              icon={Save}
              onClick={handleSubmit}
              isLoading={isSaving}
              fullWidth
              className="mt-2"
            >
              {isEditing ? 'Save Product Changes' : 'Create & Publish'}
            </Button>
          </div>

          {/* CARD B: FEATURED IMAGE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Featured Image</h3>
              <span className="text-[11px] text-slate-400">Primary Thumbnail</span>
            </div>

            {currentFeaturedUrl ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col relative group">
                <div className="h-44 w-full flex items-center justify-center bg-slate-950 p-2 overflow-hidden">
                  <img
                    src={currentFeaturedUrl}
                    alt="Featured preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {stagedFeaturedFile ? stagedFeaturedFile.name : 'Uploaded Asset'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={UploadCloud}
                      onClick={() => featuredInputRef.current?.click()}
                      isLoading={isUploadingFeatured}
                    >
                      Replace
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={handleDeleteFeaturedImage}
                      isLoading={isDeletingFeatured}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => featuredInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600">
                  {isUploadingFeatured ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <UploadCloud size={20} />
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Click to select featured image
                </div>
                <div className="text-[11px] text-slate-400">
                  JPG, PNG, WebP up to 5MB
                </div>
              </div>
            )}
          </div>

          {/* CARD C: GALLERY IMAGES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Photo Gallery</h3>
                <span className="text-[11px] text-slate-500">
                  {isEditing ? galleryList.length : stagedGalleryPreviews.length} photo(s)
                </span>
              </div>

              <Button
                size="sm"
                variant="secondary"
                icon={Plus}
                onClick={() => galleryInputRef.current?.click()}
                isLoading={isUploadingGallery}
              >
                Add Photos
              </Button>
            </div>

            {/* Existing Server Gallery (when editing) */}
            {isEditing && galleryList.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-0.5">
                {galleryList.map((item, idx) => {
                  const isDeletingThis = deletingGalleryId === (item.id || item.index);
                  return (
                    <div
                      key={item.id || idx}
                      className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-square flex items-center justify-center"
                    >
                      <img
                        src={item.url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-slate-900/70 text-[9px] text-white font-mono">
                        #{idx + 1}
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          disabled={isDeletingThis}
                          onClick={() => handleDeleteGalleryImage(item)}
                          className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                          title="Remove image"
                        >
                          {isDeletingThis ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Staged Gallery (when creating) */}
            {!isEditing && stagedGalleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-0.5">
                {stagedGalleryPreviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-square flex items-center justify-center"
                  >
                    <img
                      src={item.url}
                      alt={`Staged ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-slate-900/70 text-[9px] text-white font-mono">
                      #{idx + 1}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage({ index: idx })}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty gallery dropzone */}
            {((isEditing && galleryList.length === 0) ||
              (!isEditing && stagedGalleryPreviews.length === 0)) && (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer text-center"
              >
                <Layers size={18} className="text-slate-400" />
                <div className="text-xs font-semibold text-slate-700">
                  No gallery photos attached
                </div>
                <div className="text-[11px] text-slate-400">
                  Click to add screenshots or product photos
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;