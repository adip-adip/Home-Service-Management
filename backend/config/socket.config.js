/**
 * Socket.IO Configuration
 * Initializes and configures Socket.IO server with authentication
 */

const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utilitis/jwt.helper');
const User = require('../modules/user.module');

// Store for user socket mappings
const userSockets = new Map(); // userId -> Set of socketIds
const socketUsers = new Map(); // socketId -> userId

let io = null;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                'http://localhost:3000',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5137'
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                          socket.handshake.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify token
            const decoded = verifyAccessToken(token);
            if (!decoded) {
                return next(new Error('Invalid token'));
            }

            // Verify user exists and is not blocked
            const user = await User.findById(decoded.userId).select('_id role status');
            if (!user) {
                return next(new Error('User not found'));
            }
            if (user.status === 'blocked') {
                return next(new Error('User is blocked'));
            }

            // Attach user info to socket
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;

            next();
        } catch (error) {
            console.error('Socket auth error:', error.message);
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`🔌 User connected: ${userId} (socket: ${socket.id})`);

        // Track user socket
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
        socketUsers.set(socket.id, userId);

        // Join user's personal room
        socket.join(`user:${userId}`);

        // Join role-based room
        socket.join(`role:${socket.userRole}`);

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${userId} (reason: ${reason})`);

            // Remove from tracking
            const userSocketSet = userSockets.get(userId);
            if (userSocketSet) {
                userSocketSet.delete(socket.id);
                if (userSocketSet.size === 0) {
                    userSockets.delete(userId);
                }
            }
            socketUsers.delete(socket.id);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for user ${userId}:`, error);
        });

        // Emit connection success
        socket.emit('connected', {
            message: 'Connected to notification service',
            userId
        });
    });

    console.log('🔌 Socket.IO initialized');
    return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server|null} Socket.IO server instance
 */
const getIO = () => {
    if (!io) {
        console.warn('Socket.IO not initialized');
    }
    return io;
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID to emit to
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Emit event to all users with a specific role
 * @param {string} role - Role name (admin, employee, customer)
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
const emitToRole = (role, event, data) => {
    if (io) {
        io.to(`role:${role}`).emit(event, data);
    }
};

/**
 * Emit event to all connected users
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

/**
 * Check if a user is currently connected
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user has active connections
 */
const isUserConnected = (userId) => {
    return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

/**
 * Get count of connected users
 * @returns {number} Number of unique connected users
 */
const getConnectedUsersCount = () => {
    return userSockets.size;
};

module.exports = {
    initializeSocket,
    getIO,
    emitToUser,
    emitToRole,
    emitToAll,
    isUserConnected,
    getConnectedUsersCount
};
