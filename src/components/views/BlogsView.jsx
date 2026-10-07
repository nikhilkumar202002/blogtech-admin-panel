import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Send,
  EyeOff,
  Globe,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { DataTable } from '../ui/DataTable';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { RichTextEditor } from '../ui/RichTextEditor';
import { ImageUploader } from '../ui/ImageUploader';
import { DatePicker } from '../ui/DatePicker';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DropdownMenu } from '../ui/DropdownMenu';
import { useToast } from '../ui/ToastContext';
import { BLOG_CATEGORIES } from '../../mockData';

export const BlogsView = ({
  blogs = [],
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  isCreateOpen = false,
  onCloseCreateOpen,
  isLoading = false,
}) => {
  const { addToast } = useToast();

  // View Mode: 'list' (Table view) | 'form' (Create / Edit Article) | 'preview' (Blog Article Preview Page)
  const [viewMode, setViewMode] = useState('list');

  // Filter Bar State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Table Selection & Pagination State
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Article & Dialogs
  const [editingBlog, setEditingBlog] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [deleteBlogId, setDeleteBlogId] = useState(null);

  // SEO Accordion Collapse State
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Engineering',
    author: 'Sarah Jenkins (Lead Editor)',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    publishedAt: new Date().toISOString().split('T')[0],
  });

  // Inline Validation Errors
  const [errors, setErrors] = useState({});

  // Helper Slug Generator
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Engineering',
      author: 'Sarah Jenkins (Lead Editor)',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      status: 'Published',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      excerpt: '',
      content: '<h2>Introduction</h2><p>Write your detailed article body content here...</p>',
      seoTitle: '',
      seoDescription: '',
      publishedAt: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setIsSeoOpen(false);
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category || 'Engineering',
      author: blog.author || 'Sarah Jenkins (Lead Editor)',
      authorAvatar: blog.authorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      status: blog.status,
      coverImage: blog.coverImage || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      publishedAt: blog.publishedAt || new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setIsSeoOpen(!!(blog.seoTitle || blog.seoDescription));
    setViewMode('form');
  };

  // Open Preview Page View
  const handleOpenPreview = (blog) => {
    setPreviewBlog(blog);
    setViewMode('preview');
  };

  // Contextual Status Toggle (Publish / Unpublish)
  const handleToggleArticleStatus = (blog) => {
    let nextStatus = 'Published';
    if (blog.status === 'Published') {
      nextStatus = 'Unpublished';
    } else if (blog.status === 'Draft' || blog.status === 'Unpublished') {
      nextStatus = 'Published';
    }

    const updated = { ...blog, status: nextStatus };
    onUpdateBlog(updated);
    if (previewBlog && previewBlog.id === blog.id) {
      setPreviewBlog(updated);
    }
    addToast({
      title: nextStatus === 'Published' ? 'Article Published' : 'Article Unpublished',
      message: `Article "${blog.title}" status changed to ${nextStatus}.`,
      type: 'info',
    });
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
    const finalSlug = formData.slug || generateSlug(formData.title);

    if (editingBlog) {
      onUpdateBlog({
        ...editingBlog,
        ...formData,
        slug: finalSlug,
        status: finalStatus,
      });
      addToast({ title: 'Article Saved', message: `Article "${formData.title}" saved as ${finalStatus}.`, type: 'success' });
    } else {
      const newBlog = {
        id: `BLOG-${Math.floor(200 + Math.random() * 800)}`,
        ...formData,
        slug: finalSlug,
        status: finalStatus,
        views: '0',
        readTime: '5 min read',
      };
      onAddBlog(newBlog);
      addToast({ title: 'Article Saved', message: `New article "${formData.title}" saved as ${finalStatus}.`, type: 'success' });
    }

    setViewMode('list');
    onCloseCreateOpen && onCloseCreateOpen();
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (deleteBlogId) {
      onDeleteBlog(deleteBlogId);
      addToast({ title: 'Article Deleted', message: 'Blog article was permanently removed.', type: 'info' });
      setDeleteBlogId(null);
      if (previewBlog && previewBlog.id === deleteBlogId) {
        setPreviewBlog(null);
        setViewMode('list');
      }
    }
  };

  // Filtered & Sorted Blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.slug.toLowerCase().includes(search.toLowerCase()) ||
      (blog.author && blog.author.toLowerCase().includes(search.toLowerCase())) ||
      (blog.category && blog.category.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = !statusFilter || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === 'newest') return (b.publishedAt || '').localeCompare(a.publishedAt || '');
    if (sortBy === 'oldest') return (a.publishedAt || '').localeCompare(b.publishedAt || '');
    if (sortBy === 'updated') return (b.publishedAt || '').localeCompare(a.publishedAt || '');
    return 0;
  });

  // Table Columns Setup
  const columns = [
    {
      header: 'Featured Image',
      key: 'coverImage',
      render: (row) => (
        <img
          src={row.coverImage}
          alt={row.title}
          style={{
            width: '56px',
            height: '38px',
            borderRadius: '6px',
            objectFit: 'cover',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        />
      ),
    },
    {
      header: 'Article Title',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div style={{ maxWidth: '320px', cursor: 'pointer' }} onClick={() => handleOpenPreview(row)}>
          <div
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={row.title}
          >
            {row.title}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            Category: {row.category} • /{row.slug}
          </div>
        </div>
      ),
    },
    {
      header: 'Publication Date',
      key: 'publishedAt',
      sortable: true,
      render: (row) => <span style={{ fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>{row.publishedAt}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Last Updated',
      key: 'updated',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>Recently</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => {
        const isPublished = row.status === 'Published';
        const contextualLabel = isPublished ? 'Unpublish' : 'Publish';
        const contextualIcon = isPublished ? EyeOff : Send;

        return (
          <DropdownMenu
            trigger={
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Actions Menu"
              >
                <MoreVertical size={16} />
              </button>
            }
            items={[
              { label: 'View Article', icon: Eye, onClick: () => handleOpenPreview(row) },
              { label: 'Edit Article', icon: Edit2, onClick: () => handleOpenEdit(row) },
              { label: 'Preview', icon: Eye, onClick: () => handleOpenPreview(row) },
              {
                label: contextualLabel,
                icon: contextualIcon,
                onClick: () => handleToggleArticleStatus(row),
              },
              { divider: true },
              { label: 'Delete', icon: Trash2, danger: true, onClick: () => setDeleteBlogId(row.id) },
            ]}
          />
        );
      },
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* PREVIEW VIEW: BLOG ARTICLE PREVIEW PAGE                                   */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'preview' && previewBlog) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }} className="animate-fade-in">
        {/* HEADER BAR */}
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
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preview Mode (Public View Simulator)
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0', letterSpacing: '-0.02em' }}>
              Preview Article
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => setViewMode('form')}
            >
              Back to Editor
            </Button>
            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => handleOpenEdit(previewBlog)}
            >
              Edit
            </Button>
            <Button
              variant="accent"
              icon={Send}
              onClick={() => handleToggleArticleStatus(previewBlog)}
            >
              {previewBlog.status === 'Published' ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* MAIN PREVIEW & SIDEBAR LAYOUT */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
            gap: '28px',
          }}
        >
          {/* ARTICLE PREVIEW (LEFT / MAIN AREA) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '36px',
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            }}
          >
            {/* Featured Image */}
            {previewBlog.coverImage && (
              <div style={{ borderRadius: '12px', overflow: 'hidden', height: '340px', marginBottom: '28px' }}>
                <img
                  src={previewBlog.coverImage}
                  alt={previewBlog.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Badges & Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Badge status="accent">{previewBlog.category || 'Engineering'}</Badge>
              <Badge status={previewBlog.status}>{previewBlog.status}</Badge>
            </div>

            {/* Large Article Title */}
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.25,
                letterSpacing: '-0.025em',
                marginBottom: '20px',
              }}
            >
              {previewBlog.title}
            </h1>

            {/* Author Information & Date */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingBottom: '24px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '28px',
              }}
            >
              <img
                src={previewBlog.authorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'}
                alt={previewBlog.author}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {previewBlog.author || 'Sarah Jenkins'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Published on {previewBlog.publishedAt} • {previewBlog.readTime || '5 min read'}
                </div>
              </div>
            </div>

            {/* Article Content Rendered as Public Website */}
            <div
              style={{
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#1e293b',
                fontFamily: 'Inter, sans-serif',
              }}
              dangerouslySetInnerHTML={{
                __html: previewBlog.content || previewBlog.excerpt || '<p style="color:#94a3b8;font-style:italic;">No article content available to preview.</p>',
              }}
            />
          </div>

          {/* SIDEBAR (RIGHT AREA) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Publishing Status Card */}
            <div className="card card-padded">
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 14px 0' }}>
                Publishing Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Status</span>
                  <Badge status={previewBlog.status}>{previewBlog.status}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Publication Date</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>{previewBlog.publishedAt}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Last Updated</span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>Recently</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
            padding: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            zIndex: 100,
          }}
        >
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => setViewMode('form')}
          >
            Back to Editor
          </Button>

          <Button
            variant="accent"
            icon={Send}
            onClick={() => handleToggleArticleStatus(previewBlog)}
          >
            {previewBlog.status === 'Published' ? 'Unpublish Article' : 'Publish Article'}
          </Button>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmDialog
          isOpen={!!deleteBlogId}
          onClose={() => setDeleteBlogId(null)}
          onConfirm={handleConfirmDelete}
          title="Delete this article?"
          message="Deleting this article will permanently remove it."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          type="danger"
        />
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* FORM VIEW: PREMIUM CMS ARTICLE EDITOR PAGE                                 */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'form') {
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
          <div>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  onCloseCreateOpen && onCloseCreateOpen();
                }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                Blogs
              </button>
              <span>/</span>
              <span style={{ color: '#0f172a', fontWeight: 500 }}>
                {editingBlog ? 'Edit Article' : 'Create Article'}
              </span>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {editingBlog ? 'Edit Article' : 'Create Article'}
            </h1>
          </div>

          {/* Top Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="ghost"
              onClick={(e) => handleFormSubmit(e, 'Draft')}
            >
              Save Draft
            </Button>
            <Button
              variant="secondary"
              icon={Eye}
              onClick={() => handleOpenPreview(formData)}
            >
              Preview
            </Button>
            <Button
              variant="accent"
              icon={Send}
              onClick={(e) => handleFormSubmit(e, 'Published')}
            >
              Publish
            </Button>
          </div>
        </div>

        {/* MAIN LAYOUT (TWO COLUMNS: 70% LEFT MAIN AREA, 30% RIGHT SIDEBAR - SINGLE COLUMN ON MOBILE) */}
        <form onSubmit={(e) => handleFormSubmit(e)} noValidate style={{ paddingBottom: '70px' }}>
          <div
            className="mobile-grid-1"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
              gap: '28px',
            }}
          >
            {/* LEFT MAIN AREA (70%) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                        slug: generateSlug(newTitle),
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>Sarah Jenkins</span>
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
                <Button
                  variant="secondary"
                  icon={Eye}
                  onClick={() => handleOpenPreview(formData)}
                >
                  Preview
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  icon={Send}
                  onClick={(e) => handleFormSubmit(e, 'Published')}
                >
                  Publish Article
                </Button>
              </div>
            </div>
          </div>

          {/* MOBILE STICKY BOTTOM ACTION BAR FOR BLOG EDITOR */}
          <div
            className="show-on-mobile"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              padding: '12px 16px',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
              zIndex: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
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
              Publish
            </Button>
          </div>
        </form>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* LIST VIEW: BLOG MANAGEMENT TABLE & FILTER BAR                              */
  /* -------------------------------------------------------------------------- */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Blog Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            Create, manage and publish company articles.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create Article
        </Button>
      </div>

      {/* FILTER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search articles..."
          />

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={[
              { value: '', label: 'All' },
              { value: 'Published', label: 'Published' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Unpublished', label: 'Unpublished' },
            ]}
          />
        </div>

        <Select
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: 'newest', label: 'Sort: Newest' },
            { value: 'oldest', label: 'Sort: Oldest' },
            { value: 'updated', label: 'Sort: Recently Updated' },
          ]}
        />
      </div>

      {/* BLOG TABLE / GRID (DESKTOP) */}
      <div className="hide-on-mobile">
        <DataTable
          columns={columns}
          data={sortedBlogs}
          selectedRows={selectedRows}
          onSelectRow={setSelectedRows}
          onSelectAll={setSelectedRows}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          emptyTitle="No articles yet"
          emptyDescription="Create your first article to publish content on your website."
          onEmptyAction={handleOpenCreate}
          emptyActionLabel="Create your first article"
        />
      </div>

      {/* MOBILE STACKED BLOG CARDS */}
      <div className="show-on-mobile" style={{ flexDirection: 'column', gap: '16px' }}>
        {sortedBlogs.length === 0 ? (
          <div className="card card-padded" style={{ textAlign: 'center', color: '#94a3b8' }}>
            No articles match active filters.
          </div>
        ) : (
          sortedBlogs.map((blog) => (
            <div key={blog.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Badge status={blog.status}>{blog.status}</Badge>
                </div>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.35 }}>
                  {blog.title}
                </h3>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Publication date: {blog.publishedAt}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <Button size="sm" variant="secondary" icon={Eye} onClick={() => handleOpenPreview(blog)} style={{ flex: 1, minHeight: '44px' }}>
                    View
                  </Button>
                  <Button size="sm" variant="primary" icon={Edit2} onClick={() => handleOpenEdit(blog)} style={{ flex: 1, minHeight: '44px' }}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!deleteBlogId}
        onClose={() => setDeleteBlogId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete this article?"
        message="Deleting this article will permanently remove it."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};
