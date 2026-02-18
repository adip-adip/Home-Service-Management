/**
 * Test API Endpoints
 * Quick test to verify API functionality
 */

const API_BASE = 'http://localhost:5000/api/v1';

// Test function
async function testDocumentAPI() {
    console.log('🧪 Testing Document API...');
    
    try {
        // First, try to login with a test employee account
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'ram.plumber@example.com',
                password: 'Employee@123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const token = loginData.data.accessToken;
            console.log('✅ Login successful');
            
            // Now test the documents endpoint
            const documentsResponse = await fetch(`${API_BASE}/users/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (documentsResponse.ok) {
                const documentsData = await documentsResponse.json();
                console.log('✅ Documents API working:', documentsData);
            } else {
                const error = await documentsResponse.text();
                console.log('❌ Documents API failed:', documentsResponse.status, error);
            }
        } else {
            const error = await loginResponse.text();
            console.log('❌ Login failed:', loginResponse.status, error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test booking API as well
async function testBookingAPI() {
    console.log('🧪 Testing Booking API...');
    
    try {
        // Login first
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'ram.plumber@example.com',
                password: 'Employee@123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            const token = loginData.data.accessToken;
            console.log('✅ Login successful');
            
            // Test the my-jobs endpoint
            const jobsResponse = await fetch(`${API_BASE}/bookings/my-jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                console.log('✅ My Jobs API working:', jobsData);
            } else {
                const error = await jobsResponse.text();
                console.log('❌ My Jobs API failed:', jobsResponse.status, error);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testDocumentAPI();
testBookingAPI();