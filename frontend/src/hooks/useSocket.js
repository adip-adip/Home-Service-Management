/**
 * Socket Hook
 * Manages Socket.IO connection and real-time events
 */

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

const useSocket = () => {
    const socketRef = useRef(null);
    const { isAuthenticated, user } = useAuthStore();
    const { addNotification, fetchUnreadCount } = useNotificationStore();

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            // Fetch initial unread count
            fetchUnreadCount();
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // Handle new notifications
        socketRef.current.on('notification:new', (data) => {
            const { notification } = data;
            addNotification(notification);

            // Show toast notification
            toast(notification.title, {
                icon: getNotificationIcon(notification.type),
                duration: 5000
            });
        });

        // Handle notification read updates
        socketRef.current.on('notification:read', (data) => {
            // Update is handled by the store
        });

        socketRef.current.on('notification:allRead', () => {
            // Update is handled by the store
        });

    }, [addNotification, fetchUnreadCount]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [isAuthenticated, user, connect, disconnect]);

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected || false,
        connect,
        disconnect
    };
};

// Helper to get icon for notification type
const getNotificationIcon = (type) => {
    switch (type) {
        case 'booking':
            return '📅';
        case 'document':
            return '📄';
        case 'review':
            return '⭐';
        case 'employee':
            return '👤';
        case 'system':
        default:
            return '🔔';
    }
};

export default useSocket;
export { useSocket };
