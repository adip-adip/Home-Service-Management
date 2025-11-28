/**
 * User Model
 * Handles user data with role-based access control
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS, EMPLOYEE_STATUS } = require('../config/constant.config');

const userSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    avatar: {
        url: { type: String, default: null },
        publicId: { type: String, default: null }
    },
    
    // Address Information
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'Nepal' },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },

    // Role and Permissions
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CUSTOMER
    },
    permissions: [{
        type: String
    }],

    // Account Status
    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.PENDING_VERIFICATION
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Employee Specific Fields
    employeeProfile: {
        status: {
            type: String,
            enum: Object.values(EMPLOYEE_STATUS),
            default: EMPLOYEE_STATUS.PENDING
        },
        serviceCategories: [{
            type: String
        }],
        experience: {
            type: Number,
            default: 0
        },
        hourlyRate: {
            type: Number,
            default: 0
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        skills: [{
            type: String
        }],
        availability: {
            isAvailable: { type: Boolean, default: true },
            workingHours: {
                start: { type: String, default: '09:00' },
                end: { type: String, default: '18:00' }
            },
            workingDays: [{
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            }]
        },
        documents: [{
            name: { type: String },
            docType: { type: String }, // Document type (id_card, license, certificate, etc.)
            url: { type: String },
            publicId: { type: String },
            verified: { type: Boolean, default: false },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            rejectionReason: { type: String },
            uploadedAt: { type: Date, default: Date.now },
            verifiedAt: { type: Date },
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],
        rating: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 }
        },
        completedJobs: {
            type: Number,
            default: 0
        },
        earnings: {
            total: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            withdrawn: { type: Number, default: 0 }
        }
    },

    // Login Tracking
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'employeeProfile.status': 1 });
userSchema.index({ 'employeeProfile.serviceCategories': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Update passwordChangedAt for existing users
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to check if user has any of the specified permissions
userSchema.methods.hasAnyPermission = function(permissions) {
    return permissions.some(permission => this.permissions.includes(permission));
};

// Method to check if user has all specified permissions
userSchema.methods.hasAllPermissions = function(permissions) {
    return permissions.every(permission => this.permissions.includes(permission));
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    // Reset attempts if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
        return;
    }

    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    await this.updateOne(updates);
};

// Virtual to check if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function() {
    await this.updateOne({
        $set: { loginAttempts: 0, lastLogin: Date.now() },
        $unset: { lockUntil: 1 }
    });
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
    return this.findOne({ email }).select('+password');
};

// Static method to find active employees
userSchema.statics.findActiveEmployees = function() {
    return this.find({
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        'employeeProfile.status': EMPLOYEE_STATUS.APPROVED
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
