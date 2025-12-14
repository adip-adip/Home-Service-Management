/**
 * Booking Controller
 * Handles HTTP requests for booking endpoints
 */

const bookingService = require('../service/booking.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constant.config');

class BookingController {
    /**
     * Create new booking (Customer only)
     * POST /bookings
     */
    async createBooking(req, res, next) {
        try {
            const booking = await bookingService.createBooking(req.body, req.user.userId);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Booking created successfully',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get booking by ID
     * GET /bookings/:bookingId
     */
    async getBooking(req, res, next) {
        try {
            const booking = await bookingService.getBookingById(req.params.bookingId);

            // Verify user has access to this booking
            const isCustomer = booking.customer._id.toString() === req.user.userId;
            const isEmployee = booking.employee._id.toString() === req.user.userId;
            const isAdmin = req.user.role === 'admin';

            if (!isCustomer && !isEmployee && !isAdmin) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'Not authorized to view this booking'
                });
            }

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get customer's bookings
     * GET /bookings/my-bookings
     */
    async getMyBookings(req, res, next) {
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
     * Get employee's assigned bookings
     * GET /bookings/my-jobs
     */
    async getMyJobs(req, res, next) {
        try {
            const result = await bookingService.getEmployeeBookings(req.user.userId, req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Accept booking (Employee only)
     * PATCH /bookings/:bookingId/accept
     */
    async acceptBooking(req, res, next) {
        try {
            const booking = await bookingService.acceptBooking(req.params.bookingId, req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Booking accepted successfully',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject booking (Employee only)
     * PATCH /bookings/:bookingId/reject
     */
    async rejectBooking(req, res, next) {
        try {
            const booking = await bookingService.rejectBooking(
                req.params.bookingId, 
                req.user.userId, 
                req.body.reason
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Booking rejected',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel booking
     * PATCH /bookings/:bookingId/cancel
     */
    async cancelBooking(req, res, next) {
        try {
            const booking = await bookingService.cancelBooking(
                req.params.bookingId, 
                req.user.userId, 
                req.body.reason
            );

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
     * Start booking (Employee only)
     * PATCH /bookings/:bookingId/start
     */
    async startBooking(req, res, next) {
        try {
            const booking = await bookingService.startBooking(req.params.bookingId, req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Booking started',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Complete booking (Employee only)
     * PATCH /bookings/:bookingId/complete
     */
    async completeBooking(req, res, next) {
        try {
            const booking = await bookingService.completeBooking(
                req.params.bookingId, 
                req.user.userId, 
                req.body
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Booking completed successfully',
                data: { booking }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all bookings (Admin only)
     * GET /admin/bookings
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

    /**
     * Get available employees for a service
     * GET /bookings/available-employees/:serviceCategory
     */
    async getAvailableEmployees(req, res, next) {
        try {
            const employees = await bookingService.getAvailableEmployees(req.params.serviceCategory);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { employees }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController();
