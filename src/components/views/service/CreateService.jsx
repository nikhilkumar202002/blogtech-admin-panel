import React, { useState, useRef } from 'react';
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
  ExternalLink,
  Save,
  Image as ImageIcon,
  Clock,
  EyeOff,
  AlertCircle,
  Hash,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useToast } from '../../ui/ToastContext';
import {
  createService,
  updateService,
  publishService,
  unpublishService,
} from '../../../utils/ourservice.service';
import { API_BASE_URL } from '../../../utils/main.service';

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
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

export const CreateService = ({
  initialService = null,
  onBack,
  onSuccess,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialService?.id);

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
      : new Date().toISOString().split('T')[0],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);

  // Featured Image File & Preview
  const [featuredFile, setFeaturedFile] = useState(null);
  const [featuredPreview, setFeaturedPreview] = useState(
    formatImageUrl(initialService?.featured_image_url || initialService?.featured_image) || null
  );

  const fileInputRef = useRef(null);

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
      setFeaturedFile(file);
      setFeaturedPreview(URL.createObjectURL(file));
      addToast({
        title: 'Image Selected',
        message: `${file.name} ready for upload.`,
        type: 'info',
      });
    }
  };

  const handleRemoveImage = () => {
    setFeaturedFile(null);
    setFeaturedPreview(null);
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
    if (!formData.short_description.trim()) {
      errors.short_description = 'Short description is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Toggle Live Publish / Unpublish if already saved
  const handleTogglePublish = async () => {
    if (!initialService?.id) {
      setFormData((prev) => ({
        ...prev,
        status: prev.status === 'published' ? 'draft' : 'published',
      }));
      return;
    }

    const isCurrentlyPublished = formData.status === 'published';
    setIsStatusBusy(true);
    try {
      if (isCurrentlyPublished) {
        await unpublishService(initialService.id);
        addToast({
          title: 'Service Unpublished',
          message: `"${formData.name}" is now unpublished.`,
          type: 'info',
        });
        setFormData((prev) => ({ ...prev, status: 'unpublished' }));
      } else {
        await publishService(initialService.id);
        addToast({
          title: 'Service Published',
          message: `"${formData.name}" is now live and published!`,
          type: 'success',
        });
        setFormData((prev) => ({ ...prev, status: 'published' }));
      }
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || 'Could not change status.',
        type: 'error',
      });
    } finally {
      setIsStatusBusy(false);
    }
  };

  // Form Submit: POST /admin/services OR POST /admin/services/:id
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      addToast({
        title: 'Form Validation Failed',
        message: 'Please review the highlighted fields before saving.',
        type: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('short_description', formData.short_description.trim());
      payload.append('description', formData.description.trim());
      payload.append('content', formData.content || '');
      payload.append('status', formData.status || 'published');
      payload.append('sort_order', String(formData.sort_order ?? 1));

      if (formData.published_at) {
        payload.append('published_at', formData.published_at);
      }

      if (featuredFile instanceof File) {
        payload.append('featured_image', featuredFile);
      }

      if (isEditing) {
        // Edit Service: POST /admin/services/:id
        await updateService(initialService.id, payload);
        addToast({
          title: 'Service Updated',
          message: `"${formData.name}" specifications updated successfully.`,
          type: 'success',
        });
      } else {
        // Create Service: POST /admin/services
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

  const statusLabel = formData.status.toLowerCase();
  let badgeType = 'default';
  if (statusLabel === 'published') badgeType = 'Active';
  else if (statusLabel === 'draft') badgeType = 'Draft';
  else if (statusLabel === 'unpublished') badgeType = 'Closed';

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

            <Badge status={badgeType}>
              {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
            </Badge>

            {isEditing && initialService?.id && (
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                ID #{initialService.id}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            icon={formData.status === 'published' ? EyeOff : Globe}
            onClick={handleTogglePublish}
            isLoading={isStatusBusy}
            title="Toggle published status"
          >
            {formData.status === 'published' ? 'Unpublish' : 'Make Published'}
          </Button>

          <Button
            variant="primary"
            icon={isSaving ? RefreshCw : Save}
            onClick={handleSubmit}
            isLoading={isSaving}
          >
            {isEditing ? 'Save Changes' : 'Create Service'}
          </Button>
        </div>
      </div>

      {/* 2. TWO-COLUMN RESPONSIVE FORM LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: PRIMARY FIELDS & CONTENT (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* GENERAL INFORMATION CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wrench size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                General Service Information
              </h2>
            </div>

            {/* Service Name */}
            <FormField
              label="Service Name"
              required
              error={formErrors.name}
              helpText="Enter the official commercial name of this service offering."
            >
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Web Development"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.name
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
            </FormField>

            {/* Public URL Slug */}
            <FormField
              label="Public URL Route Slug"
              helpText="Used for search engine URLs and public linking."
            >
              <div className="flex rounded-lg shadow-2xs">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs font-mono">
                  /services/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  placeholder="web-development"
                  className="flex-1 px-3 py-2.5 rounded-r-lg border border-slate-300 text-xs font-mono focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </FormField>

            {/* Short Description */}
            <FormField
              label="Short Tagline / Summary"
              required
              error={formErrors.short_description}
              helpText="High-impact 1-2 sentence elevator pitch displayed in catalog listings."
            >
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => {
                  setFormData({ ...formData, short_description: e.target.value });
                  if (formErrors.short_description) {
                    setFormErrors((prev) => ({ ...prev, short_description: '' }));
                  }
                }}
                placeholder="e.g. Modern, responsive websites built for scale, performance, and conversions."
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                  formErrors.short_description
                    ? 'border-red-300 focus:ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
            </FormField>

            {/* Full Description / Overview */}
            <FormField
              label="Detailed Overview & Scope"
              helpText="Comprehensive summary of engineering methodology and solution architecture."
            >
              <textarea
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. We provide professional website development services using modern React, Next.js, and high-throughput backend APIs..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm leading-relaxed focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
              />
            </FormField>
          </div>

          {/* WYSIWYG MS WORD STYLE CONTENT EDITOR */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Service Content & Technical Guide
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">MS Word Rich Editor</span>
            </div>

            <p className="text-xs text-slate-500 -mt-1">
              Author rich marketing copy, feature bullet points, technical deliverables, and headings.
            </p>

            <RichTextEditor
              value={formData.content}
              onChange={(newHtml) => setFormData({ ...formData, content: newHtml })}
              placeholder="<h2>Professional Web Development</h2><p>Write your detailed service breakdown, client deliverables, and technical features...</p>"
              minHeight="320px"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: MEDIA, SETTINGS & SEO PREVIEW (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* FEATURED IMAGE UPLOADER CARD */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <ImageIcon size={15} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Featured Image</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Catalog Cover</span>
            </div>

            {featuredPreview ? (
              <div className="flex flex-col gap-3">
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-950 h-52 flex items-center justify-center shadow-xs">
                  <img
                    src={featuredPreview}
                    alt="Featured preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-md"
                    title="Remove featured image"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate font-mono text-[11px]">
                    {featuredFile?.name || 'Current image uploaded'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-44 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-all p-4 text-center"
              >
                <div className="p-3 rounded-full bg-slate-100 text-slate-500">
                  <UploadCloud size={24} />
                </div>
                <div className="text-xs font-semibold text-slate-700">Click to upload featured image</div>
                <div className="text-[11px] text-slate-400">JPEG, PNG, WebP up to 5MB</div>
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

          {/* PUBLISHING & CATALOG SETTINGS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Publishing Settings</h3>
              </div>
              <Badge status={badgeType}>
                {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
              </Badge>
            </div>

            {/* Lifecycle Status - Tactile 3-Pill Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Lifecycle Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'published', label: 'Published', sub: 'Live on site', dot: 'bg-emerald-500' },
                  { value: 'draft', label: 'Draft', sub: 'Work in progress', dot: 'bg-amber-500' },
                  { value: 'unpublished', label: 'Unpublished', sub: 'Hidden / Closed', dot: 'bg-slate-400' },
                ].map((opt) => {
                  const isSelected = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                        <span className="text-xs font-bold truncate">{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate leading-tight">
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Sort Order */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Catalog Sort Order
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash size={14} />
                </div>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-800 bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="1"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Controls display order in the services catalog (e.g. 1 appears first).
              </p>
            </div>

            {/* Publication Date */}
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Publication Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar size={14} />
                </div>
                <input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Scheduled release date or original publication timestamp.
              </p>
            </div>

            {/* Real-time Status Explanation Banner */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600 mt-1">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  formData.status === 'published'
                    ? 'bg-emerald-500 animate-pulse'
                    : formData.status === 'draft'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-[11.5px] leading-relaxed">
                {formData.status === 'published'
                  ? 'This service will be visible to clients on the live website.'
                  : formData.status === 'draft'
                  ? 'This service will remain in draft mode (internal review only).'
                  : 'This service will be archived and hidden from the public catalog.'}
              </span>
            </div>

            {/* Publishing Container Actions */}
            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100">
              <Button
                variant="primary"
                icon={isSaving ? RefreshCw : Save}
                onClick={handleSubmit}
                isLoading={isSaving}
                fullWidth
                className="py-2.5 shadow-sm"
              >
                {isEditing ? 'Save Changes' : 'Publish Service'}
              </Button>
              <Button
                variant="secondary"
                onClick={onBack}
                disabled={isSaving}
                fullWidth
              >
                Cancel & Return
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateService;