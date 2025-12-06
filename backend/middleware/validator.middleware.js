/**
 * Validator Middleware
 * Validates request data against Joi schemas
 */

const { HTTP_STATUS } = require('../config/constant.config');

/**
 * Request validation sources
 */
const ValidationSource = {
    BODY: 'body',
    PARAMS: 'params',
    QUERY: 'query',
    HEADERS: 'headers'
};

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Request property to validate (body, params, query, headers)
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = ValidationSource.BODY) => {
    return (req, res, next) => {
        const dataToValidate = req[source];

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            convert: true // Convert values to correct type
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/"/g, '')
            }));

            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Replace request data with validated/sanitized data
        req[source] = value;
        next();
    };
};

/**
 * Validate multiple sources at once
 * @param {Object} schemas - Object with source keys and schema values
 * @returns {Function} Express middleware function
 */
const validateMultiple = (schemas) => {
    return (req, res, next) => {
        const allErrors = [];

        for (const [source, schema] of Object.entries(schemas)) {
            const dataToValidate = req[source];

            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    source,
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, '')
                }));
                allErrors.push(...errors);
            } else {
                req[source] = value;
            }
        }

        if (allErrors.length > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation failed',
                errors: allErrors
            });
        }

        next();
    };
};

/**
 * Common validation helpers
 */
const validateBody = (schema) => validate(schema, ValidationSource.BODY);
const validateParams = (schema) => validate(schema, ValidationSource.PARAMS);
const validateQuery = (schema) => validate(schema, ValidationSource.QUERY);

module.exports = {
    validate,
    validateMultiple,
    validateBody,
    validateParams,
    validateQuery,
    ValidationSource
};
