/**
 * Debug and Fix User Permissions Script
 * This script will check and fix permission issues for employees
 */

const mongoose = require('mongoose');
const { User } = require('./modules');
const { ROLES, ROLE_PERMISSIONS } = require('./config/constant.config');
require('dotenv').config();

async function checkAndFixUserPermissions() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URL + process.env.MONGODB_NAME || 'mongodb://localhost:27017/home-service';
        await mongoose.connect(mongoUri);
        console.log('[DB] Connected to MongoDB');

        // Find the employee user
        const employeeEmail = 'ram.plumber@example.com';
        const employee = await User.findOne({ email: employeeEmail });

        if (!employee) {
            console.log('[ERROR] Employee not found with email:', employeeEmail);
            return;
        }

        console.log('\n[DATA] Current Employee Data:');
        console.log('ID:', employee._id);
        console.log('Name:', employee.firstName, employee.lastName);
        console.log('Email:', employee.email);
        console.log('Role:', employee.role);
        console.log('Status:', employee.status);
        console.log('Current Permissions:', employee.permissions);
        console.log('Expected Permissions for Employee:', ROLE_PERMISSIONS[ROLES.EMPLOYEE]);

        // Check if permissions are missing or incorrect
        const expectedPermissions = ROLE_PERMISSIONS[ROLES.EMPLOYEE];
        const hasCorrectPermissions = expectedPermissions.every(perm => 
            employee.permissions && employee.permissions.includes(perm)
        );

        if (!hasCorrectPermissions || !employee.permissions || employee.permissions.length === 0) {
            console.log('\n[FIX] Fixing permissions...');
            
            // Update user with correct permissions
            await User.findByIdAndUpdate(employee._id, {
                role: ROLES.EMPLOYEE,
                permissions: expectedPermissions,
                status: 'active'
            });

            console.log('[OK] Permissions updated successfully!');
            
            // Verify the update
            const updatedEmployee = await User.findById(employee._id);
            console.log('\n[DATA] Updated Employee Data:');
            console.log('Role:', updatedEmployee.role);
            console.log('Permissions:', updatedEmployee.permissions);
        } else {
            console.log('[OK] Employee permissions are already correct!');
        }

        // Check all employees
        console.log('\n[CHECK] Checking all employees...');
        const allEmployees = await User.find({ role: ROLES.EMPLOYEE });
        
        for (const emp of allEmployees) {
            const hasCorrectPerms = expectedPermissions.every(perm => 
                emp.permissions && emp.permissions.includes(perm)
            );
            
            if (!hasCorrectPerms) {
                console.log(`[FIX] Fixing permissions for: ${emp.email}`);
                await User.findByIdAndUpdate(emp._id, {
                    permissions: expectedPermissions
                });
                console.log(`[OK] Fixed permissions for: ${emp.email}`);
            } else {
                console.log(`[OK] ${emp.email} has correct permissions`);
            }
        }

    } catch (error) {
        console.error('[ERROR] Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n[DB] Database connection closed');
    }
}

// Run the script
checkAndFixUserPermissions();