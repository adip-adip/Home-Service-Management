/**
 * Refresh Token Model
 * Manages refresh tokens for JWT authentication
 * Tokens are hashed before storage for security
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    tokenHash: {
        type: String,
        required: [true, 'Token hash is required'],
        unique: true
    },
    tokenFamily: {
        type: String,
        required: true,
        index: true
    },
    deviceInfo: {
        userAgent: { type: String },
        ip: { type: String },
        device: { type: String },
        browser: { type: String },
        os: { type: String }
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    isRevoked: {
        type: Boolean,
        default: false,
        index: true
    },
    revokedAt: Date,
    revokedReason: {
        type: String,
        enum: ['logout', 'password_change', 'token_rotation', 'security', 'admin_action', 'expired']
    },
    replacedByTokenHash: String,
    usedAt: Date,
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for common queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ tokenFamily: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index - auto delete expired tokens

/**
 * Static method to hash a token
 * Uses SHA-256 for consistent hashing
 */
refreshTokenSchema.statics.hashToken = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Static method to create a new refresh token
 */
refreshTokenSchema.statics.createToken = async function(userId, token, expiresAt, deviceInfo = {}, tokenFamily = null) {
    const tokenHash = this.hashToken(token);
    
    return await this.create({
        userId,
        tokenHash,
        tokenFamily: tokenFamily || crypto.randomUUID(),
        deviceInfo,
        expiresAt
    });
};

/**
 * Static method to find valid token by hash
 */
refreshTokenSchema.statics.findValidToken = async function(token) {
    const tokenHash = this.hashToken(token);
    
    return await this.findOne({
        tokenHash,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    }).populate('userId');
};

/**
 * Static method to revoke a token
 */
refreshTokenSchema.statics.revokeToken = async function(token, reason = 'logout') {
    const tokenHash = this.hashToken(token);
    
    return await this.findOneAndUpdate(
        { tokenHash },
        {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: reason
        },
        { new: true }
    );
};

/**
 * Static method to revoke all tokens for a user
 */
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, reason = 'security') {
    return await this.updateMany(
        { userId, isRevoked: false },
        {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: reason
        }
    );
};

/**
 * Static method to revoke all tokens in a family (for token rotation security)
 */
refreshTokenSchema.statics.revokeTokenFamily = async function(tokenFamily, reason = 'security') {
    return await this.updateMany(
        { tokenFamily, isRevoked: false },
        {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: reason
        }
    );
};

/**
 * Static method to rotate token (invalidate old, record replacement)
 */
refreshTokenSchema.statics.rotateToken = async function(oldToken, newToken, expiresAt, deviceInfo = {}) {
    const oldTokenHash = this.hashToken(oldToken);
    const newTokenHash = this.hashToken(newToken);
    
    // Find the old token
    const oldTokenDoc = await this.findOne({ tokenHash: oldTokenHash });
    
    if (!oldTokenDoc) {
        return null;
    }
    
    // Check if token was already used (replay attack detection)
    if (oldTokenDoc.isRevoked) {
        // Potential replay attack - revoke entire token family
        await this.revokeTokenFamily(oldTokenDoc.tokenFamily, 'security');
        return null;
    }
    
    // Revoke old token and mark it as rotated
    await this.findOneAndUpdate(
        { tokenHash: oldTokenHash },
        {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'token_rotation',
            replacedByTokenHash: newTokenHash,
            usedAt: new Date(),
            $inc: { usageCount: 1 }
        }
    );
    
    // Create new token in the same family
    return await this.create({
        userId: oldTokenDoc.userId,
        tokenHash: newTokenHash,
        tokenFamily: oldTokenDoc.tokenFamily,
        deviceInfo,
        expiresAt
    });
};

/**
 * Static method to get active sessions for a user
 */
refreshTokenSchema.statics.getUserActiveSessions = async function(userId) {
    return await this.find({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    }).select('deviceInfo createdAt expiresAt usageCount');
};

/**
 * Static method to cleanup expired tokens
 */
refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
    return await this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isRevoked: true, revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 days old revoked tokens
        ]
    });
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
