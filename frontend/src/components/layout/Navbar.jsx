/**
 * Navbar Component - Premium Design
 * Human-crafted UI with subtle interactions and refined aesthetics
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiMenu, FiX, FiSettings, FiGrid, FiChevronDown, FiArrowRight } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { NotificationBell } from '../notifications';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/services', label: 'Services' },
        { path: '/about', label: 'About' },
    ];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100'
                : 'bg-white border-b border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-18">
                    {/* Brand */}
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
                            <FiHome className="text-white text-lg" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">
                            Home<span className="text-brand-600">Service</span>
                        </span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {/* Nav Links */}
                        <div className="flex items-center gap-1 mr-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                        isActive(link.path)
                                            ? 'text-brand-700 bg-brand-50'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-200 mx-2" />

                        {/* Auth Section */}
                        <div className="flex items-center gap-3 ml-2">
                            {isAuthenticated ? (
                                <>
                                    <NotificationBell />

                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden ring-2 ring-white shadow-sm">
                                                {user?.avatar?.url ? (
                                                    <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                                )}
                                            </div>
                                            <span className="text-slate-700 font-medium text-sm">{user?.firstName}</span>
                                            <FiChevronDown className={`text-slate-400 text-sm transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {userDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scaleIn origin-top-right">
                                                {/* User Info Header */}
                                                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-md">
                                                            {user?.avatar?.url ? (
                                                                <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-lg">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
                                                            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="inline-flex items-center mt-3 px-2.5 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full capitalize">
                                                        {user?.role}
                                                    </span>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-2">
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        <FiGrid className="text-lg" />
                                                        <span className="font-medium">Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/profile"
                                                        className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        <FiUser className="text-lg" />
                                                        <span className="font-medium">My Profile</span>
                                                    </Link>
                                                    <Link
                                                        to="/dashboard/settings"
                                                        className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-colors"
                                                        onClick={() => setUserDropdownOpen(false)}
                                                    >
                                                        <FiSettings className="text-lg" />
                                                        <span className="font-medium">Settings</span>
                                                    </Link>
                                                </div>

                                                {/* Logout */}
                                                <div className="p-2 border-t border-slate-100">
                                                    <button
                                                        className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        onClick={handleLogout}
                                                    >
                                                        <FiLogOut className="text-lg" />
                                                        <span className="font-medium">Sign Out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <button className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                                            Sign In
                                        </button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-100 animate-slideDown">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                                        isActive(link.path)
                                            ? 'text-brand-700 bg-brand-50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <hr className="my-4 border-slate-100" />

                        {isAuthenticated ? (
                            <div className="space-y-1">
                                <div className="px-4 py-3 mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                                            {user?.avatar?.url ? (
                                                <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                                            <p className="text-sm text-slate-500">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FiGrid />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/dashboard/profile"
                                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <FiUser />
                                    <span>My Profile</span>
                                </Link>
                                <button
                                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 px-4">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-3 text-slate-700 font-medium text-center hover:bg-slate-50 rounded-xl transition-colors">
                                        Sign In
                                    </button>
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl transition-colors hover:bg-slate-800">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
