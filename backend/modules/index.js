/**
 * Models Index
 * Central export for all database models
 */

const User = require('./user.module');
const Role = require('./role.module');
const Permission = require('./permission.module');
const RefreshToken = require('./refreshToken.module');
const Booking = require('./booking.module');

module.exports = {
    User,
    Role,
    Permission,
    RefreshToken,
    Booking
};
