import mainAxios from './main.service';

/**
 * Helper to wrap data into FormData if file is present
 */
const toFormData = (data) => {
  if (data instanceof FormData) return data;

  const hasFile = Object.values(data || {}).some(
    (val) => val instanceof File || val instanceof Blob
  );

  if (!hasFile) return data;

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

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
  const payload = toFormData(blogData);
  const response = await mainAxios.post('/admin/blogs', payload);
  return response.data;
};

// 4. POST /admin/blogs/:id - Update blog article
export const updateBlog = async (id, blogData) => {
  const payload = toFormData(blogData);
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

