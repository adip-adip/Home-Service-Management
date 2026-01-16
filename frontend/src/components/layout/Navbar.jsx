/**
 * Navbar Component - Tailwind CSS
 */

import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiMenu, FiX, FiSettings, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                        <FiHome className="text-2xl" />
                        <span>HomeService</span>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
                            <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Services</Link>
                            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                                            {user?.avatar?.url ? (
                                                <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                                            )}
                                        </div>
                                        <span className="text-gray-700 font-medium">{user?.firstName}</span>
                                        <FiChevronDown className={`text-gray-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {userDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">{user?.role}</span>
                                            </div>
                                            <div className="py-2">
                                                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setUserDropdownOpen(false)}>
                                                    <FiGrid />
                                                    <span>Dashboard</span>
                                                </Link>
                                                <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setUserDropdownOpen(false)}>
                                                    <FiUser />
                                                    <span>My Profile</span>
                                                </Link>
                                                <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" onClick={() => setUserDropdownOpen(false)}>
                                                    <FiSettings />
                                                    <span>Settings</span>
                                                </Link>
                                                <hr className="my-2 border-gray-100" />
                                                <button className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors" onClick={handleLogout}>
                                                    <FiLogOut />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login">
                                        <button className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Register</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            <Link to="/services" className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Services</Link>
                            <Link to="/about" className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>About</Link>
                        </div>
                        <hr className="my-4 border-gray-100" />
                        {isAuthenticated ? (
                            <div className="flex flex-col gap-2">
                                <div className="px-4 py-2">
                                    <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                <Link to="/dashboard" className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                                <Link to="/dashboard/profile" className="px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                                <button className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={handleLogout}>Logout</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 px-4">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">Login</button>
                                </Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Register</button>
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
