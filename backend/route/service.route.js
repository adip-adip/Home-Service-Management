/**
 * Service Routes
 * Handles service requests, bookings, and reviews
 */

const express = require('express');
const router = express.Router();

// Controller
const serviceController = require('../controller/service.controller');

// Middleware
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { customerOnly, adminOnly } = require('../middleware/role.middleware');
const { permissionGuard } = require('../middleware/permission.middleware');
const { validateBody, validateParams } = require('../middleware/validator.middleware');
const { PERMISSIONS } = require('../config/constant.config');
const Joi = require('joi');

// Contracts
const {
    createServiceRequestSchema,
    cancelBookingSchema,
    createReviewSchema
} = require('../contracts/service.contract');

// ID parameter schema
const idParamSchema = Joi.object({
    bookingId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    reviewId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
});

/**
 * @route   GET /api/v1/services/categories
 * @desc    Get all service categories
 * @access  Public
 */
router.get(
    '/categories',
    serviceController.getCategories
);

/**
 * @route   GET /api/v1/services/public-stats
 * @desc    Get public platform statistics for homepage
 * @access  Public
 */
router.get(
    '/public-stats',
    async (req, res, next) => {
        try {
            const { User, Booking, Review } = require('../modules');
            const { ROLES, EMPLOYEE_STATUS, BOOKING_STATUS } = require('../config/constant.config');

            const [
                totalEmployees,
                completedBookings,
                reviewStats
            ] = await Promise.all([
                // Count approved employees
                User.countDocuments({
                    role: ROLES.EMPLOYEE,
                    'employeeProfile.status': EMPLOYEE_STATUS.APPROVED
                }),
                // Count completed bookings
                Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
                // Get average rating from reviews
                Review.aggregate([
                    {
                        $group: {
                            _id: null,
                            averageRating: { $avg: '$rating' },
                            totalReviews: { $sum: 1 }
                        }
                    }
                ])
            ]);

            const avgRating = reviewStats[0]?.averageRating || 4.8;
            const totalReviews = reviewStats[0]?.totalReviews || 0;

            res.status(200).json({
                success: true,
                data: {
                    stats: {
                        totalProfessionals: totalEmployees,
                        completedJobs: completedBookings,
                        averageRating: Math.round(avgRating * 10) / 10,
                        totalReviews
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/v1/services/request
 * @desc    Create a new service request (Customer only)
 * @access  Private (Customer only)
 */
router.post(
    '/request',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.CREATE_BOOKING),
    validateBody(createServiceRequestSchema),
    serviceController.createServiceRequest
);

/**
 * @route   GET /api/v1/services/bookings
 * @desc    Get customer's booking history
 * @access  Private (Customer only)
 */
router.get(
    '/bookings',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.VIEW_OWN_BOOKINGS),
    serviceController.getBookingHistory
);

/**
 * @route   GET /api/v1/services/bookings/:bookingId
 * @desc    Get booking details by ID
 * @access  Private (Customer only)
 */
router.get(
    '/bookings/:bookingId',
    authenticate,
    customerOnly,
    serviceController.getBookingById
);

/**
 * @route   PATCH /api/v1/services/bookings/:bookingId/cancel
 * @desc    Cancel a booking (Customer only)
 * @access  Private (Customer only)
 */
router.patch(
    '/bookings/:bookingId/cancel',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.CANCEL_BOOKING),
    validateBody(cancelBookingSchema),
    serviceController.cancelBooking
);

/**
 * @route   POST /api/v1/services/reviews
 * @desc    Create a review for completed service
 * @access  Private (Customer only)
 */
router.post(
    '/reviews',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.CREATE_REVIEW),
    validateBody(createReviewSchema),
    serviceController.createReview
);

/**
 * @route   PATCH /api/v1/services/reviews/:reviewId
 * @desc    Update a review
 * @access  Private (Customer only)
 */
router.patch(
    '/reviews/:reviewId',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.UPDATE_REVIEW),
    serviceController.updateReview
);

/**
 * @route   DELETE /api/v1/services/reviews/:reviewId
 * @desc    Delete a review
 * @access  Private (Customer only)
 */
router.delete(
    '/reviews/:reviewId',
    authenticate,
    customerOnly,
    permissionGuard(PERMISSIONS.DELETE_REVIEW),
    serviceController.deleteReview
);

/**
 * @route   GET /api/v1/services/all-bookings
 * @desc    Get all bookings (Admin only)
 * @access  Private (Admin only)
 */
router.get(
    '/all-bookings',
    authenticate,
    adminOnly,
    permissionGuard(PERMISSIONS.VIEW_ALL_BOOKINGS),
    serviceController.getAllBookings
);

/**
 * @route   GET /api/v1/services/employees/:category
 * @desc    Get available employees for a service category
 * @access  Public
 */
router.get(
    '/employees/:category',
    optionalAuth,
    async (req, res, next) => {
        try {
            const bookingService = require('../service/booking.service');
            const employees = await bookingService.getAvailableEmployees(req.params.category);
            
            res.status(200).json({
                success: true,
                data: { employees }
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /api/v1/services/employees
 * @desc    Get all available employees
 * @access  Public
 */
router.get(
    '/all-employees',
    optionalAuth,
    async (req, res, next) => {
        try {
            const { User } = require('../modules');
            const { ROLES, EMPLOYEE_STATUS } = require('../config/constant.config');
            
            const employees = await User.find({
                role: ROLES.EMPLOYEE,
                status: 'active',
                'employeeProfile.status': EMPLOYEE_STATUS.APPROVED,
                'employeeProfile.availability.isAvailable': true
            }).select('firstName lastName email phone avatar employeeProfile');
            
            res.status(200).json({
                success: true,
                data: { employees }
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
