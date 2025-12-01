/**
 * Auth Contract / Validator
 * Validation schemas for authentication endpoints using Joi
 */

const Joi = require('joi');

// Password validation pattern
// At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=^~`|\\(){}\[\];:'"<>,.])[\w@$!%*?&#+\-_=^~`|\\(){}\[\];:'"<>,.]{8,}$/;

// Phone validation pattern
const phonePattern = /^[0-9]{10,15}$/;

/**
 * Register validation schema
 */
const registerSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required'
        }),
    
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required'
        }),
    
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
            'any.required': 'Password is required'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'string.empty': 'Confirm password is required',
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required'
        }),
    
    phone: Joi.string()
        .trim()
        .pattern(phonePattern)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number (10-15 digits)'
        }),
    
    role: Joi.string()
        .valid('customer', 'employee')
        .default('customer')
        .messages({
            'any.only': 'Role must be either customer or employee'
        }),
    
    // Employee specific fields
    serviceCategories: Joi.when('role', {
        is: 'employee',
        then: Joi.array()
            .items(Joi.string().valid('plumbing', 'electrical', 'cleaning', 'painting', 'carpentry', 'appliance_repair', 'pest_control', 'gardening', 'ac_repair', 'other'))
            .min(1)
            .required()
            .messages({
                'array.min': 'Please select at least one service category',
                'any.required': 'Service categories are required for employees'
            }),
        otherwise: Joi.forbidden()
    }),
    
    experience: Joi.when('role', {
        is: 'employee',
        then: Joi.number().min(0).max(50).optional(),
        otherwise: Joi.forbidden()
    }),
    
    bio: Joi.when('role', {
        is: 'employee',
        then: Joi.string().max(500).optional(),
        otherwise: Joi.forbidden()
    })
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),
    
    rememberMe: Joi.boolean()
        .default(false)
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token is required',
            'any.required': 'Refresh token is required'
        })
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'string.empty': 'Reset token is required',
            'any.required': 'Reset token is required'
        }),
    
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
            'any.required': 'Password is required'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'string.empty': 'Confirm password is required',
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required'
        })
});

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Current password is required',
            'any.required': 'Current password is required'
        }),
    
    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(passwordPattern)
        .required()
        .messages({
            'string.empty': 'New password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
            'any.required': 'New password is required'
        }),
    
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'string.empty': 'Confirm password is required',
            'any.only': 'Passwords do not match',
            'any.required': 'Confirm password is required'
        })
});

/**
 * Verify email validation schema
 */
const verifyEmailSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'string.empty': 'Verification token is required',
            'any.required': 'Verification token is required'
        })
});

/**
 * Resend verification email schema
 */
const resendVerificationSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    verifyEmailSchema,
    resendVerificationSchema
};
