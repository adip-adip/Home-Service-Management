/**
 * Auth Service Unit Tests
 */

const authService = require('../service/auth.service');
const { User, RefreshToken } = require('../modules');

jest.mock('../modules', () => ({
    User: {
        findOne: jest.fn(),
        findByEmailWithPassword: jest.fn(),
        findById: jest.fn(),
        create: jest.fn()
    },
    RefreshToken: {
        createToken: jest.fn(),
        findValidToken: jest.fn(),
        revokeToken: jest.fn(),
        revokeAllUserTokens: jest.fn(),
        rotateToken: jest.fn()
    }
}));

jest.mock('../utilitis/jwt.helper', () => ({
    generateAccessToken: jest.fn(() => 'mock_access_token'),
    generateRefreshToken: jest.fn(() => 'mock_refresh_token'),
    verifyToken: jest.fn()
}));

jest.mock('../service/mail.service', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../config/constant.config', () => ({
    ROLES: {
        CUSTOMER: 'customer',
        EMPLOYEE: 'employee',
        ADMIN: 'admin'
    },
    USER_STATUS: {
        PENDING_VERIFICATION: 'pending_verification',
        ACTIVE: 'active',
        BLOCKED: 'blocked',
        PENDING_APPROVAL: 'pending_approval'
    },
    EMPLOYEE_STATUS: {
        PENDING: 'pending',
        SUSPENDED: 'suspended',
        REJECTED: 'rejected'
    },
    ROLE_PERMISSIONS: {
        customer: ['read:services', 'create:bookings'],
        employee: ['read:booking', 'update:booking'],
        admin: ['*']
    },
    ERROR_MESSAGES: {
        USER_ALREADY_EXISTS: 'User already exists',
        INVALID_CREDENTIALS: 'Invalid credentials',
        USER_BLOCKED: 'User is blocked',
        USER_NOT_VERIFIED: 'Email not verified',
        REFRESH_TOKEN_INVALID: 'Invalid refresh token',
        UNAUTHORIZED: 'Unauthorized',
        USER_NOT_FOUND: 'User not found'
    }
}));

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new customer user', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890',
                role: 'customer'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'user_id_123',
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'customer',
                toObject: () => ({
                    _id: 'user_id_123',
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: 'customer'
                })
            });

            const result = await authService.register(userData);

            expect(User.findOne).toHaveBeenCalledWith({ email: userData.email.toLowerCase() });
            expect(User.create).toHaveBeenCalled();
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('message');
        });

        it('should throw error if user already exists', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe'
            };

            User.findOne.mockResolvedValue({ email: userData.email });

            await expect(authService.register(userData)).rejects.toEqual({
                statusCode: 409,
                message: 'User already exists'
            });
        });
    });

    describe('login', () => {
        it('should login with valid credentials', async () => {
            const mockUser = {
                _id: 'user_id_123',
                email: 'test@example.com',
                role: 'customer',
                status: 'active',
                isLocked: false,
                lockUntil: null,
                permissions: ['read:services', 'create:bookings'],
                comparePassword: jest.fn().mockResolvedValue(true),
                resetLoginAttempts: jest.fn(),
                toObject: () => ({
                    _id: 'user_id_123',
                    email: 'test@example.com',
                    role: 'customer',
                    status: 'active'
                })
            };

            User.findByEmailWithPassword.mockResolvedValue(mockUser);
            RefreshToken.createToken.mockResolvedValue({});

            const result = await authService.login('test@example.com', 'Password123!');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
        });

        it('should throw error for invalid credentials', async () => {
            const mockUser = {
                _id: 'user_id_123',
                email: 'test@example.com',
                isLocked: false,
                comparePassword: jest.fn().mockResolvedValue(false),
                incrementLoginAttempts: jest.fn()
            };

            User.findByEmailWithPassword.mockResolvedValue(mockUser);

            await expect(authService.login('test@example.com', 'WrongPassword')).rejects.toEqual({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        it('should throw error if account is locked', async () => {
            const mockUser = {
                _id: 'user_id_123',
                isLocked: true,
                lockUntil: new Date(Date.now() + 30 * 60 * 1000)
            };

            User.findByEmailWithPassword.mockResolvedValue(mockUser);

            await expect(authService.login('test@example.com', 'Password123!')).rejects.toEqual(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        it('should throw error if user is blocked', async () => {
            const mockUser = {
                _id: 'user_id_123',
                role: 'customer',
                status: 'blocked',
                isLocked: false,
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            User.findByEmailWithPassword.mockResolvedValue(mockUser);

            await expect(authService.login('test@example.com', 'Password123!')).rejects.toEqual({
                statusCode: 403,
                message: 'User is blocked'
            });
        });
    });

    describe('logout', () => {
        it('should logout single session', async () => {
            RefreshToken.revokeToken.mockResolvedValue({});

            const result = await authService.logout('refresh_token');

            expect(RefreshToken.revokeToken).toHaveBeenCalledWith('refresh_token', 'logout');
            expect(result).toHaveProperty('message');
        });

        it('should logout all devices', async () => {
            RefreshToken.revokeAllUserTokens.mockResolvedValue({});

            const result = await authService.logout(null, true, 'user_id_123');

            expect(RefreshToken.revokeAllUserTokens).toHaveBeenCalledWith('user_id_123', 'logout');
            expect(result).toHaveProperty('message');
        });
    });

    describe('verifyEmail', () => {
        it('should verify email with valid token', async () => {
            const mockUser = {
                _id: 'user_id_123',
                email: 'test@example.com',
                role: 'customer',
                isEmailVerified: false,
                status: 'pending_verification',
                emailVerificationToken: 'hashed_token',
                emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                save: jest.fn()
            };

            User.findOne.mockResolvedValue(mockUser);

            const result = await authService.verifyEmail('verification_token');

            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toHaveProperty('message');
        });

        it('should throw error for invalid token', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(authService.verifyEmail('invalid_token')).rejects.toEqual({
                statusCode: 400,
                message: 'Invalid or expired verification token'
            });
        });
    });

    describe('_parseExpiry', () => {
        it('should parse minutes correctly', () => {
            const result = authService._parseExpiry('15m');
            expect(result).toBe(15 * 60 * 1000);
        });

        it('should parse days correctly', () => {
            const result = authService._parseExpiry('7d');
            expect(result).toBe(7 * 24 * 60 * 60 * 1000);
        });

        it('should return default for invalid format', () => {
            const result = authService._parseExpiry('invalid');
            expect(result).toBe(7 * 24 * 60 * 60 * 1000);
        });
    });
});