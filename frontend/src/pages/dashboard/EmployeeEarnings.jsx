/**
 * Employee Earnings Page
 * Calculates earning summary from completed jobs
 */

import { useEffect, useMemo, useState } from 'react';
import { FiDollarSign, FiRefreshCw, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
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
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading earnings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Earnings</h1>
                    <p className="text-gray-600">Income summary from completed jobs</p>
                </div>
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={fetchCompletedJobs}
                >
                    <FiRefreshCw /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">{formatMoney(metrics.totalEarned)}</p>
                    <FiDollarSign className="mt-3 text-green-500" />
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">{formatMoney(metrics.monthEarned)}</p>
                    <FiTrendingUp className="mt-3 text-blue-500" />
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Completed Jobs</p>
                    <p className="text-2xl font-bold text-gray-800">{metrics.totalJobs}</p>
                    <FiCheckCircle className="mt-3 text-gray-500" />
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Average per Job</p>
                    <p className="text-2xl font-bold text-purple-600">{formatMoney(metrics.avgPerJob)}</p>
                    <FiDollarSign className="mt-3 text-purple-500" />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Recent Completed Jobs</h2>
                </div>

                {jobs.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No completed jobs yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-5 py-3 font-medium">Date</th>
                                    <th className="text-left px-5 py-3 font-medium">Service</th>
                                    <th className="text-left px-5 py-3 font-medium">Customer</th>
                                    <th className="text-right px-5 py-3 font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.slice(0, 15).map((job) => {
                                    const amount = job.finalPrice || job.estimatedPrice || 0;
                                    return (
                                        <tr key={job._id} className="border-t border-gray-100">
                                            <td className="px-5 py-3 text-gray-700">
                                                {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3 text-gray-800 font-medium">{job.serviceCategory || 'Service'}</td>
                                            <td className="px-5 py-3 text-gray-700">
                                                {job.customer?.firstName} {job.customer?.lastName}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-green-600">
                                                {formatMoney(amount)}
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