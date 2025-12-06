/**
 * Uploader Middleware
 * Handles file uploads using Multer
 */

const multer = require('multer');
const path = require('path');
const { HTTP_STATUS } = require('../config/constant.config');

/**
 * Multer storage configuration
 * Using memory storage for Cloudinary uploads
 */
const memoryStorage = multer.memoryStorage();

/**
 * Disk storage configuration (for local uploads)
 */
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    }
});

/**
 * File filter for images only
 */
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
    }
};

/**
 * File filter for documents
 */
const documentFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images and documents (pdf, doc, docx) are allowed'), false);
    }
};

/**
 * Image upload configuration (memory storage for Cloudinary)
 */
const uploadImage = multer({
    storage: memoryStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5 // Max 5 files at once
    }
});

/**
 * Document upload configuration
 */
const uploadDocument = multer({
    storage: memoryStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
        files: 10
    }
});

/**
 * Avatar upload (single image)
 */
const uploadAvatar = uploadImage.single('avatar');

/**
 * Multiple images upload
 */
const uploadImages = uploadImage.array('images', 5);

/**
 * Employee documents upload
 */
const uploadDocuments = uploadDocument.array('documents', 10);

/**
 * Service request images
 */
const uploadServiceImages = uploadImage.array('images', 5);

/**
 * Multer error handler middleware
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'File size too large',
                error: 'Maximum file size is 5MB for images and 10MB for documents'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Too many files',
                error: 'Maximum number of files exceeded'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Unexpected file field',
                error: err.message
            });
        }
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }

    if (err) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    }

    next();
};

module.exports = {
    uploadAvatar,
    uploadImages,
    uploadDocuments,
    uploadServiceImages,
    handleUploadError,
    memoryStorage,
    diskStorage
};
