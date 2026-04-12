/**
 * NotificationBell Component
 * Bell icon with unread count badge and dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { unreadCount, fetchUnreadCount } = useNotificationStore();

    // Fetch unread count on mount
    useEffect(() => {
        const hasToken = !!localStorage.getItem('accessToken');
        if (hasToken) {
            fetchUnreadCount();
        }
    }, [fetchUnreadCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <FiBell className="w-6 h-6" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationDropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
};

export default NotificationBell;
