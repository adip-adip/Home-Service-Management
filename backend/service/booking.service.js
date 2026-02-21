/**
 * Booking Service
 * Handles booking-related business logic
 */

const mongoose = require('mongoose');
const { Booking, User } = require('../modules');
const { BOOKING_STATUS, ERROR_MESSAGES, ROLES, EMPLOYEE_STATUS } = require('../config/constant.config');

class BookingService {
    /**
     * Create a new booking
     * @param {Object} bookingData - Booking data
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>} Created booking
     */
    async createBooking(bookingData, customerId) {
        const { 
            employee, 
            employeeId,
            serviceCategory, 
            description, 
            scheduledDate, 
            scheduledTime, 
            address,
            serviceAddress, 
            estimatedDuration, 
            customerNotes,
            customerPhone 
        } = bookingData;

        // Support both 'employee' and 'employeeId' field names
        const empId = employee || employeeId;

        // Verify customer exists
        const customer = await User.findById(customerId);
        if (!customer) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        // Verify employee exists and is approved
        const employeeUser = await User.findById(empId);
        if (!employeeUser) {
            throw { statusCode: 404, message: 'Employee not found' };
        }
        if (employeeUser.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'Selected user is not an employee' };
        }
        if (employeeUser.employeeProfile?.status !== EMPLOYEE_STATUS.APPROVED) {
            throw { statusCode: 400, message: 'Employee is not approved to accept bookings' };
        }
        if (!employeeUser.employeeProfile?.availability?.isAvailable) {
            throw { statusCode: 400, message: 'Employee is currently not available' };
        }

        // Check if employee offers the requested service category
        const employeeCategories = employeeUser.employeeProfile?.serviceCategories || [];
        if (!employeeCategories.includes(serviceCategory.toLowerCase())) {
            throw { statusCode: 400, message: `Employee does not offer ${serviceCategory} services` };
        }

        // Calculate estimated price
        const hourlyRate = employeeUser.employeeProfile?.hourlyRate || 0;
        const estimatedPrice = hourlyRate * (estimatedDuration || 1);

        // Create booking
        const booking = await Booking.create({
            customer: customerId,
            employee: empId,
            serviceCategory,
            description,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            estimatedDuration: estimatedDuration || 1,
            serviceAddress: address || serviceAddress,
            customerPhone,
            estimatedPrice,
            customerNotes,
            status: BOOKING_STATUS.PENDING,
            statusHistory: [{
                status: BOOKING_STATUS.PENDING,
                changedAt: new Date(),
                changedBy: customerId
            }]
        });

        // Populate and return
        const populatedBooking = await Booking.findById(booking._id)
            .populate('customer', 'firstName lastName email phone address')
            .populate('employee', 'firstName lastName email phone avatar employeeProfile');

        return populatedBooking;
    }

    /**
     * Get booking by ID
     * @param {string} bookingId - Booking ID
     * @returns {Promise<Object>} Booking
     */
    async getBookingById(bookingId) {
        const booking = await Booking.findById(bookingId)
            .populate('customer', 'firstName lastName email phone address')
            .populate('employee', 'firstName lastName email phone avatar employeeProfile')
            .populate('review', 'rating text createdAt');

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        return booking;
    }

    /**
     * Get bookings for a customer
     * @param {string} customerId - Customer ID
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} Bookings list
     */
    async getCustomerBookings(customerId, queryParams = {}) {
        const { page = 1, limit = 10, status } = queryParams;

        const query = { customer: customerId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('employee', 'firstName lastName email phone avatar employeeProfile')
                .populate('review', 'rating text createdAt')
                .sort({ scheduledDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query)
        ]);

        return {
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get bookings for an employee
     * @param {string} employeeId - Employee ID
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} Bookings list
     */
    async getEmployeeBookings(employeeId, queryParams = {}) {
        const { page = 1, limit = 10, status } = queryParams;

        const query = { employee: employeeId };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('customer', 'firstName lastName email phone address')
                .sort({ scheduledDate: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query)
        ]);

        return {
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Accept a booking (employee action)
     * @param {string} bookingId - Booking ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Object>} Updated booking
     */
    async acceptBooking(bookingId, employeeId) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        if (booking.employee.toString() !== employeeId) {
            throw { statusCode: 403, message: 'Not authorized to accept this booking' };
        }

        // Check if employee has all required documents approved
        const employee = await User.findById(employeeId);
        if (employee) {
            const documents = employee.employeeProfile?.documents || [];
            const hasDocuments = documents.length > 0;
            const allApproved = hasDocuments && documents.every(doc => doc.status === 'approved');

            if (!hasDocuments) {
                throw { statusCode: 403, message: 'You must upload verification documents before accepting jobs. Please go to Documents page to upload.' };
            }

            if (!allApproved) {
                const pendingDocs = documents.filter(doc => doc.status === 'pending').length;
                const rejectedDocs = documents.filter(doc => doc.status === 'rejected').length;
                let msg = 'Your documents must be approved before you can accept jobs.';
                if (pendingDocs > 0) msg += ` ${pendingDocs} document(s) pending review.`;
                if (rejectedDocs > 0) msg += ` ${rejectedDocs} document(s) rejected - please re-upload.`;
                throw { statusCode: 403, message: msg };
            }
        }

        if (booking.status !== BOOKING_STATUS.PENDING) {
            throw { statusCode: 400, message: 'Booking cannot be accepted in current status' };
        }

        await booking.confirm(employeeId);

        return this.getBookingById(bookingId);
    }

    /**
     * Reject a booking (employee action)
     * @param {string} bookingId - Booking ID
     * @param {string} employeeId - Employee ID
     * @param {string} reason - Rejection reason
     * @returns {Promise<Object>} Updated booking
     */
    async rejectBooking(bookingId, employeeId, reason) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        if (booking.employee.toString() !== employeeId) {
            throw { statusCode: 403, message: 'Not authorized to reject this booking' };
        }

        if (booking.status !== BOOKING_STATUS.PENDING) {
            throw { statusCode: 400, message: 'Booking cannot be rejected in current status' };
        }

        await booking.cancel(employeeId, reason || 'Rejected by service provider');

        return this.getBookingById(bookingId);
    }

    /**
     * Cancel a booking (customer or employee action)
     * @param {string} bookingId - Booking ID
     * @param {string} userId - User ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Updated booking
     */
    async cancelBooking(bookingId, userId, reason) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        // Check if user is authorized (customer or employee)
        const isCustomer = booking.customer.toString() === userId;
        const isEmployee = booking.employee.toString() === userId;

        if (!isCustomer && !isEmployee) {
            throw { statusCode: 403, message: 'Not authorized to cancel this booking' };
        }

        // Can only cancel pending or confirmed bookings
        if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
            throw { statusCode: 400, message: 'Booking cannot be cancelled in current status' };
        }

        await booking.cancel(userId, reason);

        return this.getBookingById(bookingId);
    }

    /**
     * Start a booking (employee action - mark as in progress)
     * @param {string} bookingId - Booking ID
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Object>} Updated booking
     */
    async startBooking(bookingId, employeeId) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        if (booking.employee.toString() !== employeeId) {
            throw { statusCode: 403, message: 'Not authorized to start this booking' };
        }

        if (booking.status !== BOOKING_STATUS.CONFIRMED) {
            throw { statusCode: 400, message: 'Only confirmed bookings can be started' };
        }

        booking.status = BOOKING_STATUS.IN_PROGRESS;
        booking.startedAt = new Date();
        booking.statusHistory.push({
            status: BOOKING_STATUS.IN_PROGRESS,
            changedAt: new Date(),
            changedBy: employeeId
        });
        await booking.save();

        return this.getBookingById(bookingId);
    }

    /**
     * Complete a booking (employee action)
     * @param {string} bookingId - Booking ID
     * @param {string} employeeId - Employee ID
     * @param {Object} completionData - Completion details
     * @returns {Promise<Object>} Updated booking
     */
    async completeBooking(bookingId, employeeId, completionData = {}) {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        if (booking.employee.toString() !== employeeId) {
            throw { statusCode: 403, message: 'Not authorized to complete this booking' };
        }

        // Accept both 'in-progress' and 'in_progress' for backward compatibility
        const validInProgressStatuses = [BOOKING_STATUS.IN_PROGRESS, 'in_progress', 'in-progress'];
        if (!validInProgressStatuses.includes(booking.status)) {
            throw { statusCode: 400, message: `Only in-progress bookings can be completed. Current status: ${booking.status}` };
        }

        const { finalPrice, notes } = completionData;
        if (finalPrice) {
            booking.finalPrice = finalPrice;
        }

        // Explicitly set status to completed
        booking.status = BOOKING_STATUS.COMPLETED;
        booking.completedAt = new Date();
        booking.completionNotes = notes || '';
        booking.statusHistory.push({
            status: BOOKING_STATUS.COMPLETED,
            changedAt: new Date(),
            changedBy: employeeId,
            notes: notes || 'Job completed'
        });
        await booking.save();

        // Update employee completed jobs count
        await User.findByIdAndUpdate(employeeId, {
            $inc: { 'employeeProfile.completedJobs': 1 }
        });

        return this.getBookingById(bookingId);
    }

    /**
     * Get all bookings (admin only)
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} Bookings list
     */
    async getAllBookings(queryParams = {}) {
        const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

        const query = {};
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const [bookings, total] = await Promise.all([
            Booking.find(query)
                .populate('customer', 'firstName lastName email phone')
                .populate('employee', 'firstName lastName email phone employeeProfile')
                .populate('review', 'rating text createdAt')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Booking.countDocuments(query)
        ]);

        return {
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get available employees for a service category
     * @param {string} serviceCategory - Service category
     * @returns {Promise<Array>} Available employees
     */
    async getAvailableEmployees(serviceCategory) {
        const employees = await User.find({
            role: ROLES.EMPLOYEE,
            status: 'active',
            'employeeProfile.status': EMPLOYEE_STATUS.APPROVED,
            'employeeProfile.availability.isAvailable': true,
            'employeeProfile.serviceCategories': serviceCategory.toLowerCase()
        }).select('firstName lastName email phone avatar employeeProfile');

        return employees;
    }

    /**
     * Submit a review for a completed booking
     * @param {string} bookingId - Booking ID
     * @param {string} customerId - Customer ID
     * @param {Object} reviewData - Review data with rating and text
     * @returns {Promise<Object>} Booking with review reference
     */
    async submitReview(bookingId, customerId, reviewData) {
        const { rating, text } = reviewData;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw { statusCode: 400, message: 'Rating must be between 1 and 5' };
        }

        // Validate review text
        if (!text || text.trim().length < 10) {
            throw { statusCode: 400, message: 'Review must be at least 10 characters long' };
        }

        if (text.length > 1000) {
            throw { statusCode: 400, message: 'Review cannot exceed 1000 characters' };
        }

        // Get booking
        const booking = await Booking.findById(bookingId)
            .populate('customer')
            .populate('employee');

        if (!booking) {
            throw { statusCode: 404, message: 'Booking not found' };
        }

        // Verify customer owns this booking
        if (booking.customer._id.toString() !== customerId) {
            throw { statusCode: 403, message: 'Only the customer can review this booking' };
        }

        // Verify booking is completed
        if (booking.status !== BOOKING_STATUS.COMPLETED) {
            throw { statusCode: 400, message: 'Only completed bookings can be reviewed' };
        }

        // Check if review already exists
        if (booking.review) {
            throw { statusCode: 400, message: 'Review already submitted for this booking' };
        }

        // Create review
        const { Review } = require('../modules');
        const review = await Review.create({
            booking: bookingId,
            customer: customerId,
            employee: booking.employee._id,
            rating,
            text: text.trim(),
            isPublished: true,
            isApproved: true
        });

        // Update booking with review reference
        booking.review = review._id;
        await booking.save();

        // Return booking with populated review
        return await Booking.findById(bookingId)
            .populate({
                path: 'review',
                select: 'rating text createdAt'
            })
            .populate('customer', 'firstName lastName email phone avatar')
            .populate('employee', 'firstName lastName email phone avatar employeeProfile');
    }

    /**
     * Get reviews for an employee
     * @param {string} employeeId - Employee ID
     * @param {Object} options - Query options (pagination, filters)
     * @returns {Promise<Object>} Reviews with pagination
     */
    async getEmployeeReviews(employeeId, options = {}) {
        const { Review } = require('../modules');
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({
            employee: employeeId,
            isPublished: true,
            isApproved: true
        })
            .populate('customer', 'firstName lastName avatar')
            .populate('booking', 'serviceCategory scheduledDate')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({
            employee: employeeId,
            isPublished: true,
            isApproved: true
        });

        // Calculate average rating
        const avgRatingResult = await Review.aggregate([
            {
                $match: {
                    employee: new mongoose.Types.ObjectId(employeeId),
                    isPublished: true,
                    isApproved: true
                }
            },
            {
                $group: {
                    _id: '$employee',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        const averageRating = avgRatingResult[0]?.averageRating || 0;

        return {
            reviews,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            averageRating: Math.round(averageRating * 10) / 10
        };
    }
}

module.exports = new BookingService();
