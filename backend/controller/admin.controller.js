/**
 * Admin Controller
 * Handles HTTP requests for admin-only endpoints
 */

const userService = require('../service/user.service');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../config/constant.config');

class AdminController {
    /**
     * Get all users
     * GET /admin/users
     */
    async getAllUsers(req, res, next) {
        try {
            const result = await userService.getAllUsers(req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by ID
     * GET /admin/users/:userId
     */
    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create new user
     * POST /admin/users
     */
    async createUser(req, res, next) {
        try {
            const user = await userService.createUser(req.body);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_CREATED,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user by admin
     * PUT /admin/users/:userId
     */
    async updateUser(req, res, next) {
        try {
            const user = await userService.updateUserByAdmin(
                req.params.userId,
                req.body,
                req.user.userId
            );

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_UPDATED || 'User updated successfully',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Block user
     * PATCH /admin/users/:userId/block
     */
    async blockUser(req, res, next) {
        try {
            const result = await userService.blockUser(req.params.userId, req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_BLOCKED,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unblock user
     * PATCH /admin/users/:userId/unblock
     */
    async unblockUser(req, res, next) {
        try {
            const result = await userService.unblockUser(req.params.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_UNBLOCKED,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete user
     * DELETE /admin/users/:userId
     */
    async deleteUser(req, res, next) {
        try {
            await userService.deleteUser(req.params.userId, req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_DELETED
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending employees
     * GET /admin/employees/pending
     */
    async getPendingEmployees(req, res, next) {
        try {
            const result = await userService.getPendingEmployees(req.query);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Approve employee
     * PATCH /admin/employees/:userId/approve
     */
    async approveEmployee(req, res, next) {
        try {
            const result = await userService.approveEmployee(req.params.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject employee
     * PATCH /admin/employees/:userId/reject
     */
    async rejectEmployee(req, res, next) {
        try {
            const { reason } = req.body;
            const result = await userService.rejectEmployee(req.params.userId, reason);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Suspend employee
     * PATCH /admin/employees/:userId/suspend
     */
    async suspendEmployee(req, res, next) {
        try {
            const { reason } = req.body;
            const result = await userService.suspendEmployee(req.params.userId, reason);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: result.message,
                data: { user: result.user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get employee documents for verification
     * GET /admin/employees/:userId/documents
     */
    async getEmployeeDocuments(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await userService.getEmployeeDocuments(userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify/reject employee document
     * PATCH /admin/employees/:userId/documents/:documentId/verify
     */
    async verifyDocument(req, res, next) {
        try {
            const { userId, documentId } = req.params;
            const { action, reason } = req.body;
            
            const result = await userService.verifyDocument(userId, documentId, action, reason, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: action === 'verify' ? SUCCESS_MESSAGES.DOCUMENT_VERIFIED : SUCCESS_MESSAGES.DOCUMENT_REJECTED,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get dashboard statistics
     * GET /admin/dashboard/stats
     */
    async getDashboardStats(req, res, next) {
        try {
            const { User, Booking } = require('../modules');
            const { ROLES, USER_STATUS, EMPLOYEE_STATUS } = require('../config/constant.config');

            const [
                totalUsers,
                totalCustomers,
                totalEmployees,
                pendingEmployees,
                blockedUsers,
                totalBookings
            ] = await Promise.all([
                User.countDocuments(),
                // Count only 'customer' role now since migration is done
                User.countDocuments({ role: ROLES.CUSTOMER }),
                User.countDocuments({ role: ROLES.EMPLOYEE, 'employeeProfile.status': EMPLOYEE_STATUS.APPROVED }),
                User.countDocuments({ role: ROLES.EMPLOYEE, 'employeeProfile.status': EMPLOYEE_STATUS.PENDING }),
                User.countDocuments({ status: USER_STATUS.BLOCKED }),
                Booking.countDocuments()
            ]);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    stats: {
                        totalUsers,
                        totalCustomers,
                        totalEmployees,
                        pendingApprovals: pendingEmployees,
                        pendingEmployees,
                        blockedUsers,
                        totalBookings
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get analytics data for charts
     * GET /admin/dashboard/analytics
     */
    async getAnalytics(req, res, next) {
        try {
            const { User, Booking } = require('../modules');
            const { ROLES, BOOKING_STATUS, EMPLOYEE_STATUS } = require('../config/constant.config');

            // Get date range for last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            sixMonthsAgo.setDate(1);
            sixMonthsAgo.setHours(0, 0, 0, 0);

            // User registrations by month (last 6 months)
            const userRegistrations = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // Bookings by month (last 6 months)
            const bookingsByMonth = await Booking.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: { $ifNull: ['$finalPrice', '$estimatedPrice'] } }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // Booking status distribution
            const bookingStatusCounts = await Booking.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // User role distribution
            const userRoleCounts = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Service category distribution (from bookings)
            const serviceCategoryCounts = await Booking.aggregate([
                {
                    $group: {
                        _id: '$serviceCategory',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ]);

            // Format month names
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const formatMonthlyData = (data) => {
                return data.map(item => ({
                    month: monthNames[item._id.month - 1],
                    year: item._id.year,
                    count: item.count,
                    revenue: item.revenue || 0
                }));
            };

            // Format status labels
            const formatStatusData = (data) => {
                return data.map(item => ({
                    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' ') : 'Unknown',
                    value: item.count
                }));
            };

            // Format role labels
            const formatRoleData = (data) => {
                return data.map(item => ({
                    name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : 'Unknown',
                    value: item.count
                }));
            };

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    userRegistrations: formatMonthlyData(userRegistrations),
                    bookingsByMonth: formatMonthlyData(bookingsByMonth),
                    bookingStatusDistribution: formatStatusData(bookingStatusCounts),
                    userRoleDistribution: formatRoleData(userRoleCounts),
                    topServiceCategories: serviceCategoryCounts.map(item => ({
                        name: item._id || 'Other',
                        value: item.count
                    }))
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();
