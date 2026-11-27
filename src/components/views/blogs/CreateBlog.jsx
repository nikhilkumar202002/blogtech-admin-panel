import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { Select } from '../../ui/Select';
import { DatePicker } from '../../ui/DatePicker';
import { ImageUploader } from '../../ui/ImageUploader';
import { useToast } from '../../ui/ToastContext';
import { BLOG_CATEGORIES } from '../../../mockData';
import { getStoredUser } from '../../../utils/auth.service';
import { formatImageUrl } from '../../../utils/image.helper';
import { createBlog, updateBlog, getBlogCategories } from '../../../utils/blog.service';

export const CreateBlog = ({
  initialBlog = null,
  currentUser = null,
  onSave,
  onAddBlog,
  onUpdateBlog,
  onBack,
  onSuccess,
  onPreview,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialBlog?.id);

  // Author is always dynamically resolved to current logged in user
  const currentUserName =
    currentUser?.name ||
    getStoredUser()?.name ||
    'Administrator';

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [featuredFile, setFeaturedFile] = useState(null);
  const [apiCategories, setApiCategories] = useState([]);

  // Fetch actual categories from database
  useEffect(() => {
    let isMounted = true;
    getBlogCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setApiCategories(list);
        }
      })
      .catch((err) => {
        console.warn('Could not load categories:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // SEO Accordion Collapse State
  const [isSeoOpen, setIsSeoOpen] = useState(
    Boolean(initialBlog?.seoTitle || initialBlog?.seoDescription || initialBlog?.meta_title || initialBlog?.meta_description)
  );

  // Initial category value
  const initialCategoryVal =
    initialBlog?.category_id
      ? String(initialBlog.category_id)
      : typeof initialBlog?.category === 'object' && initialBlog?.category?.id
      ? String(initialBlog.category.id)
      : typeof initialBlog?.category === 'string'
      ? initialBlog.category
      : '1';

  // Form State initialized from initialBlog
  const [formData, setFormData] = useState({
    title: initialBlog?.title || '',
    slug: initialBlog?.slug || '',
    category: initialCategoryVal,
    author:
      typeof initialBlog?.author === 'object'
        ? initialBlog.author?.name || currentUserName
        : initialBlog?.author || currentUserName,
    status: initialBlog?.status || 'Published',
    coverImage:
      formatImageUrl(
        initialBlog?.coverImage ||
        initialBlog?.featured_image_url ||
        initialBlog?.featured_image ||
        initialBlog?.featured_image_path
      ) || '',
    excerpt: initialBlog?.excerpt || initialBlog?.short_description || '',
    content:
      initialBlog?.content !== undefined
        ? initialBlog.content
        : '<h2>Introduction</h2><p>Write your detailed article body content here...</p>',
    seoTitle: initialBlog?.seoTitle || initialBlog?.meta_title || '',
    seoDescription: initialBlog?.seoDescription || initialBlog?.meta_description || '',
    publishedAt:
      (initialBlog?.publishedAt || initialBlog?.published_at)
        ? String(initialBlog.publishedAt || initialBlog.published_at).split('T')[0]
        : new Date().toISOString().split('T')[0],
  });

  // Inline Validation Errors
  const [errors, setErrors] = useState({});

  // Helper Slug Generator
  const generateSlug = (text) => {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Preview Handler
  const handlePreview = () => {
    const previewData = {
      ...(initialBlog || {}),
      ...formData,
      author: currentUserName,
      slug: formData.slug.trim() || generateSlug(formData.title || 'untitled-article'),
      id: initialBlog?.id || 'preview-temp-id',
      readTime: initialBlog?.readTime || '5 min read',
    };
    if (onPreview) {
      onPreview(previewData);
    }
  };

  // Form Submit Handler with Direct API persistence
  const handleFormSubmit = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Article title is required.' });
      addToast({ title: 'Validation Error', message: 'Article title is required.', type: 'error' });
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      addToast({ title: 'Validation Error', message: 'Article content is required.', type: 'error' });
      return;
    }

    const rawStatus = (forcedStatus || formData.status || 'Published').toLowerCase();
    const finalStatus = ['published', 'draft', 'unpublished'].includes(rawStatus) ? rawStatus : 'published';
    const finalSlug = formData.slug.trim() || generateSlug(formData.title);

    // Resolve numeric category_id
    let resolvedCategoryId = null;
    if (formData.category) {
      if (!isNaN(Number(formData.category))) {
        resolvedCategoryId = Number(formData.category);
      } else {
        const found = apiCategories.find(
          (c) => c.name.toLowerCase() === String(formData.category).toLowerCase()
        );
        if (found) resolvedCategoryId = found.id;
      }
    }

    const payload = {
      title: formData.title.trim(),
      slug: finalSlug,
      content: formData.content,
      excerpt: formData.excerpt,
      description: formData.excerpt,
      status: finalStatus,
      published_at: formData.publishedAt,
      category_id: resolvedCategoryId,
      featured_image: featuredFile,
      coverImage: formData.coverImage,
    };

    setIsSaving(true);
    try {
      let savedBlog = null;
      if (isEditing && initialBlog?.id && !String(initialBlog.id).startsWith('BLOG-')) {
        const res = await updateBlog(initialBlog.id, payload);
        savedBlog = res?.data || res;
        addToast({
          title: 'Article Updated',
          message: `Article "${formData.title}" was updated successfully.`,
          type: 'success',
        });
      } else {
        const res = await createBlog(payload);
        savedBlog = res?.data || res;
        addToast({
          title: 'Article Saved',
          message: `Article "${formData.title}" was saved to database successfully.`,
          type: 'success',
        });
      }

      if (onSuccess) {
        onSuccess(savedBlog);
      } else if (onSave) {
        onSave(savedBlog);
      } else if (isEditing && onUpdateBlog) {
        onUpdateBlog(savedBlog);
      } else if (!isEditing && onAddBlog) {
        onAddBlog(savedBlog);
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        'Failed to save article to server. Please check inputs.';
      addToast({
        title: 'Save Failed',
        message: errMsg,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* HEADER & TOP ACTIONS BAR */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px 0 rgba(16, 24, 40, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '8px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Back to Blogs"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <Breadcrumb
              items={[
                { label: 'Dashboard', onClick: onBack },
                { label: 'Blogs', onClick: onBack },
                { label: isEditing ? 'Edit Article' : 'Create Article' },
              ]}
            />
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
              {isEditing ? 'Edit Article' : 'Create Article'}
            </h1>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onBack && (
            <Button variant="secondary" onClick={onBack} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={(e) => handleFormSubmit(e, 'Draft')}
            disabled={isSaving}
          >
            Save Draft
          </Button>
          {onPreview && (
            <Button
              variant="secondary"
              icon={Eye}
              onClick={handlePreview}
              disabled={isSaving}
            >
              Preview
            </Button>
          )}
          <Button
            variant="accent"
            icon={Send}
            isLoading={isSaving}
            onClick={(e) => handleFormSubmit(e, 'Published')}
          >
            {isEditing ? 'Save Changes' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* MAIN LAYOUT (TWO COLUMNS: 70% LEFT MAIN AREA, 30% RIGHT SIDEBAR - SINGLE COLUMN ON MOBILE) */}
      <form onSubmit={(e) => handleFormSubmit(e)} noValidate style={{ paddingBottom: '70px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT MAIN AREA (70%) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Title & Slug Card */}
            <div className="card card-padded">
              <FormField label="Article Title" required error={errors.title}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData({
                      ...formData,
                      title: newTitle,
                      slug: isEditing && formData.slug ? formData.slug : generateSlug(newTitle),
                    });
                    if (errors.title) setErrors({ ...errors, title: null });
                  }}
                  placeholder="Enter article title"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderRadius: '8px',
                    border: errors.title ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    outline: 'none',
                  }}
                />
              </FormField>

              <FormField label="Slug" helperText="Automatically generated from article title">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="automatically generated slug"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                  }}
                />
              </FormField>

              <FormField label="Excerpt / Summary" helperText="A brief summary for previews and search results">
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Write a short summary of the article..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#334155',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </FormField>
            </div>

            {/* Large Rich Text Editor Content Card */}
            <div className="card card-padded">
              <FormField label="Content" required>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="Write article content..."
                  minHeight="360px"
                />
              </FormField>
            </div>

            {/* OPTIONAL COLLAPSIBLE SEO SECTION */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div
                onClick={() => setIsSeoOpen(!isSeoOpen)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    SEO Settings (Search Engine Optimization)
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Configure Meta Title & Meta Description tags for Google indexers
                  </p>
                </div>
                {isSeoOpen ? <ChevronUp size={18} style={{ color: '#64748b' }} /> : <ChevronDown size={18} style={{ color: '#64748b' }} />}
              </div>

              {isSeoOpen && (
                <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <FormField label="Meta Title">
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Meta title tag..."
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                  </FormField>

                  <FormField label="Meta Description">
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      placeholder="Meta description snippet..."
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR (30%) */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {/* Publishing Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 14px 0' }}>
                Publishing
              </h3>

              <FormField label="Status" required>
                <Select
                  fullWidth
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Published', label: 'Published' },
                    { value: 'Unpublished', label: 'Unpublished' },
                  ]}
                />
              </FormField>

              <FormField label="Publication Date">
                <DatePicker
                  value={formData.publishedAt}
                  onChange={(date) => setFormData({ ...formData, publishedAt: date })}
                />
              </FormField>

              <FormField label="Category">
                <Select
                  fullWidth
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={
                    apiCategories.length > 0
                      ? apiCategories.map((c) => ({ value: String(c.id), label: c.name }))
                      : BLOG_CATEGORIES.map((cat, idx) => ({ value: String(idx + 1), label: cat }))
                  }
                />
              </FormField>
            </div>

            {/* Featured Image Upload Area */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                Featured Image
              </h3>
              <ImageUploader
                value={formData.coverImage}
                onChange={(img) => setFormData({ ...formData, coverImage: img })}
                onFileSelect={(file, dataUrl) => {
                  setFeaturedFile(file);
                  setFormData((prev) => ({ ...prev, coverImage: dataUrl }));
                }}
              />
            </div>

            {/* Article Information Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
                Article Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Created</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.publishedAt}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Last updated</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>Recently</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Author</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{currentUserName}</span>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={(e) => handleFormSubmit(e, 'Draft')}
              >
                Save Draft
              </Button>
              {onPreview && (
                <Button
                  variant="secondary"
                  icon={Eye}
                  disabled={isSaving}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              )}
              <Button
                type="submit"
                variant="accent"
                icon={Send}
                isLoading={isSaving}
                onClick={(e) => handleFormSubmit(e, 'Published')}
              >
                {isEditing ? 'Save Changes' : 'Publish Article'}
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM ACTION BAR FOR BLOG EDITOR */}
        <div className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 sm:p-4 z-40 items-center justify-between gap-3 shadow-lg">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={(e) => handleFormSubmit(e, 'Draft')}
            style={{ flex: 1, minHeight: '44px' }}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            variant="accent"
            icon={Send}
            isLoading={isSaving}
            onClick={(e) => handleFormSubmit(e, 'Published')}
            style={{ flex: 1, minHeight: '44px' }}
          >
            {isEditing ? 'Save Changes' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
