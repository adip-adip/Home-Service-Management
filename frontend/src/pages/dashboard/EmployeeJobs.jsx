/**
 * Employee Jobs Page
 * Displays list of employee's assigned jobs with actions
 * Updated with premium theme styling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBriefcase, FiClock, FiUser, FiMapPin,
    FiCheckCircle, FiXCircle, FiRefreshCw, FiPlay,
    FiPhone, FiCalendar, FiChevronRight
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

    // Helper to normalize status (handle both in-progress and in_progress)
    const normalizeStatus = (status) => {
        if (status === 'in_progress') return 'in-progress';
        return status;
    };

    const getStatusColor = (status) => {
        const normalized = normalizeStatus(status);
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            confirmed: 'bg-brand-50 text-brand-700 border-brand-200',
            'in-progress': 'bg-violet-50 text-violet-700 border-violet-200',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
            rejected: 'bg-red-50 text-red-700 border-red-200'
        };
        return colors[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
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

    const filterTabs = [
        { key: 'all', label: 'All Jobs' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'in-progress', label: 'In Progress' },
        { key: 'completed', label: 'Completed' }
    ];

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500">Loading your jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Jobs</h1>
                    <p className="text-slate-500 mt-1">Manage your assigned service requests</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                    onClick={fetchJobs}
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === tab.key
                                ? 'bg-white text-brand-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                        }`}
                        onClick={() => setFilter(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FiBriefcase className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                    <p className="text-slate-500">You don't have any assigned jobs yet.</p>
                </div>
            ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-200 hover:shadow-lg transition-all card-lift flex flex-col h-full"
                        >
                            {/* Card Header */}
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border ${getStatusColor(job.status)}`}>
                                    {job.status.replace('-', ' ')}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">#{job._id.slice(-8)}</span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    {job.serviceCategory || 'Service'}
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiUser className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span>{job.customer?.fullName || 'Customer'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiPhone className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span>{job.customer?.phone || job.customerPhone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiCalendar className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span>{formatDate(job.scheduledDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FiClock className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span>{formatTime(job.scheduledTime)}</span>
                                    </div>
                                    {job.address && (
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FiMapPin className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="truncate">{job.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4">
                                    {job.totalAmount && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <span className="text-xl font-bold text-emerald-600">
                                                Rs. {job.totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {job.description && (
                                        <p className="mt-4 text-sm text-slate-500 line-clamp-2">
                                            {job.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-5 py-4 bg-slate-50 flex gap-2 flex-wrap border-t border-slate-100 mt-auto">
                                <Link
                                    to={`/dashboard/booking/${job._id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-white hover:border-slate-300 transition-colors"
                                >
                                    View Details
                                    <FiChevronRight className="w-4 h-4" />
                                </Link>

                                {normalizeStatus(job.status) === 'pending' && (
                                    <>
                                        <button
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                            onClick={() => handleAccept(job._id)}
                                        >
                                            <FiCheckCircle className="w-4 h-4" />
                                            Accept
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                            onClick={() => handleReject(job._id)}
                                        >
                                            <FiXCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {normalizeStatus(job.status) === 'confirmed' && (
                                    <button
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
                                        onClick={() => handleStart(job._id)}
                                    >
                                        <FiPlay className="w-4 h-4" />
                                        Start Job
                                    </button>
                                )}

                                {normalizeStatus(job.status) === 'in-progress' && (
                                    <button
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                        onClick={() => handleComplete(job._id)}
                                    >
                                        <FiCheckCircle className="w-4 h-4" />
                                        Complete
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
