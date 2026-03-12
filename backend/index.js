/**
 * Application Entry Point
 * Starts the server and connects to database
 */

require('dotenv').config();

const http = require('http');
const { createApp } = require('./app');
const { connectDB } = require('./config/db.config');
const { initializeSocket } = require('./config/socket.config');
const { runSeeder } = require('./seeder/user.seeder');
const mailService = require('./service/mail.service');

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server) => {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
        process.on(signal, async () => {
            console.log(`\n📛 Received ${signal}. Starting graceful shutdown...`);

            server.close(() => {
                console.log('✅ HTTP server closed');
                process.exit(0);
            });

            // Force close after 30 seconds
            setTimeout(() => {
                console.error('⚠️ Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        });
    });
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    process.exit(1);
});

/**
 * Start the server
 */
async function startServer() {
    try {
        console.log('\n🚀 Starting Home Service Platform Backend...\n');

        // Set timezone
        process.env.TZ = process.env.TZ || 'Asia/Kathmandu';
        console.log(`⏰ Timezone: ${process.env.TZ}`);

        // Connect to MongoDB
        await connectDB();

        // Initialize mail service
        mailService.initialize();

        // Run seeders in development
        if (NODE_ENV === 'development') {
            await runSeeder();
        }

        // Create Express app
        const app = createApp();

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        initializeSocket(server);

        // Start HTTP server
        server.listen(PORT, () => {
            console.log('\n========================================');
            console.log(`🌟 Server running in ${NODE_ENV} mode`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`📚 API: http://localhost:${PORT}/api/v1`);
            console.log(`❤️  Health: http://localhost:${PORT}/health`);
            console.log('========================================\n');
        });

        // Configure server timeouts
        server.timeout = 30000; // 30 seconds
        server.keepAliveTimeout = 65000; // 65 seconds
        server.headersTimeout = 66000; // 66 seconds

        // Setup graceful shutdown
        gracefulShutdown(server);

        return server;
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = { startServer };
