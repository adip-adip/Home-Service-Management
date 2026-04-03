/**
 * Employee Schedule Page
 * Shows upcoming assigned jobs grouped by day
 * Updated with premium theme styling
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiRefreshCw, FiUser, FiChevronRight } from 'react-icons/fi';
import { bookingAPI } from '../../api';
import toast from 'react-hot-toast';

const EmployeeSchedule = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = async () => {
        try {
            setLoading(true);

            const [pendingRes, confirmedRes, inProgressRes] = await Promise.all([
                bookingAPI.getMyJobs({ status: 'pending', limit: 100 }),
                bookingAPI.getMyJobs({ status: 'confirmed', limit: 100 }),
                bookingAPI.getMyJobs({ status: 'in-progress', limit: 100 })
            ]);

            const all = [
                ...(pendingRes.data?.bookings || []),
                ...(confirmedRes.data?.bookings || []),
                ...(inProgressRes.data?.bookings || [])
            ];

            const uniqueJobs = Array.from(new Map(all.map((job) => [job._id, job])).values());
            uniqueJobs.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

            setJobs(uniqueJobs);
        } catch (error) {
            console.error('Failed to load schedule:', error);
            toast.error('Failed to load your schedule');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const groupedByDay = useMemo(() => {
        return jobs.reduce((acc, job) => {
            const dayKey = new Date(job.scheduledDate).toDateString();
            if (!acc[dayKey]) {
                acc[dayKey] = [];
            }
            acc[dayKey].push(job);
            return acc;
        }, {});
    }, [jobs]);

    const dayKeys = Object.keys(groupedByDay);

    const formatDate = (dateValue) => {
        return new Date(dateValue).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isTomorrow = (dateString) => {
        const date = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
    };

    const getDateLabel = (dateString) => {
        if (isToday(dateString)) return 'Today';
        if (isTomorrow(dateString)) return 'Tomorrow';
        return formatDate(dateString);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            confirmed: 'bg-brand-50 text-brand-700 border-brand-200',
            'in-progress': 'bg-violet-50 text-violet-700 border-violet-200',
            'in_progress': 'bg-violet-50 text-violet-700 border-violet-200'
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500">Loading schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
                    <p className="text-slate-500 mt-1">Your upcoming jobs by day</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                    onClick={fetchSchedule}
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Schedule Summary */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <FiCalendar className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-brand-100 text-sm font-medium">Upcoming Jobs</p>
                        <p className="text-3xl font-bold">{jobs.length}</p>
                    </div>
                </div>
            </div>

            {/* Schedule List */}
            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FiCalendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No scheduled jobs</h3>
                    <p className="text-slate-500">Your upcoming bookings will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {dayKeys.map((dayKey) => (
                        <div key={dayKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Day Header */}
                            <div className={`px-6 py-4 border-b border-slate-100 ${
                                isToday(dayKey) ? 'bg-brand-50' : 'bg-slate-50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {isToday(dayKey) && (
                                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                                    )}
                                    <h2 className={`font-semibold ${isToday(dayKey) ? 'text-brand-900' : 'text-slate-900'}`}>
                                        {getDateLabel(dayKey)}
                                    </h2>
                                    <span className="text-sm text-slate-500">
                                        {groupedByDay[dayKey].length} job{groupedByDay[dayKey].length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Jobs for the Day */}
                            <div className="divide-y divide-slate-100">
                                {groupedByDay[dayKey].map((job) => (
                                    <div
                                        key={job._id}
                                        className="p-5 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-base font-semibold text-slate-900">
                                                        {job.serviceCategory || 'Service'}
                                                    </h3>
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${getStatusColor(job.status)}`}>
                                                        {job.status.replace('-', ' ').replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                                    <span className="inline-flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <FiClock className="w-3.5 h-3.5 text-slate-500" />
                                                        </div>
                                                        {job.scheduledTime || 'TBD'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <FiUser className="w-3.5 h-3.5 text-slate-500" />
                                                        </div>
                                                        {job.customer?.firstName} {job.customer?.lastName}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <FiMapPin className="w-3.5 h-3.5 text-slate-500" />
                                                        </div>
                                                        <span className="truncate max-w-[200px]">
                                                            {job.serviceAddress || 'Address not available'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/dashboard/booking/${job._id}`}
                                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                                            >
                                                View Details
                                                <FiChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmployeeSchedule;
