import { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Send,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchInput } from '../../ui/SearchInput';
import { Select } from '../../ui/Select';
import { DataTable } from '../../ui/DataTable';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Avatar } from '../../ui/Avatar';
import { useToast } from '../../ui/ToastContext';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { CreateBlog } from './CreateBlog';

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

  // Open Create Form View
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setViewMode('form');
  };

  // Open Edit Form View
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setViewMode('form');
  };

  // Adjust state during render when isCreateOpen changes (React recommended pattern)
  const [prevIsCreateOpen, setPrevIsCreateOpen] = useState(isCreateOpen);
  if (isCreateOpen !== prevIsCreateOpen) {
    setPrevIsCreateOpen(isCreateOpen);
    if (isCreateOpen) {
      setEditingBlog(null);
      setViewMode('form');
    }
  }

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
      render: () => <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>Recently</span>,
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ARTICLE PREVIEW (LEFT / MAIN AREA) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 md:p-9 shadow-xs">
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
              <Avatar
                name={previewBlog.author || 'Sarah Jenkins'}
                size="lg"
                showStatus={false}
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
          <div className="lg:col-span-1 flex flex-col gap-5">
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
  /* FORM VIEW: CREATE / EDIT BLOG ARTICLE CMS PAGE                             */
  /* -------------------------------------------------------------------------- */
  if (viewMode === 'form') {
    return (
      <CreateBlog
        key={editingBlog?.id || 'new-blog'}
        initialBlog={editingBlog}
        onBack={() => {
          setViewMode('list');
          setEditingBlog(null);
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        onSave={(savedBlog) => {
          if (editingBlog) {
            onUpdateBlog && onUpdateBlog(savedBlog);
          } else {
            onAddBlog && onAddBlog(savedBlog);
          }
          setViewMode('list');
          setEditingBlog(null);
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        onPreview={(blogData) => {
          setEditingBlog(blogData);
          setPreviewBlog(blogData);
          setViewMode('preview');
        }}
      />
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
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: () => setViewMode('list') },
              { label: 'Blogs' },
            ]}
          />
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: '8px 0 0 0', letterSpacing: '-0.02em' }}>
            Blogs
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
        className="mobile-stack"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, flexWrap: 'nowrap' }}>
          <div style={{ width: '240px', flexShrink: 0 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search articles..."
            />
          </div>

          <div style={{ width: '140px', flexShrink: 0 }}>
            <Select
              fullWidth
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Published', label: 'Published' },
                { value: 'Draft', label: 'Draft' },
                { value: 'Unpublished', label: 'Unpublished' },
              ]}
            />
          </div>
        </div>

        <div style={{ width: '165px', flexShrink: 0 }}>
          <Select
            fullWidth
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Sort: Newest' },
              { value: 'oldest', label: 'Sort: Oldest' },
              { value: 'updated', label: 'Sort: Recently Updated' },
            ]}
          />
        </div>
      </div>

      {/* BLOG TABLE */}
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

export default BlogsView;
