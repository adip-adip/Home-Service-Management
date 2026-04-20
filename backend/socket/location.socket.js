/**
 * Location Socket Handler
 * Handles real-time location sharing between employee and customer
 */

const Booking = require('../modules/booking.module');
const { BOOKING_STATUS } = require('../config/constant.config');

// Track active location sharing sessions
const activeTrackingSessions = new Map(); // bookingId -> { employeeId, customerId, lastLocation }

/**
 * Register location socket events
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 */
const registerLocationEvents = (socket, io) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    /**
     * Employee joins tracking room for a booking
     * Event: location:startTracking
     * Payload: { bookingId }
     */
    socket.on('location:startTracking', async (data) => {
        try {
            const { bookingId } = data;

            if (!bookingId) {
                return socket.emit('location:error', { message: 'Booking ID required' });
            }

            // Verify booking exists and user is the assigned employee
            const booking = await Booking.findById(bookingId)
                .select('employee customer status')
                .lean();

            if (!booking) {
                return socket.emit('location:error', { message: 'Booking not found' });
            }

            // Only employee can start tracking
            if (userRole !== 'employee' || booking.employee.toString() !== userId) {
                return socket.emit('location:error', { message: 'Unauthorized to track this booking' });
            }

            // Only allow tracking for confirmed or in-progress bookings
            const allowedStatuses = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS, 'confirmed', 'in-progress'];
            if (!allowedStatuses.includes(booking.status)) {
                return socket.emit('location:error', {
                    message: 'Location tracking only available for confirmed or in-progress bookings'
                });
            }

            // Join the booking room
            const roomName = `booking:${bookingId}:location`;
            socket.join(roomName);

            // Track this session
            activeTrackingSessions.set(bookingId, {
                employeeId: userId,
                customerId: booking.customer.toString(),
                employeeSocketId: socket.id,
                startedAt: new Date(),
                lastLocation: null
            });

            console.log(` Employee ${userId} started tracking for booking ${bookingId}`);

            socket.emit('location:trackingStarted', {
                bookingId,
                message: 'Location tracking started'
            });

            // Notify customer that employee started sharing location
            io.to(`user:${booking.customer.toString()}`).emit('location:employeeOnline', {
                bookingId,
                message: 'Service provider is now sharing their location'
            });

        } catch (error) {
            console.error('Error starting location tracking:', error);
            socket.emit('location:error', { message: 'Failed to start tracking' });
        }
    });

    /**
     * Employee sends location update
     * Event: location:update
     * Payload: { bookingId, latitude, longitude, heading, speed, accuracy }
     */
    socket.on('location:update', async (data) => {
        try {
            const { bookingId, latitude, longitude, heading, speed, accuracy } = data;

            console.log(` Location update received from employee ${userId} for booking ${bookingId}`);

            if (!bookingId || latitude === undefined || longitude === undefined) {
                return socket.emit('location:error', { message: 'Invalid location data' });
            }

            // Verify this is the tracking employee
            const session = activeTrackingSessions.get(bookingId);
            if (!session) {
                console.log(` No active session found for booking ${bookingId}, creating new session...`);
                // Try to create session if employee is authorized
                const booking = await Booking.findById(bookingId)
                    .select('employee customer status')
                    .lean();

                if (booking && booking.employee.toString() === userId) {
                    activeTrackingSessions.set(bookingId, {
                        employeeId: userId,
                        customerId: booking.customer.toString(),
                        employeeSocketId: socket.id,
                        startedAt: new Date(),
                        lastLocation: null
                    });

                    // Notify customer that employee started sharing location
                    console.log(` Auto-created session, notifying customer ${booking.customer.toString()}`);
                    io.to(`user:${booking.customer.toString()}`).emit('location:employeeOnline', {
                        bookingId,
                        message: 'Service provider is now sharing their location'
                    });
                } else {
                    return socket.emit('location:error', { message: 'Not authorized to update location' });
                }
            } else if (session.employeeId !== userId) {
                return socket.emit('location:error', { message: 'Not authorized to update location' });
            }

            // Get the session again (in case we just created it)
            const currentSession = activeTrackingSessions.get(bookingId);

            const locationData = {
                latitude,
                longitude,
                heading: heading || 0,
                speed: speed || 0,
                accuracy: accuracy || 0,
                timestamp: Date.now()
            };

            // Update last known location in session
            currentSession.lastLocation = locationData;
            activeTrackingSessions.set(bookingId, currentSession);

            console.log(`Broadcasting location to customer ${currentSession.customerId}`);

            // Broadcast location to the customer only
            io.to(`user:${currentSession.customerId}`).emit('location:employeeLocation', {
                bookingId,
                location: locationData
            });

            // Also update last known location in booking (throttled - every 30 seconds)
            const now = Date.now();
            if (!currentSession.lastDbUpdate || now - currentSession.lastDbUpdate > 30000) {
                currentSession.lastDbUpdate = now;
                await Booking.findByIdAndUpdate(bookingId, {
                    'employeeLastLocation': {
                        coordinates: [longitude, latitude],
                        heading,
                        speed,
                        updatedAt: new Date()
                    }
                });
            }

        } catch (error) {
            console.error('Error updating location:', error);
        }
    });

    /**
     * Customer joins to receive location updates
     * Event: location:subscribe
     * Payload: { bookingId }
     */
    socket.on('location:subscribe', async (data) => {
        try {
            const { bookingId } = data;

            console.log(`Customer ${userId} trying to subscribe to booking ${bookingId}`);

            if (!bookingId) {
                return socket.emit('location:error', { message: 'Booking ID required' });
            }

            // Verify booking and customer authorization
            const booking = await Booking.findById(bookingId)
                .select('customer employee status employeeLastLocation')
                .lean();

            if (!booking) {
                return socket.emit('location:error', { message: 'Booking not found' });
            }

            // Allow both customer and employee to subscribe (employee might want to see their own status)
            const isCustomer = booking.customer.toString() === userId;
            const isEmployee = booking.employee.toString() === userId;

            if (!isCustomer && !isEmployee) {
                return socket.emit('location:error', { message: 'Unauthorized to view this booking' });
            }

            // Check if employee is currently tracking
            const session = activeTrackingSessions.get(bookingId);

            console.log(`Customer ${userId} subscribed. Employee online: ${!!session}, Session:`, session ? { employeeId: session.employeeId, hasLocation: !!session.lastLocation } : null);

            socket.emit('location:subscribed', {
                bookingId,
                isEmployeeOnline: !!session,
                lastKnownLocation: session?.lastLocation || booking.employeeLastLocation || null
            });

            console.log(` Customer ${userId} subscribed to location for booking ${bookingId}`);

        } catch (error) {
            console.error('Error subscribing to location:', error);
            socket.emit('location:error', { message: 'Failed to subscribe' });
        }
    });

    /**
     * Stop location tracking (employee or booking completed)
     * Event: location:stopTracking
     * Payload: { bookingId }
     */
    socket.on('location:stopTracking', async (data) => {
        try {
            const { bookingId } = data;

            const session = activeTrackingSessions.get(bookingId);
            if (!session) return;

            // Only employee who started tracking or admin can stop
            if (session.employeeId !== userId && userRole !== 'admin') {
                return socket.emit('location:error', { message: 'Not authorized to stop tracking' });
            }

            // Leave the room
            const roomName = `booking:${bookingId}:location`;
            socket.leave(roomName);

            // Remove session
            activeTrackingSessions.delete(bookingId);

            console.log(` Tracking stopped for booking ${bookingId}`);

            // Notify customer
            io.to(`user:${session.customerId}`).emit('location:employeeOffline', {
                bookingId,
                message: 'Service provider stopped sharing location'
            });

            socket.emit('location:trackingStopped', { bookingId });

        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    });

    /**
     * Handle disconnect - clean up any active tracking sessions
     */
    socket.on('disconnect', () => {
        // Find and clean up any sessions this socket was managing
        for (const [bookingId, session] of activeTrackingSessions.entries()) {
            if (session.employeeSocketId === socket.id) {
                activeTrackingSessions.delete(bookingId);

                // Notify customer
                io.to(`user:${session.customerId}`).emit('location:employeeOffline', {
                    bookingId,
                    message: 'Service provider disconnected'
                });

                console.log(` Tracking auto-stopped for booking ${bookingId} (employee disconnected)`);
            }
        }
    });
};

/**
 * Check if tracking is active for a booking
 * @param {string} bookingId - Booking ID
 * @returns {boolean}
 */
const isTrackingActive = (bookingId) => {
    return activeTrackingSessions.has(bookingId);
};

/**
 * Get active session for a booking
 * @param {string} bookingId - Booking ID
 * @returns {Object|null}
 */
const getActiveSession = (bookingId) => {
    return activeTrackingSessions.get(bookingId) || null;
};

/**
 * Stop tracking for a booking (called when booking is completed/cancelled)
 * @param {string} bookingId - Booking ID
 * @param {Server} io - Socket.IO server instance
 */
const stopTrackingForBooking = (bookingId, io) => {
    const session = activeTrackingSessions.get(bookingId);
    if (session) {
        activeTrackingSessions.delete(bookingId);

        if (io) {
            io.to(`user:${session.customerId}`).emit('location:employeeOffline', {
                bookingId,
                message: 'Job completed - tracking stopped'
            });
        }
    }
};

module.exports = {
    registerLocationEvents,
    isTrackingActive,
    getActiveSession,
    stopTrackingForBooking
};
