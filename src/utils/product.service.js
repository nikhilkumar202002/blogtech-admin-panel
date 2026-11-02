import mainAxios from './main.service';

/**
 * Helper to convert product payload to FormData if needed
 * (handling featured_image File, gallery_images[] files, removed_gallery_images[], etc.)
 */
export const toFormData = (data) => {
  if (data instanceof FormData) {
    return data;
  }

  const formData = new FormData();
  Object.keys(data || {}).forEach((key) => {
    const value = data[key];
    if (value === undefined || value === null) return;

    if (key === 'gallery_images' && Array.isArray(value)) {
      value.forEach((file) => {
        if (file instanceof File || file instanceof Blob) {
          formData.append('gallery_images[]', file);
        }
      });
    } else if (key === 'removed_gallery_images' && Array.isArray(value)) {
      value.forEach((item) => {
        formData.append('removed_gallery_images[]', String(item));
      });
    } else if (key === 'existing_gallery_images' && Array.isArray(value)) {
      value.forEach((item) => {
        formData.append('existing_gallery_images[]', String(item));
      });
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

// 1. GET /admin/products - List products
export const getProducts = async (params = {}) => {
  const response = await mainAxios.get('/admin/products', { params });
  return response.data;
};

// 2. GET /admin/products/:id - Single product details
export const getProduct = async (id) => {
  const response = await mainAxios.get(`/admin/products/${id}`);
  return response.data;
};

// 3. POST /admin/products - Create new product with all details, featured image & gallery in single API
export const createProduct = async (productData) => {
  const payload = toFormData(productData);
  const response = await mainAxios.post('/admin/products', payload);
  return response.data;
};

// 4. POST /admin/products/:id - Update product details, replace/remove featured image & gallery in single API
export const updateProduct = async (id, productData) => {
  const payload = toFormData(productData);
  const response = await mainAxios.post(`/admin/products/${id}`, payload);
  return response.data;
};

// 5. DELETE /admin/products/:id - Delete single product
export const deleteProduct = async (id) => {
  const response = await mainAxios.delete(`/admin/products/${id}`);
  return response.data;
};

// 6. PATCH /admin/products/:id/publish - Publish product
export const publishProduct = async (id) => {
  const response = await mainAxios.patch(`/admin/products/${id}/publish`);
  return response.data;
};

// 7. PATCH /admin/products/:id/unpublish - Unpublish product
export const unpublishProduct = async (id) => {
  const response = await mainAxios.patch(`/admin/products/${id}/unpublish`);
  return response.data;
};

const productService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  toFormData,
};

export default productService;
