import mainAxios from './main.service';

/**
 * Helper to convert service payload to FormData if it contains files
 * (such as featured_image) or if it is already FormData.
 */
const toFormData = (data) => {
  if (data instanceof FormData) {
    return data;
  }

  // Check if any value is a File or Blob
  const hasFile = Object.values(data || {}).some(
    (val) => val instanceof File || val instanceof Blob
  );

  if (!hasFile) {
    return data;
  }

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

// 1. GET /admin/services - List all services
export const getServices = async (params = {}) => {
  const response = await mainAxios.get('/admin/services', { params });
  return response.data;
};

// 2. GET /admin/services/:id - Get single service details
export const getService = async (id) => {
  const response = await mainAxios.get(`/admin/services/${id}`);
  return response.data;
};

// 3. POST /admin/services - Create new service
export const createService = async (serviceData) => {
  const payload = toFormData(serviceData);
  const response = await mainAxios.post('/admin/services', payload);
  return response.data;
};

// 4. POST /admin/services/:id - Edit service
export const updateService = async (id, serviceData) => {
  const payload = toFormData(serviceData);
  const response = await mainAxios.post(`/admin/services/${id}`, payload);
  return response.data;
};

// 5. PATCH /admin/services/:id/publish - Change status to published
export const publishService = async (id) => {
  const response = await mainAxios.patch(`/admin/services/${id}/publish`);
  return response.data;
};

// 6. PATCH /admin/services/:id/unpublish - Change status to unpublished
export const unpublishService = async (id) => {
  const response = await mainAxios.patch(`/admin/services/${id}/unpublish`);
  return response.data;
};

// 7. DELETE /admin/services/:id - Delete single service
export const deleteService = async (id) => {
  const response = await mainAxios.delete(`/admin/services/${id}`);
  return response.data;
};

// 8. DELETE /admin/services - Delete multiple services (Bulk delete via DELETE /admin/services)
export const deleteServices = async (ids) => {
  const payload = Array.isArray(ids) ? ids : [ids];
  const response = await mainAxios.delete('/admin/services', {
    data: { ids: payload },
  });
  return response.data;
};

// 9. DELETE /admin/services/bulk-delete - Bulk delete services via DELETE method
export const bulkDeleteServices = async (ids) => {
  const payload = Array.isArray(ids) ? ids : [ids];
  const response = await mainAxios.delete('/admin/services/bulk-delete', {
    data: { ids: payload },
  });
  return response.data;
};
export const bulkDeleteServicesDelete = bulkDeleteServices;

// 10. POST /admin/services/bulk-delete - Bulk delete services via POST method
export const bulkDeleteServicesPost = async (ids) => {
  const payload = Array.isArray(ids) ? ids : [ids];
  const response = await mainAxios.post('/admin/services/bulk-delete', {
    ids: payload,
  });
  return response.data;
};

const ourServiceService = {
  getServices,
  getService,
  createService,
  updateService,
  publishService,
  unpublishService,
  deleteService,
  deleteServices,
  bulkDeleteServices,
  bulkDeleteServicesDelete,
  bulkDeleteServicesPost,
};

export default ourServiceService;