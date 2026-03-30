/**
 * Review Model
 * Handles customer reviews for completed bookings
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Booking reference
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required'],
        unique: true
    },

    // Customer who wrote the review
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required']
    },

    // Employee being reviewed
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Employee is required']
    },

    // Star rating (1-5)
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    // Review text
    text: {
        type: String,
        required: [true, 'Review text is required'],
        minlength: [10, 'Review must be at least 10 characters long'],
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },

    // Whether review is visible
    isPublished: {
        type: Boolean,
        default: true
    },

    // Admin moderation
    isApproved: {
        type: Boolean,
        default: true
    },
    moderationNotes: String,

}, { 
    timestamps: true
});

// Indexes (booking index is auto-created by unique: true)
reviewSchema.index({ customer: 1 });
reviewSchema.index({ employee: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save: Ensure unique review per booking
reviewSchema.pre('save', async function(next) {
    if (this.isNew) {
        const existing = await mongoose.model('Review').findOne({ booking: this.booking });
        if (existing) {
            throw new Error('Review already exists for this booking');
        }
    }
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
