/**
 * NotificationItem Component
 * Renders a single notification item
 */

import { FiCalendar, FiFileText, FiStar, FiUser, FiBell, FiX, FiCheck } from 'react-icons/fi';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onClick }) => {
    const { _id, type, title, message, read, createdAt, metadata } = notification;

    const getIcon = () => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'booking':
                return <FiCalendar className={`${iconClass} text-blue-500`} />;
            case 'document':
                return <FiFileText className={`${iconClass} text-purple-500`} />;
            case 'review':
                return <FiStar className={`${iconClass} text-yellow-500`} />;
            case 'employee':
                return <FiUser className={`${iconClass} text-green-500`} />;
            case 'system':
            default:
                return <FiBell className={`${iconClass} text-gray-500`} />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const handleClick = () => {
        if (!read && onMarkAsRead) {
            onMarkAsRead(_id);
        }
        if (onClick) {
            onClick(notification);
        }
    };

    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
            }`}
            onClick={handleClick}
        >
            {/* Unread indicator */}
            <div className="flex-shrink-0 mt-1">
                {!read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
            </div>

            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                {getIcon()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {title}
                </p>
                <p className={`text-sm mt-0.5 ${read ? 'text-gray-500' : 'text-gray-600'}`}>
                    {message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {formatTime(createdAt)}
                </p>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex gap-1">
                {!read && onMarkAsRead && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(_id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Mark as read"
                    >
                        <FiCheck className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(_id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
