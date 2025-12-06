/**
 * Authentication Middleware
 * Verifies JWT access tokens and attaches user info to request
 */

const { verifyAccessToken } = require('../utilitis/jwt.helper');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constant.config');
const { User } = require('../modules');

/**
 * JWT Authentication Middleware
 * Validates access token and attaches user data to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED,
                error: 'Invalid token format'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_INVALID,
                error: 'Token verification failed'
            });
        }

        // Optionally verify user still exists and is active
        // (Can be disabled for performance if not needed)
        const user = await User.findById(decoded.userId).select('status role permissions');

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND,
                error: 'User no longer exists'
            });
        }

        if (user.status === 'blocked') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.USER_BLOCKED
            });
        }

        // Check if password was changed after token was issued
        if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Password recently changed. Please login again.',
                error: 'Token invalidated'
            });
        }

        // Attach user data to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            permissions: decoded.permissions
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_EXPIRED,
                error: 'Please refresh your token'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_INVALID,
                error: error.message
            });
        }

        console.error('Authentication error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR
        });
    }
};

/**
 * Optional Authentication Middleware
 * Validates token if present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = verifyAccessToken(token);

        if (decoded) {
            req.user = {
                userId: decoded.userId,
                role: decoded.role,
                permissions: decoded.permissions
            };
        }

        next();
    } catch (error) {
        // Silently continue without authentication
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
