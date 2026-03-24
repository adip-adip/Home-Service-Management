/**
 * Notification Store (Zustand)
 * Manages notification state and real-time updates
 */

import { create } from 'zustand';
import { notificationAPI } from '../api/notification.api';

const useNotificationStore = create((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasMore: true,
    page: 1,

    // Actions
    setNotifications: (notifications) => set({ notifications }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Fetch notifications
    fetchNotifications: async (reset = false) => {
        const { page, notifications, isLoading } = get();
        if (isLoading) return;

        const currentPage = reset ? 1 : page;
        set({ isLoading: true, error: null });

        try {
            const response = await notificationAPI.getNotifications({
                page: currentPage,
                limit: 20
            });

            const { notifications: newNotifications, pagination } = response.data;

            set({
                notifications: reset ? newNotifications : [...notifications, ...newNotifications],
                page: currentPage + 1,
                hasMore: currentPage < pagination.pages,
                isLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({
                error: error.response?.data?.message || 'Failed to load notifications',
                isLoading: false
            });
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const response = await notificationAPI.getUnreadCount();
            set({ unreadCount: response.data.count });
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    // Add new notification (for real-time updates)
    addNotification: (notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    // Mark as read
    markAsRead: async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            await notificationAPI.markAllAsRead();
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, read: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            await notificationAPI.deleteNotification(id);
            set(state => {
                const notification = state.notifications.find(n => n._id === id);
                return {
                    notifications: state.notifications.filter(n => n._id !== id),
                    unreadCount: notification && !notification.read
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount
                };
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    // Clear all notifications
    clearAll: async () => {
        try {
            await notificationAPI.deleteAllNotifications();
            set({ notifications: [], unreadCount: 0 });
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    },

    // Reset store
    reset: () => set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        hasMore: true,
        page: 1
    })
}));

export default useNotificationStore;
export { useNotificationStore };
