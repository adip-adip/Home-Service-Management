/**
 * Admin Bookings Page
 * Displays all bookings for admin with filtering and management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiCalendar, 
    FiClock, 
    FiEye, 
    FiAlertTriangle,
    FiChevronLeft,
    FiChevronRight,
    FiRefreshCw
} from 'react-icons/fi';
import { adminAPI } from '../../api';
import { useAuthStore } from '../../store';
import { Button } from '../../components/common';
import toast from 'react-hot-toast';

const AdminBookings = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const fetchBookings = useCallback(async (page = 1, status = '') => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (status) params.status = status;
            
            const response = await adminAPI.getAllBookings(params);
            setBookings(response.data.bookings || []);
            setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchBookings();
        }
    }, [isAuthenticated, fetchBookings]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchBookings(newPage, filter);
        }
    };

    const handleFilterChange = (status) => {
        setFilter(status);
        fetchBookings(1, status);
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            rejected: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !hasFetched.current) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">All Bookings</h1>
                <p className="text-gray-600">View and manage all platform bookings</p>
            </div>

            {/* Filter and Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <Button 
                    onClick={() => fetchBookings(pagination.page, filter)}
                    variant="outline"
                    disabled={loading}
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </Button>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FiCalendar className="mx-auto text-4xl mb-2 text-gray-300" />
                        <p>No bookings found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bookings.map((booking) => (
                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                                #{booking._id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div>
                                                    <p className="text-gray-800 font-medium">
                                                        {booking.customer?.firstName} {booking.customer?.lastName}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">{booking.customer?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {booking.employee ? (
                                                    <div>
                                                        <p className="text-gray-800 font-medium">
                                                            {booking.employee?.firstName} {booking.employee?.lastName}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">{booking.employee?.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {booking.service?.name || booking.serviceCategory || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {booking.status === 'completed' ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(booking.status)}`}>
                                                            {booking.status?.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                        <button
                                                            onClick={() => navigate(`/dashboard/booking/${booking._id}#review`)}
                                                            className="px-2 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                                            title="View customer review"
                                                        >
                                                            View Review
                                                        </button>
                                                        {booking.review?.rating < 2 && (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-full bg-red-100 text-red-700"
                                                                title="Low customer satisfaction rating"
                                                            >
                                                                <FiAlertTriangle className="text-red-600" />
                                                                Low Satisfaction
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(booking.status)}`}>
                                                        {booking.status?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <FiClock className="text-gray-400" />
                                                    {formatDate(booking.scheduledDate || booking.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/booking/${booking._id}`)}
                                                    className="text-blue-600 hover:text-blue-800 p-1"
                                                    title="View Details"
                                                >
                                                    <FiEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                    {pagination.total} bookings
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.pages}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminBookings;
