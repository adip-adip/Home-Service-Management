/**
 * Rate Limiter Middleware
 * Protects against brute force and DDoS attacks
 */

const rateLimit = require('express-rate-limit');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constant.config');

/**
 * Create custom rate limiter
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express rate limiter middleware
 */
const createRateLimiter = (options = {}) => {
    const defaults = {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        message: {
            success: false,
            message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
            error: 'Please try again later'
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        handler: (req, res) => {
            res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
                retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes'
            });
        }
    };

    return rateLimit({ ...defaults, ...options });
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
});

/**
 * Auth endpoints rate limiter (stricter)
 * 5 attempts per 15 minutes for login/register
 */
const authLimiter = createRateLimiter({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5,
    message: {
        success: false,
        message: 'Too many authentication attempts',
        error: 'Please try again after 15 minutes'
    },
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Password reset rate limiter
 * 3 attempts per hour
 */
const passwordResetLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many password reset attempts',
        error: 'Please try again after 1 hour'
    }
});

/**
 * Email verification rate limiter
 * 5 attempts per hour
 */
const emailVerificationLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: {
        success: false,
        message: 'Too many verification email requests',
        error: 'Please try again after 1 hour'
    }
});

/**
 * File upload rate limiter
 * 10 uploads per hour
 */
const uploadLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Too many file uploads',
        error: 'Please try again later'
    }
});

/**
 * Create account rate limiter (IP-based)
 * 5 accounts per day from same IP
 */
const createAccountLimiter = createRateLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5,
    message: {
        success: false,
        message: 'Too many accounts created from this IP',
        error: 'Please try again tomorrow'
    }
});

module.exports = {
    createRateLimiter,
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
    uploadLimiter,
    createAccountLimiter
};
