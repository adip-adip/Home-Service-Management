/**
 * Simple Dashboard Test
 * Minimal component to test dashboard functionality
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';

const SimpleDashboard = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [message, setMessage] = useState('Loading...');

    useEffect(() => {
        if (!isAuthenticated) {
            setMessage('Not authenticated');
        } else if (!user) {
            setMessage('User data not found');
        } else {
            setMessage(`Welcome ${user.firstName} ${user.lastName} (${user.role})`);
        }
    }, [user, isAuthenticated]);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Simple Dashboard</h1>
            <p>{message}</p>
            
            <div style={{ marginTop: '20px' }}>
                <h2>User Data:</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Authentication Status:</h2>
                <p>Authenticated: {String(isAuthenticated)}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Quick Links:</h2>
                <button onClick={() => window.location.href = '/dashboard/admin'}>Admin Dashboard</button>
                <button onClick={() => window.location.href = '/dashboard/worker'} style={{ marginLeft: '10px' }}>Worker Dashboard</button>
                <button onClick={() => window.location.href = '/dashboard/profile'} style={{ marginLeft: '10px' }}>Profile</button>
            </div>
        </div>
    );
};

export default SimpleDashboard;