/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURL = process.env.MONGODB_URL;
        const dbName = process.env.MONGODB_NAME;

        if (!mongoURL) {
            throw new Error('MONGODB_URL is not defined in environment variables');
        }

        const connectionOptions = {
            dbName: dbName,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(mongoURL, connectionOptions);

        console.log(`[OK] MongoDB Connected: ${conn.connection.host}`);
        console.log(`[DB] Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('[ERROR] MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[WARN] MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[OK] MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('[ERROR] MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
