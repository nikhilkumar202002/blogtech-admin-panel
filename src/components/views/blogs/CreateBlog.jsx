import { useState } from 'react';
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

export const CreateBlog = ({
  initialBlog = null,
  onSave,
  onAddBlog,
  onUpdateBlog,
  onBack,
  onSuccess,
  onPreview,
}) => {
  const { addToast } = useToast();
  const isEditing = Boolean(initialBlog?.id);

  // SEO Accordion Collapse State
  const [isSeoOpen, setIsSeoOpen] = useState(
    Boolean(initialBlog?.seoTitle || initialBlog?.seoDescription)
  );

  // Form State initialized from initialBlog
  const [formData, setFormData] = useState({
    title: initialBlog?.title || '',
    slug: initialBlog?.slug || '',
    category: initialBlog?.category || 'Engineering',
    author: initialBlog?.author || 'Sarah Jenkins (Lead Editor)',
    status: initialBlog?.status || 'Published',
    coverImage:
      initialBlog?.coverImage !== undefined
        ? initialBlog.coverImage
        : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    excerpt: initialBlog?.excerpt || '',
    content:
      initialBlog?.content !== undefined
        ? initialBlog.content
        : '<h2>Introduction</h2><p>Write your detailed article body content here...</p>',
    seoTitle: initialBlog?.seoTitle || '',
    seoDescription: initialBlog?.seoDescription || '',
    publishedAt: initialBlog?.publishedAt || new Date().toISOString().split('T')[0],
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
      slug: formData.slug.trim() || generateSlug(formData.title || 'untitled-article'),
      id: initialBlog?.id || 'preview-temp-id',
      readTime: initialBlog?.readTime || '5 min read',
    };
    if (onPreview) {
      onPreview(previewData);
    }
  };

  // Form Submit Handler
  const handleFormSubmit = (e, forcedStatus = null) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Article title is required.' });
      addToast({ title: 'Validation Error', message: 'Article title is required.', type: 'error' });
      return;
    }

    const finalStatus = forcedStatus || formData.status;
    const finalSlug = formData.slug.trim() || generateSlug(formData.title);

    const savedBlog = {
      ...(initialBlog || {}),
      ...formData,
      slug: finalSlug,
      status: finalStatus,
      id: initialBlog?.id || `BLOG-${Math.floor(200 + Math.random() * 800)}`,
      views: initialBlog?.views || '0',
      readTime: initialBlog?.readTime || '5 min read',
    };

    if (onSave) {
      onSave(savedBlog);
    } else if (isEditing && onUpdateBlog) {
      onUpdateBlog(savedBlog);
    } else if (!isEditing && onAddBlog) {
      onAddBlog(savedBlog);
    }

    if (onSuccess) {
      onSuccess(savedBlog);
    }

    addToast({
      title: 'Article Saved',
      message: isEditing
        ? `Article "${formData.title}" saved as ${finalStatus}.`
        : `New article "${formData.title}" saved as ${finalStatus}.`,
      type: 'success',
    });
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
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={(e) => handleFormSubmit(e, 'Draft')}
          >
            Save Draft
          </Button>
          {onPreview && (
            <Button
              variant="secondary"
              icon={Eye}
              onClick={handlePreview}
            >
              Preview
            </Button>
          )}
          <Button
            variant="accent"
            icon={Send}
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
                  options={BLOG_CATEGORIES}
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
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{formData.author || 'Sarah Jenkins'}</span>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                onClick={(e) => handleFormSubmit(e, 'Draft')}
              >
                Save Draft
              </Button>
              {onPreview && (
                <Button
                  variant="secondary"
                  icon={Eye}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              )}
              <Button
                type="submit"
                variant="accent"
                icon={Send}
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
            onClick={(e) => handleFormSubmit(e, 'Draft')}
            style={{ flex: 1, minHeight: '44px' }}
          >
            Save Draft
          </Button>
          <Button
            type="submit"
            variant="accent"
            icon={Send}
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
