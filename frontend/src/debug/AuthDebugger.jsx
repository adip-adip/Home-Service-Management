/**
 * Auth Debugging Component
 * This component helps debug authentication issues
 */

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { authAPI, documentAPI, bookingAPI } from '../api';
import api from '../api/axios';

const AuthDebugger = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [tokenInfo, setTokenInfo] = useState(null);
    const [apiTests, setApiTests] = useState({});
    const [loading, setLoading] = useState(false);

    // Decode JWT token to inspect payload
    const decodeToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            return null;
        }
    };

    const refreshTokenInfo = () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (accessToken) {
            const decoded = decodeToken(accessToken);
            setTokenInfo({
                accessToken: {
                    token: accessToken.substring(0, 50) + '...',
                    payload: decoded,
                    expired: decoded ? Date.now() > decoded.exp * 1000 : false
                },
                refreshToken: refreshToken ? refreshToken.substring(0, 50) + '...' : null,
                localStorageUser: JSON.parse(localStorage.getItem('user') || 'null')
            });
        } else {
            setTokenInfo(null);
        }
    };

    const testAPI = async (name, apiCall) => {
        setLoading(true);
        try {
            const result = await apiCall();
            setApiTests(prev => ({
                ...prev,
                [name]: { success: true, data: result }
            }));
        } catch (error) {
            setApiTests(prev => ({
                ...prev,
                [name]: { 
                    success: false, 
                    error: {
                        status: error.response?.status,
                        message: error.response?.data?.message || error.message,
                        data: error.response?.data
                    }
                }
            }));
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshTokenInfo();
    }, [user, isAuthenticated]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Authentication Debugger</h1>
            
            {/* Auth Store State */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">Auth Store State</h2>
                <div className="space-y-2">
                    <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
                    <div><strong>User Role:</strong> {user?.role || 'Not logged in'}</div>
                    <div><strong>User Email:</strong> {user?.email || 'Not logged in'}</div>
                    <div><strong>User Permissions:</strong> {user?.permissions?.join(', ') || 'None'}</div>
                </div>
            </div>

            {/* Token Information */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">Token Information</h2>
                <button 
                    onClick={refreshTokenInfo}
                    className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Refresh Token Info
                </button>
                
                {tokenInfo ? (
                    <div className="space-y-4">
                        <div>
                            <strong>Access Token (truncated):</strong>
                            <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                                {tokenInfo.accessToken.token}
                            </div>
                        </div>
                        
                        <div>
                            <strong>Token Payload:</strong>
                            <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(tokenInfo.accessToken.payload, null, 2)}
                            </pre>
                        </div>
                        
                        <div>
                            <strong>Token Status:</strong> 
                            <span className={`ml-2 px-2 py-1 rounded text-sm ${tokenInfo.accessToken.expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {tokenInfo.accessToken.expired ? 'Expired' : 'Valid'}
                            </span>
                        </div>

                        <div>
                            <strong>Refresh Token (truncated):</strong>
                            <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                                {tokenInfo.refreshToken || 'Not found'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500">No token found in localStorage</div>
                )}
            </div>

            {/* API Tests */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">API Tests</h2>
                <div className="space-y-2 mb-4">
                    <button 
                        onClick={() => testAPI('profile', () => authAPI.getMe())}
                        disabled={loading}
                        className="mr-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Test Profile API
                    </button>
                    <button 
                        onClick={() => testAPI('documents', () => documentAPI.getUserDocuments())}
                        disabled={loading}
                        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        Test Documents API
                    </button>
                    <button 
                        onClick={() => testAPI('jobs', () => bookingAPI.getMyJobs())}
                        disabled={loading}
                        className="mr-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                        Test Jobs API
                    </button>
                </div>

                {Object.keys(apiTests).length > 0 && (
                    <div className="space-y-4">
                        {Object.entries(apiTests).map(([name, result]) => (
                            <div key={name} className="border rounded p-3">
                                <h4 className="font-medium mb-2">
                                    {name} API: 
                                    <span className={`ml-2 px-2 py-1 rounded text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {result.success ? 'Success' : 'Failed'}
                                    </span>
                                </h4>
                                <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                                    {JSON.stringify(result.success ? result.data : result.error, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Token Check */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Manual Checks</h2>
                <button 
                    onClick={() => {
                        const token = localStorage.getItem('accessToken');
                        if (token) {
                            console.log('Token Headers:', api.defaults.headers);
                            console.log('Current axios config:', api.defaults);
                        }
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Log Axios Config
                </button>
            </div>
        </div>
    );
};

export default AuthDebugger;