import test from 'node:test';
import assert from 'node:assert/strict';

import { canAccessTab, getAllowedTabs, isSuperAdmin, isAdmin, isEditor } from '../src/utils/rbac.helper.js';
import { isSafeUrl, escapeXml } from '../src/utils/sanitize.helper.js';

/* -------------------------------------------------------------------------- */
/* Part 1: Role-Based Access Control (RBAC) Hardening Tests                   */
/* -------------------------------------------------------------------------- */

test('RBAC - Super Admin permissions', () => {
  const superAdmin = { role: 'super_admin' };
  assert.strictEqual(canAccessTab(superAdmin, 'dashboard'), true);
  assert.strictEqual(canAccessTab(superAdmin, 'products'), true);
  assert.strictEqual(canAccessTab(superAdmin, 'services'), true);
  assert.strictEqual(canAccessTab(superAdmin, 'careers'), true);
  assert.strictEqual(canAccessTab(superAdmin, 'blogs'), true);
  assert.strictEqual(canAccessTab(superAdmin, 'settings'), true);

  // Administrative user & roles management capability
  assert.strictEqual(isSuperAdmin(superAdmin.role), true);
  assert.strictEqual(isAdmin(superAdmin.role), true);
  assert.strictEqual(isEditor(superAdmin.role), false);
});

test('RBAC - Admin permissions (restricted from user management and role configuration)', () => {
  const admin = { role: 'admin' };
  assert.strictEqual(canAccessTab(admin, 'dashboard'), true);
  assert.strictEqual(canAccessTab(admin, 'products'), true);
  assert.strictEqual(canAccessTab(admin, 'services'), true);
  assert.strictEqual(canAccessTab(admin, 'careers'), true);
  assert.strictEqual(canAccessTab(admin, 'blogs'), true);
  assert.strictEqual(canAccessTab(admin, 'settings'), true);

  // Administrative restrictions: Admin cannot manage administrator accounts or system roles
  assert.strictEqual(isSuperAdmin(admin.role), false, 'Admin must NOT have super_admin privileges');
  assert.strictEqual(isAdmin(admin.role), true);
  assert.strictEqual(isEditor(admin.role), false);
});

test('RBAC - Editor permissions (content-only: blogs and careers; NO catalog items or admin)', () => {
  const editor = { role: 'editor' };
  assert.strictEqual(canAccessTab(editor, 'dashboard'), true);
  assert.strictEqual(canAccessTab(editor, 'blogs'), true);
  assert.strictEqual(canAccessTab(editor, 'careers'), true);
  assert.strictEqual(canAccessTab(editor, 'settings'), true);

  // Catalog restrictions
  assert.strictEqual(canAccessTab(editor, 'products'), false, 'Editor must NOT access products');
  assert.strictEqual(canAccessTab(editor, 'services'), false, 'Editor must NOT access services');

  // Administrative restrictions
  assert.strictEqual(isSuperAdmin(editor.role), false, 'Editor must NOT have super_admin privileges');
  assert.strictEqual(isAdmin(editor.role), false, 'Editor must NOT have admin privileges');
  assert.strictEqual(isEditor(editor.role), true);
});

test('RBAC - Unknown or invalid role is strictly denied access', () => {
  const unknownUser = { role: 'viewer' };
  const maliciousUser = { role: '__proto__' };
  const emptyUser = {};
  const nullUser = null;

  assert.strictEqual(canAccessTab(unknownUser, 'products'), false);
  assert.strictEqual(canAccessTab(unknownUser, 'blogs'), false);
  assert.strictEqual(canAccessTab(maliciousUser, 'dashboard'), false);
  assert.strictEqual(canAccessTab(emptyUser, 'dashboard'), false);
  assert.strictEqual(canAccessTab(nullUser, 'dashboard'), false);

  assert.deepStrictEqual(getAllowedTabs(unknownUser), []);
  assert.deepStrictEqual(getAllowedTabs(nullUser), []);
  assert.strictEqual(isSuperAdmin('unknown'), false);
  assert.strictEqual(isAdmin('unknown'), false);
});

/* -------------------------------------------------------------------------- */
/* Part 2: XSS Prevention & Input Safety Tests                                */
/* -------------------------------------------------------------------------- */

test('URL Sanitizer - Rejects dangerous executable protocols', () => {
  // JavaScript scheme variations
  assert.strictEqual(isSafeUrl('javascript:alert(1)'), false);
  assert.strictEqual(isSafeUrl('JAVASCRIPT:alert(document.cookie)'), false);
  assert.strictEqual(isSafeUrl('  javascript:void(0)'), false);

  // Data URI scheme variations
  assert.strictEqual(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), false);
  assert.strictEqual(isSafeUrl('DATA:application/javascript,alert(1)'), false);

  // VBScript scheme
  assert.strictEqual(isSafeUrl('vbscript:msgbox(1)'), false);
});

test('URL Sanitizer - Allows legitimate URLs and paths', () => {
  assert.strictEqual(isSafeUrl('https://blogtec.co.in/articles/news'), true);
  assert.strictEqual(isSafeUrl('http://localhost:5173/admin'), true);
  assert.strictEqual(isSafeUrl('mailto:support@blogtec.co.in'), true);
  assert.strictEqual(isSafeUrl('tel:+919876543210'), true);
  assert.strictEqual(isSafeUrl('/admin/products/12'), true);
});

test('XML / SVG Escaper - Neutralizes XML injection breakouts', () => {
  const dangerousText = '<script>alert("XSS")</script>&"\'';
  const escaped = escapeXml(dangerousText);

  assert.strictEqual(escaped.includes('<script>'), false);
  assert.strictEqual(escaped.includes('"'), false);
  assert.strictEqual(escaped.includes("'"), false);
  assert.strictEqual(escaped.includes('&'), true);
  assert.strictEqual(
    escaped,
    '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&quot;&#39;'
  );
});

/* -------------------------------------------------------------------------- */
/* Part 3: API Client & Token Domain Restriction Logic                       */
/* -------------------------------------------------------------------------- */

test('API Security - Bearer token boundary enforcement logic', () => {
  const API_BASE_URL = 'https://api.blogtec.co.in/api';

  const isApprovedUrl = (url) => {
    if (!url) return false;
    const isRelative = url.startsWith('/') || !/^https?:\/\//i.test(url);
    const isAppApi = url.startsWith(API_BASE_URL);
    return isRelative || isAppApi;
  };

  // Approved destinations
  assert.strictEqual(isApprovedUrl('/admin/me'), true);
  assert.strictEqual(isApprovedUrl('admin/products'), true);
  assert.strictEqual(isApprovedUrl('https://api.blogtec.co.in/api/admin/blogs'), true);

  // External / Third-party untrusted destinations
  assert.strictEqual(isApprovedUrl('https://evil-attacker.com/collect'), false);
  assert.strictEqual(isApprovedUrl('https://api.blogtec.co.in.attacker.com/api'), false);
  assert.strictEqual(isApprovedUrl('http://insecure-thirdparty.org'), false);
});

/* -------------------------------------------------------------------------- */
/* Part 4: HTTP Status Semantics (401 vs 403 Handling)                        */
/* -------------------------------------------------------------------------- */

test('HTTP Status - 403 Forbidden does not purge authentication tokens', () => {
  // Simulating response interceptor status handling
  let tokenCleared = false;
  let forbiddenEventTriggered = false;

  const handleResponseError = (status) => {
    if (status === 401) {
      tokenCleared = true;
    } else if (status === 403) {
      // 403: Forbidden - Must NOT logout or clear tokens
      forbiddenEventTriggered = true;
    }
  };

  handleResponseError(403);
  assert.strictEqual(tokenCleared, false, '403 Forbidden must NOT clear authentication tokens');
  assert.strictEqual(forbiddenEventTriggered, true, '403 Forbidden must trigger forbidden handler');

  handleResponseError(401);
  assert.strictEqual(tokenCleared, true, '401 Unauthorized must trigger session cleanup');
});
