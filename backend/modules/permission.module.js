/**
 * Permission Model
 * Manages granular permissions for authorization
 */

const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Permission name is required'],
        unique: true,
        trim: true
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    category: {
        type: String,
        required: [true, 'Permission category is required'],
        trim: true,
        enum: ['user_management', 'booking_management', 'service_management', 'payment_management', 'review_management', 'dashboard']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
permissionSchema.index({ category: 1 });
permissionSchema.index({ isActive: 1 });

// Static method to get permissions by category
permissionSchema.statics.getByCategory = function(category) {
    return this.find({ category, isActive: true });
};

// Static method to get all active permissions
permissionSchema.statics.getActivePermissions = function() {
    return this.find({ isActive: true });
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
