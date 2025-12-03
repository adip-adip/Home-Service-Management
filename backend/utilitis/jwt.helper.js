/**
 * JWT Helper Utilities
 * Handles JWT token generation and verification
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate Access Token
 * Contains user information for authorization
 * @param {Object} payload - Token payload (userId, role, permissions)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
    const { userId, role, permissions } = payload;

    return jwt.sign(
        {
            userId,
            role,
            permissions,
            type: 'access'
        },
        JWT_SECRET,
        {
            expiresIn: JWT_ACCESS_EXPIRY,
            issuer: 'home-service-platform',
            audience: 'home-service-users'
        }
    );
};

/**
 * Generate Refresh Token
 * Random secure token for getting new access tokens
 * @returns {string} Random refresh token
 */
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

/**
 * Verify Access Token
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'home-service-platform',
            audience: 'home-service-users'
        });

        // Verify it's an access token
        if (decoded.type !== 'access') {
            return null;
        }

        return decoded;
    } catch (error) {
        // Re-throw specific errors for proper handling
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            throw error;
        }
        return null;
    }
};

/**
 * Verify any JWT token (for special tokens like email verification, password reset)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Generate Email Verification Token
 * @param {string} userId - User ID
 * @returns {string} JWT token for email verification
 */
const generateEmailVerificationToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'email_verification'
        },
        JWT_SECRET,
        {
            expiresIn: '24h'
        }
    );
};

/**
 * Generate Password Reset Token
 * @param {string} userId - User ID
 * @returns {string} JWT token for password reset
 */
const generatePasswordResetToken = (userId) => {
    return jwt.sign(
        {
            userId,
            type: 'password_reset'
        },
        JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
    }
    return null;
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
        return true;
    }
    return expiration < new Date();
};

/**
 * Parse expiry string to milliseconds
 * @param {string} expiry - Expiry string (e.g., '15m', '7d')
 * @returns {number} Milliseconds
 */
const parseExpiry = (expiry) => {
    const units = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 15 * 60 * 1000; // Default 15 minutes
    }

    return parseInt(match[1]) * units[match[2]];
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    decodeToken,
    getTokenExpiration,
    isTokenExpired,
    parseExpiry,
    JWT_ACCESS_EXPIRY,
    JWT_REFRESH_EXPIRY
};
