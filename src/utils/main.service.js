import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://blogtec.co.in/backend/api';

const mainAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authentication tokens if available
mainAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // When sending FormData (e.g. image/file uploads), delete Content-Type so Axios and
    // the browser automatically compute multipart/form-data with the correct boundary parameter.
    if (config.data instanceof FormData) {
      if (config.headers) {
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        } else {
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format and handle errors globally
mainAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default mainAxios;