/**
 * Employee Earnings Page
 * Calculates earning summary from completed jobs
 * Updated with premium theme styling
 */

import { useEffect, useMemo, useState } from 'react';
import { FiDollarSign, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiAward } from 'react-icons/fi';
import { bookingAPI } from '../../api';
import toast from 'react-hot-toast';

const EmployeeEarnings = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCompletedJobs = async () => {
        try {
            setLoading(true);
            const response = await bookingAPI.getMyJobs({ status: 'completed', limit: 200 });
            setJobs(response.data?.bookings || []);
        } catch (error) {
            console.error('Failed to load earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedJobs();
    }, []);

    const metrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalEarned = 0;
        let monthEarned = 0;

        jobs.forEach((job) => {
            const amount = job.finalPrice || job.estimatedPrice || 0;
            totalEarned += amount;

            const completedDate = job.completedAt ? new Date(job.completedAt) : null;
            if (completedDate && completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear) {
                monthEarned += amount;
            }
        });

        return {
            totalJobs: jobs.length,
            totalEarned,
            monthEarned,
            avgPerJob: jobs.length ? totalEarned / jobs.length : 0
        };
    }, [jobs]);

    const formatMoney = (value) => {
        return `Rs. ${Number(value || 0).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-slate-500">Loading earnings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                    <p className="text-slate-500 mt-1">Income summary from completed jobs</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                    onClick={fetchCompletedJobs}
                >
                    <FiRefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500">Total Earned</p>
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <FiDollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{formatMoney(metrics.totalEarned)}</p>
                    <p className="text-xs text-slate-400 mt-2">All time earnings</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-brand-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500">This Month</p>
                        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                            <FiTrendingUp className="w-5 h-5 text-brand-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-brand-600">{formatMoney(metrics.monthEarned)}</p>
                    <p className="text-xs text-slate-400 mt-2">Current month</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500">Completed Jobs</p>
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                            <FiCheckCircle className="w-5 h-5 text-slate-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{metrics.totalJobs}</p>
                    <p className="text-xs text-slate-400 mt-2">Total completed</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-500">Average per Job</p>
                        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                            <FiAward className="w-5 h-5 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-violet-600">{formatMoney(metrics.avgPerJob)}</p>
                    <p className="text-xs text-slate-400 mt-2">Per job average</p>
                </div>
            </div>

            {/* Recent Completed Jobs Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Recent Completed Jobs</h2>
                </div>

                {jobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No completed jobs yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {jobs.slice(0, 15).map((job) => {
                                    const amount = job.finalPrice || job.estimatedPrice || 0;
                                    return (
                                        <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {new Date(job.completedAt || job.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-900">
                                                    {job.serviceCategory || 'Service'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {job.customer?.firstName} {job.customer?.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-semibold text-emerald-600">
                                                    {formatMoney(amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeEarnings;
