/**
 * Notification Controller
 * Handles HTTP requests for notification endpoints
 */

const notificationService = require('../service/notification.service');
const { HTTP_STATUS } = require('../config/constant.config');

class NotificationController {
    /**
     * Get user's notifications
     * GET /notifications
     */
    async getNotifications(req, res, next) {
        try {
            const { page = 1, limit = 20, unreadOnly = false } = req.query;

            const result = await notificationService.getUserNotifications(
                req.user.userId,
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    unreadOnly: unreadOnly === 'true'
                }
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get unread notification count
     * GET /notifications/unread-count
     */
    async getUnreadCount(req, res, next) {
        try {
            const count = await notificationService.getUnreadCount(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { count }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark notification as read
     * PATCH /notifications/:id/read
     */
    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead(
                req.params.id,
                req.user.userId
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Notification marked as read',
                data: { notification }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Mark all notifications as read
     * PATCH /notifications/read-all
     */
    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a notification
     * DELETE /notifications/:id
     */
    async deleteNotification(req, res, next) {
        try {
            await notificationService.delete(req.params.id, req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Notification deleted'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete all notifications
     * DELETE /notifications
     */
    async deleteAllNotifications(req, res, next) {
        try {
            await notificationService.deleteAll(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'All notifications deleted'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
