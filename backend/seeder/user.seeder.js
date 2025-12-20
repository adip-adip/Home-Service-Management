/**
 * User Seeder
 * Seeds initial admin user and sample data for development
 */

const mongoose = require('mongoose');
const { User, Role, Permission } = require('../modules');
const { ROLES, PERMISSIONS, ROLE_PERMISSIONS, USER_STATUS, EMPLOYEE_STATUS, PERMISSION_CATEGORIES } = require('../config/constant.config');

/**
 * Permission definitions with metadata
 */
const permissionDefinitions = [
    // User Management
    { name: PERMISSIONS.MANAGE_USERS, displayName: 'Manage Users', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Full access to user management' },
    { name: PERMISSIONS.CREATE_USER, displayName: 'Create User', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Create new users' },
    { name: PERMISSIONS.BLOCK_USER, displayName: 'Block User', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Block/unblock users' },
    { name: PERMISSIONS.DELETE_USER, displayName: 'Delete User', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Delete users from system' },
    { name: PERMISSIONS.APPROVE_EMPLOYEE, displayName: 'Approve Employee', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Approve employee applications' },
    { name: PERMISSIONS.SUSPEND_EMPLOYEE, displayName: 'Suspend Employee', category: PERMISSION_CATEGORIES.USER_MANAGEMENT, description: 'Suspend employee accounts' },

    // Booking Management
    { name: PERMISSIONS.VIEW_ALL_BOOKINGS, displayName: 'View All Bookings', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'View all system bookings' },
    { name: PERMISSIONS.CREATE_BOOKING, displayName: 'Create Booking', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'Create new bookings' },
    { name: PERMISSIONS.VIEW_OWN_BOOKINGS, displayName: 'View Own Bookings', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'View personal bookings' },
    { name: PERMISSIONS.CANCEL_BOOKING, displayName: 'Cancel Booking', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'Cancel bookings' },
    { name: PERMISSIONS.VIEW_ASSIGNED_JOBS, displayName: 'View Assigned Jobs', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'View jobs assigned to employee' },
    { name: PERMISSIONS.ACCEPT_JOB, displayName: 'Accept Job', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'Accept job assignments' },
    { name: PERMISSIONS.REJECT_JOB, displayName: 'Reject Job', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'Reject job assignments' },
    { name: PERMISSIONS.UPDATE_JOB_STATUS, displayName: 'Update Job Status', category: PERMISSION_CATEGORIES.BOOKING_MANAGEMENT, description: 'Update job progress status' },

    // Service Management
    { name: PERMISSIONS.MANAGE_SERVICES, displayName: 'Manage Services', category: PERMISSION_CATEGORIES.SERVICE_MANAGEMENT, description: 'Full service management access' },
    { name: PERMISSIONS.MANAGE_CATEGORIES, displayName: 'Manage Categories', category: PERMISSION_CATEGORIES.SERVICE_MANAGEMENT, description: 'Manage service categories' },
    { name: PERMISSIONS.VIEW_SERVICES, displayName: 'View Services', category: PERMISSION_CATEGORIES.SERVICE_MANAGEMENT, description: 'View available services' },
    { name: PERMISSIONS.VIEW_EMPLOYEES, displayName: 'View Employees', category: PERMISSION_CATEGORIES.SERVICE_MANAGEMENT, description: 'View employee profiles' },
    { name: PERMISSIONS.UPDATE_AVAILABILITY, displayName: 'Update Availability', category: PERMISSION_CATEGORIES.SERVICE_MANAGEMENT, description: 'Update availability status' },

    // Payment Management
    { name: PERMISSIONS.VIEW_ALL_PAYMENTS, displayName: 'View All Payments', category: PERMISSION_CATEGORIES.PAYMENT_MANAGEMENT, description: 'View all payment records' },
    { name: PERMISSIONS.VIEW_OWN_EARNINGS, displayName: 'View Own Earnings', category: PERMISSION_CATEGORIES.PAYMENT_MANAGEMENT, description: 'View personal earnings' },

    // Review Management
    { name: PERMISSIONS.CREATE_REVIEW, displayName: 'Create Review', category: PERMISSION_CATEGORIES.REVIEW_MANAGEMENT, description: 'Create service reviews' },
    { name: PERMISSIONS.UPDATE_REVIEW, displayName: 'Update Review', category: PERMISSION_CATEGORIES.REVIEW_MANAGEMENT, description: 'Update own reviews' },
    { name: PERMISSIONS.DELETE_REVIEW, displayName: 'Delete Review', category: PERMISSION_CATEGORIES.REVIEW_MANAGEMENT, description: 'Delete own reviews' },
    { name: PERMISSIONS.VIEW_OWN_REVIEWS, displayName: 'View Own Reviews', category: PERMISSION_CATEGORIES.REVIEW_MANAGEMENT, description: 'View reviews received' },

    // Dashboard
    { name: PERMISSIONS.ACCESS_ADMIN_DASHBOARD, displayName: 'Access Admin Dashboard', category: PERMISSION_CATEGORIES.DASHBOARD, description: 'Access admin dashboard' }
];

/**
 * Role definitions with metadata
 */
const roleDefinitions = [
    {
        name: ROLES.ADMIN,
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        level: 100,
        isSystem: true
    },
    {
        name: ROLES.EMPLOYEE,
        displayName: 'Service Provider',
        description: 'Service provider who can accept and complete jobs',
        level: 50,
        isSystem: true
    },
    {
        name: ROLES.CUSTOMER,
        displayName: 'Customer',
        description: 'Customer who can book services',
        level: 10,
        isSystem: true
    }
];

/**
 * Default admin user
 */
const defaultAdmin = {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@homeservice.com',
    password: 'Admin@123456',
    phone: '9800000000',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    isEmailVerified: true
};

/**
 * Sample employees for development
 */
const sampleEmployees = [
    {
        firstName: 'Ram',
        lastName: 'Sharma',
        email: 'ram.plumber@example.com',
        password: 'Employee@123',
        phone: '9801234567',
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        employeeProfile: {
            status: EMPLOYEE_STATUS.APPROVED,
            serviceCategories: ['plumbing'],
            experience: 5,
            hourlyRate: 500,
            bio: 'Experienced plumber with 5 years of experience in residential and commercial plumbing.',
            skills: ['Pipe repair', 'Leak detection', 'Water heater installation'],
            availability: {
                isAvailable: true,
                workingHours: { start: '08:00', end: '18:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            rating: { average: 4.5, count: 25 },
            completedJobs: 50
        }
    },
    {
        firstName: 'Sita',
        lastName: 'Thapa',
        email: 'sita.electrician@example.com',
        password: 'Employee@123',
        phone: '9807654321',
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        employeeProfile: {
            status: EMPLOYEE_STATUS.APPROVED,
            serviceCategories: ['electrical'],
            experience: 8,
            hourlyRate: 600,
            bio: 'Certified electrician specializing in home electrical repairs and installations.',
            skills: ['Wiring', 'Circuit repair', 'Panel upgrade', 'Lighting installation'],
            availability: {
                isAvailable: true,
                workingHours: { start: '09:00', end: '17:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            },
            rating: { average: 4.8, count: 42 },
            completedJobs: 85
        }
    },
    {
        firstName: 'Krishna',
        lastName: 'Karki',
        email: 'krishna.carpenter@example.com',
        password: 'Employee@123',
        phone: '9802345678',
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        employeeProfile: {
            status: EMPLOYEE_STATUS.APPROVED,
            serviceCategories: ['carpentry'],
            experience: 10,
            hourlyRate: 700,
            bio: 'Master carpenter with expertise in custom furniture and home renovations.',
            skills: ['Custom furniture', 'Door installation', 'Cabinet making', 'Wood repair'],
            availability: {
                isAvailable: true,
                workingHours: { start: '07:00', end: '16:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            rating: { average: 4.7, count: 38 },
            completedJobs: 120
        }
    },
    {
        firstName: 'Gita',
        lastName: 'Adhikari',
        email: 'gita.cleaner@example.com',
        password: 'Employee@123',
        phone: '9803456789',
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        employeeProfile: {
            status: EMPLOYEE_STATUS.APPROVED,
            serviceCategories: ['cleaning'],
            experience: 3,
            hourlyRate: 350,
            bio: 'Professional house cleaner offering thorough cleaning services for homes and offices.',
            skills: ['Deep cleaning', 'Kitchen cleaning', 'Bathroom sanitization', 'Window cleaning'],
            availability: {
                isAvailable: true,
                workingHours: { start: '08:00', end: '17:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            rating: { average: 4.6, count: 55 },
            completedJobs: 95
        }
    },
    {
        firstName: 'Rajesh',
        lastName: 'Lama',
        email: 'rajesh.painter@example.com',
        password: 'Employee@123',
        phone: '9804567890',
        role: ROLES.EMPLOYEE,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        employeeProfile: {
            status: EMPLOYEE_STATUS.APPROVED,
            serviceCategories: ['painting'],
            experience: 7,
            hourlyRate: 550,
            bio: 'Professional painter specializing in interior and exterior painting.',
            skills: ['Interior painting', 'Exterior painting', 'Texture work', 'Wallpaper installation'],
            availability: {
                isAvailable: true,
                workingHours: { start: '07:00', end: '18:00' },
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            },
            rating: { average: 4.9, count: 62 },
            completedJobs: 145
        }
    }
];

/**
 * Sample customers for development
 */
const sampleCustomers = [
    {
        firstName: 'Hari',
        lastName: 'Bahadur',
        email: 'hari@example.com',
        password: 'Customer@123',
        phone: '9812345678',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        address: {
            street: 'Kalanki',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
        }
    },
    {
        firstName: 'Maya',
        lastName: 'Gurung',
        email: 'maya.gurung@example.com',
        password: 'Customer@123',
        phone: '9813456789',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        address: {
            street: 'Thamel',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
        }
    },
    {
        firstName: 'Bijay',
        lastName: 'Tamang',
        email: 'bijay.tamang@example.com',
        password: 'Customer@123',
        phone: '9814567890',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        address: {
            street: 'New Road',
            city: 'Kathmandu',
            state: 'Bagmati',
            zipCode: '44600',
            country: 'Nepal'
        }
    },
    {
        firstName: 'Sunita',
        lastName: 'Rai',
        email: 'sunita.rai@example.com',
        password: 'Customer@123',
        phone: '9815678901',
        role: ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
        isEmailVerified: true,
        address: {
            street: 'Patan',
            city: 'Lalitpur',
            state: 'Bagmati',
            zipCode: '44700',
            country: 'Nepal'
        }
    }
];

/**
 * Seed permissions
 */
async function seedPermissions() {
    console.log('🔐 Seeding permissions...');

    for (const permission of permissionDefinitions) {
        await Permission.findOneAndUpdate(
            { name: permission.name },
            permission,
            { upsert: true, new: true }
        );
    }

    console.log(`✅ ${permissionDefinitions.length} permissions seeded`);
}

/**
 * Seed roles with permissions
 */
async function seedRoles() {
    console.log('👥 Seeding roles...');

    for (const roleDef of roleDefinitions) {
        // Get permission IDs for this role
        const permissionNames = ROLE_PERMISSIONS[roleDef.name] || [];
        const permissions = await Permission.find({ name: { $in: permissionNames } }).select('_id');
        const permissionIds = permissions.map(p => p._id);

        await Role.findOneAndUpdate(
            { name: roleDef.name },
            { ...roleDef, permissions: permissionIds },
            { upsert: true, new: true }
        );
    }

    console.log(`✅ ${roleDefinitions.length} roles seeded`);
}

/**
 * Seed admin user
 */
async function seedAdmin() {
    console.log('👤 Seeding admin user...');

    const existingAdmin = await User.findOne({ email: defaultAdmin.email });
    
    if (existingAdmin) {
        console.log('ℹ️ Admin user already exists');
        return;
    }

    const adminData = {
        ...defaultAdmin,
        permissions: ROLE_PERMISSIONS[ROLES.ADMIN]
    };

    await User.create(adminData);
    console.log('✅ Admin user created');
    console.log(`   Email: ${defaultAdmin.email}`);
    console.log(`   Password: ${defaultAdmin.password}`);
}

/**
 * Seed sample data (for development only)
 */
async function seedSampleData() {
    if (process.env.NODE_ENV === 'production') {
        console.log('⚠️ Skipping sample data in production');
        return;
    }

    console.log('📦 Seeding sample data...');

    // Seed employees
    for (const employee of sampleEmployees) {
        const exists = await User.findOne({ email: employee.email });
        if (!exists) {
            await User.create({
                ...employee,
                permissions: ROLE_PERMISSIONS[ROLES.EMPLOYEE]
            });
            console.log(`   ✅ Employee created: ${employee.email}`);
        }
    }

    // Seed customers
    for (const customer of sampleCustomers) {
        const exists = await User.findOne({ email: customer.email });
        if (!exists) {
            await User.create({
                ...customer,
                permissions: ROLE_PERMISSIONS[ROLES.CUSTOMER]
            });
            console.log(`   ✅ Customer created: ${customer.email}`);
        }
    }

    console.log('✅ Sample data seeded');
}

/**
 * Main seeder function
 */
async function runSeeder() {
    try {
        console.log('\n🌱 Starting database seeder...\n');

        await seedPermissions();
        await seedRoles();
        await seedAdmin();
        await seedSampleData();

        console.log('\n🎉 Database seeding completed successfully!\n');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

/**
 * Run seeder as standalone script
 */
async function main() {
    require('dotenv').config();

    const mongoURL = process.env.MONGODB_URL;
    const dbName = process.env.MONGODB_NAME;

    if (!mongoURL) {
        console.error('❌ MONGODB_URL not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoURL, { dbName });
        console.log('✅ Connected to MongoDB');

        await runSeeder();

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = { runSeeder, seedAdmin, seedPermissions, seedRoles };

// Run if called directly
if (require.main === module) {
    main();
}
