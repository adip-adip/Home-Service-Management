/**
 * API Debug Component
 * Helps debug API connectivity issues
 */

import React, { useState } from 'react';
import { authAPI, bookingAPI, documentAPI } from '../api';

const ApiDebug = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        try {
            const response = await authAPI.login({
                email: 'ram.plumber@example.com',
                password: 'Employee@123'
            });
            
            setResults(prev => ({
                ...prev,
                login: { success: true, data: response }
            }));
            
            console.log('Login successful:', response);
        } catch (error) {
            setResults(prev => ({
                ...prev,
                login: { success: false, error: error.message }
            }));
            console.error('Login failed:', error);
        }
        setLoading(false);
    };

    const testDocuments = async () => {
        setLoading(true);
        try {
            const response = await documentAPI.getUserDocuments();
            setResults(prev => ({
                ...prev,
                documents: { success: true, data: response }
            }));
            console.log('Documents successful:', response);
        } catch (error) {
            setResults(prev => ({
                ...prev,
                documents: { success: false, error: error.message, fullError: error }
            }));
            console.error('Documents failed:', error);
        }
        setLoading(false);
    };

    const testJobs = async () => {
        setLoading(true);
        try {
            const response = await bookingAPI.getMyJobs();
            setResults(prev => ({
                ...prev,
                jobs: { success: true, data: response }
            }));
            console.log('Jobs successful:', response);
        } catch (error) {
            setResults(prev => ({
                ...prev,
                jobs: { success: false, error: error.message, fullError: error }
            }));
            console.error('Jobs failed:', error);
        }
        setLoading(false);
    };

    const checkAuth = () => {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        setResults(prev => ({
            ...prev,
            auth: {
                hasToken: !!token,
                token: token ? 'Token exists' : 'No token',
                user: user ? JSON.parse(user) : 'No user data'
            }
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">API Debug Console</h1>
            
            <div className="space-y-4">
                <div className="flex gap-4 mb-6">
                    <button 
                        onClick={checkAuth}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Check Auth Status
                    </button>
                    <button 
                        onClick={testLogin}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Test Login
                    </button>
                    <button 
                        onClick={testDocuments}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                        Test Documents
                    </button>
                    <button 
                        onClick={testJobs}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                    >
                        Test Jobs
                    </button>
                </div>

                {loading && <div className="text-blue-600">Testing...</div>}

                <div className="space-y-4">
                    {Object.entries(results).map(([key, result]) => (
                        <div key={key} className="border rounded p-4">
                            <h3 className="font-bold text-lg capitalize">{key}</h3>
                            <div className="mt-2">
                                {result.success ? (
                                    <div className="text-green-600">
                                        ✅ Success
                                        <pre className="mt-2 text-xs bg-green-50 p-2 rounded">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>
                                ) : result.success === false ? (
                                    <div className="text-red-600">
                                        ❌ Failed: {result.error}
                                        {result.fullError && (
                                            <pre className="mt-2 text-xs bg-red-50 p-2 rounded">
                                                {JSON.stringify(result.fullError, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-600">
                                        <pre className="text-xs bg-gray-50 p-2 rounded">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApiDebug;