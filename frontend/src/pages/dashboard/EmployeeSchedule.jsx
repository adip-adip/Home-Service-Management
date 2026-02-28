/**
 * Employee Schedule Page
 * Shows upcoming assigned jobs grouped by day
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiRefreshCw, FiUser } from 'react-icons/fi';
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
                    <p className="text-gray-600">Your upcoming jobs by day</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={fetchSchedule}
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                    <FiCalendar className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No scheduled jobs</h3>
                    <p className="text-gray-600">Your upcoming bookings will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {dayKeys.map((dayKey) => (
                        <div key={dayKey} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-semibold text-gray-800">{formatDate(dayKey)}</h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {groupedByDay[dayKey].map((job) => (
                                    <div key={job._id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-base font-semibold text-gray-800">{job.serviceCategory || 'Service'}</p>
                                            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                                                <span className="inline-flex items-center gap-1">
                                                    <FiClock className="text-gray-400" />
                                                    {job.scheduledTime || 'TBD'}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <FiUser className="text-gray-400" />
                                                    {job.customer?.firstName} {job.customer?.lastName}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    <FiMapPin className="text-gray-400" />
                                                    {job.serviceAddress || 'Address not available'}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/dashboard/booking/${job._id}`}
                                            className="inline-flex justify-center px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        >
                                            View Details
                                        </Link>
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