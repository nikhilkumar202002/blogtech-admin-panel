import mainAxios from './main.service';

/**
 * Converts a base64 data URL into a standard browser File object
 */
export const dataUrlToFile = (dataUrl, filename = 'featured_image.webp') => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.warn('Could not convert dataUrl to File:', err);
    return null;
  }
};

/**
 * Normalizes blog payload into a strict Laravel-compliant FormData object
 */
export const formatBlogPayload = (blogData) => {
  if (blogData instanceof FormData) return blogData;

  const formData = new FormData();
  const data = blogData || {};

  // 1. Title & Slug
  if (data.title) formData.append('title', String(data.title).trim());
  if (data.slug) formData.append('slug', String(data.slug).trim());

  // 2. Content (required by backend)
  if (data.content) formData.append('content', String(data.content));

  // 3. Excerpt & Description
  const excerpt = data.excerpt || data.description || data.short_description || '';
  if (excerpt) {
    formData.append('excerpt', String(excerpt).trim());
    formData.append('description', String(excerpt).trim());
  }

  // 4. Status (must be lowercase 'published' | 'draft' | 'unpublished')
  const rawStatus = String(data.status || 'published').toLowerCase();
  const validStatus = ['published', 'draft', 'unpublished'].includes(rawStatus) ? rawStatus : 'published';
  formData.append('status', validStatus);

  // 5. Category ID (must be integer ID existing in blog_categories)
  const catId = data.category_id || (typeof data.category === 'object' ? data.category?.id : null);
  if (catId && !isNaN(Number(catId))) {
    formData.append('category_id', String(Number(catId)));
  }

  // 6. Publication Date (YYYY-MM-DD)
  const pubDate = data.published_at || data.publishedAt || '';
  if (pubDate) {
    formData.append('published_at', String(pubDate).split('T')[0]);
  }

  // 7. Featured Image File
  if (data.featured_image instanceof File || data.featured_image instanceof Blob) {
    formData.append('featured_image', data.featured_image);
  } else if (data.image instanceof File || data.image instanceof Blob) {
    formData.append('image', data.image);
  } else if (data.featuredImageFile instanceof File || data.featuredImageFile instanceof Blob) {
    formData.append('featured_image', data.featuredImageFile);
  } else if (data.coverImage && typeof data.coverImage === 'string' && data.coverImage.startsWith('data:')) {
    const file = dataUrlToFile(data.coverImage, 'blog_cover.webp');
    if (file) {
      formData.append('featured_image', file);
    }
  }

  return formData;
};

// 1. GET /admin/blogs - List blogs with search, filters & pagination
export const getBlogs = async (params = {}) => {
  const response = await mainAxios.get('/admin/blogs', { params });
  return response.data;
};

// 2. GET /admin/blogs/:id - Retrieve single blog details
export const getBlog = async (id) => {
  const response = await mainAxios.get(`/admin/blogs/${id}`);
  return response.data;
};

// 3. POST /admin/blogs - Create new blog article
export const createBlog = async (blogData) => {
  const payload = formatBlogPayload(blogData);
  const response = await mainAxios.post('/admin/blogs', payload);
  return response.data;
};

// 4. POST /admin/blogs/:id - Update blog article
export const updateBlog = async (id, blogData) => {
  const payload = formatBlogPayload(blogData);
  const response = await mainAxios.post(`/admin/blogs/${id}`, payload);
  return response.data;
};

// 5. DELETE /admin/blogs/:id - Delete blog article
export const deleteBlog = async (id) => {
  const response = await mainAxios.delete(`/admin/blogs/${id}`);
  return response.data;
};

// 6. PATCH /admin/blogs/:id/publish - Publish blog
export const publishBlog = async (id) => {
  const response = await mainAxios.patch(`/admin/blogs/${id}/publish`);
  return response.data;
};

// 7. PATCH /admin/blogs/:id/unpublish - Unpublish blog
export const unpublishBlog = async (id) => {
  const response = await mainAxios.patch(`/admin/blogs/${id}/unpublish`);
  return response.data;
};

// 8. GET /admin/blog-categories - List blog categories
export const getBlogCategories = async () => {
  const response = await mainAxios.get('/admin/blog-categories');
  return response.data;
};

