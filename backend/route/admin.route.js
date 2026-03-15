/**
 * Admin Routes
 * Handles admin-only endpoints for user management
 */

const express = require('express');
const router = express.Router();

// Controller
const adminController = require('../controller/admin.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');
const { permissionGuard } = require('../middleware/permission.middleware');
const { validateBody, validateQuery, validateParams } = require('../middleware/validator.middleware');
const { PERMISSIONS } = require('../config/constant.config');

// Contracts (Validation Schemas)
const {
    adminCreateUserSchema,
    paginationSchema,
    userIdParamSchema,
    documentVerifyParamsSchema
} = require('../contracts/user.contract');

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(adminOnly);

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get(
    '/dashboard/stats',
    permissionGuard(PERMISSIONS.ACCESS_ADMIN_DASHBOARD),
    adminController.getDashboardStats
);

/**
 * @route   GET /api/v1/admin/dashboard/analytics
 * @desc    Get analytics data for charts
 * @access  Private (Admin only)
 */
router.get(
    '/dashboard/analytics',
    permissionGuard(PERMISSIONS.ACCESS_ADMIN_DASHBOARD),
    adminController.getAnalytics
);
/**
 * @route   GET /api/v1/admin/employees/:userId/documents
 * @desc    Get employee documents for verification
 * @access  Private (Admin only)
 */
router.get(
    '/employees/:userId/documents',
    permissionGuard(PERMISSIONS.APPROVE_EMPLOYEE),
    validateParams(userIdParamSchema),
    adminController.getEmployeeDocuments
);

/**
 * @route   PATCH /api/v1/admin/employees/:userId/documents/:documentId/verify
 * @desc    Verify or unverify employee document
 * @access  Private (Admin only)
 */
router.patch(
    '/employees/:userId/documents/:documentId/verify',
    permissionGuard(PERMISSIONS.APPROVE_EMPLOYEE),
    validateParams(documentVerifyParamsSchema),
    adminController.verifyDocument
);
/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get(
    '/users',
    permissionGuard(PERMISSIONS.MANAGE_USERS),
    validateQuery(paginationSchema),
    adminController.getAllUsers
);

/**
 * @route   GET /api/v1/admin/users/:userId
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get(
    '/users/:userId',
    permissionGuard(PERMISSIONS.MANAGE_USERS),
    validateParams(userIdParamSchema),
    adminController.getUserById
);

/**
 * @route   POST /api/v1/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post(
    '/users',
    permissionGuard(PERMISSIONS.CREATE_USER),
    validateBody(adminCreateUserSchema),
    adminController.createUser
);

/**
 * @route   PUT /api/v1/admin/users/:userId
 * @desc    Update user by admin
 * @access  Private (Admin only)
 */
router.put(
    '/users/:userId',
    permissionGuard(PERMISSIONS.MANAGE_USERS),
    validateParams(userIdParamSchema),
    adminController.updateUser
);

/**
 * @route   PATCH /api/v1/admin/users/:userId/block
 * @desc    Block a user
 * @access  Private (Admin only)
 */
router.patch(
    '/users/:userId/block',
    permissionGuard(PERMISSIONS.BLOCK_USER),
    validateParams(userIdParamSchema),
    adminController.blockUser
);

/**
 * @route   PATCH /api/v1/admin/users/:userId/unblock
 * @desc    Unblock a user
 * @access  Private (Admin only)
 */
router.patch(
    '/users/:userId/unblock',
    permissionGuard(PERMISSIONS.BLOCK_USER),
    validateParams(userIdParamSchema),
    adminController.unblockUser
);

/**
 * @route   DELETE /api/v1/admin/users/:userId
 * @desc    Delete a user
 * @access  Private (Admin only)
 */
router.delete(
    '/users/:userId',
    permissionGuard(PERMISSIONS.DELETE_USER),
    validateParams(userIdParamSchema),
    adminController.deleteUser
);

/**
 * @route   GET /api/v1/admin/employees/pending
 * @desc    Get pending employee applications
 * @access  Private (Admin only)
 */
router.get(
    '/employees/pending',
    permissionGuard(PERMISSIONS.APPROVE_EMPLOYEE),
    validateQuery(paginationSchema),
    adminController.getPendingEmployees
);

/**
 * @route   PATCH /api/v1/admin/employees/:userId/approve
 * @desc    Approve employee application
 * @access  Private (Admin only)
 */
router.patch(
    '/employees/:userId/approve',
    permissionGuard(PERMISSIONS.APPROVE_EMPLOYEE),
    validateParams(userIdParamSchema),
    adminController.approveEmployee
);

/**
 * @route   PATCH /api/v1/admin/employees/:userId/reject
 * @desc    Reject employee application
 * @access  Private (Admin only)
 */
router.patch(
    '/employees/:userId/reject',
    permissionGuard(PERMISSIONS.APPROVE_EMPLOYEE),
    validateParams(userIdParamSchema),
    adminController.rejectEmployee
);

/**
 * @route   PATCH /api/v1/admin/employees/:userId/suspend
 * @desc    Suspend an employee
 * @access  Private (Admin only)
 */
router.patch(
    '/employees/:userId/suspend',
    permissionGuard(PERMISSIONS.SUSPEND_EMPLOYEE),
    validateParams(userIdParamSchema),
    adminController.suspendEmployee
);

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    Get all bookings
 * @access  Private (Admin only)
 */
router.get(
    '/bookings',
    permissionGuard(PERMISSIONS.VIEW_ALL_BOOKINGS),
    validateQuery(paginationSchema),
    require('../controller/booking.controller').getAllBookings
);

module.exports = router;
