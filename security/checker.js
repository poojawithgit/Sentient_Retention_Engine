const rbacRules = require('./rbac-rules.json');

/**
 * Checks if a role has a given permission, including inheritance.
 * @param {string} role - The user's role (e.g. 'admin', 'specialist')
 * @param {string} permission - The permission to check (e.g. 'execute:override')
 * @returns {boolean} - True if permitted, false otherwise.
 */
function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const roleConfig = rbacRules.roles[role];
  if (!roleConfig) return false;
  
  // Direct check
  if (roleConfig.permissions.includes(permission)) {
    return true;
  }
  
  // Inherited check
  if (roleConfig.inherits && roleConfig.inherits.length > 0) {
    for (const parentRole of roleConfig.inherits) {
      if (hasPermission(parentRole, permission)) {
        return true;
      }
    }
  }
  
  return false;
}

module.exports = {
  hasPermission,
  rules: rbacRules
};
