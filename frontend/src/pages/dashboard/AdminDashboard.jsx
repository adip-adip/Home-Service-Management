/**
 * Admin Dashboard Component with Analytics Charts
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUsers,
    FiUserCheck,
    FiFileText,
    FiActivity,
    FiBarChart2,
    FiTrendingUp,
    FiAlertTriangle,
    FiCalendar,
    FiDollarSign
} from 'react-icons/fi';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../../api';
import { Button } from '../../components/common';
import { useAuthStore } from '../../store';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    useEffect(() => {
        if (isAuthenticated && user && !hasFetched.current) {
            hasFetched.current = true;
            fetchDashboardData();
        } else if (!isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsResponse, analyticsResponse] = await Promise.all([
                adminAPI.getDashboardStats(),
                adminAPI.getAnalytics()
            ]);
            setStats(statsResponse.data.stats);
            setAnalytics(analyticsResponse.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const adminCards = [
        {
            title: 'User Management',
            description: 'Manage users, block/unblock accounts',
            icon: <FiUsers />,
            action: () => navigate('/dashboard/users'),
            color: 'bg-blue-500'
        },
        {
            title: 'Employee Verification',
            description: 'Approve/reject employee applications',
            icon: <FiUserCheck />,
            action: () => navigate('/dashboard/document-verification'),
            color: 'bg-green-500'
        },
        {
            title: 'Document Management',
            description: 'Review employee documents',
            icon: <FiFileText />,
            action: () => navigate('/dashboard/document-verification'),
            color: 'bg-purple-500'
        },
        {
            title: 'All Bookings',
            description: 'View and manage all bookings',
            icon: <FiCalendar />,
            action: () => navigate('/dashboard/bookings'),
            color: 'bg-teal-500'
        }
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-600">Platform overview and analytics</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <FiAlertTriangle />
                    {error}
                </div>
            )}

            {/* Quick Stats Cards */}
            {stats && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FiUsers className="text-xl text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
                                <p className="text-sm text-gray-500">Total Users</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <FiUserCheck className="text-xl text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</h3>
                                <p className="text-sm text-gray-500">Verified Employees</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FiTrendingUp className="text-xl text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.pendingApprovals}</h3>
                                <p className="text-sm text-gray-500">Pending Approvals</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FiCalendar className="text-xl text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalBookings}</h3>
                                <p className="text-sm text-gray-500">Total Bookings</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Charts */}
            {analytics && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics</h2>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* User Registrations Line Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiTrendingUp className="text-blue-500" />
                                User Registrations (Last 6 Months)
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={analytics.userRegistrations}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                        name="New Users"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bookings Bar Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiBarChart2 className="text-green-500" />
                                Bookings by Month
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.bookingsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#10B981"
                                        radius={[4, 4, 0, 0]}
                                        name="Bookings"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Booking Status Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiActivity className="text-purple-500" />
                                Booking Status Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analytics.bookingStatusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {analytics.bookingStatusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* User Role Distribution Pie Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiUsers className="text-orange-500" />
                                User Role Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={analytics.userRoleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {analytics.userRoleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Revenue Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
                            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FiDollarSign className="text-emerald-500" />
                                Revenue by Month (Rs.)
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={analytics.bookingsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px'
                                        }}
                                        formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#059669"
                                        radius={[4, 4, 0, 0]}
                                        name="Revenue"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Service Categories */}
                        {analytics.topServiceCategories && analytics.topServiceCategories.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
                                <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <FiBarChart2 className="text-indigo-500" />
                                    Top Service Categories
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={analytics.topServiceCategories} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis type="number" stroke="#6B7280" fontSize={12} />
                                        <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={100} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="#6366F1"
                                            radius={[0, 4, 4, 0]}
                                            name="Bookings"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {adminCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={card.action}
                        >
                            <div className={`${card.color} p-4 text-white`}>
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-1">{card.title}</h3>
                                <p className="text-sm text-gray-500">{card.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={() => navigate('/dashboard/document-verification')}
                >
                    <FiUserCheck />
                    Review Pending Employees
                </Button>

                <Button
                    onClick={() => navigate('/dashboard/users')}
                    variant="outline"
                >
                    <FiUsers />
                    Manage Users
                </Button>

                <Button
                    onClick={() => {
                        hasFetched.current = false;
                        fetchDashboardData();
                    }}
                    variant="ghost"
                >
                    <FiActivity />
                    Refresh Data
                </Button>
            </div>
        </div>
    );
};

export default AdminDashboard;
