/**
 * Notifications Page
 * Shows all notifications with filtering and pagination
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheckCircle, FiTrash2, FiFilter, FiInbox } from 'react-icons/fi';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationItem } from '../../components/notifications';

const Notifications = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, unread, read
    const {
        notifications,
        isLoading,
        hasMore,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    const handleNotificationClick = (notification) => {
        if (notification.metadata?.link) {
            navigate(notification.metadata.link);
        }
    };

    const handleLoadMore = () => {
        if (hasMore && !isLoading) {
            fetchNotifications(false);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FiBell className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Delete all notifications?')) {
                                    clearAll();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'unread', label: 'Unread' },
                    { key: 'read', label: 'Read' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            filter === key
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                        <FiInbox className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {filter === 'unread'
                                ? "You're all caught up!"
                                : filter === 'read'
                                ? "No read notifications"
                                : "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onMarkAsRead={markAsRead}
                                onDelete={deleteNotification}
                                onClick={handleNotificationClick}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {hasMore && filteredNotifications.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : 'Load more'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
