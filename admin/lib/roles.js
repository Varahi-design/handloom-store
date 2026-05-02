export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIEWER: 'viewer'
};

export const hasPermission = (role, perm) => role === 'super_admin' || role === 'admin';