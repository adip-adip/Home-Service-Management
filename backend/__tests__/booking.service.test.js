/**
 * Booking Service Unit Tests
 */

jest.resetModules();

jest.mock('../modules', () => ({
    Booking: {
        find: jest.fn(() => ({
            populate: jest.fn(() => ({
                sort: jest.fn(() => ({ skip: jest.fn(() => ({ limit: jest.fn(() => Promise.resolve([])) })) }))
            })),
            findById: jest.fn(),
            create: jest.fn()
        })),
        countDocuments: jest.fn(() => Promise.resolve(10))
    },
    User: { findById: jest.fn() }
}));

jest.mock('../service/notification.service', () => ({
    notifyNewBooking: jest.fn().mockResolvedValue(true)
}));

jest.mock('../config/constant.config', () => ({
    BOOKING_STATUS: { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED' },
    ERROR_MESSAGES: { USER_NOT_FOUND: 'User not found' },
    ROLES: { EMPLOYEE: 'employee' },
    EMPLOYEE_STATUS: { APPROVED: 'approved' }
}));

const { Booking, User } = require('../modules');
const bookingService = require('../service/booking.service');

describe('BookingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Validation Tests', () => {
        const validData = {
            employee: 'employee_123',
            serviceCategory: 'cleaning',
            description: 'Home cleaning',
            scheduledDate: '2026-03-15',
            scheduledTime: '10:00',
            address: '123 Main St',
            estimatedDuration: 2
        };

        it('should throw 404 if customer not found', async () => {
            User.findById.mockResolvedValue(null);
            await expect(bookingService.createBooking(validData, 'invalid'))
                .rejects.toMatchObject({ statusCode: 404 });
        });

        it('should throw 404 if employee not found', async () => {
            User.findById
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce(null);
            await expect(bookingService.createBooking(validData, 'customer_123'))
                .rejects.toMatchObject({ statusCode: 404 });
        });

        it('should throw 400 if user is not employee', async () => {
            User.findById
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ role: 'customer' });
            await expect(bookingService.createBooking(validData, 'customer_123'))
                .rejects.toMatchObject({ statusCode: 400 });
        });

        it('should throw 400 if employee not approved', async () => {
            User.findById
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ role: 'employee', employeeProfile: { status: 'pending' } });
            await expect(bookingService.createBooking(validData, 'customer_123'))
                .rejects.toMatchObject({ statusCode: 400 });
        });

        it('should throw 400 if employee not available', async () => {
            User.findById
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ 
                    role: 'employee', 
                    employeeProfile: { status: 'approved', availability: { isAvailable: false } } 
                });
            await expect(bookingService.createBooking(validData, 'customer_123'))
                .rejects.toMatchObject({ statusCode: 400 });
        });

        it('should throw 400 if service category not offered', async () => {
            User.findById
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ 
                    role: 'employee', 
                    employeeProfile: { 
                        status: 'approved', 
                        serviceCategories: ['plumbing'],
                        availability: { isAvailable: true } 
                    } 
                });
            await expect(bookingService.createBooking(validData, 'customer_123'))
                .rejects.toMatchObject({ statusCode: 400 });
        });
    });
});