/**
 * Sidebar Component for Dashboard - Tailwind CSS
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FiHome, FiUser, FiUsers, FiSettings, FiLogOut, 
    FiCalendar, FiBriefcase, FiDollarSign, FiStar,
    FiUserCheck, FiGrid, FiX, FiFileText, FiShield,
    FiUpload
} from 'react-icons/fi';
import { useAuthStore } from '../../store';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Menu items based on role
    const getMenuItems = () => {
        const common = [
            { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
            { path: '/dashboard/profile', icon: FiUser, label: 'Profile' },
        ];

        if (user?.role === 'admin') {
            return [
                ...common,
                { path: '/dashboard/users', icon: FiUsers, label: 'Users' },
                { path: '/dashboard/employees', icon: FiUserCheck, label: 'Employees' },
                { path: '/dashboard/bookings', icon: FiCalendar, label: 'All Bookings' },
                { path: '/dashboard/document-verification', icon: FiFileText, label: 'Documents' },
            ];
        }

        if (user?.role === 'employee') {
            return [
                { path: '/dashboard/worker', icon: FiGrid, label: 'Worker Dashboard' },
                { path: '/dashboard/worker-profile', icon: FiUser, label: 'Profile' },
                { path: '/dashboard/jobs', icon: FiBriefcase, label: 'My Jobs' },
                { path: '/dashboard/worker-documents', icon: FiUpload, label: 'Documents' },
                { path: '/dashboard/schedule', icon: FiCalendar, label: 'Schedule' },
                { path: '/dashboard/earnings', icon: FiDollarSign, label: 'Earnings' },
                { path: '/dashboard/reviews', icon: FiStar, label: 'Reviews' },
            ];
        }

        // Customer
        return [
            ...common,
            { path: '/dashboard/bookings', icon: FiCalendar, label: 'My Bookings' },
            { path: '/dashboard/favorites', icon: FiStar, label: 'Favorites' },
        ];
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            />
            
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                        <FiHome className="text-2xl" />
                        <span>HomeService</span>
                    </div>
                    <button 
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        onClick={onClose}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {user?.avatar?.url ? (
                                <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h4>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">{user?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {getMenuItems().map((item) => (
                        <NavLink 
                            key={item.path} 
                            to={item.path} 
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-600 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                }`
                            }
                            end={item.path === '/dashboard'}
                            onClick={onClose}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button 
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        onClick={handleLogout}
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
