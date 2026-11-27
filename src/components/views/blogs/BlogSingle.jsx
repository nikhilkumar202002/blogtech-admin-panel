import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Globe,
  EyeOff,
  Send,
  Calendar,
  Clock,
  User,
  Tag,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Code2,
  Sparkles,
  Maximize2,
  X,
  Share2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Breadcrumb } from '../../ui/Breadcrumb';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { Avatar } from '../../ui/Avatar';
import { useToast } from '../../ui/ToastContext';
import { formatImageUrl, handleImageError } from '../../../utils/image.helper';
import { sanitizeHtml } from '../../../utils/sanitize.helper';
import {
  getBlog,
  publishBlog,
  unpublishBlog,
  deleteBlog,
} from '../../../utils/blog.service';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Unscheduled';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return '';
  }
};

const getCategoryName = (category) => {
  if (!category) return 'General';
  if (typeof category === 'object') return category.name || category.title || 'General';
  return String(category);
};

const getAuthorName = (author, fallback = 'Administrator') => {
  if (!author) return fallback;
  if (typeof author === 'object') return author.name || fallback;
  return String(author);
};

const getAuthorEmail = (author) => {
  if (typeof author === 'object') return author.email || '';
  return '';
};

const calculateReadTime = (htmlContent) => {
  if (!htmlContent) return '1 min read';
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read (${words} words)`;
};

export const BlogSingle = ({
  blog: initialBlog,
  currentUser = null,
  onBack,
  onEdit,
  onRefresh,
}) => {
  const { addToast } = useToast();

  const [blog, setBlog] = useState(initialBlog);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Content display mode: 'rendered' (HTML preview) | 'source' (Code inspection)
  const [contentViewMode, setContentViewMode] = useState('rendered');

  // JSON Raw API Inspector Modal
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  // 1-Click Copy States
  const [hasCopiedSlug, setHasCopiedSlug] = useState(false);
  const [hasCopiedContent, setHasCopiedContent] = useState(false);

  // Lightbox modal for full-size featured image
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Fetch full details from API on mount if not fully loaded
  useEffect(() => {
    let isMounted = true;
    if (initialBlog?.id && !String(initialBlog.id).startsWith('BLOG-')) {
      setIsLoading(true);
      getBlog(initialBlog.id)
        .then((res) => {
          if (!isMounted) return;
          const fresh = res?.data || res;
          if (fresh) {
            setBlog(fresh);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch fresh blog single view, fallback to initial data:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [initialBlog?.id]);

  // Featured image resolution
  const featuredImageUrl = formatImageUrl(
    blog?.featured_image_url ||
    blog?.featured_image ||
    blog?.featured_image_path ||
    blog?.coverImage
  );

  const isPublished = String(blog?.status || '').toLowerCase() === 'published';
  const categoryName = getCategoryName(blog?.category);
  const authorName = getAuthorName(blog?.author, currentUser?.name || 'Administrator');
  const authorEmail = getAuthorEmail(blog?.author) || currentUser?.email || '';
  const readTimeMeta = calculateReadTime(blog?.content || '');

  // Toggle Publish / Unpublish handler
  const handleToggleStatus = async () => {
    const nextStatus = isPublished ? 'unpublished' : 'published';
    const displayLabel = isPublished ? 'Unpublished' : 'Published';

    setIsStatusBusy(true);
    try {
      if (blog?.id && !String(blog.id).startsWith('BLOG-')) {
        if (isPublished) {
          await unpublishBlog(blog.id);
        } else {
          await publishBlog(blog.id);
        }
      }

      setBlog((prev) => ({
        ...prev,
        status: nextStatus,
        published_at: nextStatus === 'published' && !prev.published_at ? new Date().toISOString() : prev.published_at,
      }));

      addToast({
        title: isPublished ? 'Article Unpublished' : 'Article Published',
        message: `Article status changed to ${displayLabel}.`,
        type: 'info',
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || 'Could not update publication status.',
        type: 'error',
      });
    } finally {
      setIsStatusBusy(false);
    }
  };

  // Delete article handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (blog?.id && !String(blog.id).startsWith('BLOG-')) {
        await deleteBlog(blog.id);
      }
      addToast({
        title: 'Article Deleted',
        message: `"${blog?.title || 'Article'}" was permanently removed.`,
        type: 'info',
      });
      setIsConfirmDeleteOpen(false);
      if (onRefresh) onRefresh();
      if (onBack) onBack();
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Failed to delete blog article.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy slug helper
  const handleCopySlug = () => {
    if (!blog?.slug) return;
    navigator.clipboard.writeText(blog.slug);
    setHasCopiedSlug(true);
    addToast({ title: 'Copied', message: `Slug "/${blog.slug}" copied to clipboard.`, type: 'success' });
    setTimeout(() => setHasCopiedSlug(false), 2000);
  };

  // Copy HTML Content helper
  const handleCopyContent = () => {
    if (!blog?.content) return;
    navigator.clipboard.writeText(blog.content);
    setHasCopiedContent(true);
    addToast({ title: 'HTML Copied', message: 'Raw article HTML source copied.', type: 'info' });
    setTimeout(() => setHasCopiedContent(false), 2000);
  };

  // Copy JSON Payload
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(blog, null, 2));
    setHasCopiedJson(true);
    addToast({ title: 'JSON Copied', message: 'API JSON payload copied to clipboard.', type: 'info' });
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16">
      {/* 1. TOP HEADER & BREADCRUMBS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', onClick: onBack },
              { label: 'Blogs', onClick: onBack },
              { label: blog?.title || 'Article Details' },
            ]}
          />
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {blog?.title || 'Untitled Article'}
            </h1>
            <Badge status={blog?.status || 'published'}>
              {blog?.status ? String(blog.status).charAt(0).toUpperCase() + String(blog.status).slice(1) : 'Published'}
            </Badge>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#cb9706]/15 border border-[#cb9706]/30 text-[#844414]">
              {categoryName}
            </span>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={onBack}
          >
            Back
          </Button>

          <Button
            variant="secondary"
            icon={Code2}
            onClick={() => setShowJsonInspector(true)}
            title="Inspect Raw API JSON"
          >
            API JSON
          </Button>

          <Button
            variant="secondary"
            icon={Edit2}
            onClick={() => onEdit && onEdit(blog)}
          >
            Edit
          </Button>

          <Button
            variant={isPublished ? 'secondary' : 'primary'}
            icon={isPublished ? EyeOff : Send}
            isLoading={isStatusBusy}
            onClick={handleToggleStatus}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>

          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setIsConfirmDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: HERO IMAGE, METADATA & BODY CONTENT (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* A. FEATURED IMAGE HERO BANNER */}
          {featuredImageUrl ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative group">
              <div className="h-64 sm:h-80 md:h-96 w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                <img
                  src={featuredImageUrl}
                  alt={blog?.title || 'Featured Article Banner'}
                  onError={(e) => handleImageError(e, blog?.title || 'Blog Cover', true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* Badges on Banner */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 shadow-sm border border-white/40">
                    {categoryName}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white shadow-sm border border-white/20">
                    {readTimeMeta}
                  </span>
                </div>

                {/* Expand Image Button */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-md backdrop-blur-sm transition-all duration-150 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  title="View full resolution image"
                >
                  <Maximize2 size={15} />
                  <span>View Fullsize</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <FileText size={32} className="text-slate-300" />
              <p className="text-sm font-medium">No featured image uploaded for this article.</p>
            </div>
          )}

          {/* B. AUTHOR & READING METADATA STRIP */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar name={authorName} size="lg" showStatus={false} />
              <div>
                <div className="text-sm font-bold text-slate-900">{authorName}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  {authorEmail && <span>{authorEmail}</span>}
                  {authorEmail && <span>•</span>}
                  <span className="text-[#a34b03] font-medium">Author</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                <span>Published {formatDate(blog?.published_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                <span>{formatRelativeTime(blog?.published_at)}</span>
              </div>
            </div>
          </div>

          {/* C. EXCERPT / ABSTRACT CALLOUT */}
          {(blog?.excerpt || blog?.description) && (
            <div className="bg-[#edd8bb]/15 border-l-4 border-[#a34b03] p-5 rounded-r-2xl shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#844414] uppercase tracking-wider mb-1.5">
                <Sparkles size={14} className="text-[#cb9706]" />
                <span>Article Overview & Summary</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{blog?.excerpt || blog?.description}"
              </p>
            </div>
          )}

          {/* D. ARTICLE BODY CONTENT CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-5">
            {/* Content Toolbar Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#a34b03]/10 border border-[#a34b03]/20 flex items-center justify-center text-[#a34b03]">
                  <FileText size={16} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Article Content</h2>
                  <p className="text-xs text-slate-400">Full publication body and formatted markup</p>
                </div>
              </div>

              {/* View Mode Toggle: Preview vs HTML Source */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setContentViewMode('rendered')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    contentViewMode === 'rendered'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Article View
                </button>
                <button
                  type="button"
                  onClick={() => setContentViewMode('source')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    contentViewMode === 'source'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  HTML Source
                </button>
              </div>
            </div>

            {/* RENDERED MODE */}
            {contentViewMode === 'rendered' ? (
              <div
                className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-800 font-sans"
                style={{
                  lineHeight: '1.8',
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    blog?.content || '<p class="text-slate-400 italic">No article content available.</p>'
                  ),
                }}
              />
            ) : (
              /* SOURCE CODE MODE */
              <div className="relative">
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono border-b border-slate-800">
                  <span>HTML Source Content ({blog?.content?.length || 0} characters)</span>
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {hasCopiedContent ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{hasCopiedContent ? 'Copied' : 'Copy HTML'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-b-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap select-all border border-slate-900">
                  {blog?.content || '<!-- No content -->'}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TAXONOMY, METADATA & LIFECYCLE (1 Col - Sticky on Desktop) */}
        <div className="lg:col-span-1 lg:sticky lg:top-4 self-start flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto pr-0.5">
          {/* CARD 1: QUICK ACTIONS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Quick Actions</span>
              <span className="text-[11px] font-mono text-slate-400">ID #{blog?.id}</span>
            </h3>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="primary"
                icon={Edit2}
                onClick={() => onEdit && onEdit(blog)}
                fullWidth
              >
                Edit Article
              </Button>

              <Button
                variant={isPublished ? 'secondary' : 'accent'}
                icon={isPublished ? EyeOff : Send}
                isLoading={isStatusBusy}
                onClick={handleToggleStatus}
                fullWidth
              >
                {isPublished ? 'Unpublish Article' : 'Publish Article'}
              </Button>
            </div>
          </div>

          {/* CARD 2: PUBLISHING SPECIFICATIONS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Globe size={16} className="text-[#a34b03]" />
                <span>Publishing Status</span>
              </div>
              <Badge status={blog?.status || 'published'}>
                {blog?.status ? String(blog.status).toUpperCase() : 'PUBLISHED'}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Release Date</span>
                <span className="text-slate-800 font-mono font-medium">
                  {formatDate(blog?.published_at)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Created At</span>
                <span className="text-slate-800 font-mono">
                  {formatDate(blog?.created_at)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Last Modified</span>
                <span className="text-slate-800 font-mono">
                  {formatDate(blog?.updated_at)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Database ID</span>
                <span className="text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  #{blog?.id || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* CARD 3: TAXONOMY & CATEGORY */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              <Tag size={16} className="text-[#a34b03]" />
              <span>Category & Taxonomy</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Category Name</span>
                <span className="text-xs font-semibold text-[#844414] bg-[#edd8bb] border border-[#dfc49f] px-2.5 py-0.5 rounded-full">
                  {categoryName}
                </span>
              </div>

              {blog?.category?.slug && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Category Slug</span>
                  <span className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    /{blog.category.slug}
                  </span>
                </div>
              )}

              {blog?.category?.id && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Category ID</span>
                  <span className="font-mono text-slate-700">
                    #{blog.category.id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CARD 4: SEARCH ENGINE SIMULATION (SEO PREVIEW) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <ExternalLink size={16} className="text-[#a34b03]" />
                <span>Search Engine Preview</span>
              </div>
              <button
                type="button"
                onClick={handleCopySlug}
                className="text-[11px] font-semibold text-[#a34b03] hover:underline flex items-center gap-1 cursor-pointer"
                title="Copy slug URL"
              >
                {hasCopiedSlug ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{hasCopiedSlug ? 'Copied' : 'Copy Slug'}</span>
              </button>
            </div>

            {/* Google SERP Snippet Simulator */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
              <div className="text-[11px] text-slate-500 font-mono truncate">
                https://blogtec.co.in/blogs/{blog?.slug || 'article-slug'}
              </div>
              <div className="text-sm font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
                {blog?.seoTitle || blog?.meta_title || blog?.title || 'Article Headline'} | BLOGTECH
              </div>
              <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {blog?.seoDescription || blog?.meta_description || blog?.excerpt || blog?.description || 'Learn more about this publication on the live platform.'}
              </div>
            </div>
          </div>

          {/* CARD 5: AUTHOR OWNERSHIP */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
              <User size={16} className="text-[#a34b03]" />
              <span>Author Ownership</span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={authorName} size="md" showStatus={false} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{authorName}</div>
                <div className="text-[11px] text-slate-500 truncate">{authorEmail || 'Account User'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LIGHTBOX IMAGE VIEWER MODAL */}
      {isLightboxOpen && featuredImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="text-xs font-medium truncate max-w-md">{blog?.title}</div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Fullscreen Image Preview */}
            <div className="p-4 flex items-center justify-center bg-black/60 overflow-hidden">
              <img
                src={featuredImageUrl}
                alt="Full resolution banner preview"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. RAW API JSON INSPECTOR MODAL */}
      {showJsonInspector && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setShowJsonInspector(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-[#cb9706]" />
                <h3 className="text-sm font-semibold text-white">API Response JSON Payload</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={hasCopiedJson ? Check : Copy}
                  onClick={handleCopyJson}
                >
                  {hasCopiedJson ? 'Copied' : 'Copy JSON'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowJsonInspector(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <pre className="text-xs font-mono text-emerald-400 bg-slate-950 p-4 rounded-xl leading-relaxed whitespace-pre overflow-x-auto border border-slate-800 select-all">
                {JSON.stringify(blog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this article?"
        message={`Are you sure you want to permanently delete "${blog?.title || 'this article'}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Article'}
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BlogSingle;
