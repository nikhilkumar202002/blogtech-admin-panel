import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  User,
  Clock,
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
import { useToast } from '../ui/ToastContext';
import { BLOG_CATEGORIES } from '../../mockData';

export const BlogsView = ({
  blogs = [],
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  isCreateOpen = false,
  onCloseCreateOpen,
}) => {
  const { addToast } = useToast();

  // Filters & Layout View state
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Table selection & pagination
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit article state
  const [editingBlog, setEditingBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preview drawer state
  const [previewBlog, setPreviewBlog] = useState(null);

  // Delete confirmation
  const [deleteBlogId, setDeleteBlogId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Engineering',
    author: 'Sarah Jenkins (Lead Editor)',
    status: 'Published',
    coverImage: '',
    excerpt: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    scheduledDate: '',
  });

  // Slug generator helper
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (newTitle) => {
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: prev.slug || generateSlug(newTitle),
      seoTitle: prev.seoTitle || `${newTitle} | ApexCorp Blog`,
    }));
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Engineering',
      author: 'Sarah Jenkins (Lead Editor)',
      status: 'Published',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      excerpt: '',
      content: '<h2>Introduction</h2><p>Write your detailed article body here...</p>',
      seoTitle: '',
      seoDescription: '',
      scheduledDate: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      author: blog.author,
      status: blog.status,
      coverImage: blog.coverImage || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      scheduledDate: blog.publishedAt.includes('Scheduled') ? blog.publishedAt.split(' ')[0] : '',
    });
    setIsModalOpen(true);
  };

  // Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({ title: 'Validation Error', message: 'Article title is required.', type: 'error' });
      return;
    }

    if (editingBlog) {
      onUpdateBlog({
        ...editingBlog,
        ...formData,
        publishedAt: formData.status === 'Published' ? new Date().toISOString().split('T')[0] : formData.status === 'Scheduled' ? `${formData.scheduledDate || '2026-10-15'} (Scheduled)` : 'Unpublished',
      });
      addToast({ title: 'Article Updated', message: `Blog post "${formData.title}" updated successfully.`, type: 'success' });
    } else {
      const newBlog = {
        id: `BLOG-${Math.floor(200 + Math.random() * 800)}`,
        ...formData,
        views: '0',
        readTime: '5 min read',
        publishedAt: formData.status === 'Published' ? new Date().toISOString().split('T')[0] : formData.status === 'Scheduled' ? `${formData.scheduledDate || '2026-10-15'} (Scheduled)` : 'Unpublished',
      };
      onAddBlog(newBlog);
      addToast({ title: 'Article Created', message: `New blog post "${formData.title}" created as ${formData.status}.`, type: 'success' });
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteBlogId) {
      onDeleteBlog(deleteBlogId);
      addToast({ title: 'Article Deleted', message: 'Blog post was removed from CMS.', type: 'info' });
      setDeleteBlogId(null);
    }
  };

  // Filtered blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.slug.toLowerCase().includes(search.toLowerCase()) ||
      blog.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || blog.category === categoryFilter;
    const matchesStatus = !statusFilter || blog.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Table Columns
  const columns = [
    {
      header: 'Article Title & Slug',
      key: 'title',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={row.coverImage}
            alt={row.title}
            style={{
              width: '48px',
              height: '36px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
              {row.title}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
              /{row.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      render: (row) => <Badge status="accent">{row.category}</Badge>,
    },
    {
      header: 'Author',
      key: 'author',
      sortable: true,
      render: (row) => (
        <div style={{ fontSize: '12.5px', color: '#334155' }}>
          {row.author.split('(')[0]}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Views',
      key: 'views',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
          {row.views}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'publishedAt',
      sortable: true,
      render: (row) => <span style={{ fontSize: '12px', color: '#64748b' }}>{row.publishedAt}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => setPreviewBlog(row)}
            title="Preview Article"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Edit2}
            onClick={() => handleOpenEdit(row)}
            title="Edit Article"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => setDeleteBlogId(row.id)}
            title="Delete Article"
            style={{ color: '#dc2626' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Toolbar & Filters */}
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
            placeholder="Search article headline or author..."
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="All Categories"
            options={BLOG_CATEGORIES}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={['Published', 'Draft', 'Scheduled']}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Toggle */}
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
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'grid' ? '#f1f5f9' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
            New Article
          </Button>
        </div>
      </div>

      {/* Main Content (Table or Grid) */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredBlogs}
          selectedRows={selectedRows}
          onSelectRow={setSelectedRows}
          onSelectAll={setSelectedRows}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          emptyTitle="No Blog Articles Found"
          emptyDescription="No published or draft articles match your search criteria."
          onEmptyAction={handleOpenAdd}
          emptyActionLabel="Write First Article"
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
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

      {/* Create / Edit Blog Article Modal */}
      <Modal
        isOpen={isModalOpen || isCreateOpen}
        onClose={() => {
          setIsModalOpen(false);
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        title={editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
        subtitle="Manage title, content body, cover asset, and SEO metadata"
        maxWidth="840px"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                onCloseCreateOpen && onCloseCreateOpen();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingBlog ? 'Save Article' : 'Publish Article'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <FormField label="Article Headline Title" required>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Architecting Scalable SaaS Micro-Frontends"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              />
            </FormField>

            <FormField label="Category" required>
              <Select
                fullWidth
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={BLOG_CATEGORIES}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormField label="URL Slug">
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-url-slug"
                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
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

            <FormField label="Publishing Status">
              <Select
                fullWidth
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={[
                  { value: 'Published', label: 'Published (Live)' },
                  { value: 'Draft', label: 'Draft' },
                  { value: 'Scheduled', label: 'Scheduled' },
                ]}
              />
            </FormField>
          </div>

          {formData.status === 'Scheduled' && (
            <FormField label="Scheduled Publishing Date">
              <DatePicker
                value={formData.scheduledDate}
                onChange={(date) => setFormData({ ...formData, scheduledDate: date })}
                placeholder="Select publish date..."
              />
            </FormField>
          )}

          <FormField label="Cover Image Asset">
            <ImageUploader
              value={formData.coverImage}
              onChange={(img) => setFormData({ ...formData, coverImage: img })}
            />
          </FormField>

          <FormField label="Short Excerpt & Summary">
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief 1-2 sentence overview for cards and social shares..."
              rows={2}
              style={{ width: '100%', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          </FormField>

          <FormField label="Article Body Content">
            <RichTextEditor
              value={formData.content}
              onChange={(val) => setFormData({ ...formData, content: val })}
              minHeight="260px"
            />
          </FormField>

          {/* SEO Metadata Accordion */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px 0' }}>
              Search Engine Optimization (SEO Metadata)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormField label="SEO Title Tag">
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Meta title tag..."
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
              <FormField label="SEO Meta Description">
                <input
                  type="text"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Meta description snippet..."
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>

      {/* Quick Preview Article Modal */}
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
              <span>{previewBlog.readTime}</span>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteBlogId}
        onClose={() => setDeleteBlogId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Article?"
        message="Are you sure you want to delete this article? Published links will be removed from your website."
        confirmLabel="Yes, Delete Article"
        type="danger"
      />
    </div>
  );
};
