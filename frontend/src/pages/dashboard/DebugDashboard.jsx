/**
 * Debug Dashboard Component
 * Simple component to test if the dashboard routing works
 */

import React from 'react';
import { useAuthStore } from '../../store';

const DebugDashboard = () => {
    const { user, isAuthenticated } = useAuthStore();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Debug Dashboard</h1>
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User Role:</strong> {user?.role || 'None'}</p>
                <p><strong>User Email:</strong> {user?.email || 'None'}</p>
                <p><strong>User Name:</strong> {user?.firstName} {user?.lastName}</p>
                
                <h2 className="text-lg font-semibold mt-4 mb-2">Navigation</h2>
                <div className="space-y-2">
                    <button 
                        onClick={() => window.location.href = '/dashboard/admin'}
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Go to Admin Dashboard
                    </button>
                    <button 
                        onClick={() => window.location.href = '/dashboard/worker'}
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Go to Worker Dashboard
                    </button>
                    <button 
                        onClick={() => window.location.href = '/dashboard/profile'}
                        className="bg-purple-500 text-white px-4 py-2 rounded"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DebugDashboard;