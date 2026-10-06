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
  Grid,
  List,
  Sparkles,
  ArrowLeft,
  X,
  FileText,
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

  // Mode: 'list' (Table / Grid) | 'form' (Create / Edit Article)
  const [viewMode, setViewMode] = useState('list');
  const [layoutStyle, setLayoutStyle] = useState('table'); // 'table' | 'grid'

  // Filter Bar State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' (All), 'Published', 'Draft', 'Unpublished'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'updated'

  // Table Selection & Pagination State
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Article & Dialogs
  const [editingBlog, setEditingBlog] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [deleteBlogId, setDeleteBlogId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Engineering',
    author: 'Sarah Jenkins (Lead Editor)',
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

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Engineering',
      author: 'Sarah Jenkins (Lead Editor)',
      status: 'Published',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      excerpt: '',
      content: '<h2>Introduction</h2><p>Write your detailed article body content here...</p>',
      seoTitle: '',
      seoDescription: '',
      publishedAt: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category || 'Engineering',
      author: blog.author || 'Sarah Jenkins',
      status: blog.status,
      coverImage: blog.coverImage || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      publishedAt: blog.publishedAt || new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setViewMode('form');
  };

  // Toggle Contextual Status Action (Publish / Unpublish)
  const handleToggleArticleStatus = (blog) => {
    let nextStatus = 'Published';
    if (blog.status === 'Published') {
      nextStatus = 'Unpublished';
    } else if (blog.status === 'Draft' || blog.status === 'Unpublished') {
      nextStatus = 'Published';
    }

    onUpdateBlog({ ...blog, status: nextStatus });
    addToast({
      title: nextStatus === 'Published' ? 'Article Published' : 'Article Unpublished',
      message: `Article "${blog.title}" status changed to ${nextStatus}.`,
      type: 'info',
    });
  };

  // Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Article title is required.' });
      addToast({ title: 'Validation Error', message: 'Article title is required.', type: 'error' });
      return;
    }

    if (editingBlog) {
      onUpdateBlog({
        ...editingBlog,
        ...formData,
      });
      addToast({ title: 'Article Updated', message: `Article "${formData.title}" updated.`, type: 'success' });
    } else {
      const newBlog = {
        id: `BLOG-${Math.floor(200 + Math.random() * 800)}`,
        ...formData,
        views: '0',
        readTime: '5 min read',
      };
      onAddBlog(newBlog);
      addToast({ title: 'Article Created', message: `New article "${formData.title}" saved as ${formData.status}.`, type: 'success' });
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
    }
  };

  // Filtered and Sorted Blogs
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

  // Table Columns Setup according to specifications
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
        <div style={{ maxWidth: '320px', cursor: 'pointer' }} onClick={() => setPreviewBlog(row)}>
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
        const isDraft = row.status === 'Draft';
        const isUnpublished = row.status === 'Unpublished';

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
              { label: 'View Article', icon: Eye, onClick: () => setPreviewBlog(row) },
              { label: 'Edit Article', icon: Edit2, onClick: () => handleOpenEdit(row) },
              { label: 'Preview', icon: Eye, onClick: () => setPreviewBlog(row) },
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
  /* FORM VIEW: CREATE / EDIT ARTICLE PAGE                                      */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'form') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={() => {
              setViewMode('list');
              onCloseCreateOpen && onCloseCreateOpen();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#64748b',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '12px',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft size={16} />
            Back to Blog Management
          </button>

          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {editingBlog ? 'Edit Article' : 'Create Article'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
            {editingBlog ? 'Update article content, cover imagery, and publishing parameters.' : 'Draft and publish a new company blog post.'}
          </p>
        </div>

        {/* TWO-COLUMN FORM LAYOUT */}
        <form onSubmit={handleFormSubmit} noValidate>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2.3fr) minmax(0, 1fr)',
              gap: '28px',
            }}
          >
            {/* LEFT / MAIN COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card card-padded">
                <FormField label="Article Title" required error={errors.title}>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: formData.slug || e.target.value.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-'),
                      });
                      if (errors.title) setErrors({ ...errors, title: null });
                    }}
                    placeholder="e.g. Architecting Scalable SaaS Micro-Frontends"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '14px',
                      color: '#0f172a',
                      borderRadius: '8px',
                      border: errors.title ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <FormField label="URL Slug">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="article-url-slug"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </FormField>
              </div>

              <div className="card card-padded">
                <FormField label="Cover Image Asset">
                  <ImageUploader
                    value={formData.coverImage}
                    onChange={(img) => setFormData({ ...formData, coverImage: img })}
                  />
                </FormField>
              </div>

              <div className="card card-padded">
                <FormField label="Short Excerpt & Summary">
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief 1-2 sentence overview snippet..."
                    rows={2}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                </FormField>
              </div>

              <div className="card card-padded">
                <FormField label="Article Body Content" required>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(val) => setFormData({ ...formData, content: val })}
                    minHeight="260px"
                  />
                </FormField>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card card-padded">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
                  Publishing Settings
                </h3>

                <FormField label="Category" required>
                  <Select
                    fullWidth
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                    options={BLOG_CATEGORIES}
                  />
                </FormField>

                <FormField label="Author">
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </FormField>

                <FormField label="Publication Date">
                  <DatePicker
                    value={formData.publishedAt}
                    onChange={(date) => setFormData({ ...formData, publishedAt: date })}
                  />
                </FormField>

                <FormField label="Publication Status" required>
                  <Select
                    fullWidth
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    options={[
                      { value: 'Published', label: 'Published (Live)' },
                      { value: 'Draft', label: 'Draft' },
                      { value: 'Unpublished', label: 'Unpublished (Hidden)' },
                    ]}
                  />
                </FormField>
              </div>

              {/* ACTION BAR */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setViewMode('list');
                    onCloseCreateOpen && onCloseCreateOpen();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingJob ? 'Save Article' : 'Publish Article'}
                </Button>
              </div>
            </div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Sort: Newest' },
              { value: 'oldest', label: 'Sort: Oldest' },
              { value: 'updated', label: 'Sort: Recently Updated' },
            ]}
          />

          {/* Table / Grid Layout Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setLayoutStyle('table')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: layoutStyle === 'table' ? '#f1f5f9' : 'transparent',
                color: layoutStyle === 'table' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table Layout"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setLayoutStyle('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: layoutStyle === 'grid' ? '#f1f5f9' : 'transparent',
                color: layoutStyle === 'grid' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid Layout"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* BLOG TABLE / GRID */}
      {layoutStyle === 'table' ? (
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
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {sortedBlogs.map((blog) => (
            <div key={blog.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img src={blog.coverImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Badge status={blog.status}>{blog.status}</Badge>
                </div>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <Badge status="accent" size="sm">{blog.category}</Badge>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '8px 0 6px 0', lineHeight: 1.4 }}>
                    {blog.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.excerpt}
                  </p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{blog.publishedAt}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button size="sm" variant="ghost" icon={Eye} onClick={() => setPreviewBlog(blog)} />
                    <Button size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenEdit(blog)} />
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDeleteBlogId(blog.id)} style={{ color: '#dc2626' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE PREVIEW MODAL */}
      <Modal
        isOpen={!!previewBlog}
        onClose={() => setPreviewBlog(null)}
        title={previewBlog?.title}
        subtitle={`Category: ${previewBlog?.category} • Published ${previewBlog?.publishedAt}`}
        maxWidth="760px"
        footer={<Button variant="secondary" onClick={() => setPreviewBlog(null)}>Close Preview</Button>}
      >
        {previewBlog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <img
              src={previewBlog.coverImage}
              alt={previewBlog.title}
              style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b' }}>
              <span>Author: <strong>{previewBlog.author}</strong></span>
              <span>•</span>
              <Badge status={previewBlog.status}>{previewBlog.status}</Badge>
            </div>
            <div
              style={{ fontSize: '14px', lineHeight: 1.7, color: '#0f172a', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}
              dangerouslySetInnerHTML={{ __html: previewBlog.content || previewBlog.excerpt }}
            />
          </div>
        )}
      </Modal>

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
