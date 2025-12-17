/**
 * Employee Routes
 * Handles employee-specific endpoints
 */

const express = require('express');
const router = express.Router();

// Controller
const employeeController = require('../controller/employee.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const { employeeOnly } = require('../middleware/role.middleware');
const { permissionGuard } = require('../middleware/permission.middleware');
const { validateBody, validateParams } = require('../middleware/validator.middleware');
const { PERMISSIONS } = require('../config/constant.config');

// Contracts
const { updateJobStatusSchema, jobIdParamSchema } = require('../contracts/service.contract');

// Apply authentication and employee role check to all routes
router.use(authenticate);
router.use(employeeOnly);

/**
 * @route   GET /api/v1/employee/dashboard
 * @desc    Get employee dashboard data
 * @access  Private (Employee only)
 */
router.get(
    '/dashboard',
    employeeController.getDashboard
);

/**
 * @route   GET /api/v1/employee/jobs
 * @desc    Get assigned jobs
 * @access  Private (Employee only)
 */
router.get(
    '/jobs',
    permissionGuard(PERMISSIONS.VIEW_ASSIGNED_JOBS),
    employeeController.getAssignedJobs
);

/**
 * @route   GET /api/v1/employee/jobs/:jobId
 * @desc    Get job details by ID
 * @access  Private (Employee only)
 */
router.get(
    '/jobs/:jobId',
    permissionGuard(PERMISSIONS.VIEW_ASSIGNED_JOBS),
    validateParams(jobIdParamSchema),
    employeeController.getJobById
);

/**
 * @route   PATCH /api/v1/employee/jobs/:jobId/accept
 * @desc    Accept a job
 * @access  Private (Employee only)
 */
router.patch(
    '/jobs/:jobId/accept',
    permissionGuard(PERMISSIONS.ACCEPT_JOB),
    validateParams(jobIdParamSchema),
    employeeController.acceptJob
);

/**
 * @route   PATCH /api/v1/employee/jobs/:jobId/reject
 * @desc    Reject a job
 * @access  Private (Employee only)
 */
router.patch(
    '/jobs/:jobId/reject',
    permissionGuard(PERMISSIONS.REJECT_JOB),
    validateParams(jobIdParamSchema),
    employeeController.rejectJob
);

/**
 * @route   PATCH /api/v1/employee/jobs/:jobId/status
 * @desc    Update job status (in-progress, completed)
 * @access  Private (Employee only)
 */
router.patch(
    '/jobs/:jobId/status',
    permissionGuard(PERMISSIONS.UPDATE_JOB_STATUS),
    validateParams(jobIdParamSchema),
    validateBody(updateJobStatusSchema),
    employeeController.updateJobStatus
);

/**
 * @route   GET /api/v1/employee/earnings
 * @desc    Get earnings summary
 * @access  Private (Employee only)
 */
router.get(
    '/earnings',
    permissionGuard(PERMISSIONS.VIEW_OWN_EARNINGS),
    employeeController.getEarnings
);

/**
 * @route   PATCH /api/v1/employee/availability
 * @desc    Update availability status
 * @access  Private (Employee only)
 */
router.patch(
    '/availability',
    permissionGuard(PERMISSIONS.UPDATE_AVAILABILITY),
    employeeController.updateAvailability
);

/**
 * @route   GET /api/v1/employee/reviews
 * @desc    Get reviews for the employee
 * @access  Private (Employee only)
 */
router.get(
    '/reviews',
    permissionGuard(PERMISSIONS.VIEW_OWN_REVIEWS),
    employeeController.getReviews
);

module.exports = router;
