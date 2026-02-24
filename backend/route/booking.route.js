/**
 * Booking Routes
 * Handles booking-related endpoints
 */

const express = require('express');
const router = express.Router();

// Controller
const bookingController = require('../controller/booking.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const { permissionGuard } = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../config/constant.config');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Private (Customer only)
 */
router.post(
    '/',
    permissionGuard(PERMISSIONS.CREATE_BOOKING),
    bookingController.createBooking
);

/**
 * @route   GET /api/v1/bookings/my-bookings
 * @desc    Get customer's own bookings
 * @access  Private (Customer only)
 */
router.get(
    '/my-bookings',
    permissionGuard(PERMISSIONS.VIEW_OWN_BOOKINGS),
    bookingController.getMyBookings
);

/**
 * @route   GET /api/v1/bookings/my-jobs
 * @desc    Get employee's assigned jobs
 * @access  Private (Employee only)
 */
router.get(
    '/my-jobs',
    permissionGuard(PERMISSIONS.VIEW_ASSIGNED_JOBS),
    bookingController.getMyJobs
);

/**
 * @route   GET /api/v1/bookings/available-employees/:serviceCategory
 * @desc    Get available employees for a service category
 * @access  Private
 */
router.get(
    '/available-employees/:serviceCategory',
    bookingController.getAvailableEmployees
);

/**
 * @route   GET /api/v1/bookings/:bookingId
 * @desc    Get booking by ID
 * @access  Private (Booking owner or admin)
 */
router.get(
    '/:bookingId',
    bookingController.getBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/accept
 * @desc    Accept a booking (Employee only)
 * @access  Private (Employee only)
 */
router.patch(
    '/:bookingId/accept',
    permissionGuard(PERMISSIONS.ACCEPT_JOB),
    bookingController.acceptBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/reject
 * @desc    Reject a booking (Employee only)
 * @access  Private (Employee only)
 */
router.patch(
    '/:bookingId/reject',
    permissionGuard(PERMISSIONS.REJECT_JOB),
    bookingController.rejectBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Private (Booking owner)
 */
router.patch(
    '/:bookingId/cancel',
    permissionGuard(PERMISSIONS.CANCEL_BOOKING),
    bookingController.cancelBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/start
 * @desc    Start a booking (Employee only)
 * @access  Private (Employee only)
 */
router.patch(
    '/:bookingId/start',
    permissionGuard(PERMISSIONS.UPDATE_JOB_STATUS),
    bookingController.startBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/complete
 * @desc    Complete a booking (Employee only)
 * @access  Private (Employee only)
 */
router.patch(
    '/:bookingId/complete',
    permissionGuard(PERMISSIONS.UPDATE_JOB_STATUS),
    bookingController.completeBooking
);

/**
 * @route   PATCH /api/v1/bookings/:bookingId/review
 * @desc    Submit a review for a completed booking (Customer only)
 * @access  Private (Customer only)
 */
router.patch(
    '/:bookingId/review',
    permissionGuard(PERMISSIONS.CREATE_BOOKING),
    bookingController.submitReview
);

/**
 * @route   GET /api/v1/bookings/employee/:employeeId/reviews
 * @desc    Get reviews for an employee
 * @access  Public
 */
router.get(
    '/employee/:employeeId/reviews',
    bookingController.getEmployeeReviews
);

module.exports = router;
