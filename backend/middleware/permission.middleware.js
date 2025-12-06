/**
 * Permission Guard Middleware
 * Restricts access based on granular permissions
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constant.config');

/**
 * Permission-based access control middleware
 * Checks if user has required permission(s)
 * @param {...string} requiredPermissions - Permissions required to access the route
 * @returns {Function} Express middleware function
 */
const permissionGuard = (...requiredPermissions) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'Authentication required'
            });
        }

        const userPermissions = req.user.permissions || [];

        // Check if user has at least one of the required permissions
        const hasPermission = requiredPermissions.some(permission => 
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                error: `Missing required permission: ${requiredPermissions.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Strict permission guard - requires ALL permissions
 * @param {...string} requiredPermissions - All permissions required
 * @returns {Function} Express middleware function
 */
const strictPermissionGuard = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'Authentication required'
            });
        }

        const userPermissions = req.user.permissions || [];

        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every(permission => 
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            const missingPermissions = requiredPermissions.filter(
                permission => !userPermissions.includes(permission)
            );

            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                error: `Missing required permissions: ${missingPermissions.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if user has specific permission (utility function)
 * @param {Object} user - User object with permissions
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has the permission
 */
const hasPermission = (user, permission) => {
    if (!user || !user.permissions) {
        return false;
    }
    return user.permissions.includes(permission);
};

/**
 * Dynamic permission check based on resource ownership
 * Allows access if user owns the resource OR has the required permission
 * @param {string} permission - Required permission for non-owners
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 * @returns {Function} Express middleware function
 */
const ownerOrPermissionGuard = (permission, getResourceOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'Authentication required'
            });
        }

        try {
            // Get resource owner ID
            const ownerId = await getResourceOwnerId(req);
            
            // Check if user is the owner
            if (ownerId && ownerId.toString() === req.user.userId.toString()) {
                return next();
            }

            // Check if user has the required permission
            if (req.user.permissions && req.user.permissions.includes(permission)) {
                return next();
            }

            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                error: 'You do not have permission to access this resource'
            });
        } catch (error) {
            console.error('Permission guard error:', error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ERROR_MESSAGES.INTERNAL_ERROR
            });
        }
    };
};

module.exports = {
    permissionGuard,
    strictPermissionGuard,
    hasPermission,
    ownerOrPermissionGuard
};
