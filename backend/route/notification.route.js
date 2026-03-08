/**
 * Notification Routes
 * Handles notification endpoints
 */

const express = require('express');
const router = express.Router();

// Controller
const notificationController = require('../controller/notification.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user's notifications (paginated)
 * @access  Private
 * @query   page, limit, unreadOnly
 */
router.get(
    '/',
    authenticate,
    notificationController.getNotifications
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
    '/unread-count',
    authenticate,
    notificationController.getUnreadCount
);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
    '/read-all',
    authenticate,
    notificationController.markAllAsRead
);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch(
    '/:id/read',
    authenticate,
    notificationController.markAsRead
);

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
router.delete(
    '/',
    authenticate,
    notificationController.deleteAllNotifications
);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
    '/:id',
    authenticate,
    notificationController.deleteNotification
);

module.exports = router;
