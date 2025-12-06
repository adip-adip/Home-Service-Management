/**
 * Events Middleware
 * Handles request/response logging and events
 */

const { HTTP_STATUS } = require('../config/constant.config');

/**
 * Request Logger Middleware
 * Logs incoming requests with method, URL, and timestamp
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log request
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Started`);

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        const resetColor = '\x1b[0m';
        
        console.log(
            `[${timestamp}] ${req.method} ${req.originalUrl} - ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
        );
    });

    next();
};

/**
 * Request ID Middleware
 * Adds unique request ID for tracing
 */
const requestId = (req, res, next) => {
    const id = req.headers['x-request-id'] || generateRequestId();
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
};

/**
 * Generate unique request ID
 */
const generateRequestId = () => {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Response Time Header Middleware
 */
const responseTime = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        res.setHeader('X-Response-Time', `${time}ms`);
    });

    next();
};

/**
 * Security Headers Middleware
 * Additional security headers not covered by Helmet
 */
const securityHeaders = (req, res, next) => {
    // Prevent caching of sensitive data
    if (req.originalUrl.includes('/auth/') || req.originalUrl.includes('/admin/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
};

/**
 * IP Address Extraction Middleware
 * Gets real client IP considering proxies
 */
const extractClientIP = (req, res, next) => {
    req.clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'] ||
                   req.connection?.remoteAddress ||
                   req.socket?.remoteAddress ||
                   req.ip;
    next();
};

/**
 * Health Check Response
 */
const healthCheck = (req, res) => {
    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
};

module.exports = {
    requestLogger,
    requestId,
    responseTime,
    securityHeaders,
    extractClientIP,
    healthCheck
};
