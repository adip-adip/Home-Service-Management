/**
 * Migration Script
 * Migrates all data from Search_Professional to Home_Service database
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function migrateData() {
    try {
        console.log('🔄 Starting migration from Search_Professional to Home_Service...\n');

        const client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const sourceDb = client.db('Search_Professional');
        const targetDb = client.db('Home_Service');

        // Get all users from source
        const sourceUsers = await sourceDb.collection('users').find({}).toArray();
        console.log(`📊 Found ${sourceUsers.length} users in Search_Professional`);

        // Get existing emails in target to avoid duplicates
        const existingUsers = await targetDb.collection('users').find({}, { projection: { email: 1 } }).toArray();
        const existingEmails = new Set(existingUsers.map(u => u.email));
        console.log(`📊 Existing users in Home_Service: ${existingEmails.size}\n`);

        // Migrate users
        let insertedCount = 0;
        for (const user of sourceUsers) {
            if (!existingEmails.has(user.email)) {
                // Remove _id to let MongoDB generate new one
                const { _id, ...userData } = user;
                await targetDb.collection('users').insertOne(userData);
                console.log(`  ✅ Migrated: ${user.email} (${user.role || 'customer'})`);
                insertedCount++;
            } else {
                console.log(`  ⏭️  Skipped (exists): ${user.email}`);
            }
        }

        console.log(`\n✅ Migrated ${insertedCount} new users`);

        // Get final count
        const finalCount = await targetDb.collection('users').countDocuments();
        console.log(`📊 Total users in Home_Service: ${finalCount}`);

        // Close connection
        await client.close();

        console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateData();
