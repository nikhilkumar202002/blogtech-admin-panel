
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
 * Accepts either a role string ('super_admin') or a user object ({ role: 'super_admin' }).
 * @param {string|object} roleOrUser
 * @param {string} tab - tab identifier ('dashboard', 'products', etc.)
 * @returns {boolean}
 */
export const canAccessTab = (roleOrUser, tab) => {
  if (!tab || !roleOrUser) return false;
  const role = typeof roleOrUser === 'object' ? roleOrUser.role : roleOrUser;
  if (!role || typeof role !== 'string') return false;
  const cleanRole = role.toLowerCase().trim();
  const allowed = ROLE_PERMISSIONS[cleanRole];
  // Unknown or unrecognized roles are strictly denied all access
  if (!allowed || !Array.isArray(allowed)) return false;
  return allowed.includes(tab.toLowerCase());
};

/**
 * Returns array of permitted navigation tabs for a role or user
 * @param {string|object} roleOrUser
 * @returns {string[]}
 */
export const getAllowedTabs = (roleOrUser) => {
  if (!roleOrUser) return [];
  const role = typeof roleOrUser === 'object' ? roleOrUser.role : roleOrUser;
  if (!role || typeof role !== 'string') return [];
  const cleanRole = role.toLowerCase().trim();
  return ROLE_PERMISSIONS[cleanRole] || [];
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

