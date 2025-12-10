/**
 * Mail Service
 * Handles all email-related functionality using Nodemailer
 */

const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    /**
     * Initialize the mail transporter
     */
    initialize() {
        try {
            const config = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT, 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
            };

            this.transporter = nodemailer.createTransport(config);
            this.initialized = true;
            console.log('📧 Mail service initialized successfully');
        } catch (error) {
            console.error('❌ Mail service initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Verify transporter connection
     */
    async verify() {
        if (!this.initialized) {
            this.initialize();
        }

        try {
            await this.transporter.verify();
            console.log('✅ Mail server connection verified');
            return true;
        } catch (error) {
            console.error('❌ Mail server connection failed:', error.message);
            return false;
        }
    }

    /**
     * Send an email
     * @param {Object} options - Email options
     * @returns {Promise<Object>} Send result
     */
    async sendMail(options) {
        if (!this.initialized) {
            this.initialize();
        }

        const mailOptions = {
            from: `"Home Service Platform" <${process.env.SMTP_FROM}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📨 Email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send verification email
     * @param {string} email - Recipient email
     * @param {string} firstName - User's first name
     * @param {string} token - Verification token
     */
    async sendVerificationEmail(email, firstName, token) {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .button:hover { background: #5a67d8; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Home Service Platform!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${firstName},</h2>
                        <p>Thank you for registering with us! Please verify your email address to complete your registration.</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
            Hi ${firstName},
            
            Thank you for registering with Home Service Platform!
            
            Please verify your email address by clicking the link below:
            ${verificationUrl}
            
            This link will expire in 24 hours.
            
            If you didn't create an account, you can safely ignore this email.
            
            Best regards,
            Home Service Platform Team
        `;

        return await this.sendMail({
            to: email,
            subject: 'Verify Your Email - Home Service Platform',
            text,
            html
        });
    }

    /**
     * Send password reset email
     * @param {string} email - Recipient email
     * @param {string} firstName - User's first name
     * @param {string} token - Reset token
     */
    async sendPasswordResetEmail(email, firstName, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${firstName},</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This link will expire in 1 hour</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged until you create a new one</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `
            Hi ${firstName},
            
            We received a request to reset your password.
            
            Click the link below to create a new password:
            ${resetUrl}
            
            This link will expire in 1 hour.
            
            If you didn't request this reset, please ignore this email.
            Your password will remain unchanged until you create a new one.
            
            Best regards,
            Home Service Platform Team
        `;

        return await this.sendMail({
            to: email,
            subject: 'Password Reset Request - Home Service Platform',
            text,
            html
        });
    }

    /**
     * Send welcome email after verification
     * @param {string} email - Recipient email
     * @param {string} firstName - User's first name
     * @param {string} role - User's role
     */
    async sendWelcomeEmail(email, firstName, role) {
        let roleMessage = '';
        if (role === 'customer') {
            roleMessage = 'You can now browse services and book professionals for your home needs.';
        } else if (role === 'employee') {
            roleMessage = 'Your account is pending approval. Once approved, you can start accepting service requests.';
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Email Verified!</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome ${firstName}!</h2>
                        <p>Your email has been successfully verified. ${roleMessage}</p>
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/login" class="button">Go to Dashboard</a>
                        </p>
                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendMail({
            to: email,
            subject: 'Welcome to Home Service Platform!',
            html,
            text: `Welcome ${firstName}! Your email has been verified. ${roleMessage}`
        });
    }

    /**
     * Send employee approval notification
     * @param {string} email - Recipient email
     * @param {string} firstName - User's first name
     * @param {boolean} approved - Whether approved or rejected
     * @param {string} reason - Rejection reason (if rejected)
     */
    async sendEmployeeApprovalEmail(email, firstName, approved, reason = '') {
        const subject = approved 
            ? '🎉 Your Account Has Been Approved!' 
            : 'Account Application Update';

        const html = approved ? `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 15px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Congratulations!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${firstName},</h2>
                        <p>Great news! Your service provider account has been approved.</p>
                        <p>You can now start accepting service requests from customers in your area.</p>
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/employee/dashboard" class="button">Start Working</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ` : `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Application Update</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${firstName},</h2>
                        <p>We appreciate your interest in joining our platform. Unfortunately, we were unable to approve your application at this time.</p>
                        <div class="reason-box">
                            <strong>Reason:</strong>
                            <p>${reason || 'Your application did not meet our current requirements.'}</p>
                        </div>
                        <p>You may reapply after addressing the concerns mentioned above. If you have any questions, please contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Home Service Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendMail({
            to: email,
            subject,
            html,
            text: approved 
                ? `Hi ${firstName}, your service provider account has been approved!`
                : `Hi ${firstName}, unfortunately we couldn't approve your application. Reason: ${reason}`
        });
    }
}

// Export singleton instance
module.exports = new MailService();
