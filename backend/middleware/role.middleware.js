/**
 * Role Guard Middleware
 * Restricts access based on user roles
 */

const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../config/constant.config');

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'Authentication required'
            });
        }

        const userRole = req.user.role;

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(userRole)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.FORBIDDEN,
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Admin only middleware
 */
const adminOnly = roleGuard(ROLES.ADMIN);

/**
 * Employee only middleware
 */
const employeeOnly = roleGuard(ROLES.EMPLOYEE);

/**
 * Customer only middleware
 */
const customerOnly = roleGuard(ROLES.CUSTOMER);

/**
 * Admin or Employee middleware
 */
const adminOrEmployee = roleGuard(ROLES.ADMIN, ROLES.EMPLOYEE);

/**
 * Any authenticated user middleware (just verifies auth exists)
 */
const anyAuthenticated = roleGuard(ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.CUSTOMER);

module.exports = {
    roleGuard,
    adminOnly,
    employeeOnly,
    customerOnly,
    adminOrEmployee,
    anyAuthenticated
};
