/**
 * Notification Model
 * Handles persistent notifications for users
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // User who receives the notification
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required'],
        index: true
    },

    // Notification type
    type: {
        type: String,
        enum: ['booking', 'document', 'review', 'employee', 'system'],
        required: [true, 'Notification type is required']
    },

    // Notification title
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },

    // Notification message
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },

    // Read status
    read: {
        type: Boolean,
        default: false,
        index: true
    },

    // Optional metadata for linking to related resources
    metadata: {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        link: String,
        extra: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
    if (!this.read) {
        this.read = true;
        return this.save();
    }
    return this;
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({ recipient: userId, read: false });
};

// Static method to get notifications for a user with pagination
notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
    const {
        page = 1,
        limit = 20,
        unreadOnly = false
    } = options;

    const query = { recipient: userId };
    if (unreadOnly) {
        query.read = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
    return this.updateMany(
        { recipient: userId, read: false },
        { read: true }
    );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
