/**
 * Test Authentication Flow Script
 * This script will test the login process and token generation
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testAuthentication() {
    try {
        console.log('[TEST] Testing Employee Login...');
        
        // Test login
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'ram.plumber@example.com',
            password: 'Employee@123'
        });

        console.log('[OK] Login successful!');
        console.log('User Data:', JSON.stringify(loginResponse.data.data.user, null, 2));
        
        const { accessToken, refreshToken } = loginResponse.data.data;
        console.log('Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
        
        // Test document API with the token
        console.log('\n[TEST] Testing Document API...');
        try {
            const documentsResponse = await axios.get(`${API_BASE_URL}/users/documents`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('[OK] Documents API successful!');
            console.log('Documents:', documentsResponse.data);
        } catch (docError) {
            console.log('[ERROR] Documents API failed:');
            console.log('Status:', docError.response?.status);
            console.log('Error:', docError.response?.data);
        }

        // Test jobs API with the token
        console.log('\n[TEST] Testing Jobs API...');
        try {
            const jobsResponse = await axios.get(`${API_BASE_URL}/bookings/my-jobs`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('[OK] Jobs API successful!');
            console.log('Jobs:', jobsResponse.data);
        } catch (jobError) {
            console.log('[ERROR] Jobs API failed:');
            console.log('Status:', jobError.response?.status);
            console.log('Error:', jobError.response?.data);
        }

    } catch (error) {
        console.error('[ERROR] Login failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testAuthentication();