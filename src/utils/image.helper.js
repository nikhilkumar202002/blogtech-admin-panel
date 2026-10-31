import { API_BASE_URL } from './main.service';

// Default live storage domain where files are hosted
export const STORAGE_BASE_URL = 'https://api.blogtec.co.in/storage';
export const API_STREAM_URL = 'https://api.blogtec.co.in/api/storage';

/**
 * Normalizes any image identifier (relative storage path, full URL from different domains,
 * base64, or blob URL) into a reliable, directly fetchable URL.
 */
export const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();

  // Keep data URIs and blob URLs unchanged (used for instant image upload previews)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it's a 3rd party external image (Unsplash, external CDN, etc.) that doesn't reference our backend storage
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('/storage/') &&
    !trimmed.includes('blogtec.co.in')
  ) {
    return trimmed;
  }

  // Extract relative storage path if embedded in any URL
  let path = trimmed;
  if (path.includes('/storage/')) {
    path = path.substring(path.indexOf('/storage/') + 9);
  } else if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname;
      if (path.includes('/storage/')) {
        path = path.substring(path.indexOf('/storage/') + 9);
      }
    } catch {
      // ignore
    }
  }

  // Strip leading slash or accidental "storage/" or "public/"
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;
  while (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.slice(8);
  }
  while (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.slice(7);
  }
  if (!cleanPath) return '';

  // Local development if API_BASE_URL points to localhost
  if (API_BASE_URL && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}/storage/${cleanPath}`;
  }

  // Live production:
  // api.blogtec.co.in/storage/ is the dedicated LiteSpeed document root hosting public/storage.
  return `${STORAGE_BASE_URL}/${cleanPath}`;
};

/**
 * Creates an inline SVG placeholder Data URI with custom text/initials and theme colors.
 * Completely immune to network errors, CORS issues, or third-party placeholder downtimes.
 */
export const createSvgPlaceholder = (
  text = 'No Image',
  bgColor = '#f1f5f9',
  textColor = '#64748b',
  width = 200,
  height = 200
) => {
  const cleanText = (text || 'NA').toString().slice(0, 20);
  const fontSize = Math.max(12, Math.min(22, Math.floor(width / Math.max(cleanText.length, 6))));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="${fontSize}" fill="${textColor}">
      ${cleanText}
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

/**
 * Multi-domain fallback handler for <img> onError events.
 * 1. Tries api.blogtec.co.in/storage/ if failed on backend domain
 * 2. Tries PHP streaming controller route https://api.blogtec.co.in/api/storage/ (with CORS)
 * 3. Falls back to offline SVG placeholder
 */
export const handleImageError = (e, fallbackText = 'Image Not Found', isDark = false) => {
  const target = e.target;
  const currentSrc = target.src || '';

  // Extract relative storage path
  let relativePath = '';
  if (currentSrc.includes('/storage/')) {
    relativePath = currentSrc.substring(currentSrc.indexOf('/storage/') + 9);
  }

  // Attempt 1: Try api.blogtec.co.in/storage/ if it failed on backend domain
  if (!target.dataset.triedApiDomain && currentSrc.includes('blogtec.co.in/backend/storage/')) {
    target.dataset.triedApiDomain = '1';
    target.src = currentSrc.replace('blogtec.co.in/backend/storage/', 'api.blogtec.co.in/storage/');
    return;
  }

  // Attempt 2: Try streaming /api/storage/ route (has CORS and PHP disk fallback)
  if (!target.dataset.triedApiStream && relativePath) {
    target.dataset.triedApiStream = '1';
    target.src = `${API_STREAM_URL}/${relativePath}`;
    return;
  }

  // Final fallback: Inline SVG placeholder
  target.onerror = null;
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  target.src = createSvgPlaceholder(fallbackText, bgColor, textColor);
};

