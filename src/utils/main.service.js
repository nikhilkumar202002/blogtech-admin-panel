import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.blogtec.co.in/api';

const mainAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000, // 30-second standard timeout to prevent hung connections
});

// Flag to prevent multiple simultaneous 401 failures from triggering duplicate logout cascades
let isHandlingUnauthorized = false;

// Request Interceptor: Attach authentication tokens safely to approved destinations only
mainAxios.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    // Only attach authorization headers if the destination is relative (e.g. /admin/...)
    // or strictly targets the configured API_BASE_URL origin. Never leak tokens to external URLs.
    const isRelative = !url.startsWith('http://') && !url.startsWith('https://');
    const isApprovedHost = url.startsWith(API_BASE_URL);

    if (isRelative || isApprovedHost) {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // When sending FormData (e.g. image/file uploads), delete manual Content-Type header so
    // Axios and the browser automatically compute multipart/form-data with the correct boundary parameter.
    const isFormData =
      config.data instanceof FormData ||
      (config.data && typeof config.data?.append === 'function');

    if (isFormData && config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format, sanitize, and handle errors globally
mainAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 1. 401 Unauthorized: Session is invalid or token revoked -> clear credentials & redirect once
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: {
              message:
                error.response?.data?.message ||
                'Your session has expired. Please sign in again.',
            },
          })
        );
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 2500);
      }
    }

    // 2. 403 Forbidden: Access denied -> DO NOT log the user out! Keep session alive.
    else if (status === 403) {
      const forbiddenMsg =
        error.response?.data?.message ||
        'Access denied: You do not have permission to perform this action.';
      window.dispatchEvent(
        new CustomEvent('auth:forbidden', {
          detail: { message: forbiddenMsg },
        })
      );
    }

    // 3. 429 Too Many Requests: Rate limited
    else if (status === 429) {
      window.dispatchEvent(
        new CustomEvent('api:ratelimited', {
          detail: {
            message: 'Too many requests. Please wait a moment before trying again.',
          },
        })
      );
    }

    // 4. 5xx Server Errors: Normalize without exposing internal exception details
    else if (status >= 500 && error.response?.data) {
      // Clean up sensitive server traces from client visibility
      if (typeof error.response.data === 'object' && error.response.data.exception) {
        delete error.response.data.exception;
        delete error.response.data.trace;
      }
    }

    return Promise.reject(error);
  }
);

export default mainAxios;
