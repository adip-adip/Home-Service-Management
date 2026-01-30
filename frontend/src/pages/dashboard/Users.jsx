/**
 * Users Management Page (Admin) - Tailwind CSS
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2, FiUser, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api';
import { useAuthStore } from '../../store';

const Users = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 10;
    
    // Track the current page type to detect changes
    const isEmployeePage = location.pathname.includes('/employees');
    const prevPageType = useRef(isEmployeePage);
    const isFetching = useRef(false);

    // Page-specific configuration
    const pageTitle = isEmployeePage ? 'Employees Management' : 'Users Management';
    const pageDescription = isEmployeePage ? 'Manage employees on the platform' : 'Manage all users on the platform';

    const fetchUsers = useCallback(async (page = 1, search = '') => {
        // Prevent concurrent fetches
        if (isFetching.current || !isAuthenticated || !user) {
            if (!isAuthenticated) setIsLoading(false);
            return;
        }
        
        isFetching.current = true;
        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            
            // Build params
            const params = { page, limit };
            
            if (search && search.trim()) {
                params.search = search.trim();
            }
            
            // Set role based on which page we're on
            if (isEmployeePage) {
                params.role = 'employee';
            }
            // For users page, we don't set role - we'll filter on frontend
            
            console.log('Fetching users with params:', params);
            
            const response = await adminAPI.getUsers(params);
            
            const data = response?.data || response || {};
            let usersList = Array.isArray(data.users) ? data.users : [];
            
            // Filter out employees on the users page
            if (!isEmployeePage) {
                usersList = usersList.filter(u => u.role !== 'employee');
            }
            
            const pag = data.pagination || {};
            
            console.log('Users API response:', { usersCount: usersList.length, pagination: pag });
            
            setUsers(usersList);
            setCurrentPage(Number(pag.page) || 1);
            setTotalPages(Number(pag.pages) || 1);
            setTotalUsers(Number(pag.total) || usersList.length);
        } catch (error) {
            console.error('Error fetching users:', error?.response?.data || error.message);
            
            if (error.response?.status === 429) {
                toast.error('Too many requests. Please wait a moment.');
            } else if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
            } else if (error.response?.status === 403) {
                toast.error('Access denied. Admin permissions required.');
            } else if (error.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to load users');
            }
            
            setUsers([]);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [isAuthenticated, user, isEmployeePage]);

    // Single effect to handle all data fetching
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setIsLoading(false);
            return;
        }

        // Check if page type changed (navigated between users/employees)
        const pageTypeChanged = prevPageType.current !== isEmployeePage;
        prevPageType.current = isEmployeePage;

        if (pageTypeChanged) {
            // Reset state and fetch fresh data
            setSearchQuery('');
            setCurrentPage(1);
            setUsers([]);
            fetchUsers(1, '');
        } else {
            // Initial fetch
            fetchUsers(currentPage, searchQuery);
        }
    }, [isAuthenticated, user, isEmployeePage]); // Note: removed fetchUsers from deps to prevent loops

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchUsers(newPage, searchQuery);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(1, searchQuery);
    };

    const handleEdit = (userData) => {
        setEditingUser({
            id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            status: userData.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await adminAPI.updateUser(editingUser.id, {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                role: editingUser.role,
                status: editingUser.status
            });
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers(currentPage, searchQuery);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await adminAPI.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers(currentPage, searchQuery);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const getStatusBadgeClass = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700',
            inactive: 'bg-gray-100 text-gray-700',
            suspended: 'bg-red-100 text-red-700',
            pending: 'bg-amber-100 text-amber-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    if (isLoading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
        );
    }

    // Show troubleshooting info if no users and not loading
    if (!isLoading && users.length === 0 && totalUsers === 0 && !searchQuery) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{pageTitle}</h1>
                    <p className="text-gray-500 mt-1">{pageDescription}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <FiUser className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No {isEmployeePage ? 'Employees' : 'Users'} Found</h3>
                    <p className="text-gray-500 mb-4">This could be due to:</p>
                    <ul className="text-left text-gray-600 text-sm mb-6 max-w-xs mx-auto space-y-1">
                        <li>• Database connection issues</li>
                        <li>• Authentication/permission problems</li>
                        <li>• Backend server not running</li>
                        <li>• API endpoint configuration issues</li>
                    </ul>
                    <button 
                        onClick={() => fetchUsers(1, '')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                    <p className="text-sm text-gray-400 mt-4">
                        Check the browser console for detailed error information.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{pageTitle}</h1>
                <p className="text-gray-500 mt-1">{pageDescription}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${isEmployeePage ? 'employees' : 'users'}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <h3 className="font-medium text-gray-800">No {isEmployeePage ? 'employees' : 'users'} found</h3>
                                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                                                    {user.avatar?.url ? (
                                                        <img src={user.avatar.url} alt={user.firstName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-800">{user.firstName} {user.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadgeClass(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors" 
                                                    title="Edit"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" 
                                                    title="Delete"
                                                    onClick={() => handleDelete(user._id)}
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 text-sm">Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800">Edit User</h3>
                            <button 
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={editingUser.firstName}
                                    onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={editingUser.lastName}
                                    onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={editingUser.status}
                                    onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiSave className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
