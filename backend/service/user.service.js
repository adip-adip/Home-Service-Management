/**
 * User Service
 * Handles user-related business logic
 */

const { User } = require('../modules');
const { ROLES, USER_STATUS, EMPLOYEE_STATUS, ERROR_MESSAGES, ROLE_PERMISSIONS } = require('../config/constant.config');
const mailService = require('./mail.service');

class UserService {
    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User object
     */
    async getUserById(userId) {
        const user = await User.findById(userId);
        
        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        return user;
    }

    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    async getProfile(userId) {
        const user = await User.findById(userId).select('-password -emailVerificationToken -passwordResetToken');
        
        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        return user;
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated user
     */
    async updateProfile(userId, updateData) {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
        
        // Filter only allowed fields
        const filteredData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: filteredData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        return user;
    }

    /**
     * Update employee profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Employee profile update data
     * @returns {Promise<Object>} Updated user
     */
    async updateEmployeeProfile(userId, updateData) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 403, message: 'Only employees can update employee profile' };
        }

        // Update nested employeeProfile fields
        const employeeProfileUpdates = {};
        Object.keys(updateData).forEach(key => {
            employeeProfileUpdates[`employeeProfile.${key}`] = updateData[key];
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: employeeProfileUpdates },
            { new: true, runValidators: true }
        ).select('-password');

        return updatedUser;
    }

    /**
     * Update user avatar
     * @param {string} userId - User ID
     * @param {Object} avatarData - Avatar URL and public ID
     * @returns {Promise<Object>} Updated user
     */
    async updateAvatar(userId, avatarData) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { avatar: avatarData } },
            { new: true }
        ).select('-password');

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        return user;
    }

    /**
     * Get all users (Admin only)
     * @param {Object} queryParams - Query parameters for pagination and filtering
     * @returns {Promise<Object>} Users list with pagination
     */
    async getAllUsers(queryParams) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = '',
            role,
            status
        } = queryParams;

        // Build query
        const query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Execute query
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password -emailVerificationToken -passwordResetToken')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        return {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create user (Admin only)
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    async createUser(userData) {
        const { email, role } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw { statusCode: 409, message: ERROR_MESSAGES.USER_ALREADY_EXISTS };
        }

        // Set permissions based on role
        userData.permissions = ROLE_PERMISSIONS[role];
        userData.status = USER_STATUS.ACTIVE;
        userData.isEmailVerified = true; // Admin-created users are auto-verified

        // Set employee profile if employee
        if (role === ROLES.EMPLOYEE) {
            userData.employeeProfile = {
                status: EMPLOYEE_STATUS.APPROVED, // Admin-created employees are auto-approved
                serviceCategories: userData.serviceCategories || [],
                experience: userData.experience || 0
            };
        }

        const user = await User.create(userData);

        const userResponse = user.toObject();
        delete userResponse.password;

        return userResponse;
    }

    /**
     * Update user by Admin
     * @param {string} userId - User ID to update
     * @param {Object} updateData - Update data
     * @param {string} adminId - Admin performing the action
     * @returns {Promise<Object>} Updated user
     */
    async updateUserByAdmin(userId, updateData, adminId) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        // Prevent admin from changing their own role
        if (userId === adminId && updateData.role && updateData.role !== user.role) {
            throw { statusCode: 400, message: 'You cannot change your own role' };
        }

        // Allowed fields for admin to update
        const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'address', 'role', 'status'];
        
        // Filter only allowed fields
        Object.keys(updateData).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = updateData[key];
            }
        });

        // If role is being changed to employee, set up employee profile
        if (updateData.role === ROLES.EMPLOYEE && !user.employeeProfile) {
            user.employeeProfile = {
                status: EMPLOYEE_STATUS.PENDING,
                serviceCategories: [],
                experience: 0
            };
        }

        // If employee profile status is being updated
        if (updateData.employeeStatus && user.role === ROLES.EMPLOYEE) {
            user.employeeProfile = user.employeeProfile || {};
            user.employeeProfile.status = updateData.employeeStatus;
        }

        // Update permissions based on new role if role changed
        if (updateData.role) {
            user.permissions = ROLE_PERMISSIONS[updateData.role];
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return userResponse;
    }

    /**
     * Block user (Admin only)
     * @param {string} userId - User ID to block
     * @param {string} adminId - Admin performing the action
     * @returns {Promise<Object>} Updated user
     */
    async blockUser(userId, adminId) {
        if (userId === adminId) {
            throw { statusCode: 400, message: 'You cannot block yourself' };
        }

        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        // Prevent blocking other admins
        if (user.role === ROLES.ADMIN) {
            throw { statusCode: 403, message: 'Cannot block another admin' };
        }

        user.status = USER_STATUS.BLOCKED;
        await user.save();

        return { message: 'User blocked successfully', user };
    }

    /**
     * Unblock user (Admin only)
     * @param {string} userId - User ID to unblock
     * @returns {Promise<Object>} Updated user
     */
    async unblockUser(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.status !== USER_STATUS.BLOCKED) {
            throw { statusCode: 400, message: 'User is not blocked' };
        }

        user.status = USER_STATUS.ACTIVE;
        await user.save();

        return { message: 'User unblocked successfully', user };
    }

    /**
     * Delete user (Admin only)
     * @param {string} userId - User ID to delete
     * @param {string} adminId - Admin performing the action
     * @returns {Promise<Object>} Deletion result
     */
    async deleteUser(userId, adminId) {
        if (userId === adminId) {
            throw { statusCode: 400, message: 'You cannot delete yourself' };
        }

        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        // Prevent deleting other admins
        if (user.role === ROLES.ADMIN) {
            throw { statusCode: 403, message: 'Cannot delete another admin' };
        }

        await User.findByIdAndDelete(userId);

        return { message: 'User deleted successfully' };
    }

    /**
     * Approve employee (Admin only)
     * @param {string} userId - Employee user ID
     * @returns {Promise<Object>} Updated user
     */
    async approveEmployee(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'User is not an employee' };
        }

        if (user.employeeProfile.status === EMPLOYEE_STATUS.APPROVED) {
            throw { statusCode: 400, message: 'Employee is already approved' };
        }

        user.employeeProfile.status = EMPLOYEE_STATUS.APPROVED;
        user.status = USER_STATUS.ACTIVE;
        await user.save();

        // Send approval email
        await mailService.sendEmployeeApprovalEmail(user.email, user.firstName, true);

        return { message: 'Employee approved successfully', user };
    }

    /**
     * Reject employee application (Admin only)
     * @param {string} userId - Employee user ID
     * @param {string} reason - Rejection reason
     * @returns {Promise<Object>} Updated user
     */
    async rejectEmployee(userId, reason) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'User is not an employee' };
        }

        user.employeeProfile.status = EMPLOYEE_STATUS.REJECTED;
        await user.save();

        // Send rejection email
        await mailService.sendEmployeeApprovalEmail(user.email, user.firstName, false, reason);

        return { message: 'Employee application rejected', user };
    }

    /**
     * Suspend employee (Admin only)
     * @param {string} userId - Employee user ID
     * @param {string} reason - Suspension reason
     * @returns {Promise<Object>} Updated user
     */
    async suspendEmployee(userId, reason) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'User is not an employee' };
        }

        user.employeeProfile.status = EMPLOYEE_STATUS.SUSPENDED;
        await user.save();

        return { message: 'Employee suspended successfully', user };
    }

    /**
     * Get pending employees for approval (Admin only)
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} List of pending employees
     */
    async getPendingEmployees(queryParams) {
        const { page = 1, limit = 10 } = queryParams;
        const skip = (page - 1) * limit;

        // Show employees who have at least one document with status 'pending'
        const query = {
            role: ROLES.EMPLOYEE,
            'employeeProfile.documents': {
                $elemMatch: { status: 'pending' }
            }
        };

        const [employees, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get active employees (for customers to browse)
     * @param {Object} queryParams - Query parameters
     * @returns {Promise<Object>} List of active employees
     */
    async getActiveEmployees(queryParams) {
        const {
            page = 1,
            limit = 10,
            category,
            minRating,
            search
        } = queryParams;

        const query = {
            role: ROLES.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
            'employeeProfile.status': EMPLOYEE_STATUS.APPROVED,
            'employeeProfile.availability.isAvailable': true
        };

        if (category) {
            query['employeeProfile.serviceCategories'] = category;
        }

        if (minRating) {
            query['employeeProfile.rating.average'] = { $gte: parseFloat(minRating) };
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { 'employeeProfile.bio': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            User.find(query)
                .select('firstName lastName avatar employeeProfile.serviceCategories employeeProfile.rating employeeProfile.experience employeeProfile.hourlyRate employeeProfile.bio employeeProfile.completedJobs')
                .sort({ 'employeeProfile.rating.average': -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        return {
            employees,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Upload verification documents (Employee only)
     * @param {string} userId - Employee user ID
     * @param {Array} files - Array of uploaded files
     * @param {Array} documentTypes - Array of document types corresponding to files
     * @returns {Promise<Object>} Upload result
     */
    async uploadDocuments(userId, files, documentTypes) {
        console.log('Starting document upload for user:', userId);
        console.log('Files received:', files.length);
        console.log('Document types:', documentTypes);
        
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 403, message: 'Only employees can upload verification documents' };
        }

        // Ensure employeeProfile exists with proper structure
        if (!user.employeeProfile) {
            console.log('Creating new employeeProfile for user');
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        employeeProfile: {
                            status: 'pending',
                            serviceCategories: [],
                            experience: 0,
                            hourlyRate: 0,
                            bio: '',
                            skills: [],
                            documents: [],
                            availability: {
                                isAvailable: false,
                                workingHours: { start: '09:00', end: '17:00' },
                                workingDays: []
                            },
                            rating: { average: 0, count: 0 },
                            completedJobs: 0
                        }
                    }
                },
                { runValidators: true }
            );
        }

        // Ensure documents array exists
        if (!user.employeeProfile || !user.employeeProfile.documents) {
            console.log('Initializing documents array for user');
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        'employeeProfile.documents': []
                    }
                },
                { runValidators: true }
            );
        }

        // Import cloudinary uploader
        const { cloudinary } = require('../config/cloudinary.config');
        
        const uploadedDocuments = [];
        const documentTypesList = Array.isArray(documentTypes) ? documentTypes : [documentTypes];

        // Validate files exist
        if (!files || files.length === 0) {
            throw { statusCode: 400, message: 'No files provided for upload' };
        }

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const documentType = documentTypesList[i] || 'other';

                // Validate file
                if (!file || !file.buffer) {
                    throw new Error(`Invalid file at index ${i}`);
                }

                // Upload to cloudinary
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'auto',
                            folder: `employees/${userId}/documents`,
                            allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx']
                        },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload error:', error);
                                reject(error);
                            } else {
                                console.log('Cloudinary upload success:', result.public_id);
                                resolve(result);
                            }
                        }
                    ).end(file.buffer);
                });

                const documentData = {
                    name: documentType,
                    docType: documentType,
                    url: result.secure_url,
                    publicId: result.public_id,
                    verified: false,
                    status: 'pending'
                    // uploadedAt will be set by default in schema
                };

                uploadedDocuments.push(documentData);
                console.log(`Document ${i + 1} processed:`, documentData.docType);
            }

            // Use $addToSet or $push to add documents to the array - this is safer than modifying and saving the entire document
            console.log('About to update user with documents:', JSON.stringify(uploadedDocuments, null, 2));

            try {
                const updateResult = await User.findByIdAndUpdate(
                    userId,
                    {
                        $push: {
                            'employeeProfile.documents': { $each: uploadedDocuments }
                        }
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                );

                if (!updateResult) {
                    throw new Error('User not found during document update');
                }

                console.log('Documents uploaded and saved successfully');
            } catch (saveError) {
                console.error('Error saving user with documents:', saveError);
                throw saveError;
            }

            // Get updated user to return correct document count
            const updatedUser = await User.findById(userId).select('employeeProfile.documents');
            console.log('Total documents for user:', updatedUser.employeeProfile.documents.length);

            return {
                message: 'Documents uploaded successfully',
                documents: uploadedDocuments,
                totalDocuments: updatedUser.employeeProfile.documents.length
            };
        } catch (error) {
            console.error('Upload documents error:', error);
            throw { statusCode: 500, message: 'Failed to upload documents: ' + error.message };
        }
    }

    /**
     * Get user's verification documents
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User documents
     */
    async getUserDocuments(userId) {
        const user = await User.findById(userId).select('role employeeProfile.documents');

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 403, message: 'Only employees can access verification documents' };
        }

        const documents = user.employeeProfile?.documents || [];
        console.log('Retrieved documents for user:', userId);
        console.log('Document count:', documents.length);
        console.log('Documents:', JSON.stringify(documents, null, 2));

        return {
            documents: documents
        };
    }

    /**
     * Delete verification document (Employee only)
     * @param {string} userId - Employee user ID
     * @param {string} documentId - Document ID to delete
     * @returns {Promise<Object>} Deletion result
     */
    async deleteDocument(userId, documentId) {
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 403, message: 'Only employees can delete verification documents' };
        }

        const documentIndex = user.employeeProfile.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            throw { statusCode: 404, message: 'Document not found' };
        }

        const document = user.employeeProfile.documents[documentIndex];

        // Delete from cloudinary
        const { deleteFromCloudinary } = require('../config/cloudinary.config');
        if (document.publicId) {
            try {
                await deleteFromCloudinary(document.publicId);
            } catch (error) {
                console.error('Failed to delete document from cloudinary:', error);
            }
        }

        // Remove from user profile
        user.employeeProfile.documents.splice(documentIndex, 1);
        await user.save();

        return { message: 'Document deleted successfully' };
    }

    /**
     * Get employee documents (Admin only)
     * @param {string} userId - Employee user ID
     * @returns {Promise<Object>} Employee documents
     */
    async getEmployeeDocuments(userId) {
        const user = await User.findById(userId).select('firstName lastName email role employeeProfile.documents employeeProfile.status');

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'User is not an employee' };
        }

        return {
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            documents: user.employeeProfile?.documents || [],
            employeeStatus: user.employeeProfile?.status
        };
    }

    /**
     * Verify employee document (Admin only)
     * @param {string} documentId - Document ID
     * @param {string} action - 'verify' or 'reject'
     * @param {string} reason - Rejection reason
     * @param {Object} adminUser - Admin user performing the action
     * @returns {Promise<Object>} Verification result
     */
    async verifyDocument(userId, documentId, action, reason, adminUser) {
        // Find user by ID and verify they have this document
        const user = await User.findById(userId);

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        if (user.role !== ROLES.EMPLOYEE) {
            throw { statusCode: 400, message: 'User is not an employee' };
        }

        if (!user.employeeProfile || !user.employeeProfile.documents) {
            throw { statusCode: 404, message: 'Employee has no documents' };
        }

        const document = user.employeeProfile.documents.id(documentId);
        if (!document) {
            throw { statusCode: 404, message: 'Document not found' };
        }

        const verified = action === 'verify';
        document.verified = verified;
        document.status = verified ? 'approved' : 'rejected';
        if (!verified && reason) {
            document.rejectionReason = reason;
        }
        document.verifiedAt = new Date();
        document.verifiedBy = adminUser?.userId;

        await user.save();

        // Check if all required documents are approved and auto-approve employee
        const allDocuments = user.employeeProfile.documents;
        const allApproved = allDocuments.length > 0 && allDocuments.every(doc => doc.status === 'approved');
        const anyRejected = allDocuments.some(doc => doc.status === 'rejected');

        // Update employee status based on document verification
        if (allApproved && user.employeeProfile.status === EMPLOYEE_STATUS.PENDING) {
            user.employeeProfile.status = EMPLOYEE_STATUS.APPROVED;
            user.status = USER_STATUS.ACTIVE;
            await user.save();
        }

        return {
            document,
            allDocumentsApproved: allApproved,
            message: `Document ${verified ? 'verified' : 'rejected'} successfully`
        };
    }
}

module.exports = new UserService();
