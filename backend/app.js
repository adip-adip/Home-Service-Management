/**
 * Express Application Configuration
 * Sets up middleware, security, and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

// Config
const { configureRoutes } = require('./config/router.config');
const { configureCloudinary } = require('./config/cloudinary.config');

// Middleware
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { requestLogger, requestId, securityHeaders, extractClientIP } = require('./middleware/events.middleware');

/**
 * Create and configure Express application
 */
const createApp = () => {
    const app = express();

    // Trust proxy (for rate limiting behind reverse proxy)
    app.set('trust proxy', 1);

    // ============================================
    // SECURITY MIDDLEWARE
    // ============================================

    // Helmet - Security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));

    // CORS Configuration
    const corsOptions = {
        origin: function (origin, callback) {
            const allowedOrigins = [
                process.env.FRONTEND_URL,
                'http://localhost:3000',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5137'
            ].filter(Boolean);

            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Device-Type', 'X-Browser'],
        exposedHeaders: ['X-Request-Id', 'X-Response-Time', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
        maxAge: 86400 // 24 hours
    };
    app.use(cors(corsOptions));

    // Additional security headers
    app.use(securityHeaders);

    // ============================================
    // PARSING MIDDLEWARE
    // ============================================

    // Body parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    app.use(cookieParser());

    // Sanitize against NoSQL injection
    app.use(mongoSanitize({
        replaceWith: '_'
    }));

    // ============================================
    // REQUEST PROCESSING MIDDLEWARE
    // ============================================

    // Request ID for tracing
    app.use(requestId);

    // Extract client IP
    app.use(extractClientIP);

    // Request logging (development only)
    if (process.env.NODE_ENV === 'development') {
        app.use(requestLogger);
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    // Apply general rate limiting to all API routes
    app.use('/api/', apiLimiter);

    // ============================================
    // STATIC FILES
    // ============================================

    // Serve static files from public directory
    app.use('/public', express.static('public'));

    // ============================================
    // CLOUDINARY CONFIGURATION
    // ============================================

    configureCloudinary();

    // ============================================
    // ROUTES
    // ============================================

    configureRoutes(app);

    // ============================================
    // ERROR HANDLING
    // ============================================

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
};

module.exports = { createApp };
