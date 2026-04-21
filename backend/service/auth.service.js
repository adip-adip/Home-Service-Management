/**
 * Auth Service
 * Handles all authentication-related business logic
 */

const crypto = require('crypto');
const { User, RefreshToken } = require('../modules');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utilitis/jwt.helper');
const mailService = require('./mail.service');
const { ROLES, USER_STATUS, EMPLOYEE_STATUS, ROLE_PERMISSIONS, ERROR_MESSAGES } = require('../config/constant.config');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user and tokens
     */
    async register(userData) {
        const { email, password, firstName, lastName, phone, role, serviceCategories, experience, bio } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw { statusCode: 409, message: ERROR_MESSAGES.USER_ALREADY_EXISTS };
        }

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Prepare user data
        const newUserData = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            phone,
            role: role || ROLES.CUSTOMER,
            permissions: ROLE_PERMISSIONS[role || ROLES.CUSTOMER],
            status: USER_STATUS.PENDING_VERIFICATION,
            emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
            emailVerificationExpires: verificationExpires
        };

        // Add employee-specific fields if role is employee
        if (role === ROLES.EMPLOYEE) {
            newUserData.employeeProfile = {
                status: EMPLOYEE_STATUS.PENDING,
                serviceCategories: serviceCategories || [],
                experience: experience || 0,
                bio: bio || ''
            };
        }

        // Create user
        const user = await User.create(newUserData);

        // Send verification email - track if it was initiated
        let emailInitiated = false;
        const emailPromise = mailService.sendVerificationEmail(user.email, user.firstName, verificationToken)
            .then(result => {
                emailInitiated = result.success;
                if (result.success) {
                    console.log('[OK] Verification email sent successfully');
                } else {
                    console.warn('[WARN] Verification email failed, but registration continues');
                }
            })
            .catch(error => {
                console.error('Email sending error:', error.message);
                emailInitiated = false;
            });

        // Return user without sensitive data
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.emailVerificationToken;
        delete userResponse.emailVerificationExpires;
        
        if (user.role !== ROLES.EMPLOYEE) {
            delete userResponse.employeeProfile;
        }

        // Wait for email to be initiated before returning
        await emailPromise;

        return {
            user: userResponse,
            message: 'Registration successful. Please check your email to verify your account.',
            emailSent: emailInitiated,
            requiresEmailVerification: true
        };
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Object} deviceInfo - Device information for token
     * @returns {Promise<Object>} User and tokens
     */
    async login(email, password, deviceInfo = {}) {
        // Find user with password
        const user = await User.findByEmailWithPassword(email.toLowerCase());

        if (!user) {
            throw { statusCode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };
        }

        // Check if account is locked
        if (user.isLocked) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            throw { 
                statusCode: 401, 
                message: `Account is locked. Try again in ${lockTimeRemaining} minutes.` 
            };
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            throw { statusCode: 401, message: ERROR_MESSAGES.INVALID_CREDENTIALS };
        }

        // Check user status
        if (user.status === USER_STATUS.BLOCKED) {
            throw { statusCode: 403, message: ERROR_MESSAGES.USER_BLOCKED };
        }

        if (user.status === USER_STATUS.PENDING_VERIFICATION) {
            throw { statusCode: 403, message: ERROR_MESSAGES.USER_NOT_VERIFIED };
        }

        // Check employee approval status - allow pending employees to log in so they can upload documents
        if (user.role === ROLES.EMPLOYEE) {
            if (user.employeeProfile?.status === EMPLOYEE_STATUS.SUSPENDED) {
                throw { statusCode: 403, message: 'Your account has been suspended. Please contact support.' };
            }
            if (user.employeeProfile?.status === EMPLOYEE_STATUS.REJECTED) {
                throw { statusCode: 403, message: 'Your application was rejected. Please contact support for details.' };
            }
            // PENDING employees are allowed to log in - they need to upload documents
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id,
            role: user.role,
            permissions: user.permissions
        });

        const refreshToken = generateRefreshToken();

        // Calculate refresh token expiry
        const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
        const expiresIn = this._parseExpiry(refreshExpiry);
        const expiresAt = new Date(Date.now() + expiresIn);

        // Store refresh token in database
        await RefreshToken.createToken(user._id, refreshToken, expiresAt, deviceInfo);

        // Prepare user response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        if (user.role !== ROLES.EMPLOYEE) {
            delete userResponse.employeeProfile;
        }

        return {
            user: userResponse,
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
        };
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @param {Object} deviceInfo - Device information
     * @returns {Promise<Object>} New tokens
     */
    async refreshToken(refreshToken, deviceInfo = {}) {
        // Find valid refresh token
        const tokenDoc = await RefreshToken.findValidToken(refreshToken);

        if (!tokenDoc) {
            throw { statusCode: 401, message: ERROR_MESSAGES.REFRESH_TOKEN_INVALID };
        }

        const user = tokenDoc.userId;

        // Check if user still exists and is active
        if (!user || user.status === USER_STATUS.BLOCKED) {
            await RefreshToken.revokeToken(refreshToken, 'security');
            throw { statusCode: 401, message: ERROR_MESSAGES.UNAUTHORIZED };
        }

        // Generate new tokens (Token Rotation)
        const newAccessToken = generateAccessToken({
            userId: user._id,
            role: user.role,
            permissions: user.permissions
        });

        const newRefreshToken = generateRefreshToken();

        // Calculate new expiry
        const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
        const expiresIn = this._parseExpiry(refreshExpiry);
        const expiresAt = new Date(Date.now() + expiresIn);

        // Rotate token (invalidate old, create new in same family)
        const rotatedToken = await RefreshToken.rotateToken(
            refreshToken,
            newRefreshToken,
            expiresAt,
            deviceInfo
        );

        if (!rotatedToken) {
            // Possible replay attack - token was already used
            throw { statusCode: 401, message: 'Session invalidated for security. Please login again.' };
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
        };
    }

    /**
     * Logout user
     * @param {string} refreshToken - Refresh token to revoke
     * @param {boolean} allDevices - Whether to logout from all devices
     * @param {string} userId - User ID (required if allDevices is true)
     */
    async logout(refreshToken, allDevices = false, userId = null) {
        if (allDevices && userId) {
            await RefreshToken.revokeAllUserTokens(userId, 'logout');
        } else if (refreshToken) {
            await RefreshToken.revokeToken(refreshToken, 'logout');
        }

        return { message: 'Logout successful' };
    }

    /**
     * Verify email
     * @param {string} token - Verification token
     * @returns {Promise<Object>} Verification result
     */
    async verifyEmail(token) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired verification token' };
        }

        // Update user status
        user.isEmailVerified = true;
        user.status = user.role === ROLES.EMPLOYEE ? USER_STATUS.PENDING_APPROVAL : USER_STATUS.ACTIVE;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email asynchronously
        mailService.sendWelcomeEmail(user.email, user.firstName, user.role).catch(error => {
            console.error('Welcome email sending failed:', error.message);
        });

        return {
            message: user.role === ROLES.EMPLOYEE
                ? 'Email verified successfully. Your account is pending admin approval.'
                : 'Email verified successfully. You can now login.',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            }
        };
    }

    /**
     * Resend verification email
     * @param {string} email - User email
     */
    async resendVerificationEmail(email) {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a verification link will be sent.' };
        }

        if (user.isEmailVerified) {
            throw { statusCode: 400, message: 'Email is already verified' };
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // Send verification email asynchronously
        mailService.sendVerificationEmail(user.email, user.firstName, verificationToken).catch(error => {
            console.error('Verification email sending failed:', error.message);
        });

        return { message: 'Verification email sent successfully' };
    }

    /**
     * Forgot password - send reset email
     * @param {string} email - User email
     */
    async forgotPassword(email) {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a password reset link will be sent.' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send reset email asynchronously
        mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken).catch(error => {
            console.error('Password reset email sending failed:', error.message);
        });

        return { message: 'Password reset email sent successfully' };
    }

    /**
     * Reset password
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     */
    async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw { statusCode: 400, message: 'Invalid or expired reset token' };
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = Date.now();
        
        // Reset login attempts and unlock account after password reset
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        
        await user.save();

        // Revoke all existing refresh tokens for security
        await RefreshToken.revokeAllUserTokens(user._id, 'password_change');

        return { message: 'Password reset successful. Please login with your new password.' };
    }

    /**
     * Change password (for logged in users)
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw { statusCode: 404, message: ERROR_MESSAGES.USER_NOT_FOUND };
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw { statusCode: 401, message: 'Current password is incorrect' };
        }

        // Update password
        user.password = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();

        // Revoke all refresh tokens except current session (optional: revoke all)
        await RefreshToken.revokeAllUserTokens(userId, 'password_change');

        return { message: 'Password changed successfully. Please login again.' };
    }

    /**
     * Get active sessions for user
     * @param {string} userId - User ID
     */
    async getActiveSessions(userId) {
        const sessions = await RefreshToken.getUserActiveSessions(userId);
        return { sessions };
    }

    /**
     * Revoke specific session
     * @param {string} userId - User ID
     * @param {string} sessionId - Session ID to revoke
     */
    async revokeSession(userId, sessionId) {
        const session = await RefreshToken.findOne({ _id: sessionId, userId });
        
        if (!session) {
            throw { statusCode: 404, message: 'Session not found' };
        }

        session.isRevoked = true;
        session.revokedAt = new Date();
        session.revokedReason = 'logout';
        await session.save();

        return { message: 'Session revoked successfully' };
    }

    /**
     * Parse expiry string to milliseconds
     * @private
     */
    _parseExpiry(expiry) {
        const units = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };

        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000; // Default 7 days
        }

        return parseInt(match[1]) * units[match[2]];
    }
}

module.exports = new AuthService();
