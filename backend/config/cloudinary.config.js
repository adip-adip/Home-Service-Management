/**
 * Cloudinary Configuration
 * Handles cloud storage for images and files
 */

const cloudinary = require('cloudinary').v2;

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    });

    console.log('☁️ Cloudinary configured successfully');
    return cloudinary;
};

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
const uploadToCloudinary = async (filePath, options = {}) => {
    try {
        const defaultOptions = {
            folder: 'home-service-platform',
            resource_type: 'auto',
            ...options
        };

        const result = await cloudinary.uploader.upload(filePath, defaultOptions);
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const defaultOptions = {
            folder: 'home-service-platform',
            resource_type: 'auto',
            ...options
        };

        cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
            if (error) {
                reject({
                    success: false,
                    error: error.message
                });
            } else {
                resolve({
                    success: true,
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    width: result.width,
                    height: result.height
                });
            }
        }).end(buffer);
    });
};

module.exports = {
    cloudinary,
    configureCloudinary,
    uploadToCloudinary,
    deleteFromCloudinary,
    uploadBufferToCloudinary
};
