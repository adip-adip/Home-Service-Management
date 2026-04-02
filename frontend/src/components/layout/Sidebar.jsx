/**
 * Sidebar Component - Premium Dashboard Navigation
 * Clean, refined navigation with subtle interactions
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
    FiHome, FiUser, FiUsers, FiLogOut,
    FiCalendar, FiBriefcase, FiDollarSign, FiStar,
    FiUserCheck, FiX, FiFileText, FiUpload,
    FiChevronRight, FiBell
} from 'react-icons/fi';
import { useAuthStore } from '../../store';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getMenuItems = () => {
        const common = [
            { path: '/dashboard', icon: FiHome, label: 'Overview', end: true },
            { path: '/dashboard/profile', icon: FiUser, label: 'Profile' },
            { path: '/dashboard/notifications', icon: FiBell, label: 'Notifications' },
        ];

        if (user?.role === 'admin') {
            return [
                ...common,
                { divider: true, label: 'Administration' },
                { path: '/dashboard/users', icon: FiUsers, label: 'Users' },
                { path: '/dashboard/employees', icon: FiUserCheck, label: 'Employees' },
                { path: '/dashboard/all-bookings', icon: FiCalendar, label: 'All Bookings' },
                { path: '/dashboard/document-verification', icon: FiFileText, label: 'Documents' },
            ];
        }

        if (user?.role === 'employee') {
            return [
                { path: '/dashboard/worker', icon: FiHome, label: 'Overview', end: true },
                { path: '/dashboard/worker-profile', icon: FiUser, label: 'My Profile' },
                { divider: true, label: 'Work' },
                { path: '/dashboard/jobs', icon: FiBriefcase, label: 'My Jobs' },
                { path: '/dashboard/schedule', icon: FiCalendar, label: 'Schedule' },
                { divider: true, label: 'Account' },
                { path: '/dashboard/worker-documents', icon: FiUpload, label: 'Documents' },
                { path: '/dashboard/earnings', icon: FiDollarSign, label: 'Earnings' },
                { path: '/dashboard/reviews', icon: FiStar, label: 'Reviews' },
            ];
        }

        // Customer
        return [
            ...common,
            { divider: true, label: 'Bookings' },
            { path: '/dashboard/bookings', icon: FiCalendar, label: 'My Bookings' },
        ];
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20">
                            <FiHome className="text-white text-lg" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">
                            Home<span className="text-brand-600">Service</span>
                        </span>
                    </div>
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                        onClick={onClose}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-md ring-2 ring-white">
                            {user?.avatar?.url ? (
                                <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">
                                {user?.firstName} {user?.lastName}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-md capitalize">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        if (item.divider) {
                            return (
                                <div key={index} className="pt-5 pb-2 px-3">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        isActive
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                                end={item.end}
                                onClick={onClose}
                            >
                                <item.icon
                                    className={`w-[18px] h-[18px] transition-colors`}
                                />
                                <span className="font-medium text-sm flex-1">{item.label}</span>
                                <FiChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
                        onClick={handleLogout}
                    >
                        <FiLogOut className="w-[18px] h-[18px]" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
