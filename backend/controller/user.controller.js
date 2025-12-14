/**
 * User Controller
 * Handles HTTP requests for user-related endpoints
 */

const userService = require('../service/user.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constant.config');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary.config');

class UserController {
    /**
     * Get current user profile
     * GET /users/profile
     */
    async getProfile(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update current user profile
     * PATCH /users/profile
     */
    async updateProfile(req, res, next) {
        try {
            const user = await userService.updateProfile(req.user.userId, req.body);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.PROFILE_UPDATED,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update employee profile
     * PATCH /users/employee-profile
     */
    async updateEmployeeProfile(req, res, next) {
        try {
            const user = await userService.updateEmployeeProfile(req.user.userId, req.body);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.PROFILE_UPDATED,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload/Update avatar
     * POST /users/avatar
     */
    async uploadAvatar(req, res, next) {
        try {
            if (!req.file) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Please upload an image file'
                });
            }

            // Get current user to check for existing avatar
            const currentUser = await userService.getUserById(req.user.userId);

            // Delete old avatar from Cloudinary if exists
            if (currentUser.avatar?.publicId) {
                await deleteFromCloudinary(currentUser.avatar.publicId);
            }

            // Upload new avatar to Cloudinary
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
                folder: 'home-service-platform/avatars',
                transformation: [
                    { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                    { quality: 'auto' }
                ]
            });

            if (!uploadResult.success) {
                return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Failed to upload avatar'
                });
            }

            // Update user avatar
            const user = await userService.updateAvatar(req.user.userId, {
                url: uploadResult.url,
                publicId: uploadResult.publicId
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Avatar updated successfully',
                data: { avatar: user.avatar }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete avatar
     * DELETE /users/avatar
     */
    async deleteAvatar(req, res, next) {
        try {
            const currentUser = await userService.getUserById(req.user.userId);

            if (currentUser.avatar?.publicId) {
                await deleteFromCloudinary(currentUser.avatar.publicId);
            }

            const user = await userService.updateAvatar(req.user.userId, {
                url: null,
                publicId: null
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Avatar deleted successfully',
                data: { avatar: user.avatar }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active employees (for customers to browse)
     * GET /users/employees
     */
    async getActiveEmployees(req, res, next) {
        try {
            const result = await userService.getActiveEmployees(req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get employee by ID
     * GET /users/employees/:userId
     */
    async getEmployeeById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.userId);

            // Only return employee details if user is an employee
            if (user.role !== 'employee') {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Employee not found'
                });
            }

            // Filter sensitive data
            const employeeData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                employeeProfile: {
                    serviceCategories: user.employeeProfile.serviceCategories,
                    experience: user.employeeProfile.experience,
                    hourlyRate: user.employeeProfile.hourlyRate,
                    bio: user.employeeProfile.bio,
                    skills: user.employeeProfile.skills,
                    rating: user.employeeProfile.rating,
                    completedJobs: user.employeeProfile.completedJobs,
                    availability: user.employeeProfile.availability
                }
            };

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { employee: employeeData }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's verification documents
     * GET /users/documents
     */
    async getUserDocuments(req, res, next) {
        try {
            const result = await userService.getUserDocuments(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload verification documents
     * POST /users/documents
     */
    async uploadDocuments(req, res, next) {
        try {
            console.log('Upload documents request:', { userId: req.user.userId, body: req.body, filesCount: req.files?.length });
            
            const { documentTypes } = req.body;
            const files = req.files || [];

            if (!files || files.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'At least one document file is required'
                });
            }

            const result = await userService.uploadDocuments(req.user.userId, files, documentTypes);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Documents uploaded successfully',
                data: { documents: result.documents }
            });
        } catch (error) {
            console.error('Upload documents error:', error);
            next(error);
        }
    }

    /**
     * Delete verification document
     * DELETE /users/documents/:documentId
     */
    async deleteDocument(req, res, next) {
        try {
            const { documentId } = req.params;
            
            await userService.deleteDocument(req.user.userId, documentId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
