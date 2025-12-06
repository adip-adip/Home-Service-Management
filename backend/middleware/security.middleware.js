/**
 * Security Middleware
 * Additional security validations and protections
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { HTTP_STATUS } = require('../config/constant.config');

/**
 * Password strength validator beyond basic pattern
 */
const validatePasswordStrength = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return next();
    }

    const errors = [];
    
    // Check for common passwords
    const commonPasswords = [
        'password', '12345678', 'password123', 'admin123', 'qwerty123',
        'letmein', 'welcome', 'monkey123', '123456789', 'password1'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password is too common');
    }
    
    // Check for sequential characters
    if (/123456|abcdef|qwerty/i.test(password)) {
        errors.push('Password cannot contain sequential characters');
    }
    
    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Password cannot have more than 2 consecutive repeated characters');
    }
    
    if (errors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Password does not meet security requirements',
            errors
        });
    }
    
    next();
};

/**
 * File upload security validator
 */
const validateFileUpload = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    const errors = [];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png', 
        'image/jpg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    req.files.forEach((file, index) => {
        // Check file size
        if (file.size > maxFileSize) {
            errors.push(`File ${index + 1}: Size exceeds 5MB limit`);
        }
        
        // Check MIME type
        if (!allowedMimeTypes.includes(file.mimetype)) {
            errors.push(`File ${index + 1}: Invalid file type`);
        }
        
        // Check for potential executable extensions
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
        const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        
        if (dangerousExtensions.includes(fileExtension)) {
            errors.push(`File ${index + 1}: File type not allowed`);
        }

        // Basic virus scan simulation (check for suspicious file signatures)
        if (file.buffer) {
            const fileHeader = file.buffer.toString('hex', 0, 20);
            const virusSignatures = ['4d5a', '7f454c46']; // MZ (Windows executable), ELF (Linux executable)
            
            if (virusSignatures.some(sig => fileHeader.startsWith(sig))) {
                errors.push(`File ${index + 1}: Potentially malicious file detected`);
            }
        }
    });

    if (errors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'File validation failed',
            errors
        });
    }

    next();
};

/**
 * Enhanced rate limiter for sensitive operations
 */
const strictRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message: 'Too many attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
    // Recursively sanitize object
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.trim()
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                .replace(/javascript:/gi, '') // Remove javascript: protocol
                .replace(/on\w+\s*=\s*["'][^"']*["']/gi, ''); // Remove event handlers
        } else if (Array.isArray(obj)) {
            return obj.map(sanitize);
        } else if (obj !== null && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };

    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }

    next();
};

/**
 * CSRF Protection for state-changing operations
 */
const csrfProtection = (req, res, next) => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body.csrfToken;
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: 'Invalid CSRF token'
        });
    }

    next();
};

module.exports = {
    validatePasswordStrength,
    validateFileUpload,
    strictRateLimit,
    sanitizeInput,
    csrfProtection
};