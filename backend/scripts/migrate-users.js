/**
 * Database Migration Script
 * Fixes legacy 'user' roles to 'customer' and adds missing permissions
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/user.module');
const { ROLES, ROLE_PERMISSIONS, USER_STATUS } = require('../config/constant.config');

async function migrateLegacyUsers() {
    try {
        console.log('[MIGRATE] Starting legacy user migration...\n');

        const mongoURL = process.env.MONGODB_URL;
        const dbName = process.env.MONGODB_NAME;

        await mongoose.connect(mongoURL, { dbName });
        console.log('[OK] Connected to MongoDB\n');

        // Find users with role 'user' or null/undefined role
        const legacyUsers = await User.find({
            $or: [
                { role: 'user' },
                { role: null },
                { role: { $exists: false } }
            ]
        });

        console.log(`Found ${legacyUsers.length} users with legacy or missing roles\n`);

        for (const user of legacyUsers) {
            console.log(`Updating user: ${user.email}`);
            
            // Update to customer role
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    role: ROLES.CUSTOMER,
                    permissions: ROLE_PERMISSIONS[ROLES.CUSTOMER],
                    status: user.status || USER_STATUS.ACTIVE
                }
            });
        }

        console.log('\n[OK] Legacy users migrated to customer role\n');

        // Fix users missing firstName/lastName
        const usersWithoutNames = await User.find({
            $or: [
                { firstName: { $exists: false } },
                { lastName: { $exists: false } },
                { firstName: null },
                { lastName: null }
            ]
        });

        console.log(`Found ${usersWithoutNames.length} users without names\n`);

        for (const user of usersWithoutNames) {
            const emailName = user.email.split('@')[0];
            const firstName = user.firstName || emailName.charAt(0).toUpperCase() + emailName.slice(1);
            const lastName = user.lastName || 'User';
            
            await User.findByIdAndUpdate(user._id, {
                $set: { firstName, lastName }
            });
            console.log(`Updated name for: ${user.email} -> ${firstName} ${lastName}`);
        }

        // Summary
        console.log('\n[INFO] Migration Summary:');
        const roleDistribution = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log('Role distribution:', roleDistribution);

        await mongoose.disconnect();
        console.log('\n[OK] Migration completed successfully!');

    } catch (error) {
        console.error('[ERROR] Migration failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    migrateLegacyUsers();
}

module.exports = { migrateLegacyUsers };
