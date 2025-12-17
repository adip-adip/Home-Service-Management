/**
 * User Routes
 * Handles user profile and general user endpoints
 */

const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controller/user.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const { employeeOnly } = require('../middleware/role.middleware');
const { validateBody, validateQuery, validateParams } = require('../middleware/validator.middleware');
const { uploadAvatar, uploadDocuments, handleUploadError } = require('../middleware/uploader.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

// Contracts (Validation Schemas)
const {
    updateProfileSchema,
    updateEmployeeProfileSchema,
    uploadDocumentsSchema,
    paginationSchema,
    userIdParamSchema
} = require('../contracts/user.contract');

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get(
    '/profile',
    authenticate,
    userController.getProfile
);

/**
 * @route   PATCH /api/v1/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.patch(
    '/profile',
    authenticate,
    validateBody(updateProfileSchema),
    userController.updateProfile
);

/**
 * @route   PATCH /api/v1/users/employee-profile
 * @desc    Update employee-specific profile
 * @access  Private (Employee only)
 */
router.patch(
    '/employee-profile',
    authenticate,
    employeeOnly,
    validateBody(updateEmployeeProfileSchema),
    userController.updateEmployeeProfile
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload/Update user avatar
 * @access  Private
 */
router.post(
    '/avatar',
    authenticate,
    uploadLimiter,
    uploadAvatar,
    handleUploadError,
    userController.uploadAvatar
);

/**
 * @route   DELETE /api/v1/users/avatar
 * @desc    Delete user avatar
 * @access  Private
 */
router.delete(
    '/avatar',
    authenticate,
    userController.deleteAvatar
);

/**
 * @route   GET /api/v1/users/documents
 * @desc    Get current user's verification documents (Employee only)
 * @access  Private (Employee only)
 */
router.get(
    '/documents',
    authenticate,
    employeeOnly,
    userController.getUserDocuments
);

/**
 * @route   POST /api/v1/users/documents
 * @desc    Upload verification documents (Employee only)
 * @access  Private (Employee only)
 */
router.post(
    '/documents',
    authenticate,
    employeeOnly,
    uploadLimiter,
    uploadDocuments,
    handleUploadError,
    validateBody(uploadDocumentsSchema),
    userController.uploadDocuments
);

/**
 * @route   DELETE /api/v1/users/documents/:documentId
 * @desc    Delete a verification document
 * @access  Private (Employee only)
 */
router.delete(
    '/documents/:documentId',
    authenticate,
    employeeOnly,
    userController.deleteDocument
);

/**
 * @route   GET /api/v1/users/employees
 * @desc    Get list of active employees (for customers to browse)
 * @access  Public
 */
router.get(
    '/employees',
    validateQuery(paginationSchema),
    userController.getActiveEmployees
);

/**
 * @route   GET /api/v1/users/employees/:userId
 * @desc    Get employee profile by ID
 * @access  Public
 */
router.get(
    '/employees/:userId',
    validateParams(userIdParamSchema),
    userController.getEmployeeById
);

module.exports = router;
