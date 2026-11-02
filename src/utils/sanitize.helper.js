import DOMPurify from 'dompurify';

/**
 * Strict HTML Sanitization Configuration for Rich-Text Content
 * Whitelists only standard formatting, headings, lists, tables, and safe links.
 * Strips all executable scripts, iframes, objects, forms, inline event handlers,
 * and dangerous URI protocols (e.g. javascript:, vbscript:, data:).
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'b', 'strong', 'i', 'em', 'u', 's', 'strike',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a', 'img',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'title',
    'src', 'alt', 'width', 'height',
    'class',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'base', 'meta', 'link', 'style'],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onkeydown', 'onkeypress', 'onkeyup', 'ondblclick',
    'oncontextmenu', 'onmouseenter', 'onmouseleave',
  ],
};

// Hook into DOMPurify to enforce secure rel attributes on all anchor tags
if (typeof window !== 'undefined' && DOMPurify.addHook) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Sanitizes rich-text HTML string before rendering to DOM.
 * @param {string} dirtyHtml
 * @returns {string} Sanitized safe HTML string
 */
export const sanitizeHtml = (dirtyHtml) => {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, SANITIZE_CONFIG);
};

/**
 * Validates whether a user-supplied URL is safe to use in links / redirects.
 * Explicitly rejects dangerous schemes: javascript:, vbscript:, data:
 * @param {string} url
 * @returns {boolean}
 */
export const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return false;
  }
  return true;
};

/**
 * Safely escapes characters for embedding in XML/SVG context.
 * Prevents XML injection / breakout in dynamically generated SVG data URIs.
 * @param {string} text
 * @returns {string} Escaped XML string
 */
export const escapeXml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
