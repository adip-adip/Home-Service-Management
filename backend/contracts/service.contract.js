/**
 * Service Contract / Validator
 * Validation schemas for service-related endpoints
 */

const Joi = require('joi');

/**
 * Create service request schema (Customer)
 */
const createServiceRequestSchema = Joi.object({
    category: Joi.string()
        .valid('plumbing', 'electrical', 'cleaning', 'painting', 'carpentry', 'appliance_repair', 'pest_control', 'gardening', 'ac_repair', 'other')
        .required()
        .messages({
            'any.only': 'Invalid service category',
            'any.required': 'Service category is required'
        }),
    
    title: Joi.string()
        .trim()
        .min(10)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 10 characters',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    
    description: Joi.string()
        .trim()
        .min(20)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 20 characters',
            'string.max': 'Description cannot exceed 1000 characters',
            'any.required': 'Description is required'
        }),
    
    address: Joi.object({
        street: Joi.string().trim().max(200).required(),
        city: Joi.string().trim().max(100).required(),
        state: Joi.string().trim().max(100).optional(),
        zipCode: Joi.string().trim().max(20).optional(),
        coordinates: Joi.object({
            latitude: Joi.number().min(-90).max(90).optional(),
            longitude: Joi.number().min(-180).max(180).optional()
        }).optional()
    }).required().messages({
        'any.required': 'Service address is required'
    }),
    
    preferredDate: Joi.date()
        .min('now')
        .required()
        .messages({
            'date.min': 'Preferred date must be in the future',
            'any.required': 'Preferred date is required'
        }),
    
    preferredTime: Joi.string()
        .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required()
        .messages({
            'string.pattern.base': 'Please provide a valid time format (HH:MM)',
            'any.required': 'Preferred time is required'
        }),
    
    urgency: Joi.string()
        .valid('low', 'medium', 'high', 'emergency')
        .default('medium')
        .messages({
            'any.only': 'Invalid urgency level'
        }),
    
    estimatedBudget: Joi.number()
        .min(0)
        .max(1000000)
        .optional()
        .messages({
            'number.min': 'Budget cannot be negative',
            'number.max': 'Budget seems too high'
        }),
    
    images: Joi.array()
        .items(Joi.string().uri())
        .max(5)
        .optional()
        .messages({
            'array.max': 'Cannot upload more than 5 images'
        }),
    
    preferredEmployeeId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Invalid employee ID format'
        })
});

/**
 * Update job status schema (Employee)
 */
const updateJobStatusSchema = Joi.object({
    status: Joi.string()
        .valid('accepted', 'rejected', 'in_progress', 'completed')
        .required()
        .messages({
            'any.only': 'Invalid status. Must be: accepted, rejected, in_progress, or completed',
            'any.required': 'Status is required'
        }),
    
    notes: Joi.string()
        .trim()
        .max(500)
        .optional()
        .messages({
            'string.max': 'Notes cannot exceed 500 characters'
        }),
    
    rejectionReason: Joi.when('status', {
        is: 'rejected',
        then: Joi.string().trim().min(10).max(300).required().messages({
            'string.empty': 'Rejection reason is required when rejecting a job',
            'string.min': 'Rejection reason must be at least 10 characters',
            'any.required': 'Rejection reason is required when rejecting a job'
        }),
        otherwise: Joi.forbidden()
    }),
    
    completionDetails: Joi.when('status', {
        is: 'completed',
        then: Joi.object({
            workDone: Joi.string().trim().min(10).max(500).required(),
            hoursWorked: Joi.number().min(0.5).max(24).required(),
            materialsUsed: Joi.array().items(Joi.object({
                name: Joi.string().required(),
                quantity: Joi.number().min(1).required(),
                cost: Joi.number().min(0).required()
            })).optional(),
            totalCost: Joi.number().min(0).required()
        }).required().messages({
            'any.required': 'Completion details are required when marking job as completed'
        }),
        otherwise: Joi.forbidden()
    })
});

/**
 * Cancel booking schema (Customer)
 */
const cancelBookingSchema = Joi.object({
    reason: Joi.string()
        .trim()
        .min(10)
        .max(300)
        .required()
        .messages({
            'string.empty': 'Cancellation reason is required',
            'string.min': 'Reason must be at least 10 characters',
            'string.max': 'Reason cannot exceed 300 characters',
            'any.required': 'Cancellation reason is required'
        })
});

/**
 * Create review schema (Customer)
 */
const createReviewSchema = Joi.object({
    bookingId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid booking ID format',
            'any.required': 'Booking ID is required'
        }),
    
    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.base': 'Rating must be a number',
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
    
    title: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Title must be at least 5 characters',
            'string.max': 'Title cannot exceed 100 characters'
        }),
    
    comment: Joi.string()
        .trim()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Comment is required',
            'string.min': 'Comment must be at least 10 characters',
            'string.max': 'Comment cannot exceed 500 characters',
            'any.required': 'Comment is required'
        }),
    
    wouldRecommend: Joi.boolean()
        .default(true)
});

/**
 * Job ID parameter validation
 */
const jobIdParamSchema = Joi.object({
    jobId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Invalid job ID format',
            'any.required': 'Job ID is required'
        })
});

module.exports = {
    createServiceRequestSchema,
    updateJobStatusSchema,
    cancelBookingSchema,
    createReviewSchema,
    jobIdParamSchema
};
