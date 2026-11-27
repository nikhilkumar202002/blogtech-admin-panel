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
import { BlogSingle } from './BlogSingle';
import { getStoredUser } from '../../../utils/auth.service';
import { sanitizeHtml } from '../../../utils/sanitize.helper';
import { formatImageUrl, handleImageError } from '../../../utils/image.helper';
import { publishBlog, unpublishBlog } from '../../../utils/blog.service';

// Safe helper to extract category name whether string or object { id, name, slug }
const getCategoryName = (category) => {
  if (!category) return 'General';
  if (typeof category === 'object') return category.name || category.title || 'General';
  return String(category);
};

// Safe helper to extract author name whether string or object { id, name, email }
const getAuthorName = (author, fallback = 'Administrator') => {
  if (!author) return fallback;
  if (typeof author === 'object') return author.name || fallback;
  return String(author);
};

export const BlogsView = ({
  blogs = [],
  currentUser = null,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  isCreateOpen = false,
  onCloseCreateOpen,
  isLoading = false,
  onRefresh,
}) => {
  const { addToast } = useToast();

  const currentUserName =
    currentUser?.name ||
    getStoredUser()?.name ||
    'Administrator';

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

  // Contextual Status Toggle (Publish / Unpublish) via Native Backend Endpoint
  const handleToggleArticleStatus = async (blog) => {
    const isCurrentlyPublished = String(blog.status).toLowerCase() === 'published';
    const nextStatus = isCurrentlyPublished ? 'Unpublished' : 'Published';

    try {
      if (blog.id && !String(blog.id).startsWith('BLOG-')) {
        if (isCurrentlyPublished) {
          await unpublishBlog(blog.id);
        } else {
          await publishBlog(blog.id);
        }
      }
      const updated = { ...blog, status: nextStatus };
      onUpdateBlog && onUpdateBlog(updated);
      if (previewBlog && previewBlog.id === blog.id) {
        setPreviewBlog(updated);
      }
      addToast({
        title: isCurrentlyPublished ? 'Article Unpublished' : 'Article Published',
        message: `Article "${blog.title}" status changed to ${nextStatus}.`,
        type: 'info',
      });
      onRefresh && onRefresh();
    } catch (err) {
      console.warn('Could not toggle status via patch endpoint, falling back to full update:', err);
      const updated = { ...blog, status: nextStatus };
      onUpdateBlog && onUpdateBlog(updated);
    }
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
      onRefresh && onRefresh();
    }
  };

  // Filtered & Sorted Blogs
  const filteredBlogs = blogs.filter((blog) => {
    const categoryName = getCategoryName(blog.category);
    const authorName = getAuthorName(blog.author, currentUserName);
    const title = blog.title || '';
    const slug = blog.slug || '';
    const q = (search || '').toLowerCase();

    const matchesSearch =
      !search ||
      title.toLowerCase().includes(q) ||
      slug.toLowerCase().includes(q) ||
      authorName.toLowerCase().includes(q) ||
      categoryName.toLowerCase().includes(q);

    const blogStatus = (blog.status || '').toLowerCase();
    const matchesStatus = !statusFilter || blogStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    const dateA = a.publishedAt || a.published_at || a.created_at || '';
    const dateB = b.publishedAt || b.published_at || b.created_at || '';
    if (sortBy === 'newest') return String(dateB).localeCompare(String(dateA));
    if (sortBy === 'oldest') return String(dateA).localeCompare(String(dateB));
    if (sortBy === 'updated') return String(dateB).localeCompare(String(dateA));
    return 0;
  });

  // Table Columns Setup
  const columns = [
    {
      header: 'Featured Image',
      key: 'coverImage',
      render: (row) => {
        const rawUrl = row.coverImage || row.featured_image_url || row.featured_image || row.featured_image_path;
        const imgUrl = formatImageUrl(rawUrl);
        return (
          <img
            src={imgUrl || ''}
            alt={row.title || 'Blog cover'}
            onError={(e) => handleImageError(e, row.title || 'Blog', true)}
            style={{
              width: '56px',
              height: '38px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}
          />
        );
      },
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
            title={typeof row.title === 'object' ? (row.title?.rendered || row.title?.name || '') : String(row.title || '')}
          >
            {typeof row.title === 'object' ? (row.title?.rendered || row.title?.name || '') : String(row.title || '')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            Category: {getCategoryName(row.category)} • /{typeof row.slug === 'object' ? (row.slug?.slug || row.slug?.name || '') : String(row.slug || '')}
          </div>
        </div>
      ),
    },
    {
      header: 'Publication Date',
      key: 'publishedAt',
      sortable: true,
      render: (row) => {
        const rawDate = row.publishedAt || row.published_at || row.created_at || '';
        const displayDate = rawDate ? String(rawDate).split('T')[0] : '—';
        return <span style={{ fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>{displayDate}</span>;
      },
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const rawStatus = row.status || 'Draft';
        const label = String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1);
        return <Badge status={rawStatus}>{label}</Badge>;
      },
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
        const isPublished = String(row.status || '').toLowerCase() === 'published';
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
              { label: 'View Details', icon: Eye, onClick: () => handleOpenPreview(row) },
              { label: 'Edit Article', icon: Edit2, onClick: () => handleOpenEdit(row) },
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
  /* SINGLE VIEW: DEDICATED ARTICLE DETAILS & METADATA PAGE                     */
  /* -------------------------------------------------------------------------- */
  if ((viewMode === 'preview' || viewMode === 'single') && previewBlog) {
    return (
      <BlogSingle
        blog={previewBlog}
        currentUser={currentUser}
        onBack={() => {
          setViewMode('list');
          setPreviewBlog(null);
        }}
        onEdit={(blogToEdit) => {
          handleOpenEdit(blogToEdit);
        }}
        onRefresh={() => {
          onRefresh && onRefresh();
        }}
      />
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
        currentUser={currentUser}
        onBack={() => {
          setViewMode('list');
          setEditingBlog(null);
          onCloseCreateOpen && onCloseCreateOpen();
        }}
        onSuccess={(savedBlog) => {
          if (editingBlog) {
            onUpdateBlog && onUpdateBlog(savedBlog);
          } else {
            onAddBlog && onAddBlog(savedBlog);
          }
          setViewMode('list');
          setEditingBlog(null);
          onCloseCreateOpen && onCloseCreateOpen();
          onRefresh && onRefresh();
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
          onRefresh && onRefresh();
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
