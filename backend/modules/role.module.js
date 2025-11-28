/**
 * Role Model
 * Manages roles for RBAC
 */

const mongoose = require('mongoose');
const { ROLES } = require('../config/constant.config');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true,
        enum: Object.values(ROLES)
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
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isSystem: {
        type: Boolean,
        default: false // System roles cannot be deleted
    },
    level: {
        type: Number,
        default: 0 // Higher level = more privileges (admin = 100, employee = 50, customer = 10)
    }
}, {
    timestamps: true
});

// Indexes
roleSchema.index({ isActive: 1 });

// Static method to get role with permissions
roleSchema.statics.getRoleWithPermissions = function(roleName) {
    return this.findOne({ name: roleName, isActive: true }).populate('permissions');
};

// Static method to get all active roles
roleSchema.statics.getActiveRoles = function() {
    return this.find({ isActive: true }).populate('permissions');
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
