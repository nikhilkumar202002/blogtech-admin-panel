import mainAxios from './main.service';

/**
 * Helper to convert payload to FormData if it contains files
 * or if it is already FormData.
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

// 1. GET /admin/careers - List all careers/jobs
export const getCareers = async (params = {}) => {
  const response = await mainAxios.get('/admin/careers', { params });
  return response.data;
};

// 2. GET /admin/careers/:id - View single career/job
export const getCareer = async (id) => {
  const response = await mainAxios.get(`/admin/careers/${id}`);
  return response.data;
};

// 3. POST /admin/careers - Create new career/job
export const createCareer = async (careerData) => {
  const payload = toFormData(careerData);
  const isMultipart = payload instanceof FormData;

  const response = await mainAxios.post('/admin/careers', payload, {
    headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

// 4. PUT /admin/careers/:id - Update career/job
export const updateCareer = async (id, careerData) => {
  const payload = toFormData(careerData);
  const isMultipart = payload instanceof FormData;

  try {
    const response = await mainAxios.put(`/admin/careers/${id}`, payload, {
      headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 405) {
      const patchResponse = await mainAxios.patch(`/admin/careers/${id}`, payload, {
        headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return patchResponse.data;
    }
    throw err;
  }
};

// Generic status update: PATCH /admin/careers/:id/:action
// where action can be: 'publish', 'unpublish', 'close', 'withdraw', 'reopen'
export const updateCareerStatus = async (id, action) => {
  const response = await mainAxios.patch(`/admin/careers/${id}/${action}`);
  return response.data;
};

// 5. PATCH /admin/careers/:id/publish - Publish career
export const publishCareer = async (id) => updateCareerStatus(id, 'publish');

// 6. PATCH /admin/careers/:id/unpublish - Unpublish career
export const unpublishCareer = async (id) => updateCareerStatus(id, 'unpublish');

// 7. PATCH /admin/careers/:id/close - Close career
export const closeCareer = async (id) => updateCareerStatus(id, 'close');

// 8. PATCH /admin/careers/:id/withdraw - Withdraw career
export const withdrawCareer = async (id) => updateCareerStatus(id, 'withdraw');

// 9. PATCH /admin/careers/:id/reopen - Reopen career
export const reopenCareer = async (id) => updateCareerStatus(id, 'reopen');

// 10. DELETE /admin/careers/:id - Delete career opening
export const deleteCareer = async (id) => {
  const response = await mainAxios.delete(`/admin/careers/${id}`);
  return response.data;
};

// Aliases for Job naming convention
export const getJobs = getCareers;
export const getJob = getCareer;
export const createJob = createCareer;
export const updateJob = updateCareer;
export const deleteJob = deleteCareer;
export const updateJobStatus = updateCareerStatus;
export const publishJob = publishCareer;
export const unpublishJob = unpublishCareer;
export const closeJob = closeCareer;
export const withdrawJob = withdrawCareer;
export const reopenJob = reopenCareer;

const careerService = {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
  updateCareerStatus,
  publishCareer,
  unpublishCareer,
  closeCareer,
  withdrawCareer,
  reopenCareer,
  // Job aliases
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  publishJob,
  unpublishJob,
  closeJob,
  withdrawJob,
  reopenJob,
};

export default careerService;