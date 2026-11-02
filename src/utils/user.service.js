import mainAxios from './main.service';

/**
 * User & Role Management Service
 * Endpoints for administrators, profile, password, roles, and permissions.
 */

// 1. GET /admin/users - List administrators with search, filters, pagination
export const getUsers = async (params = {}) => {
  const response = await mainAxios.get('/admin/users', { params });
  return response.data;
};

// 2. GET /admin/users/:id - Get individual administrator details
export const getUser = async (id) => {
  const response = await mainAxios.get(`/admin/users/${id}`);
  return response.data;
};

// 3. POST /admin/users - Create new administrator
export const createUser = async (userData) => {
  const response = await mainAxios.post('/admin/users', userData);
  return response.data;
};

// 4. PUT /admin/users/:id - Update administrator details & role
export const updateUser = async (id, userData) => {
  const response = await mainAxios.put(`/admin/users/${id}`, userData);
  return response.data;
};

// 5. PATCH /admin/users/:id/status - Toggle active/inactive status
export const updateUserStatus = async (id, status) => {
  const response = await mainAxios.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};

// 6. DELETE /admin/users/:id - Delete administrator
export const deleteUser = async (id) => {
  const response = await mainAxios.delete(`/admin/users/${id}`);
  return response.data;
};

// 7. GET /admin/roles - Retrieve all system roles
export const getRoles = async () => {
  const response = await mainAxios.get('/admin/roles');
  return response.data;
};

// 8. GET /admin/permissions - Retrieve roles, permission matrix & hierarchy
export const getPermissions = async () => {
  const response = await mainAxios.get('/admin/permissions');
  return response.data;
};

// 9. PUT /admin/profile - Update authenticated admin profile
export const updateProfile = async (profileData) => {
  const response = await mainAxios.put('/admin/profile', profileData);
  return response.data;
};

// 10. PUT /admin/change-password - Change authenticated admin password
export const changePassword = async (passwordData) => {
  const response = await mainAxios.put('/admin/change-password', passwordData);
  return response.data;
};

const userService = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getRoles,
  getPermissions,
  updateProfile,
  changePassword,
};

export default userService;

