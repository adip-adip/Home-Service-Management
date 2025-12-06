/**
 * Error Middleware
 * Global error handling for the application
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constant.config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.isOperational = isOperational;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message = 'Bad Request', errors = []) {
        return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
    }

    static unauthorized(message = ERROR_MESSAGES.UNAUTHORIZED) {
        return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
    }

    static forbidden(message = ERROR_MESSAGES.FORBIDDEN) {
        return new ApiError(HTTP_STATUS.FORBIDDEN, message);
    }

    static notFound(message = ERROR_MESSAGES.RESOURCE_NOT_FOUND) {
        return new ApiError(HTTP_STATUS.NOT_FOUND, message);
    }

    static conflict(message = 'Resource already exists') {
        return new ApiError(HTTP_STATUS.CONFLICT, message);
    }

    static internal(message = ERROR_MESSAGES.INTERNAL_ERROR) {
        return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
    }
}

/**
 * Handle MongoDB Cast Errors (invalid ObjectId)
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

/**
 * Handle MongoDB Duplicate Key Errors
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return new ApiError(HTTP_STATUS.CONFLICT, message);
};

/**
 * Handle MongoDB Validation Errors
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
    }));
    return new ApiError(HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.TOKEN_INVALID);
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.TOKEN_EXPIRED);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('ERROR 💥:', err);
    } else {
        console.error('ERROR:', err.message);
    }

    // Handle specific error types
    if (err.name === 'CastError') {
        error = handleCastError(err);
    }

    if (err.code === 11000) {
        error = handleDuplicateKeyError(err);
    }

    if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    }

    if (err.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
    }

    // Handle custom errors with statusCode
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Default error response
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

/**
 * Not Found Handler (for undefined routes)
 */
const notFoundHandler = (req, res, next) => {
    const error = ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
    next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async functions to catch errors automatically
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    ApiError,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
