/**
 * API Test Component
 * For debugging API calls
 */

import { useState } from 'react';
import { adminAPI, userAPI } from '../api';
import { useAuthStore } from '../store';
import { Button } from '../components/common';

const ApiTest = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [results, setResults] = useState('');
    const [loading, setLoading] = useState(false);

    const testAdminUsers = async () => {
        setLoading(true);
        setResults('Testing admin users API...\n');
        
        try {
            const response = await adminAPI.getUsers();
            setResults(prev => prev + `✓ Success: ${JSON.stringify(response, null, 2)}\n`);
        } catch (error) {
            setResults(prev => prev + `✗ Error: ${error.message}\n`);
            setResults(prev => prev + `Status: ${error.response?.status}\n`);
            setResults(prev => prev + `Data: ${JSON.stringify(error.response?.data || {}, null, 2)}\n`);
            setResults(prev => prev + `Full Error: ${JSON.stringify({
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                method: error.config?.method
            }, null, 2)}\n`);
        } finally {
            setLoading(false);
        }
    };

    const testUserProfile = async () => {
        setLoading(true);
        setResults('Testing user profile API...\n');
        
        try {
            const response = await userAPI.getProfile();
            setResults(prev => prev + `✓ Success: ${JSON.stringify(response, null, 2)}\n`);
        } catch (error) {
            setResults(prev => prev + `✗ Error: ${error.message}\n${JSON.stringify(error.response?.data || error, null, 2)}\n`);
        } finally {
            setLoading(false);
        }
    };

    const testBackendConnections = async () => {
        setLoading(true);
        setResults('Testing backend connectivity...\n');
        
        const endpoints = [
            'http://localhost:5000/api/v1/admin/users',
            'http://localhost:5000/admin/users', 
            'http://localhost:5000/api/admin/users',
            'http://localhost:3000/api/v1/admin/users'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                setResults(prev => prev + `${endpoint}: ${response.status} ${response.statusText}\n`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(prev => prev + `  Data preview: ${JSON.stringify(data).substring(0, 200)}...\n`);
                }
            } catch (error) {
                setResults(prev => prev + `${endpoint}: Connection failed - ${error.message}\n`);
            }
        }
        setLoading(false);
    };

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        setResults(`Auth Status:\n` + 
                   `Is Authenticated: ${isAuthenticated}\n` +
                   `Current User: ${JSON.stringify(user, null, 2)}\n` +
                   `Access Token: ${token ? `Present (${token.substring(0, 20)}...)` : 'Missing'}\n` +
                   `Refresh Token: ${refreshToken ? 'Present' : 'Missing'}\n` +
                   `API Base URL: ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}\n`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>API Test Component</h2>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button onClick={checkAuth}>Check Auth</Button>
                <Button onClick={testUserProfile} loading={loading}>Test User Profile</Button>
                <Button onClick={testAdminUsers} loading={loading}>Test Admin Users</Button>
                <Button onClick={testBackendConnections} loading={loading}>Test Backend</Button>
                <Button onClick={() => setResults('')}>Clear</Button>
            </div>
            <pre style={{ 
                background: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '5px',
                overflow: 'auto',
                maxHeight: '500px',
                fontSize: '12px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}>
                {results || 'Click a test button to see results...'}
            </pre>
        </div>
    );
};

export default ApiTest;