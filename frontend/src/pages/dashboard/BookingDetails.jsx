/**
 * Booking Details Page
 * Shows full details of a booking with actions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    FiArrowLeft, FiCalendar, FiClock, FiUser, FiMapPin, 
    FiPhone, FiMail, FiCheckCircle, FiXCircle, FiPlay,
    FiFileText, FiDollarSign, FiAlertCircle
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const BookingDetails = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    const fetchBooking = useCallback(async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.getBooking(bookingId);
            setBooking(response.data?.booking);
        } catch (error) {
            console.error('Failed to fetch booking:', error);
            toast.error('Failed to load booking details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [bookingId, navigate]);

    useEffect(() => {
        if (isAuthenticated && bookingId && !hasFetched.current) {
            hasFetched.current = true;
            fetchBooking();
        }
    }, [isAuthenticated, bookingId, fetchBooking]);

    const handleAccept = async () => {
        try {
            await bookingAPI.acceptBooking(bookingId);
            toast.success('Booking accepted');
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept');
        }
    };

    const handleReject = async () => {
        const reason = window.prompt('Reason for rejection:');
        if (!reason) return;
        try {
            await bookingAPI.rejectBooking(bookingId, reason);
            toast.success('Booking rejected');
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    const handleStart = async () => {
        try {
            await bookingAPI.startBooking(bookingId);
            toast.success('Job started');
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start');
        }
    };

    const handleComplete = async () => {
        const notes = window.prompt('Completion notes (optional):');
        try {
            await bookingAPI.completeBooking(bookingId, { notes });
            toast.success('Job completed!');
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await bookingAPI.cancelBooking(bookingId, 'Cancelled by user');
            toast.success('Booking cancelled');
            fetchBooking();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500',
            confirmed: 'bg-blue-500',
            'in-progress': 'bg-purple-500',
            completed: 'bg-green-500',
            cancelled: 'bg-gray-500',
            rejected: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isEmployee = user?.role === 'employee';
    const isCustomer = user?.role === 'customer';

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiAlertCircle className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking not found</h3>
                    <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft className="text-xl" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
                    <span className="text-gray-500">#{booking._id.slice(-8)}</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Status Banner */}
                <div className={`${getStatusColor(booking.status)} text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}>
                    <span className="text-lg font-semibold capitalize">
                        {booking.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm opacity-90">
                        Created: {formatDate(booking.createdAt)}
                    </span>
                </div>

                {/* Main Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">{booking.serviceCategory || 'Service'}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Schedule</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <FiCalendar className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="text-gray-800">{formatDate(booking.scheduledDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FiClock className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-500">Time</p>
                                        <p className="text-gray-800">{booking.scheduledTime || 'TBD'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FiMapPin className="text-gray-400 mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-gray-800">{booking.address || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">
                                {isEmployee ? 'Customer' : 'Service Provider'}
                            </h3>
                            {isEmployee ? (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FiUser className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="text-gray-800">{booking.customer?.fullName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiPhone className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-gray-800">{booking.customerPhone || booking.customer?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiMail className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-gray-800">{booking.customer?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <FiUser className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="text-gray-800">{booking.employee?.fullName || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiPhone className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-gray-800">{booking.employee?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {booking.description && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase mb-3">
                                <FiFileText /> Description
                            </h3>
                            <p className="text-gray-700">{booking.description}</p>
                        </div>
                    )}

                    {booking.totalAmount && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase mb-3">
                                <FiDollarSign /> Payment
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                Rs. {booking.totalAmount.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Status History */}
                {booking.statusHistory && booking.statusHistory.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status History</h3>
                        <div className="space-y-4">
                            {booking.statusHistory.map((history, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(history.status)}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-800 capitalize">{history.status}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(history.changedAt).toLocaleString()}
                                        </p>
                                        {history.notes && (
                                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    {/* Customer Actions */}
                    {isCustomer && ['pending', 'confirmed'].includes(booking.status) && (
                        <button 
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            onClick={handleCancel}
                        >
                            <FiXCircle /> Cancel Booking
                        </button>
                    )}

                    {/* Employee Actions */}
                    {isEmployee && booking.status === 'pending' && (
                        <>
                            <button 
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                onClick={handleAccept}
                            >
                                <FiCheckCircle /> Accept Job
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                onClick={handleReject}
                            >
                                <FiXCircle /> Reject Job
                            </button>
                        </>
                    )}

                    {isEmployee && booking.status === 'confirmed' && (
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            onClick={handleStart}
                        >
                            <FiPlay /> Start Job
                        </button>
                    )}

                    {isEmployee && booking.status === 'in-progress' && (
                        <button 
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            onClick={handleComplete}
                        >
                            <FiCheckCircle /> Complete Job
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
