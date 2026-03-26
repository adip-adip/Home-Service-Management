/**
 * Admin API Service
 */

import api from './axios';

export const adminAPI = {
    // Get dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data;
    },

    // Get analytics data for charts
    getAnalytics: async () => {
        const response = await api.get('/admin/dashboard/analytics');
        return response.data;
    },

    // Get all users
    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    // Get user by ID
    getUser: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data;
    },

    // Create user
    createUser: async (userData) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    // Update user
    updateUser: async (id, userData) => {
        const response = await api.put(`/admin/users/${id}`, userData);
        return response.data;
    },

    // Delete user
    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Get pending employees
    getPendingEmployees: async () => {
        const response = await api.get('/admin/employees/pending');
        return response.data;
    },

    // Approve employee
    approveEmployee: async (id) => {
        const response = await api.patch(`/admin/employees/${id}/approve`);
        return response.data;
    },

    // Reject employee
    rejectEmployee: async (id, reason) => {
        const response = await api.patch(`/admin/employees/${id}/reject`, { reason });
        return response.data;
    },

    // Block user
    blockUser: async (id) => {
        const response = await api.patch(`/admin/users/${id}/block`);
        return response.data;
    },

    // Unblock user
    unblockUser: async (id) => {
        const response = await api.patch(`/admin/users/${id}/unblock`);
        return response.data;
    },

    // Suspend employee
    suspendEmployee: async (id, reason) => {
        const response = await api.patch(`/admin/employees/${id}/suspend`, { reason });
        return response.data;
    },

    // Get employee documents
    getEmployeeDocuments: async (userId) => {
        const response = await api.get(`/admin/employees/${userId}/documents`);
        return response.data;
    },

    // Verify/reject employee document
    verifyDocument: async (userId, documentId, action, reason) => {
        const response = await api.patch(`/admin/employees/${userId}/documents/${documentId}/verify`, { action, reason });
        return response.data;
    },

    // Get all bookings (admin only)
    getAllBookings: async (params = {}) => {
        const response = await api.get('/admin/bookings', { params });
        return response.data;
    }
};

export default adminAPI;
