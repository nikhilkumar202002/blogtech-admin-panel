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
 * Cleans and normalizes article HTML markup:
 * 1. Strips leading duplicate <h1> title if it duplicates the article headline
 * 2. Unwraps block elements (<p>, <ul>, <ol>, <div>, <blockquote>, <table>) mistakenly nested inside <h1-h6>
 * 3. Unwraps unnecessary <p> elements directly inside <li>
 * 4. Removes empty heading tags and empty paragraphs
 * @param {string} rawHtml
 * @param {string} articleTitle
 * @returns {string} Cleaned HTML string
 */
export const cleanArticleHtml = (rawHtml, articleTitle = '') => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  let clean = rawHtml;

  // 1. Remove duplicate leading <h1> if it matches or resembles the article title
  if (articleTitle) {
    const normTitle = articleTitle.trim().toLowerCase();
    clean = clean.replace(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/i, (match, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim().toLowerCase();
      if (text === normTitle || normTitle.includes(text) || text.includes(normTitle)) {
        return '';
      }
      return match;
    });
  } else {
    clean = clean.replace(/^\s*<h1[^>]*>[\s\S]*?<\/h1>/i, '');
  }

  // 2. Fix block elements mistakenly wrapped inside <h1-h6>
  clean = clean.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/gi, (match, level, inner) => {
    const trimmed = inner.trim();
    // If the entire heading contains only block elements (starts with <p, <ul, <ol, <div, etc.)
    if (/^<(?:p|ul|ol|div|blockquote|table)[\s\S]*$/i.test(trimmed)) {
      return trimmed;
    }
    // If heading has heading title AND THEN block elements inside it
    const blockMatch = trimmed.match(/^([\s\S]*?)(<(?:p|ul|ol|div|blockquote|table)[\s\S]*)$/i);
    if (blockMatch) {
      const headingPart = blockMatch[1].trim();
      const bodyPart = blockMatch[2].trim();
      if (headingPart) {
        return `<h${level}>${headingPart}</h${level}>${bodyPart}`;
      }
      return bodyPart;
    }
    return match;
  });

  // 3. Unwrap redundant <p> inside <li>
  clean = clean.replace(/<li([^>]*)>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li$1>$2</li>');

  // 4. Remove empty heading tags and empty paragraphs
  clean = clean.replace(/<h[1-6]>\s*(?:&nbsp;|\s)*<\/h[1-6]>/gi, '');
  clean = clean.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '');

  return clean.trim();
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

