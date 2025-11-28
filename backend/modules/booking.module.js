/**
 * Booking Model
 * Handles booking/appointment data between customers and employees
 */

const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constant.config');

const bookingSchema = new mongoose.Schema({
    // Customer who made the booking
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },

    // Employee/Service provider assigned to the booking
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Employee is required']
    },

    // Service category
    serviceCategory: {
        type: String,
        required: [true, 'Service category is required'],
        trim: true
    },

    // Service description
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // Booking date and time
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },

    // Simple time string (e.g., "10:00 AM")
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required']
    },

    // Estimated duration in hours
    estimatedDuration: {
        type: Number,
        default: 1,
        min: [0.5, 'Duration must be at least 30 minutes'],
        max: [24, 'Duration cannot exceed 24 hours']
    },

    // Simple address string
    serviceAddress: {
        type: String,
        required: [true, 'Service address is required']
    },

    // Customer phone for this booking
    customerPhone: {
        type: String
    },

    // Booking status
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.PENDING
    },

    // Status history for tracking changes
    statusHistory: [{
        status: {
            type: String,
            enum: Object.values(BOOKING_STATUS)
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],

    // Pricing
    estimatedPrice: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    finalPrice: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },

    // Payment details
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'esewa', 'khalti', 'card', 'bank_transfer'],
        default: 'cash'
    },
    paymentDetails: {
        transactionId: String,
        paidAt: Date,
        paidAmount: Number
    },

    // Cancellation details
    cancellation: {
        cancelledAt: Date,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String
    },

    // Completion details
    completedAt: Date,
    completionNotes: String,

    // Customer notes
    customerNotes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Employee notes
    employeeNotes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // Review reference (after completion)
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ customer: 1 });
bookingSchema.index({ employee: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });

// Virtual for booking reference number
bookingSchema.virtual('bookingRef').get(function() {
    return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual alias for address
bookingSchema.virtual('address').get(function() {
    return this.serviceAddress;
});

// Virtual for totalAmount alias
bookingSchema.virtual('totalAmount').get(function() {
    return this.finalPrice || this.estimatedPrice;
});

// Pre-save middleware to update status history
bookingSchema.pre('save', function(next) {
    if (this.isModified('status') && this.statusHistory) {
        this.statusHistory.push({
            status: this.status,
            changedAt: new Date()
        });
    }
    next();
});

// Static method to find bookings by customer
bookingSchema.statics.findByCustomer = function(customerId, options = {}) {
    const query = { customer: customerId };
    if (options.status) {
        query.status = options.status;
    }
    return this.find(query)
        .populate('employee', 'firstName lastName email phone avatar employeeProfile')
        .sort({ scheduledDate: -1 });
};

// Static method to find bookings by employee
bookingSchema.statics.findByEmployee = function(employeeId, options = {}) {
    const query = { employee: employeeId };
    if (options.status) {
        query.status = options.status;
    }
    return this.find(query)
        .populate('customer', 'firstName lastName email phone address')
        .sort({ scheduledDate: -1 });
};

// Method to confirm booking
bookingSchema.methods.confirm = async function(userId) {
    this.status = BOOKING_STATUS.CONFIRMED;
    this.statusHistory.push({
        status: BOOKING_STATUS.CONFIRMED,
        changedAt: new Date(),
        changedBy: userId
    });
    return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = async function(userId, reason) {
    this.status = BOOKING_STATUS.CANCELLED;
    this.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: userId,
        reason
    };
    this.statusHistory.push({
        status: BOOKING_STATUS.CANCELLED,
        changedAt: new Date(),
        changedBy: userId,
        notes: reason
    });
    return this.save();
};

// Method to mark as complete
bookingSchema.methods.complete = async function(userId, notes) {
    this.status = BOOKING_STATUS.COMPLETED;
    this.completedAt = new Date();
    this.completionNotes = notes;
    this.statusHistory.push({
        status: BOOKING_STATUS.COMPLETED,
        changedAt: new Date(),
        changedBy: userId,
        notes
    });
    return this.save();
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
