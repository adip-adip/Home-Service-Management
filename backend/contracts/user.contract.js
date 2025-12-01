/**
 * User Contract / Validator
 * Validation schemas for user-related endpoints
 */

const Joi = require('joi');

// Phone validation pattern
const phonePattern = /^[0-9]{10,15}$/;

/**
 * Update profile validation schema
 */
const updateProfileSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters'
        }),
    
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters'
        }),
    
    phone: Joi.string()
        .trim()
        .pattern(phonePattern)
        .optional()
        .allow('')
        .messages({
            'string.pattern.base': 'Please provide a valid phone number (10-15 digits)'
        }),
    
    address: Joi.object({
        street: Joi.string().trim().max(200).optional().allow(''),
        city: Joi.string().trim().max(100).optional().allow(''),
        state: Joi.string().trim().max(100).optional().allow(''),
        zipCode: Joi.string().trim().max(20).optional().allow(''),
        country: Joi.string().trim().max(100).optional().allow(''),
        coordinates: Joi.object({
            latitude: Joi.number().min(-90).max(90).optional(),
            longitude: Joi.number().min(-180).max(180).optional()
        }).optional()
    }).optional()
}).min(1).messages({
    'object.min': 'At least one field is required to update'
});

/**
 * Update employee profile schema
 */
const updateEmployeeProfileSchema = Joi.object({
    serviceCategories: Joi.array()
        .items(Joi.string().valid('plumbing', 'electrical', 'cleaning', 'painting', 'carpentry', 'appliance_repair', 'pest_control', 'gardening', 'ac_repair', 'other'))
        .min(1)
        .optional()
        .messages({
            'array.min': 'Please select at least one service category'
        }),
    
    experience: Joi.number()
        .min(0)
        .max(50)
        .optional()
        .messages({
            'number.min': 'Experience cannot be negative',
            'number.max': 'Experience cannot exceed 50 years'
        }),
    
    hourlyRate: Joi.number()
        .min(0)
        .max(100000)
        .optional()
        .messages({
            'number.min': 'Hourly rate cannot be negative',
            'number.max': 'Hourly rate seems too high'
        }),
    
    bio: Joi.string()
        .max(500)
        .optional()
        .allow('')
        .messages({
            'string.max': 'Bio cannot exceed 500 characters'
        }),
    
    skills: Joi.array()
        .items(Joi.string().trim().max(50))
        .max(20)
        .optional()
        .messages({
            'array.max': 'Cannot add more than 20 skills'
        }),
    
    availability: Joi.object({
        isAvailable: Joi.boolean().optional(),
        workingHours: Joi.object({
            start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
            end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
        }).optional(),
        workingDays: Joi.array()
            .items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
            .optional()
    }).optional()
});

/**
 * Admin create user schema
 */
const adminCreateUserSchema = Joi.object({
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
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        }),
    
    phone: Joi.string()
        .trim()
        .pattern(phonePattern)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    
    role: Joi.string()
        .valid('admin', 'employee', 'customer')
        .required()
        .messages({
            'any.only': 'Invalid role specified',
            'any.required': 'Role is required'
        }),
    
    status: Joi.string()
        .valid('active', 'inactive', 'blocked', 'pending_verification')
        .default('active')
});

/**
 * User ID parameter validation
 */
const userIdParamSchema = Joi.object({
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid user ID format',
            'any.required': 'User ID is required'
        })
});

/**
 * Document upload validation schema
 */
const uploadDocumentsSchema = Joi.object({
    documentTypes: Joi.alternatives()
        .try(
            Joi.string().valid('id_card', 'passport', 'driving_license', 'certificate', 'license', 'address_proof', 'bank_statement', 'experience_letter', 'other'),
            Joi.array().items(
                Joi.string().valid('id_card', 'passport', 'driving_license', 'certificate', 'license', 'address_proof', 'bank_statement', 'experience_letter', 'other')
            )
        )
        .required()
        .messages({
            'any.required': 'Document types are required',
            'any.only': 'Invalid document type'
        })
});

/**
 * Update user status validation (Admin only)
 */
const updateUserStatusSchema = Joi.object({
    status: Joi.string()
        .valid('active', 'inactive', 'blocked')
        .required()
        .messages({
            'any.only': 'Status must be active, inactive, or blocked'
        })
});

/**
 * Pagination query schema
 */
const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be at least 1'
        }),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),
    
    sortBy: Joi.string()
        .valid('createdAt', 'firstName', 'lastName', 'email', 'role', 'status')
        .default('createdAt'),
    
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
    
    search: Joi.string()
        .trim()
        .max(100)
        .optional()
        .allow(''),
    
    role: Joi.string()
        .valid('admin', 'employee', 'customer')
        .optional(),
    
    status: Joi.string()
        .valid('active', 'inactive', 'blocked', 'pending_verification', 'pending_approval')
        .optional()
});

/**
 * Document verification params schema (userId + documentId)
 */
const documentVerifyParamsSchema = Joi.object({
    userId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid user ID format',
            'any.required': 'User ID is required'
        }),
    documentId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid document ID format',
            'any.required': 'Document ID is required'
        })
});

module.exports = {
    updateProfileSchema,
    updateEmployeeProfileSchema,
    adminCreateUserSchema,
    userIdParamSchema,
    uploadDocumentsSchema,
    updateUserStatusSchema,
    paginationSchema,
    documentVerifyParamsSchema
};
