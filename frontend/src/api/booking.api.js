/**
 * Booking API Service
 */

import api from './axios';

export const bookingAPI = {
    // Get public platform statistics (for homepage)
    getPublicStats: async () => {
        const response = await api.get('/services/public-stats');
        return response.data;
    },

    // Create a new booking
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // Get my bookings (customer)
    getMyBookings: async (params = {}) => {
        const response = await api.get('/bookings/my-bookings', { params });
        return response.data;
    },

    // Get my jobs (employee)
    getMyJobs: async (params = {}) => {
        const response = await api.get('/bookings/my-jobs', { params });
        return response.data;
    },

    // Get booking by ID
    getBooking: async (bookingId) => {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
    },

    // Get available employees for a service
    getAvailableEmployees: async (serviceCategory) => {
        const response = await api.get(`/bookings/available-employees/${serviceCategory}`);
        return response.data;
    },

    // Accept booking (employee)
    acceptBooking: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/accept`);
        return response.data;
    },

    // Reject booking (employee)
    rejectBooking: async (bookingId, reason) => {
        const response = await api.patch(`/bookings/${bookingId}/reject`, { reason });
        return response.data;
    },

    // Cancel booking
    cancelBooking: async (bookingId, reason) => {
        const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
        return response.data;
    },

    // Start booking (employee)
    startBooking: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/start`);
        return response.data;
    },

    // Complete booking (employee)
    completeBooking: async (bookingId, completionData) => {
        const response = await api.patch(`/bookings/${bookingId}/complete`, completionData);
        return response.data;
    },

    // Submit review (customer)
    submitReview: async (bookingId, reviewData) => {
        const response = await api.patch(`/bookings/${bookingId}/review`, reviewData);
        return response.data;
    },

    // Get employee reviews
    getEmployeeReviews: async (employeeId, params = {}) => {
        const response = await api.get(`/bookings/employee/${employeeId}/reviews`, { params });
        return response.data;
    }
};

export default bookingAPI;
