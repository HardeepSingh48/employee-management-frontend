// Utility to test backend connection - COMMENTED OUT (not needed in production)
/*
export const testBackendConnection = async () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  console.log('🧪 Testing backend connection...');
  console.log('Base URL:', baseURL);
  
  try {
    // Test 1: Basic fetch to root endpoint
    console.log('Test 1: Testing root endpoint...');
    const rootResponse = await fetch('http://localhost:5000/');
    console.log('Root endpoint status:', rootResponse.status);
    
    if (rootResponse.ok) {
      const rootData = await rootResponse.json();
      console.log('Root endpoint data:', rootData);
    }
    
    // Test 2: Test CORS preflight
    console.log('Test 2: Testing CORS preflight...');
    const corsResponse = await fetch(`${baseURL}/salary-codes/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('CORS preflight status:', corsResponse.status);
    console.log('CORS headers:', Object.fromEntries(corsResponse.headers.entries()));
    
    // Test 3: Test actual GET request
    console.log('Test 3: Testing GET request...');
    const getResponse = await fetch(`${baseURL}/salary-codes/test`);
    console.log('GET request status:', getResponse.status);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('GET request data:', getData);
    }
    
    // Test 4: Test POST request to /test endpoint
    console.log('Test 4: Testing POST request to /test...');
    const postTestResponse = await fetch(`${baseURL}/salary-codes/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ test: 'data' })
    });
    console.log('POST /test request status:', postTestResponse.status);

    if (postTestResponse.ok) {
      const postTestData = await postTestResponse.json();
      console.log('POST /test request data:', postTestData);
    }

    // Test 5: Test the ACTUAL endpoint that's failing
    console.log('Test 5: Testing POST request to actual salary-codes endpoint...');
    try {
      const actualPostResponse = await fetch(`${baseURL}/salary-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          site_name: 'Test Site ' + Date.now(), // Make it unique
          rank: 'SS',
          state: 'UP',
          base_wage: 1000
        })
      });
      console.log('POST /salary-codes status:', actualPostResponse.status);

      if (actualPostResponse.ok) {
        const actualData = await actualPostResponse.json();
        console.log('POST /salary-codes data:', actualData);
      } else {
        const errorText = await actualPostResponse.text();
        console.log('POST /salary-codes error:', errorText);
      }
    } catch (fetchError) {
      console.error('POST /salary-codes fetch error:', fetchError);
    }
    
    console.log('✅ Backend connection tests completed');
    return true;

  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    return false;
  }
};

// Function to add a test button to the salary code form
export const addTestButton = () => {
  if (typeof window !== 'undefined') {
    const button = document.createElement('button');
    button.textContent = '🧪 Test Backend Connection';
    button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      background: #f59e0b;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    button.onclick = () => testBackendConnection();
    document.body.appendChild(button);
  }
};
*/

// Placeholder exports for commented code
export const testBackendConnection = async () => true;
export const addTestButton = () => {};
