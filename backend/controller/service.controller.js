/**
 * Service Controller
 * Handles HTTP requests for service-related endpoints (bookings, etc.)
 */

const { HTTP_STATUS } = require('../config/constant.config');
const bookingService = require('../service/booking.service');

class ServiceController {
    /**
     * Create service request (Customer)
     * POST /services/request
     */
    async createServiceRequest(req, res, next) {
        try {
            const booking = await bookingService.createBooking(req.body, req.user.userId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Service request created successfully',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get customer's booking history
     * GET /services/bookings
     */
    async getBookingHistory(req, res, next) {
        try {
            const result = await bookingService.getCustomerBookings(req.user.userId, req.query);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get booking by ID
     * GET /services/bookings/:bookingId
     */
    async getBookingById(req, res, next) {
        try {
            const booking = await bookingService.getBookingById(req.params.bookingId);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel booking (Customer)
     * PATCH /services/bookings/:bookingId/cancel
     */
    async cancelBooking(req, res, next) {
        try {
            const { reason } = req.body;
            const booking = await bookingService.cancelBooking(req.params.bookingId, req.user.userId, reason);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create review (Customer)
     * POST /services/reviews
     */
    async createReview(req, res, next) {
        try {
            // TODO: Implement review creation
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Review created successfully',
                data: { review: req.body }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update review (Customer)
     * PATCH /services/reviews/:reviewId
     */
    async updateReview(req, res, next) {
        try {
            // TODO: Implement review update
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Review updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete review (Customer)
     * DELETE /services/reviews/:reviewId
     */
    async deleteReview(req, res, next) {
        try {
            // TODO: Implement review deletion
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get service categories
     * GET /services/categories
     */
    async getCategories(req, res, next) {
        try {
            const { SERVICE_CATEGORIES } = require('../config/constant.config');

            const categories = Object.entries(SERVICE_CATEGORIES).map(([key, value]) => ({
                id: value,
                name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
            }));

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bookings (Admin)
     * GET /services/all-bookings
     */
    async getAllBookings(req, res, next) {
        try {
            const result = await bookingService.getAllBookings(req.query);
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ServiceController();
