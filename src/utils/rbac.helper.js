
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
};

// Allowed navigation module tabs per role
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['dashboard', 'products', 'services', 'careers', 'blogs', 'settings'],
  [ROLES.ADMIN]: ['dashboard', 'products', 'services', 'careers', 'blogs', 'settings'],
  [ROLES.EDITOR]: ['dashboard', 'careers', 'blogs', 'settings'],
};

/**
 * Checks if a user's role has permission to access a given navigation tab
 * @param {string} role - 'super_admin' | 'admin' | 'editor'
 * @param {string} tab - tab identifier ('dashboard', 'products', etc.)
 * @returns {boolean}
 */
export const canAccessTab = (role, tab) => {
  if (!tab) return false;
  const cleanRole = (role || ROLES.EDITOR).toLowerCase();
  const allowed = ROLE_PERMISSIONS[cleanRole] || ROLE_PERMISSIONS[ROLES.EDITOR];
  return allowed.includes(tab.toLowerCase());
};

/**
 * Returns array of permitted navigation tabs for a role
 * @param {string} role
 * @returns {string[]}
 */
export const getAllowedTabs = (role) => {
  const cleanRole = (role || ROLES.EDITOR).toLowerCase();
  return ROLE_PERMISSIONS[cleanRole] || ROLE_PERMISSIONS[ROLES.EDITOR];
};

/**
 * Formats a raw role string into a human-readable title
 * @param {string} role
 * @returns {string}
 */
export const formatRoleLabel = (role) => {
  if (!role) return 'Editor';
  if (role === 'super_admin') return 'Super Admin';
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Role query helpers
 */
export const isSuperAdmin = (role) => (role || '').toLowerCase() === ROLES.SUPER_ADMIN;
export const isAdmin = (role) => ['super_admin', 'admin'].includes((role || '').toLowerCase());
export const isEditor = (role) => (role || '').toLowerCase() === ROLES.EDITOR;

