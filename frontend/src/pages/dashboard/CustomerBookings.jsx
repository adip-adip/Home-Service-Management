/**
 * Customer Bookings Page
 * Displays list of customer's bookings with filtering
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiCalendar, FiClock, FiUser, FiMapPin, 
    FiCheckCircle, FiXCircle, FiPlus, FiRefreshCw,
    FiFilter, FiStar
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const CustomerBookings = () => {
    const { isAuthenticated } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const hasFetched = useRef(false);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await bookingAPI.getMyBookings(params);
            setBookings(response.data?.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchBookings();
        }
    }, [isAuthenticated, fetchBookings]);

    useEffect(() => {
        if (hasFetched.current && filter) {
            fetchBookings();
        }
    }, [filter, fetchBookings]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        
        try {
            await bookingAPI.cancelBooking(bookingId, 'Cancelled by customer');
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    // Helper to normalize status (handle both in-progress and in_progress)
    const normalizeStatus = (status) => {
        if (status === 'in_progress') return 'in-progress';
        return status;
    };

    const getStatusColor = (status) => {
        const normalized = normalizeStatus(status);
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[normalized] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString || 'TBD';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
                    <p className="text-gray-600">Track and manage your service bookings</p>
                </div>
                <Link 
                    to="/dashboard/book-service" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiPlus /> Book Service
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
                {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((tab) => (
                    <button 
                        key={tab}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            filter === tab 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => setFilter(tab)}
                    >
                        {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiCalendar className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
                    <Link 
                        to="/dashboard/book-service" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiPlus /> Book Your First Service
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                                    {booking.status.replace('-', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">#{booking._id.slice(-8)}</span>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {booking.serviceCategory || 'Service'}
                                </h3>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiUser className="text-gray-400" />
                                        <span>{booking.employee?.fullName || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiCalendar className="text-gray-400" />
                                        <span>{formatDate(booking.scheduledDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiClock className="text-gray-400" />
                                        <span>{formatTime(booking.scheduledTime)}</span>
                                    </div>
                                    {booking.address && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FiMapPin className="text-gray-400" />
                                            <span className="truncate">{booking.address}</span>
                                        </div>
                                    )}
                                </div>

                                {booking.totalAmount && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-lg font-bold text-green-600">
                                            Rs. {booking.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 flex gap-2 flex-wrap">
                                <Link 
                                    to={`/dashboard/booking/${booking._id}`} 
                                    className="flex-1 px-3 py-2 text-center text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    View Details
                                </Link>
                                {['pending', 'confirmed'].includes(normalizeStatus(booking.status)) && (
                                    <button 
                                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                                        onClick={() => handleCancelBooking(booking._id)}
                                    >
                                        <FiXCircle /> Cancel
                                    </button>
                                )}
                                {/* Review button for completed bookings */}
                                {normalizeStatus(booking.status) === 'completed' && !booking.review && (
                                    <Link
                                        to={`/dashboard/booking/${booking._id}/review`}
                                        className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1"
                                    >
                                        <FiStar /> Review
                                    </Link>
                                )}
                                {/* Show reviewed badge */}
                                {normalizeStatus(booking.status) === 'completed' && booking.review && (
                                    <span className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg flex items-center gap-1">
                                        <FiCheckCircle /> Reviewed
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerBookings;
