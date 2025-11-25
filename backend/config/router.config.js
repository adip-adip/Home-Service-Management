/**
 * Router Configuration
 * Central routing configuration for all API endpoints
 */

const authRoutes = require('../route/auth.route');
const userRoutes = require('../route/user.route');
const adminRoutes = require('../route/admin.route');
const employeeRoutes = require('../route/employee.route');
const serviceRoutes = require('../route/service.route');
const bookingRoutes = require('../route/booking.route');

/**
 * Configure all routes for the application
 * @param {Express} app - Express application instance
 */
const configureRoutes = (app) => {
    // API Version prefix
    const API_PREFIX = '/api/v1';

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // API Routes
    app.use(`${API_PREFIX}/auth`, authRoutes);
    app.use(`${API_PREFIX}/users`, userRoutes);
    app.use(`${API_PREFIX}/admin`, adminRoutes);
    app.use(`${API_PREFIX}/employee`, employeeRoutes);
    app.use(`${API_PREFIX}/services`, serviceRoutes);
    app.use(`${API_PREFIX}/bookings`, bookingRoutes);

    // 404 Handler for undefined routes
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            message: `Cannot ${req.method} ${req.originalUrl}`,
            error: 'Route not found'
        });
    });

    console.log('🛣️ Routes configured successfully');
};

module.exports = { configureRoutes };
