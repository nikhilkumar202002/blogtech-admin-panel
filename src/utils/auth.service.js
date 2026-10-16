import mainAxios from './main.service';

const TOKEN_KEY = 'token';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY) || null;
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const DEFAULT_ADMIN_USER = {
  id: 55,
  name: 'Nikhil Kumar',
  email: 'nikhilkumars12343@gmail.com',
  role: 'super_admin',
  status: 'active',
  created_at: '2026-10-16T06:01:51.000000Z',
  updated_at: '2026-10-16T06:01:51.000000Z',
};

const sanitizeUserData = (rawUser) => {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const user = { ...rawUser };
  delete user.avatar;
  delete user.image;
  delete user.photo;
  delete user.profile_photo_url;
  return user;
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return sanitizeUserData(JSON.parse(raw));
  } catch (err) {
    console.error('Error parsing stored user:', err);
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

/**
 * Admin Login
 * POST /admin/login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} API response data
 */
export const login = async (credentials) => {
  const response = await mainAxios.post('/admin/login', credentials);
  const data = response.data;

  // Extract token from common response structures
  const token = data?.token || data?.data?.token || data?.access_token || data?.data?.access_token;
  if (token) {
    setToken(token);
  }

  // Extract and save user if available in response
  const rawUser = data?.user || data?.data?.user || (data?.data && !data?.data?.token ? data?.data : null);
  const cleanUser = sanitizeUserData(rawUser);
  if (cleanUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(cleanUser));
  }

  return data;
};

/**
 * Admin Logout
 * POST /admin/logout
 * @returns {Promise<Object>} API response data
 */
export const logout = async () => {
  try {
    const response = await mainAxios.post('/admin/logout');
    return response.data;
  } finally {
    // Clear tokens regardless of whether server request succeeds or fails
    removeToken();
  }
};

/**
 * Get Current Authenticated Admin
 * GET /admin/me
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 55,
 *     "name": "Nikhil Kumar",
 *     "email": "nikhilkumars12343@gmail.com",
 *     "role": "super_admin",
 *     "status": "active",
 *     "created_at": "2026-10-16T06:01:51.000000Z",
 *     "updated_at": "2026-10-16T06:01:51.000000Z"
 *   }
 * }
 * @returns {Promise<Object>} API response data
 */
export const getCurrentUser = async () => {
  const response = await mainAxios.get('/admin/me');
  const data = response.data;
  const rawUser = data?.data || data?.user || (data?.id ? data : null);
  const cleanUser = sanitizeUserData(rawUser);

  if (cleanUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(cleanUser));
  }

  return data;
};

// Alias for convenience
export const getMe = getCurrentUser;

const authService = {
  login,
  logout,
  getCurrentUser,
  getMe,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  isAuthenticated,
};

export default authService;