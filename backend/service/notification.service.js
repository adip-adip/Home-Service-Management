/**
 * Notification Service
 * Handles notification business logic and real-time emission
 */

const Notification = require('../modules/notification.module');
const { emitToUser, emitToRole } = require('../config/socket.config');

class NotificationService {
    /**
     * Create a notification and emit via socket
     * @param {Object} data - Notification data
     * @returns {Promise<Object>} Created notification
     */
    async create(data) {
        const { recipient, type, title, message, metadata } = data;

        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            metadata
        });

        // Emit real-time notification to user
        emitToUser(recipient.toString(), 'notification:new', {
            notification: notification.toJSON()
        });

        return notification;
    }

    /**
     * Create notifications for multiple recipients
     * @param {Object} data - Notification data with recipients array
     * @returns {Promise<Array>} Created notifications
     */
    async createBulk(data) {
        const { recipients, type, title, message, metadata } = data;

        const notifications = await Promise.all(
            recipients.map(recipient =>
                this.create({ recipient, type, title, message, metadata })
            )
        );

        return notifications;
    }

    /**
     * Notify all admins
     * @param {Object} data - Notification data (without recipient)
     * @returns {Promise<Array>} Created notifications
     */
    async notifyAdmins(data) {
        const User = require('../modules/user.module');
        const admins = await User.find({ role: 'admin', status: 'active' }).select('_id');

        const notifications = await Promise.all(
            admins.map(admin =>
                this.create({ ...data, recipient: admin._id })
            )
        );

        return notifications;
    }

    /**
     * Get user's notifications with pagination
     * @param {string} userId - User ID
     * @param {Object} options - Pagination options
     * @returns {Promise<Object>} Notifications with pagination
     */
    async getUserNotifications(userId, options = {}) {
        return Notification.getUserNotifications(userId, options);
    }

    /**
     * Get unread count for a user
     * @param {string} userId - User ID
     * @returns {Promise<number>} Unread count
     */
    async getUnreadCount(userId) {
        return Notification.getUnreadCount(userId);
    }

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID (for ownership verification)
     * @returns {Promise<Object>} Updated notification
     */
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            const error = new Error('Notification not found');
            error.statusCode = 404;
            throw error;
        }

        await notification.markAsRead();

        // Emit update to user
        emitToUser(userId, 'notification:read', {
            notificationId,
            unreadCount: await this.getUnreadCount(userId)
        });

        return notification;
    }

    /**
     * Mark all notifications as read for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Update result
     */
    async markAllAsRead(userId) {
        await Notification.markAllAsRead(userId);

        // Emit update to user
        emitToUser(userId, 'notification:allRead', {
            unreadCount: 0
        });

        return { success: true };
    }

    /**
     * Delete a notification
     * @param {string} notificationId - Notification ID
     * @param {string} userId - User ID (for ownership verification)
     * @returns {Promise<Object>} Deletion result
     */
    async delete(notificationId, userId) {
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            const error = new Error('Notification not found');
            error.statusCode = 404;
            throw error;
        }

        // Emit update to user
        emitToUser(userId, 'notification:deleted', {
            notificationId,
            unreadCount: await this.getUnreadCount(userId)
        });

        return { success: true };
    }

    /**
     * Delete all notifications for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteAll(userId) {
        await Notification.deleteMany({ recipient: userId });

        emitToUser(userId, 'notification:allDeleted', {
            unreadCount: 0
        });

        return { success: true };
    }

    // ============================================
    // NOTIFICATION HELPERS FOR SPECIFIC EVENTS
    // ============================================

    /**
     * Notify about new booking
     * @param {Object} booking - Booking object
     */
    async notifyNewBooking(booking) {
        // Notify admin about new booking
        await this.notifyAdmins({
            type: 'booking',
            title: 'New Booking',
            message: `New booking #${booking.bookingRef} has been created`,
            metadata: { bookingId: booking._id, link: `/dashboard/booking/${booking._id}` }
        });

        // Notify assigned employee
        if (booking.employee) {
            await this.create({
                recipient: booking.employee,
                type: 'booking',
                title: 'New Job Assignment',
                message: `You have been assigned to booking #${booking.bookingRef}`,
                metadata: { bookingId: booking._id, link: `/dashboard/booking/${booking._id}` }
            });
        }
    }

    /**
     * Notify about booking status change
     * @param {Object} booking - Booking object
     * @param {string} status - New status
     */
    async notifyBookingStatusChange(booking, status) {
        const statusMessages = {
            confirmed: 'Your booking has been confirmed',
            'in-progress': 'Your service has started',
            completed: 'Your booking has been completed. Please leave a review!',
            cancelled: 'Your booking has been cancelled'
        };

        // Notify customer
        await this.create({
            recipient: booking.customer,
            type: 'booking',
            title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: statusMessages[status] || `Booking status updated to ${status}`,
            metadata: { bookingId: booking._id, link: `/dashboard/booking/${booking._id}` }
        });
    }

    /**
     * Notify about document verification
     * @param {Object} user - Employee user object
     * @param {string} documentType - Type of document
     * @param {string} status - verified or rejected
     * @param {string} reason - Rejection reason (optional)
     */
    async notifyDocumentVerification(user, documentType, status, reason) {
        const isVerified = status === 'verified';

        await this.create({
            recipient: user._id,
            type: 'document',
            title: `Document ${isVerified ? 'Verified' : 'Rejected'}`,
            message: isVerified
                ? `Your ${documentType} has been verified`
                : `Your ${documentType} was rejected${reason ? `: ${reason}` : ''}`,
            metadata: { userId: user._id, link: '/dashboard/worker-documents' }
        });
    }

    /**
     * Notify about employee approval/status change
     * @param {Object} user - Employee user object
     * @param {string} status - approved, suspended, rejected
     */
    async notifyEmployeeStatus(user, status) {
        const messages = {
            approved: 'Your employee account has been approved. You can now receive job assignments!',
            suspended: 'Your employee account has been suspended. Please contact admin.',
            rejected: 'Your employee application has been rejected.'
        };

        await this.create({
            recipient: user._id,
            type: 'employee',
            title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: messages[status] || `Your account status has been updated to ${status}`,
            metadata: { userId: user._id }
        });
    }

    /**
     * Notify about new review
     * @param {Object} review - Review object
     * @param {Object} employee - Employee user object
     */
    async notifyNewReview(review, employee) {
        await this.create({
            recipient: employee._id,
            type: 'review',
            title: 'New Review',
            message: `You received a ${review.rating}-star review`,
            metadata: { bookingId: review.booking, link: '/dashboard/reviews' }
        });
    }

    /**
     * Notify admins about new document upload
     * @param {Object} user - Employee user object
     * @param {number} documentCount - Number of documents uploaded
     */
    async notifyDocumentUpload(user, documentCount) {
        const docText = documentCount === 1 ? 'document' : 'documents';
        await this.notifyAdmins({
            type: 'document',
            title: 'New Document Upload',
            message: `${user.firstName} ${user.lastName} uploaded ${documentCount} ${docText} for verification`,
            metadata: { userId: user._id, link: '/dashboard/document-verification' }
        });
    }
}

module.exports = new NotificationService();
