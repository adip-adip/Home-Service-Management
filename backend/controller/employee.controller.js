/**
 * Employee Controller
 * Handles HTTP requests for employee-specific endpoints
 */

const userService = require('../service/user.service');
const { HTTP_STATUS } = require('../config/constant.config');

class EmployeeController {
    /**
     * Get employee dashboard data
     * GET /employee/dashboard
     */
    async getDashboard(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.userId);

            // TODO: Add job statistics, earnings data, etc.
            const dashboardData = {
                profile: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    status: user.employeeProfile.status
                },
                stats: {
                    completedJobs: user.employeeProfile.completedJobs || 0,
                    rating: user.employeeProfile.rating || { average: 0, count: 0 },
                    earnings: user.employeeProfile.earnings || { total: 0, pending: 0, withdrawn: 0 }
                },
                availability: user.employeeProfile.availability
            };

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get assigned jobs
     * GET /employee/jobs
     */
    async getAssignedJobs(req, res, next) {
        try {
            // TODO: Implement jobs model and service
            // For now, return placeholder
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    jobs: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get job by ID
     * GET /employee/jobs/:jobId
     */
    async getJobById(req, res, next) {
        try {
            // TODO: Implement job details
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: { job: null }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Accept job
     * PATCH /employee/jobs/:jobId/accept
     */
    async acceptJob(req, res, next) {
        try {
            // TODO: Implement job acceptance
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Job accepted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reject job
     * PATCH /employee/jobs/:jobId/reject
     */
    async rejectJob(req, res, next) {
        try {
            // TODO: Implement job rejection
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Job rejected successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update job status
     * PATCH /employee/jobs/:jobId/status
     */
    async updateJobStatus(req, res, next) {
        try {
            // TODO: Implement job status update
            const { status } = req.body;

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: `Job status updated to ${status}`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get earnings
     * GET /employee/earnings
     */
    async getEarnings(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.userId);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    earnings: user.employeeProfile.earnings || {
                        total: 0,
                        pending: 0,
                        withdrawn: 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update availability
     * PATCH /employee/availability
     */
    async updateAvailability(req, res, next) {
        try {
            const { isAvailable, workingHours, workingDays } = req.body;

            const updateData = { availability: {} };
            
            if (typeof isAvailable === 'boolean') {
                updateData.availability.isAvailable = isAvailable;
            }
            if (workingHours) {
                updateData.availability.workingHours = workingHours;
            }
            if (workingDays) {
                updateData.availability.workingDays = workingDays;
            }

            const user = await userService.updateEmployeeProfile(req.user.userId, updateData);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Availability updated successfully',
                data: { availability: user.employeeProfile.availability }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reviews
     * GET /employee/reviews
     */
    async getReviews(req, res, next) {
        try {
            // TODO: Implement reviews model and service
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: {
                    reviews: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new EmployeeController();
