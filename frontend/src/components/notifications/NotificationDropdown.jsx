/**
 * NotificationDropdown Component
 * Displays list of notifications in a dropdown panel
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiTrash2, FiInbox } from 'react-icons/fi';
import NotificationItem from './NotificationItem';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const {
        notifications,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotificationStore();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications(true);
        }
    }, [isOpen, fetchNotifications]);

    const handleNotificationClick = (notification) => {
        if (notification.metadata?.link) {
            navigate(notification.metadata.link);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-96 max-h-[480px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            title="Mark all as read"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                            <span>Mark all read</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[360px]">
                {isLoading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <FiInbox className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
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
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={() => {
                        navigate('/dashboard/notifications');
                        onClose();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                >
                    View all notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
