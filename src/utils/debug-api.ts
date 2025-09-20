/**
 * Frontend API Debug Utility
 * Use this to test API connectivity and CORS issues
 */

export const debugAPI = {
  // Test basic connectivity
  async testConnectivity() {
    console.log('🔍 Testing API Connectivity...');
    
    const baseURLs = [
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
    
    for (const baseURL of baseURLs) {
      try {
        console.log(`📡 Testing ${baseURL}`);
        
        // Test root endpoint
        const response = await fetch(`${baseURL}/`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${baseURL} - Status: ${response.status}`, data);
        } else {
          console.log(`❌ ${baseURL} - Status: ${response.status}`);
        }
        
        // Test health endpoint
        const healthResponse = await fetch(`${baseURL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include'
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log(`✅ Health check - Status: ${healthResponse.status}`, healthData);
        }
        
      } catch (error) {
        console.error(`❌ Connection failed to ${baseURL}:`, error);
      }
    }
  },

  // Test CORS preflight
  async testCORS() {
    console.log('🌐 Testing CORS Configuration...');
    
    const baseURL = 'http://127.0.0.1:5000';
    const endpoints = ['/api/auth/login', '/api/superadmin/users'];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing CORS for ${endpoint}`);
        
        // Manual preflight request
        const preflightResponse = await fetch(`${baseURL}${endpoint}`, {
          method: 'OPTIONS',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
          }
        });
        
        console.log(`Preflight Status: ${preflightResponse.status}`);
        console.log('CORS Headers:', {
          'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers'),
          'Access-Control-Allow-Credentials': preflightResponse.headers.get('Access-Control-Allow-Credentials')
        });
        
      } catch (error) {
        console.error(`❌ CORS test failed for ${endpoint}:`, error);
      }
    }
  },

  // Test authentication flow
  async testAuth() {
    console.log('🔐 Testing Authentication Flow...');
    
    const baseURL = 'http://127.0.0.1:5000';
    
    try {
      // Test login
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email: 'superadmin@company.com',
          password: 'superadmin123'
        })
      });
      
      console.log(`Login Status: ${loginResponse.status}`);
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData);
        
        if (loginData.data?.token) {
          // Test authenticated endpoint
          const authResponse = await fetch(`${baseURL}/api/superadmin/users`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${loginData.data.token}`,
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            }
          });
          
          console.log(`Authenticated request status: ${authResponse.status}`);
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('✅ Authenticated request successful:', authData);
          } else {
            console.log('❌ Authenticated request failed:', await authResponse.text());
          }
        }
      } else {
        console.log('❌ Login failed:', await loginResponse.text());
      }
      
    } catch (error) {
      console.error('❌ Auth test failed:', error);
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running Complete API Debug Suite...');
    console.log('='.repeat(50));
    
    await this.testConnectivity();
    console.log('\n');
    await this.testCORS();
    console.log('\n');
    await this.testAuth();
    
    console.log('\n🏁 Debug suite complete!');
    console.log('Check console for detailed results.');
  },

  // Quick network test
  async quickTest() {
    try {
      const response = await fetch('http://127.0.0.1:5000/health', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.log('❌ Backend returned error:', response.status);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Backend is not reachable:', errorMessage);
      return false;
    }
  }
};

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).debugAPI = debugAPI;
}

export default debugAPI;