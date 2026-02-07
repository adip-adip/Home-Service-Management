/**
 * Employee Jobs Page
 * Displays list of employee's assigned jobs with actions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiBriefcase, FiClock, FiUser, FiMapPin, 
    FiCheckCircle, FiXCircle, FiRefreshCw, FiPlay,
    FiPhone, FiCalendar
} from 'react-icons/fi';
import { bookingAPI } from '../../api';
import { useAuthStore } from '../../store';
import toast from 'react-hot-toast';

const EmployeeJobs = () => {
    const { isAuthenticated } = useAuthStore();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const hasFetched = useRef(false);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const response = await bookingAPI.getMyJobs(params);
            setJobs(response.data?.bookings || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchJobs();
        }
    }, [isAuthenticated, fetchJobs]);

    useEffect(() => {
        if (hasFetched.current && filter) {
            fetchJobs();
        }
    }, [filter, fetchJobs]);

    const handleAccept = async (bookingId) => {
        try {
            await bookingAPI.acceptBooking(bookingId);
            toast.success('Job accepted successfully');
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept job');
        }
    };

    const handleReject = async (bookingId) => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        try {
            await bookingAPI.rejectBooking(bookingId, reason);
            toast.success('Job rejected');
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject job');
        }
    };

    const handleStart = async (bookingId) => {
        try {
            await bookingAPI.startBooking(bookingId);
            toast.success('Job started successfully');
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start job');
        }
    };

    const handleComplete = async (bookingId) => {
        const notes = window.prompt('Any completion notes? (optional)');
        try {
            await bookingAPI.completeBooking(bookingId, { notes });
            toast.success('Job completed successfully');
            fetchJobs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete job');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            'in-progress': 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
                    <p className="text-gray-600">Loading your jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
                    <p className="text-gray-600">Manage your assigned service requests</p>
                </div>
                <button 
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={fetchJobs}
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
                {['all', 'pending', 'confirmed', 'in-progress', 'completed'].map((tab) => (
                    <button 
                        key={tab}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            filter === tab 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => setFilter(tab)}
                    >
                        {tab === 'all' ? 'All Jobs' : tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiBriefcase className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
                    <p className="text-gray-600">You don't have any assigned jobs yet.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
                                    {job.status.replace('-', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">#{job._id.slice(-8)}</span>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    {job.serviceCategory || 'Service'}
                                </h3>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiUser className="text-gray-400" />
                                        <span>{job.customer?.fullName || 'Customer'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiPhone className="text-gray-400" />
                                        <span>{job.customer?.phone || job.customerPhone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiCalendar className="text-gray-400" />
                                        <span>{formatDate(job.scheduledDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiClock className="text-gray-400" />
                                        <span>{formatTime(job.scheduledTime)}</span>
                                    </div>
                                    {job.address && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <FiMapPin className="text-gray-400" />
                                            <span className="truncate">{job.address}</span>
                                        </div>
                                    )}
                                </div>

                                {job.totalAmount && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-lg font-bold text-green-600">
                                            Rs. {job.totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                {job.description && (
                                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                        {job.description}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 flex gap-2 flex-wrap">
                                <Link 
                                    to={`/dashboard/booking/${job._id}`} 
                                    className="px-3 py-2 text-center text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    View Details
                                </Link>
                                
                                {job.status === 'pending' && (
                                    <>
                                        <button 
                                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                            onClick={() => handleAccept(job._id)}
                                        >
                                            <FiCheckCircle /> Accept
                                        </button>
                                        <button 
                                            className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                                            onClick={() => handleReject(job._id)}
                                        >
                                            <FiXCircle /> Reject
                                        </button>
                                    </>
                                )}

                                {job.status === 'confirmed' && (
                                    <button 
                                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        onClick={() => handleStart(job._id)}
                                    >
                                        <FiPlay /> Start Job
                                    </button>
                                )}

                                {job.status === 'in-progress' && (
                                    <button 
                                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                        onClick={() => handleComplete(job._id)}
                                    >
                                        <FiCheckCircle /> Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeJobs;
