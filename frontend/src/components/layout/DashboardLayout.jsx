/**
 * Dashboard Layout Component - Premium Design
 * Clean, spacious layout with refined header and content area
 */

import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FiMenu, FiHome, FiHelpCircle } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { NotificationBell } from '../notifications';
import { useAuthStore } from '../../store';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuthStore();

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col lg:ml-72">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                    <div className="flex items-center justify-between h-16 px-4 md:px-6">
                        {/* Left side */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <FiMenu className="w-5 h-5" />
                            </button>

                            {/* Breadcrumb / Home link on mobile */}
                            <Link
                                to="/"
                                className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm"
                            >
                                <FiHome className="w-4 h-4" />
                                <span>Home</span>
                            </Link>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Help button */}
                            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors hidden md:flex">
                                <FiHelpCircle className="w-5 h-5" />
                            </button>

                            {/* Notification */}
                            <NotificationBell />

                            {/* User avatar (mobile) */}
                            <div className="lg:hidden">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                                    {user?.avatar?.url ? (
                                        <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-slate-200/60 bg-white/50 py-4 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-slate-500">
                        <p>© 2026 HomeService. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-slate-700 transition-colors">Help Center</a>
                            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
