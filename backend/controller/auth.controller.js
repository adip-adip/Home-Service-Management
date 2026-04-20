/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */

const authService = require('../service/auth.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constant.config');

class AuthController {
    /**
     * Register new user
     * POST /auth/register
     */
    async register(req, res, next) {
        try {
            const result = await authService.register(req.body);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: result.message,
                data: {
                    user: result.user,
                    emailSent: result.emailSent,
                    requiresEmailVerification: result.requiresEmailVerification
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            // Get device info from request
            const deviceInfo = {
                userAgent: req.headers['user-agent'],
                ip: req.ip || req.connection.remoteAddress,
                device: req.headers['x-device-type'] || 'unknown',
                browser: req.headers['x-browser'] || 'unknown'
            };

            const result = await authService.login(email, password, deviceInfo);

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.LOGGED_IN,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresIn: result.expiresIn
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /auth/refresh
     */
    async refreshToken(req, res, next) {
        try {
            // Get refresh token from body or cookie
            const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const deviceInfo = {
                userAgent: req.headers['user-agent'],
                ip: req.ip || req.connection.remoteAddress
            };

            const result = await authService.refreshToken(refreshToken, deviceInfo);

            // Update refresh token cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresIn: result.expiresIn
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     * POST /auth/logout
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
            const { allDevices } = req.body;
            const userId = req.user?.userId;

            await authService.logout(refreshToken, allDevices, userId);

            // Clear refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.LOGGED_OUT
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify email
     * POST /auth/verify-email
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            const result = await authService.verifyEmail(token);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Resend verification email
     * POST /auth/resend-verification
     */
    async resendVerificationEmail(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.resendVerificationEmail(email);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Forgot password - send reset email
     * POST /auth/forgot-password
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset password
     * POST /auth/reset-password
     */
    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;
            const result = await authService.resetPassword(token, password);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password (for logged in users)
     * POST /auth/change-password
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            const result = await authService.changePassword(userId, currentPassword, newPassword);

            // Clear refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active sessions
     * GET /auth/sessions
     */
    async getActiveSessions(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await authService.getActiveSessions(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Revoke specific session
     * DELETE /auth/sessions/:sessionId
     */
    async revokeSession(req, res, next) {
        try {
            const userId = req.user.userId;
            const { sessionId } = req.params;

            const result = await authService.revokeSession(userId, sessionId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current authenticated user
     * GET /auth/me
     */
    async getCurrentUser(req, res, next) {
        try {
            const userService = require('../service/user.service');
            const user = await userService.getProfile(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
