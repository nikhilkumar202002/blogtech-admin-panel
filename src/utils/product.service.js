import mainAxios from './main.service';

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

// 3. POST /admin/products - Create new product
export const createProduct = async (productData) => {
  const response = await mainAxios.post('/admin/products', productData);
  return response.data;
};

// 4. PUT /admin/products/:id - Update product details (or POST if sending FormData)
export const updateProduct = async (id, productData) => {
  if (productData instanceof FormData) {
    const response = await mainAxios.post(`/admin/products/${id}`, productData);
    return response.data;
  }
  try {
    const response = await mainAxios.put(`/admin/products/${id}`, productData);
    return response.data;
  } catch (err) {
    if (err.response?.status === 405) {
      const patchResponse = await mainAxios.patch(`/admin/products/${id}`, productData);
      return patchResponse.data;
    }
    throw err;
  }
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

// 8. POST /admin/products/:id/featured-image - Upload featured image
export const uploadFeaturedImage = async (id, fileOrFormData) => {
  let formData = fileOrFormData;
  if (fileOrFormData instanceof File) {
    formData = new FormData();
    formData.append('featured_image', fileOrFormData);
  }
  const response = await mainAxios.post(`/admin/products/${id}/featured-image`, formData);
  return response.data;
};

// 9. DELETE /admin/products/:id/featured-image - Delete featured image
export const deleteFeaturedImage = async (id) => {
  const response = await mainAxios.delete(`/admin/products/${id}/featured-image`);
  return response.data;
};

// 10. POST /admin/products/:id/images - Upload gallery images
export const uploadGalleryImages = async (id, filesOrFormData) => {
  let formData = filesOrFormData;
  if (filesOrFormData instanceof FileList || Array.isArray(filesOrFormData)) {
    formData = new FormData();
    Array.from(filesOrFormData).forEach((file) => {
      formData.append('images[]', file);
    });
  } else if (filesOrFormData instanceof File) {
    formData = new FormData();
    formData.append('images[]', filesOrFormData);
  }
  const response = await mainAxios.post(`/admin/products/${id}/images`, formData);
  return response.data;
};

// 11. DELETE /admin/products/:productId/images/:imageId - Delete gallery image
export const deleteGalleryImage = async (productId, imageId) => {
  const response = await mainAxios.delete(`/admin/products/${productId}/images/${imageId}`);
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
  uploadFeaturedImage,
  deleteFeaturedImage,
  uploadGalleryImages,
  deleteGalleryImage,
};

export default productService;
