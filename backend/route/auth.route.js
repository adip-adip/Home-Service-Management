/**
 * Auth Routes
 * Handles all authentication-related endpoints
 */

const express = require('express');
const router = express.Router();

// Controller
const authController = require('../controller/auth.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validator.middleware');
const { authLimiter, passwordResetLimiter, emailVerificationLimiter, createAccountLimiter } = require('../middleware/rateLimiter.middleware');
const { validatePasswordStrength, sanitizeInput } = require('../middleware/security.middleware');

// Contracts (Validation Schemas)
const {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    verifyEmailSchema,
    resendVerificationSchema
} = require('../contracts/auth.contract');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (customer or employee)
 * @access  Public
 */
router.post(
    '/register',
    sanitizeInput,
    createAccountLimiter,
    validateBody(registerSchema),
    validatePasswordStrength,
    authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get tokens
 * @access  Public
 */
router.post(
    '/login',
    sanitizeInput,
    authLimiter,
    validateBody(loginSchema),
    authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (with valid refresh token)
 */
router.post(
    '/refresh',
    validateBody(refreshTokenSchema),
    authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    authController.logout
);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
router.post(
    '/verify-email',
    validateBody(verifyEmailSchema),
    authController.verifyEmail
);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification link
 * @access  Public
 */
router.post(
    '/resend-verification',
    emailVerificationLimiter,
    validateBody(resendVerificationSchema),
    authController.resendVerificationEmail
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
    '/forgot-password',
    passwordResetLimiter,
    validateBody(forgotPasswordSchema),
    authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
    '/reset-password',
    validateBody(resetPasswordSchema),
    authController.resetPassword
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password for logged in user
 * @access  Private
 */
router.post(
    '/change-password',
    authenticate,
    validateBody(changePasswordSchema),
    authController.changePassword
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    authController.getCurrentUser
);

/**
 * @route   GET /api/v1/auth/sessions
 * @desc    Get active sessions for current user
 * @access  Private
 */
router.get(
    '/sessions',
    authenticate,
    authController.getActiveSessions
);

/**
 * @route   DELETE /api/v1/auth/sessions/:sessionId
 * @desc    Revoke specific session
 * @access  Private
 */
router.delete(
    '/sessions/:sessionId',
    authenticate,
    authController.revokeSession
);

module.exports = router;
