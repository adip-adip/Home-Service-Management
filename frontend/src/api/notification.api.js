/**
 * Notification API Service
 */

import api from './axios';

export const notificationAPI = {
    // Get user's notifications
    getNotifications: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread notification count
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    },

    // Delete a notification
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },

    // Delete all notifications
    deleteAllNotifications: async () => {
        const response = await api.delete('/notifications');
        return response.data;
    }
};

export default notificationAPI;
