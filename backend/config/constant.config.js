/**
 * Application Constants Configuration
 * Defines all constant values used throughout the application
 */

// User Roles
const ROLES = Object.freeze({
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CUSTOMER: 'customer'
});

// Permission Categories
const PERMISSION_CATEGORIES = Object.freeze({
    USER_MANAGEMENT: 'user_management',
    BOOKING_MANAGEMENT: 'booking_management',
    SERVICE_MANAGEMENT: 'service_management',
    PAYMENT_MANAGEMENT: 'payment_management',
    REVIEW_MANAGEMENT: 'review_management',
    DASHBOARD: 'dashboard'
});

// Permissions
const PERMISSIONS = Object.freeze({
    // Admin Permissions
    MANAGE_USERS: 'manage_users',
    CREATE_USER: 'create_user',
    BLOCK_USER: 'block_user',
    DELETE_USER: 'delete_user',
    APPROVE_EMPLOYEE: 'approve_employee',
    SUSPEND_EMPLOYEE: 'suspend_employee',
    VIEW_ALL_BOOKINGS: 'view_all_bookings',
    VIEW_ALL_PAYMENTS: 'view_all_payments',
    ACCESS_ADMIN_DASHBOARD: 'access_admin_dashboard',
    MANAGE_SERVICES: 'manage_services',
    MANAGE_CATEGORIES: 'manage_categories',

    // Employee Permissions
    VIEW_ASSIGNED_JOBS: 'view_assigned_jobs',
    ACCEPT_JOB: 'accept_job',
    REJECT_JOB: 'reject_job',
    UPDATE_JOB_STATUS: 'update_job_status',
    VIEW_OWN_EARNINGS: 'view_own_earnings',
    UPDATE_AVAILABILITY: 'update_availability',
    VIEW_OWN_REVIEWS: 'view_own_reviews',

    // Customer Permissions
    CREATE_BOOKING: 'create_booking',
    VIEW_OWN_BOOKINGS: 'view_own_bookings',
    CANCEL_BOOKING: 'cancel_booking',
    CREATE_REVIEW: 'create_review',
    UPDATE_REVIEW: 'update_review',
    DELETE_REVIEW: 'delete_review',
    VIEW_SERVICES: 'view_services',
    VIEW_EMPLOYEES: 'view_employees'
});

// Role-Permission Mapping
const ROLE_PERMISSIONS = Object.freeze({
    [ROLES.ADMIN]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.BLOCK_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.APPROVE_EMPLOYEE,
        PERMISSIONS.SUSPEND_EMPLOYEE,
        PERMISSIONS.VIEW_ALL_BOOKINGS,
        PERMISSIONS.VIEW_ALL_PAYMENTS,
        PERMISSIONS.ACCESS_ADMIN_DASHBOARD,
        PERMISSIONS.MANAGE_SERVICES,
        PERMISSIONS.MANAGE_CATEGORIES,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.VIEW_EMPLOYEES
    ],
    [ROLES.EMPLOYEE]: [
        PERMISSIONS.VIEW_ASSIGNED_JOBS,
        PERMISSIONS.ACCEPT_JOB,
        PERMISSIONS.REJECT_JOB,
        PERMISSIONS.UPDATE_JOB_STATUS,
        PERMISSIONS.VIEW_OWN_EARNINGS,
        PERMISSIONS.UPDATE_AVAILABILITY,
        PERMISSIONS.VIEW_OWN_REVIEWS,
        PERMISSIONS.VIEW_SERVICES
    ],
    [ROLES.CUSTOMER]: [
        PERMISSIONS.CREATE_BOOKING,
        PERMISSIONS.VIEW_OWN_BOOKINGS,
        PERMISSIONS.CANCEL_BOOKING,
        PERMISSIONS.CREATE_REVIEW,
        PERMISSIONS.UPDATE_REVIEW,
        PERMISSIONS.DELETE_REVIEW,
        PERMISSIONS.VIEW_SERVICES,
        PERMISSIONS.VIEW_EMPLOYEES
    ]
});

// Token Types
const TOKEN_TYPES = Object.freeze({
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email'
});

// User Status
const USER_STATUS = Object.freeze({
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked',
    PENDING_VERIFICATION: 'pending_verification',
    PENDING_APPROVAL: 'pending_approval'
});

// Employee Status (for approval workflow)
const EMPLOYEE_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected'
});

// Job Status
const JOB_STATUS = Object.freeze({
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
});

// Booking Status
const BOOKING_STATUS = Object.freeze({
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
});

// Payment Status
const PAYMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
});

// HTTP Status Codes
const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
});

// Error Messages
const ERROR_MESSAGES = Object.freeze({
    // Auth Errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    USER_BLOCKED: 'Your account has been blocked. Please contact support.',
    USER_NOT_VERIFIED: 'Please verify your email before logging in',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_NOT_FOUND: 'Token not found',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
    REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission to perform this action',
    
    // User Errors
    USER_ALREADY_EXISTS: 'User with this email already exists',
    INVALID_USER_ID: 'Invalid user ID',
    
    // Validation Errors
    VALIDATION_ERROR: 'Validation failed',
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    PASSWORD_MISMATCH: 'Passwords do not match',
    
    // General Errors
    INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    RESOURCE_NOT_FOUND: 'Resource not found'
});

// Success Messages
const SUCCESS_MESSAGES = Object.freeze({
    REGISTERED: 'Registration successful. Please verify your email.',
    LOGGED_IN: 'Login successful',
    LOGGED_OUT: 'Logout successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent successfully',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    USER_DELETED: 'User deleted successfully',
    DOCUMENT_VERIFIED: 'Document verified successfully',
    DOCUMENT_REJECTED: 'Document rejected successfully'
});

// Service Categories
const SERVICE_CATEGORIES = Object.freeze({
    PLUMBING: 'plumbing',
    ELECTRICAL: 'electrical',
    CLEANING: 'cleaning',
    PAINTING: 'painting',
    CARPENTRY: 'carpentry',
    APPLIANCE_REPAIR: 'appliance_repair',
    PEST_CONTROL: 'pest_control',
    GARDENING: 'gardening',
    AC_REPAIR: 'ac_repair',
    OTHER: 'other'
});

// Notification Types
const NOTIFICATION_TYPES = Object.freeze({
    BOOKING: 'booking',
    DOCUMENT: 'document',
    REVIEW: 'review',
    EMPLOYEE: 'employee',
    SYSTEM: 'system'
});

// Socket Events
const SOCKET_EVENTS = Object.freeze({
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',
    NOTIFICATION_ALL_READ: 'notification:allRead',
    NOTIFICATION_DELETED: 'notification:deleted',
    NOTIFICATION_ALL_DELETED: 'notification:allDeleted'
});

module.exports = {
    ROLES,
    PERMISSIONS,
    PERMISSION_CATEGORIES,
    ROLE_PERMISSIONS,
    TOKEN_TYPES,
    USER_STATUS,
    EMPLOYEE_STATUS,
    JOB_STATUS,
    BOOKING_STATUS,
    PAYMENT_STATUS,
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    SERVICE_CATEGORIES,
    NOTIFICATION_TYPES,
    SOCKET_EVENTS
};
