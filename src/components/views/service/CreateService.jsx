import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Wrench,
  Trash2,
  UploadCloud,
  RefreshCw,
  Globe,
  Calendar,
  FileText,
  Sparkles,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  X,
  ListPlus,
  Tag,
  Hash,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useToast } from '../../ui/ToastContext';
import {
  getServices,
  getService,
  createService,
  updateService,
} from '../../../utils/ourservice.service';
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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CreateService = ({
  initialService = null,
  onBack,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialService?.id);
  const [isAutoCalculated, setIsAutoCalculated] = useState(!initialService?.id);

  // Form State matching backend payload
  const [formData, setFormData] = useState({
    name: initialService?.name || '',
    slug: initialService?.slug || '',
    short_description: initialService?.short_description || '',
    description: initialService?.description || '',
    content: initialService?.content || '',
    status: initialService?.status || 'published',
    sort_order: initialService?.sort_order ?? 1,
    published_at: initialService?.published_at
      ? initialService.published_at.split('T')[0]
      : getTodayDateString(),
  });

  // Features list state: array of feature string bullets
  const [features, setFeatures] = useState(() => {
    let raw = initialService?.features || [];
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = raw.split('\n').filter(Boolean);
      }
    }
    return Array.isArray(raw) ? raw : [];
  });
  const [featureInput, setFeatureInput] = useState('');

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Featured Image File & Preview
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(
    formatImageUrl(
      initialService?.featured_image_path ||
      initialService?.featured_image_url ||
      initialService?.featured_image
    ) || null
  );
  const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);

  const fileInputRef = useRef(null);

  // If editing an existing service, fetch fresh details to ensure latest features & content
  useEffect(() => {
    if (initialService?.id) {
      getService(initialService.id)
        .then((res) => {
          const fresh = res?.data || res?.service || res;
          if (fresh && fresh.id) {
            setFormData({
              name: fresh.name || '',
              slug: fresh.slug || '',
              short_description: fresh.short_description || '',
              description: fresh.description || '',
              content: fresh.content || '',
              status: fresh.status || 'published',
              sort_order: fresh.sort_order ?? 1,
              published_at: fresh.published_at ? fresh.published_at.split('T')[0] : getTodayDateString(),
            });

            let fList = fresh.features || [];
            if (typeof fList === 'string') {
              try {
                fList = JSON.parse(fList);
              } catch {
                fList = fList.split('\n').filter(Boolean);
              }
            }
            if (Array.isArray(fList)) {
              setFeatures(fList);
            }

            const freshImg = formatImageUrl(
              fresh.featured_image_path ||
              fresh.featured_image_url ||
              fresh.featured_image
            );
            if (freshImg) {
              setFeaturedPreview(freshImg);
            }
          }
        })
        .catch((err) => console.warn('Could not sync fresh service details:', err));
    }
  }, [initialService?.id]);

  // Auto-calculate sort_order from database for new services
  useEffect(() => {
    if (!isEditing) {
      const fetchLatestMaxSortOrder = async () => {
        try {
          const res = await getServices({ per_page: 100 });
          let list = [];
          if (Array.isArray(res?.data)) list = res.data;
          else if (Array.isArray(res?.data?.data)) list = res.data.data;
          else if (Array.isArray(res)) list = res;
          else if (Array.isArray(res?.services)) list = res.services;

          if (list.length > 0) {
            const maxOrder = list.reduce((max, item) => {
              const val = Number(item?.sort_order);
              return !isNaN(val) ? Math.max(max, val) : max;
            }, 0);
            setFormData((prev) => ({
              ...prev,
              sort_order: maxOrder + 1,
            }));
            setIsAutoCalculated(true);
          }
        } catch (err) {
          console.warn('Could not auto-calculate next sort order from database:', err);
        }
      };

      fetchLatestMaxSortOrder();
    }
  }, [isEditing]);

  const handleRecalculateSortOrder = async () => {
    try {
      const res = await getServices({ per_page: 100 });
      let list = [];
      if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.services)) list = res.services;

      const maxOrder = list.reduce((max, item) => {
        const val = Number(item?.sort_order);
        return !isNaN(val) ? Math.max(max, val) : max;
      }, 0);
      setFormData((prev) => ({ ...prev, sort_order: maxOrder + 1 }));
      setIsAutoCalculated(true);
      addToast({
        title: 'Sort Order Updated',
        message: `Next catalog order position set to #${maxOrder + 1}.`,
        type: 'info',
      });
    } catch (err) {
      console.warn('Failed to recalculate sort order:', err);
    }
  };

  // Name change handler with auto-slug generation
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: !isEditing ? generateSlug(newName) : prev.slug,
    }));
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  // Feature Points Management Handlers
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      addToast({
        title: 'Duplicate Feature',
        message: 'This feature item is already in the list.',
        type: 'warning',
      });
      return;
    }
    setFeatures([...features, trimmed]);
    setFeatureInput('');
  };

  const handleKeyDownFeature = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const handleRemoveFeature = (indexToRemove) => {
    setFeatures(features.filter((_, idx) => idx !== indexToRemove));
  };

  // Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
        title: 'Image Selected',
        message: `${file.name} ready for upload.`,
        type: 'info',
      });
    }
  };

  const handleRemoveImage = () => {
    if (featuredPreview && featuredPreview.startsWith('blob:')) {
      URL.revokeObjectURL(featuredPreview);
    }
    setFeaturedFile(null);
    setFeaturedPreview(null);
    setRemoveFeaturedImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Service name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit: POST /admin/services OR POST /admin/services/:id
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      addToast({
        title: 'Validation Error',
        message: 'Please review the highlighted required fields.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      if (formData.slug?.trim()) {
        payload.append('slug', formData.slug.trim());
      }
      payload.append('short_description', formData.short_description?.trim() || '');
      payload.append('description', formData.description?.trim() || '');
      payload.append('content', formData.content || '');

      // Features array as JSON string
      const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
      payload.append('features', JSON.stringify(cleanFeatures));

      payload.append('status', formData.status || 'published');
      payload.append('sort_order', String(Number(formData.sort_order) || 1));
      payload.append('published_at', formData.published_at || '');

      if (featuredFile) {
        payload.append('featured_image', featuredFile);
      } else if (isEditing && removeFeaturedImage) {
        payload.append('remove_featured_image', '1');
      }

      if (isEditing) {
        await updateService(initialService.id, payload);
        addToast({
          title: 'Service Updated',
          message: `"${formData.name}" updated successfully.`,
          type: 'success',
        });
      } else {
        await createService(payload);
        addToast({
          title: 'Service Created',
          message: `"${formData.name}" created and added to catalog.`,
          type: 'success',
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      addToast({
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to save service.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: onBack },
              { label: 'Services', onClick: onBack },
              { label: isEditing ? `Edit: ${formData.name || 'Service'}` : 'Create New Service' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Return to services catalog"
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? (formData.name ? `Edit: ${formData.name}` : 'Edit Service') : 'Create New Service'}
            </h1>

            <Badge status={formData.status}>
              {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Published'}
            </Badge>

            {isEditing && initialService?.id && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                ID #{initialService.id}
              </span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            icon={Save}
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Create & Publish'}
          </Button>
        </div>
      </div>

      {/* 2. TWO-COLUMN RESPONSIVE FORM LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY DETAILS, PUBLISHING, FEATURES & CONTENT (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* CARD 1: GENERAL INFORMATION */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-[#a34b03]/10 border border-[#a34b03]/20 flex items-center justify-center text-[#a34b03]">
                <Wrench size={17} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  General Information
                </h2>
                <p className="text-xs text-slate-500">
                  Official service title, public URL slug, and summary overview
                </p>
              </div>
            </div>

            {/* Service Name */}
            <FormField
              label="Service Name"
              required
              error={formErrors.name}
              hint="Enter the official commercial name of this service offering."
            >
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Web Development"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.name
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-[#a34b03] focus:ring-[#a34b03]/15'
                }`}
              />
            </FormField>

            {/* Public URL Slug */}
            <FormField
              label="Public URL Route Slug"
              hint="Unique route identifier for public service page"
            >
              <div className="flex rounded-lg shadow-2xs overflow-hidden border border-slate-200 focus-within:border-[#a34b03] focus-within:ring-2 focus-within:ring-[#a34b03]/15 transition-all">
                <span className="inline-flex items-center px-3 border-r border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono">
                  /services/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  placeholder="web-development"
                  className="flex-1 px-3 py-2 text-xs font-mono text-slate-900 bg-white outline-none"
                />
              </div>
            </FormField>

            {/* Short Description */}
            <FormField
              label="Short Tagline / Summary"
              hint="Concise 1-2 sentence overview shown in service catalog cards"
            >
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="e.g. Modern, responsive websites built for business growth."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 outline-none transition-all"
              />
            </FormField>

            {/* Full Description / Overview */}
            <FormField
              label="Detailed Overview & Scope"
              hint="Comprehensive summary of engineering methodology and solution architecture."
            >
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. We provide professional website development services to help businesses establish a strong digital presence..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white leading-relaxed focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 outline-none transition-all"
              />
            </FormField>
          </div>

          {/* CARD 2: PUBLISHING SETTINGS (3 IN A ROW) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Globe size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Publishing Settings</h2>
                  <p className="text-xs text-slate-500">Publication status, catalog display order, and release timestamp</p>
                </div>
              </div>
              <Badge status={formData.status}>
                {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Published'}
              </Badge>
            </div>

            {/* 3 Fields arranged in 3 separate rows */}
            <div className="grid grid-cols-1 gap-4">
              {/* 1. Publication Status */}
              <FormField label="Publication Status" required>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all font-medium cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </FormField>

              {/* 2. Catalog Sort Order */}
              <FormField
                label="Catalog Sort Order"
                hint={
                  !isEditing && isAutoCalculated
                    ? 'Auto-calculated from DB (rank + 1)'
                    : 'Lower ranks appear first'
                }
              >
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => {
                      setIsAutoCalculated(false);
                      setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 });
                    }}
                    className="w-full px-3.5 py-2.5 pr-24 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all font-mono font-medium"
                  />
                  <div className="absolute right-2 flex items-center gap-1.5">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={handleRecalculateSortOrder}
                        className="text-[10px] font-semibold text-[#844414] bg-[#edd8bb] hover:bg-[#e4cbab] border border-[#dfc49f] px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        title="Click to recalculate next sort order from database"
                      >
                        {isAutoCalculated ? 'Auto (DB)' : 'Reset'}
                      </button>
                    )}
                  </div>
                </div>
              </FormField>

              {/* 3. Publication Date */}
              <div className="flex flex-col gap-1.5 w-full mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-slate-700">
                    Publication Date
                  </label>
                  {formData.published_at !== getTodayDateString() ? (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, published_at: getTodayDateString() })
                      }
                      className="text-[11px] font-medium text-[#a34b03] hover:underline cursor-pointer"
                      title="Reset date to today"
                    >
                      Reset to Today
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#844414] bg-[#edd8bb] border border-[#dfc49f] px-2 py-0.5 rounded-full">
                      Today (Auto)
                    </span>
                  )}
                </div>

                <input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) =>
                    setFormData({ ...formData, published_at: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all font-medium cursor-pointer"
                />

                <span className="text-xs text-slate-500">
                  {formData.published_at === getTodayDateString()
                    ? "Automatically set to today • Click calendar to modify"
                    : `Custom release date: ${formData.published_at}`}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: KEY FEATURES & DELIVERABLES */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#cb9706]/15 border border-[#cb9706]/30 flex items-center justify-center text-[#cb9706]">
                  <Sparkles size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Key Features & Technical Highlights
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bulleted service capabilities, deliverables, and architecture modules
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#edd8bb] text-[#844414] border border-[#dfc49f]">
                {features.length} {features.length === 1 ? 'Feature' : 'Features'} Defined
              </span>
            </div>

            {/* Feature Input Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleKeyDownFeature}
                placeholder="e.g. AWS, GCP & Azure Architecture"
                className="flex-1 px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#a34b03] focus:ring-2 focus:ring-[#a34b03]/15 transition-all"
              />
              <Button
                variant="primary"
                icon={Plus}
                onClick={handleAddFeature}
                disabled={!featureInput.trim()}
              >
                Add Feature
              </Button>
            </div>

            {/* Features List */}
            {features.length > 0 ? (
              <div className="flex flex-col gap-2 pt-1">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#a34b03]/10 text-[#a34b03] flex items-center justify-center text-[11px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800 break-words">
                        {feat}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Remove feature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center gap-1.5">
                <ListPlus size={20} className="text-slate-400" />
                <span>No features added yet. Type a capability above and click &quot;Add Feature&quot;.</span>
              </div>
            )}
          </div>

          {/* CARD 4: RICH TEXT CONTENT & SCOPE EDITOR */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#a34b03]/10 border border-[#a34b03]/20 flex items-center justify-center text-[#a34b03]">
                  <FileText size={17} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Service Content & Technical Guide
                  </h2>
                  <p className="text-xs text-slate-500">
                    MS Word styled rich editor for detailed methodology, deliverables, and headings
                  </p>
                </div>
              </div>
            </div>

            <RichTextEditor
              value={formData.content}
              onChange={(newHtml) => setFormData({ ...formData, content: newHtml })}
              placeholder="<h2>Professional Web Development</h2><p>Write your detailed service breakdown, client deliverables, and technical features...</p>"
              minHeight="340px"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS & FEATURED IMAGE (1 Col - Sticky & Static on Desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-4 self-start flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto pr-0.5">
          {/* CARD A: ACTIONS CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Actions
              </h3>
              <Badge status={formData.status}>
                {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1) : 'Published'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {formData.status === 'published'
                ? 'This service offering will be publicly visible on the live catalog.'
                : formData.status === 'draft'
                ? 'This service is saved in draft mode (internal review only).'
                : 'This service is archived and hidden from public catalog.'}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSubmit}
                isLoading={isSaving}
                className="flex-1"
              >
                {isEditing ? 'Save Changes' : 'Create & Publish'}
              </Button>

              <Button
                variant="secondary"
                onClick={onBack}
                disabled={isSaving}
                className="flex-1"
              >
                Discard
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              All fields, features, and media sync atomically to API.
            </p>
          </div>

          {/* CARD B: FEATURED IMAGE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={16} className="text-[#a34b03]" />
                <h3 className="text-sm font-semibold text-slate-900">Featured Image</h3>
              </div>
              <span className="text-[11px] text-slate-400">Catalog Cover</span>
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
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={handleRemoveImage}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#a34b03] rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-[#a34b03]/5 transition-colors cursor-pointer text-center"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#a34b03]">
                  <UploadCloud size={20} />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  Select Featured Image
                </div>
                <div className="text-[11px] text-slate-400">
                  Square, 4:3, or 16:9 banner (JPEG, PNG, WebP up to 5MB)
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateService;
