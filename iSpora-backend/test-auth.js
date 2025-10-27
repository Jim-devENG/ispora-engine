const http = require('http');

// Test authentication flow
async function testAuth() {
  console.log('Testing authentication flow...');
  
  // Test 1: Register a new user
  console.log('\n1. Testing user registration...');
  const registerData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });
  
  const registerResponse = await makeRequest('POST', '/api/auth/register', registerData);
  console.log('Register Status:', registerResponse.status);
  console.log('Register Response:', registerResponse.data);
  
  if (registerResponse.status === 201) {
    console.log('✅ Registration successful');
    
    // Test 2: Login with the user
    console.log('\n2. Testing user login...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    console.log('Login Status:', loginResponse.status);
    console.log('Login Response:', loginResponse.data);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log('✅ Login successful');
      
      // Test 3: Get user profile with token
      console.log('\n3. Testing protected route...');
      const meResponse = await makeRequest('GET', '/api/auth/me', null, loginResponse.data.token);
      console.log('Me Status:', meResponse.status);
      console.log('Me Response:', meResponse.data);
      
      if (meResponse.status === 200) {
        console.log('✅ Protected route access successful');
        console.log('\n🎉 All authentication tests passed!');
      } else {
        console.log('❌ Protected route access failed');
      }
    } else {
      console.log('❌ Login failed');
    }
  } else {
    console.log('❌ Registration failed');
  }
}

function makeRequest(method, path, data, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ status: 0, data: error.message });
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

testAuth();
