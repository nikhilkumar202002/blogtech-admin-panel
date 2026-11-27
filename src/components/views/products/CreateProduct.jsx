import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  UploadCloud,
  Globe,
  FileText,
  Layers,
  Sparkles,
  Save,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  PhoneCall,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { Badge } from '../../ui/Badge';
import { useToast } from '../../ui/ToastContext';
import {
  createProduct,
  updateProduct,
  getProduct,
} from '../../../utils/product.service';
import { formatImageUrl, handleImageError } from '../../../utils/image.helper';

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

export const CreateProduct = ({
  initialProduct = null,
  onBack,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialProduct?.id);

  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    slug: initialProduct?.slug || '',
    banner_title: initialProduct?.banner_title || initialProduct?.banner?.title || '',
    banner_title_highlight: initialProduct?.banner_title_highlight || initialProduct?.banner?.title_highlight || '',
    banner_subtitle: initialProduct?.banner_subtitle || initialProduct?.banner?.subtitle || '',
    banner_description: initialProduct?.banner_description || initialProduct?.banner?.description || '',
    banner_button_text: initialProduct?.banner_button_text || initialProduct?.banner?.button_text || initialProduct?.banner?.cta_text || '',
    banner_button_link: initialProduct?.banner_button_link || initialProduct?.banner?.button_link || initialProduct?.banner?.cta_link || '',
    short_description: initialProduct?.short_description || '',
    description: initialProduct?.description || '',
    content: initialProduct?.content || '',
    status: initialProduct?.status || 'published',
    sort_order: initialProduct?.sort_order ?? 1,
    meta_title: initialProduct?.meta_title || '',
    meta_description: initialProduct?.meta_description || '',
    published_at: initialProduct?.published_at
      ? initialProduct.published_at.split('T')[0]
      : '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeProduct, setActiveProduct] = useState(initialProduct);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(
    formatImageUrl(
      initialProduct?.featured_image_path ||
      initialProduct?.featured_image_url ||
      initialProduct?.featured_image
    ) || null
  );
  const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);
  const [bannerDesktopFile, setBannerDesktopFile] = useState(null);
  const [bannerDesktopPreview, setBannerDesktopPreview] = useState(
    formatImageUrl(
      initialProduct?.banner_image_desktop_path ||
      initialProduct?.banner_image_desktop_url ||
      initialProduct?.banner_image_desktop
    ) || null
  );
  const [removeBannerDesktop, setRemoveBannerDesktop] = useState(false);
  const [bannerMobileFile, setBannerMobileFile] = useState(null);
  const [bannerMobilePreview, setBannerMobilePreview] = useState(
    formatImageUrl(
      initialProduct?.banner_image_mobile_path ||
      initialProduct?.banner_image_mobile_url ||
      initialProduct?.banner_image_mobile
    ) || null
  );
  const [removeBannerMobile, setRemoveBannerMobile] = useState(false);
  const [existingGallery, setExistingGallery] = useState([])
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState([])
  const [stagedGalleryPreviews, setStagedGalleryPreviews] = useState([]);
  const [removedGalleryImages, setRemovedGalleryImages] = useState([]);
  const featuredInputRef = useRef(null);
  const bannerDesktopInputRef = useRef(null);
  const bannerMobileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
      const rawUrl = typeof item === 'string' ? item : (item.url || item.image_url || item.path || item.image || '');
      const rawPath = paths[index] || (typeof item === 'object' ? item.path : null);
      return {
        id: `existing-${index}`,
        index: index,
        url: formatImageUrl(rawPath || rawUrl),
        path: rawPath || (typeof item === 'string' ? item : null),
      };
    });
  };

  useEffect(() => {
    if (initialProduct?.id) {
      setActiveProduct(initialProduct);
      setExistingGallery(syncGallery(initialProduct));

      getProduct(initialProduct.id)
        .then((res) => {
          const fresh = res?.data || res?.product || res;
          if (fresh && fresh.id) {
            setActiveProduct(fresh);
            setExistingGallery(syncGallery(fresh));
            setFormData({
              name: fresh.name || '',
              slug: fresh.slug || '',
              banner_title: fresh.banner_title || fresh.banner?.title || '',
              banner_title_highlight: fresh.banner_title_highlight || fresh.banner?.title_highlight || '',
              banner_subtitle: fresh.banner_subtitle || fresh.banner?.subtitle || '',
              banner_description: fresh.banner_description || fresh.banner?.description || '',
              banner_button_text: fresh.banner_button_text || fresh.banner?.button_text || fresh.banner?.cta_text || '',
              banner_button_link: fresh.banner_button_link || fresh.banner?.button_link || fresh.banner?.cta_link || '',
              short_description: fresh.short_description || '',
              description: fresh.description || '',
              content: fresh.content || '',
              status: fresh.status || 'published',
              sort_order: fresh.sort_order ?? 1,
              meta_title: fresh.meta_title || '',
              meta_description: fresh.meta_description || '',
              published_at: fresh.published_at ? fresh.published_at.split('T')[0] : '',
            });
            const freshImg = formatImageUrl(
              fresh.featured_image_path ||
              fresh.featured_image_url ||
              fresh.featured_image
            );
            if (freshImg) {
              setFeaturedPreview(freshImg);
            }

            const freshDesktop = formatImageUrl(
              fresh.banner_image_desktop_path ||
              fresh.banner_image_desktop_url ||
              fresh.banner_image_desktop
            );
            if (freshDesktop) {
              setBannerDesktopPreview(freshDesktop);
            }

            const freshMobile = formatImageUrl(
              fresh.banner_image_mobile_path ||
              fresh.banner_image_mobile_url ||
              fresh.banner_image_mobile
            );
            if (freshMobile) {
              setBannerMobilePreview(freshMobile);
            }
          }
        })
        .catch((err) => console.warn('Could not sync fresh product:', err));
    }
  }, [initialProduct]);

  useEffect(() => {
    return () => {
      if (featuredPreview && featuredPreview.startsWith('blob:')) {
        URL.revokeObjectURL(featuredPreview);
      }
      if (bannerDesktopPreview && bannerDesktopPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerDesktopPreview);
      }
      if (bannerMobilePreview && bannerMobilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerMobilePreview);
      }
    };
  }, [featuredPreview, bannerDesktopPreview, bannerMobilePreview]);

  const handleSelectFeaturedFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Featured image must be under 5MB.',
        type: 'error',
      });
      return;
    }

    if (featuredPreview && featuredPreview.startsWith('blob:')) {
      URL.revokeObjectURL(featuredPreview);
    }

    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
    setRemoveFeaturedImage(false);

    addToast({
      title: 'Featured Image Selected',
      message: `${file.name} ready to save.`,
      type: 'info',
    });
  };

  const handleDeleteFeaturedImage = () => {
    if (featuredPreview && featuredPreview.startsWith('blob:')) {
      URL.revokeObjectURL(featuredPreview);
    }
    setFeaturedFile(null);
    setFeaturedPreview(null);
    setRemoveFeaturedImage(true);
    if (featuredInputRef.current) {
      featuredInputRef.current.value = '';
    }

    addToast({
      title: 'Featured Image Removed',
      message: 'Image will be deleted upon saving.',
      type: 'info',
    });
  };

  // Handle Banner Desktop Image Selection
  const handleSelectBannerDesktop = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Desktop banner image must be under 5MB.',
        type: 'error',
      });
      return;
    }

    if (bannerDesktopPreview && bannerDesktopPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerDesktopPreview);
    }

    setBannerDesktopFile(file);
    setBannerDesktopPreview(URL.createObjectURL(file));
    setRemoveBannerDesktop(false);

    addToast({
      title: 'Desktop Banner Selected',
      message: `${file.name} ready to save.`,
      type: 'info',
    });
  };

  // Handle Delete Banner Desktop Image
  const handleDeleteBannerDesktop = () => {
    if (bannerDesktopPreview && bannerDesktopPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerDesktopPreview);
    }
    setBannerDesktopFile(null);
    setBannerDesktopPreview(null);
    setRemoveBannerDesktop(true);
    if (bannerDesktopInputRef.current) {
      bannerDesktopInputRef.current.value = '';
    }

    addToast({
      title: 'Desktop Banner Removed',
      message: 'Desktop banner will be deleted upon saving.',
      type: 'info',
    });
  };

  // Handle Banner Mobile Image Selection
  const handleSelectBannerMobile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Mobile banner image must be under 5MB.',
        type: 'error',
      });
      return;
    }

    if (bannerMobilePreview && bannerMobilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerMobilePreview);
    }

    setBannerMobileFile(file);
    setBannerMobilePreview(URL.createObjectURL(file));
    setRemoveBannerMobile(false);

    addToast({
      title: 'Mobile Banner Selected',
      message: `${file.name} ready to save.`,
      type: 'info',
    });
  };

  // Handle Delete Banner Mobile Image
  const handleDeleteBannerMobile = () => {
    if (bannerMobilePreview && bannerMobilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerMobilePreview);
    }
    setBannerMobileFile(null);
    setBannerMobilePreview(null);
    setRemoveBannerMobile(true);
    if (bannerMobileInputRef.current) {
      bannerMobileInputRef.current.value = '';
    }

    addToast({
      title: 'Mobile Banner Removed',
      message: 'Mobile banner will be deleted upon saving.',
      type: 'info',
    });
  };

  // Handle Gallery Selection (Staged locally, saved atomically on submit)
  const handleSelectGalleryFiles = (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles = [];
    const newPreviews = [];

    fileArray.forEach((file, idx) => {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          title: 'File Too Large',
          message: `${file.name} exceeds 5MB limit and was skipped.`,
          type: 'error',
        });
        return;
      }
      validFiles.push(file);
      newPreviews.push({
        id: `staged-${Date.now()}-${idx}`,
        url: URL.createObjectURL(file),
        name: file.name,
      });
    });

    if (validFiles.length > 0) {
      setStagedGalleryFiles((prev) => [...prev, ...validFiles]);
      setStagedGalleryPreviews((prev) => [...prev, ...newPreviews]);

      addToast({
        title: 'Gallery Photos Added',
        message: `${validFiles.length} photo(s) staged to upload.`,
        type: 'info',
      });
    }
  };

  // Delete single existing gallery image
  const handleDeleteExistingGalleryImage = (item, idx) => {
    const identifier = item.path || item.index !== undefined ? (item.path || item.index) : idx;
    setRemovedGalleryImages((prev) => [...prev, identifier]);
    setExistingGallery((prev) => prev.filter((_, i) => i !== idx));

    addToast({
      title: 'Image Marked for Removal',
      message: 'Photo will be removed upon saving.',
      type: 'info',
    });
  };

  // Delete single staged new gallery image
  const handleDeleteStagedGalleryImage = (idx) => {
    const item = stagedGalleryPreviews[idx];
    if (item?.url && item.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }
    setStagedGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setStagedGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form Submit Handler: unified atomic request for product data, banner, and all media
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
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name.trim());
      formDataPayload.append('slug', formData.slug.trim() || generateSlug(formData.name));
      formDataPayload.append('banner_title', formData.banner_title?.trim() || '');
      formDataPayload.append('banner_title_highlight', formData.banner_title_highlight?.trim() || '');
      formDataPayload.append('banner_subtitle', formData.banner_subtitle?.trim() || '');
      formDataPayload.append('banner_description', formData.banner_description?.trim() || '');
      formDataPayload.append('banner_button_text', formData.banner_button_text?.trim() || '');
      formDataPayload.append('banner_button_link', formData.banner_button_link?.trim() || '');
      formDataPayload.append('short_description', formData.short_description?.trim() || '');
      formDataPayload.append('description', formData.description?.trim() || '');
      formDataPayload.append('content', formData.content || '');
      formDataPayload.append('status', formData.status || 'published');
      formDataPayload.append('sort_order', String(Number(formData.sort_order) || 1));
      formDataPayload.append('published_at', formData.published_at || '');
      formDataPayload.append('meta_title', formData.meta_title?.trim() || '');
      formDataPayload.append('meta_description', formData.meta_description?.trim() || '');

      if (featuredFile) {
        formDataPayload.append('featured_image', featuredFile);
      } else if (removeFeaturedImage) {
        formDataPayload.append('remove_featured_image', '1');
      }

      // Staged new gallery images handling
      if (stagedGalleryFiles && stagedGalleryFiles.length > 0) {
        stagedGalleryFiles.forEach((file) => {
          formDataPayload.append('gallery_images[]', file);
        });
      }

      // Existing retained gallery images handling (in edit mode)
      if (isEditing && existingGallery && existingGallery.length > 0) {
        existingGallery.forEach((item) => {
          if (item.path) {
            formDataPayload.append('existing_gallery_images[]', item.path);
          } else if (item.url) {
            formDataPayload.append('existing_gallery_images[]', item.url);
          }
        });
      }

      // Removed gallery images handling
      if (removedGalleryImages && removedGalleryImages.length > 0) {
        removedGalleryImages.forEach((item) => {
          formDataPayload.append('removed_gallery_images[]', String(item));
        });
      }

      // Banner Desktop Image handling
      if (bannerDesktopFile) {
        formDataPayload.append('banner_image_desktop', bannerDesktopFile);
      } else if (removeBannerDesktop) {
        formDataPayload.append('remove_banner_image_desktop', '1');
      }

      // Banner Mobile Image handling
      if (bannerMobileFile) {
        formDataPayload.append('banner_image_mobile', bannerMobileFile);
      } else if (removeBannerMobile) {
        formDataPayload.append('remove_banner_image_mobile', '1');
      }

      if (isEditing && activeProduct?.id) {
        // Edit mode: single unified POST /admin/products/:id API call
        await updateProduct(activeProduct.id, formDataPayload);
        addToast({
          title: 'Product Updated',
          message: `"${formData.name}" has been updated successfully.`,
          type: 'success',
        });
      } else {
        // Create mode: single unified POST /admin/products API call
        await createProduct(formDataPayload);
        addToast({
          title: 'Product Created',
          message: `"${formData.name}" has been created successfully.`,
          type: 'success',
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        'Failed to save product details.';
      addToast({
        title: 'Save Failed',
        message: errMsg,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalGalleryCount = existingGallery.length + stagedGalleryPreviews.length;

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
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={bannerDesktopInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSelectBannerDesktop(e.target.files[0]);
          }
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={bannerMobileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSelectBannerMobile(e.target.files[0]);
          }
          e.target.value = '';
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
          e.target.value = '';
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
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back to products"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit: ${activeProduct?.name || formData.name}` : 'Create New Product'}
            </h1>
            <Badge status={formData.status}>
              {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Published'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {isEditing
              ? 'Update catalog specifications, hero banner copy & graphics, and publication lifecycle in a single save.'
              : 'Add a new software solution or catalog item with specifications, responsive hero media, and SEO.'}
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#a34b03]/10 border border-[#a34b03]/20 flex items-center justify-center text-[#a34b03]">
                  <FileText size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">General Information</h2>
                  <p className="text-xs text-slate-500">Core software identification, catalog title, and address slug</p>
                </div>
              </div>
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
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-medium transition-all"
              />
            </FormField>

            <FormField label="URL Slug" hint="Unique route identifier for public catalog page">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-[#a34b03] focus-within:ring-2 focus-within:ring-[#a34b03]/15 transition-all">
                <span className="px-3.5 py-2.5 text-xs text-slate-500 bg-slate-100 border-r border-slate-200 select-none font-mono">
                  /products/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: generateSlug(e.target.value) })
                  }
                  placeholder="jewellery-erp-software"
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white outline-none font-mono"
                />
              </div>
            </FormField>

            <FormField
              label="Short Description"
              hint="Concise 1-2 sentence overview shown on catalog preview cards"
            >
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({ ...formData, short_description: e.target.value })
                }
                placeholder="Simplify jewellery business operations with an integrated ERP solution."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all"
              />
            </FormField>

            <FormField label="Overview / Description" hint="General overview of product capabilities and value proposition">
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A comprehensive jewellery ERP solution designed to streamline inventory, billing, sales, and operations..."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-sans leading-relaxed transition-all"
              />
            </FormField>
          </div>

          {/* CARD 2: HERO BANNER & LANDING PRESENTATION */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#cb9706]/15 border border-[#cb9706]/30 flex items-center justify-center text-[#cb9706]">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Hero Banner & Landing Presentation</h2>
                  <p className="text-xs text-slate-500">Configure promotional headline, CTA buttons, and responsive banner graphics</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#844414] bg-[#edd8bb] border border-[#dfc49f] px-2.5 py-0.5 rounded-full">
                Hero Section
              </span>
            </div>

            {/* Banner Headline Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Banner Title"
                hint="Main headline prefix before highlight"
              >
                <input
                  type="text"
                  value={formData.banner_title}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_title: e.target.value })
                  }
                  placeholder="e.g. Every Aspect of Your"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all"
                />
              </FormField>

              <FormField
                label="Banner Highlight Title"
                hint="Highlighted emphasis in brand color"
              >
                <input
                  type="text"
                  value={formData.banner_title_highlight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      banner_title_highlight: e.target.value,
                    })
                  }
                  placeholder="e.g. Jewellery Business. Simplified."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-semibold text-[#a34b03] transition-all"
                />
              </FormField>
            </div>

            {/* Subtitle & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Banner Eyebrow / Subtitle"
                hint="Top badge or eyebrow tag above headline"
              >
                <input
                  type="text"
                  value={formData.banner_subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_subtitle: e.target.value })
                  }
                  placeholder="e.g. One Software. Complete Management."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-medium transition-all"
                />
              </FormField>

              <FormField
                label="Banner Description"
                hint="Hero introductory paragraph under headline"
              >
                <textarea
                  rows={2}
                  value={formData.banner_description}
                  onChange={(e) =>
                    setFormData({ ...formData, banner_description: e.target.value })
                  }
                  placeholder="e.g. AURIX is a comprehensive jewellery management solution built to streamline day-to-day operations."
                  className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-sans transition-all"
                />
              </FormField>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="CTA Button Label"
                hint="Call-to-action button text"
              >
                <input
                  type="text"
                  value={formData.banner_button_text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      banner_button_text: e.target.value,
                    })
                  }
                  placeholder="e.g. Call Now or Request Demo"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-medium transition-all"
                />
              </FormField>

              <FormField
                label="CTA Button Link"
                hint="Destination URL, phone number, or anchor"
              >
                <input
                  type="text"
                  value={formData.banner_button_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      banner_button_link: e.target.value,
                    })
                  }
                  placeholder="e.g. tel:+919876543210 or /contact"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-mono transition-all"
                />
              </FormField>
            </div>

            {/* Responsive Banner Graphics Section (Side-by-Side Desktop & Mobile) */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Responsive Banner Graphics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Upload tailored image banners optimized for desktop monitors and mobile devices
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Desktop Banner Upload Block */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Monitor size={15} className="text-[#a34b03]" />
                      <span>Desktop Banner</span>
                    </div>
                    <span className="text-[10.5px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      1920 × 600
                    </span>
                  </div>

                  {bannerDesktopPreview ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col">
                      <div className="h-32 w-full bg-slate-950/90 flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={bannerDesktopPreview}
                          alt="Desktop Banner preview"
                          className="max-h-full max-w-full object-contain rounded"
                          onError={(e) => handleImageError(e, 'Desktop Banner', true)}
                        />
                      </div>
                      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                          {bannerDesktopFile
                            ? bannerDesktopFile.name
                            : removeBannerDesktop
                            ? 'Marked for deletion'
                            : 'Current Banner'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={UploadCloud}
                            onClick={() => bannerDesktopInputRef.current?.click()}
                          >
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={Trash2}
                            onClick={handleDeleteBannerDesktop}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerDesktopInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleSelectBannerDesktop(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 hover:border-[#a34b03] rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-[#a34b03]/5 transition-colors cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#a34b03]">
                        <Monitor size={16} />
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        Select Desktop Banner
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        1920×600 widescreen image (up to 5MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Mobile Banner Upload Block */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <Smartphone size={15} className="text-[#a34b03]" />
                      <span>Mobile Banner</span>
                    </div>
                    <span className="text-[10.5px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      750 × 600
                    </span>
                  </div>

                  {bannerMobilePreview ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col">
                      <div className="h-32 w-full bg-slate-950/90 flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={bannerMobilePreview}
                          alt="Mobile Banner preview"
                          className="max-h-full max-w-full object-contain rounded"
                          onError={(e) => handleImageError(e, 'Mobile Banner', true)}
                        />
                      </div>
                      <div className="p-2.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                          {bannerMobileFile
                            ? bannerMobileFile.name
                            : removeBannerMobile
                            ? 'Marked for deletion'
                            : 'Current Mobile Banner'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={UploadCloud}
                            onClick={() => bannerMobileInputRef.current?.click()}
                          >
                            Replace
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={Trash2}
                            onClick={handleDeleteBannerMobile}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerMobileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleSelectBannerMobile(e.dataTransfer.files[0]);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 hover:border-[#a34b03] rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-[#a34b03]/5 transition-colors cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#a34b03]">
                        <Smartphone size={16} />
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        Select Mobile Banner
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        750×600 responsive mobile image (up to 5MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: DETAILED PRODUCT CONTENT (MS WORD-STYLE WYSIWYG) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#a34b03]/10 border border-[#a34b03]/20 flex items-center justify-center text-[#a34b03]">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Product Content & Documentation</h2>
                  <p className="text-xs text-slate-500">Rich formatted descriptions, key benefits, modules, and specifications</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#a34b03] bg-[#a34b03]/10 border border-[#a34b03]/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a34b03] animate-pulse" />
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

          {/* CARD 4: SEO & METADATA */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Globe size={17} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Search Engine Optimization (SEO)</h2>
                <p className="text-xs text-slate-500">Customize Google search appearance and social preview meta tags</p>
              </div>
            </div>

            <FormField label="Meta Title" hint="Search engine title tag (recommended 50-60 characters)">
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Jewellery ERP Software | BLOGTECH"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all"
              />
            </FormField>

            <FormField label="Meta Description" hint="Search result snippet summary (recommended 150-160 characters)">
              <textarea
                rows={2}
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData({ ...formData, meta_description: e.target.value })
                }
                placeholder="Manage jewellery inventory, billing, sales, and customers efficiently with BLOGTECH."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 font-sans transition-all"
              />
            </FormField>

            {/* SERP Search Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Google Search Result Preview
              </div>
              <div className="text-sm font-semibold text-[#a34b03] truncate hover:underline cursor-pointer">
                {formData.meta_title || `${formData.name || 'Product'} | BLOGTECH`}
              </div>
              <div className="text-xs text-emerald-700 font-mono">
                https://blogtech.com/products/{formData.slug || 'product-slug'}
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
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
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Publishing Settings
              </h3>
              <Badge status={formData.status}>
                {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Published'}
              </Badge>
            </div>

            <FormField label="Publication Status" required>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all font-medium"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </FormField>

            <FormField label="Catalog Sort Order" hint="Lower rank numbers appear first">
              <input
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all font-mono"
              />
            </FormField>

            <FormField label="Publication Date" hint="Schedule or release date">
              <input
                type="date"
                value={formData.published_at}
                onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                className="w-full px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all"
              />
            </FormField>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSubmit}
                isLoading={isSaving}
                fullWidth
              >
                {isEditing ? 'Save Product Changes' : 'Create & Publish'}
              </Button>
              <Button
                variant="secondary"
                onClick={onBack}
                disabled={isSaving}
                fullWidth
              >
                Discard
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              All 20 fields, media, and SEO sync atomically to API.
            </p>
          </div>

          {/* CARD B: FEATURED IMAGE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={16} className="text-[#a34b03]" />
                <h3 className="text-sm font-semibold text-slate-900">Featured Image</h3>
              </div>
              <span className="text-[11px] text-slate-400">Primary Thumbnail</span>
            </div>

            {featuredPreview ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col relative group">
                <div className="h-44 w-full flex items-center justify-center bg-slate-950 p-2 overflow-hidden">
                  <img
                    src={featuredPreview}
                    alt="Featured preview"
                    className="max-h-full max-w-full object-contain rounded"
                    onError={(e) => handleImageError(e, 'Preview', true)}
                  />
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {featuredFile ? featuredFile.name : (removeFeaturedImage ? 'Marked for deletion' : 'Current Image')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={UploadCloud}
                      onClick={() => featuredInputRef.current?.click()}
                    >
                      Replace
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={handleDeleteFeaturedImage}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => featuredInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSelectFeaturedFile(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-[#a34b03] rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-[#a34b03]/5 transition-colors cursor-pointer text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#a34b03]">
                  <UploadCloud size={20} />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Select Featured Thumbnail
                </div>
                <div className="text-[11px] text-slate-400">
                  Square or 4:3 catalog card image (up to 5MB)
                </div>
              </div>
            )}
          </div>

          {/* CARD C: GALLERY IMAGES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers size={16} className="text-[#a34b03]" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Photo Gallery</h3>
                  <span className="text-[11px] text-slate-500">
                    {totalGalleryCount} photo(s) attached
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="secondary"
                icon={Plus}
                onClick={() => galleryInputRef.current?.click()}
              >
                Add Photos
              </Button>
            </div>

            {/* Gallery Grid: Display existing + staged new photos */}
            {totalGalleryCount > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-0.5">
                {/* 1. Existing Gallery Photos */}
                {existingGallery.map((item, idx) => (
                  <div
                    key={item.id || `exist-${idx}`}
                    className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 aspect-square flex items-center justify-center"
                  >
                    <img
                      src={item.url}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, `Gallery #${idx + 1}`)}
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-slate-900/70 text-[9px] text-white font-mono">
                      #{idx + 1}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingGalleryImage(item, idx)}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* 2. Newly Staged Gallery Photos */}
                {stagedGalleryPreviews.map((item, idx) => (
                  <div
                    key={item.id || `staged-${idx}`}
                    className="group relative rounded-lg border-2 border-[#a34b03]/50 overflow-hidden bg-slate-100 aspect-square flex items-center justify-center"
                  >
                    <img
                      src={item.url}
                      alt={`New Staged ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#a34b03] text-[9px] text-white font-semibold uppercase tracking-wider">
                      New
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteStagedGalleryImage(idx)}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer"
                        title="Remove staged photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty gallery dropzone */
              <div
                onClick={() => galleryInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleSelectGalleryFiles(e.dataTransfer.files);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-[#a34b03] rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-[#a34b03]/5 transition-colors cursor-pointer text-center"
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
