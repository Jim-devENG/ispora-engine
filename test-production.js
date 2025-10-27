const http = require('http');

// Test the deployed backend on Render.com
const RENDER_URL = 'https://ispora-backend.onrender.com'; // Update this with your actual Render URL

async function testProduction() {
  console.log('🧪 Testing Production Backend on Render.com...\n');
  console.log(`Testing URL: ${RENDER_URL}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Health Check
  await runTest('Health Check', async () => {
    const response = await makeRequest('GET', '/api/health');
    if (response.status === 200 && response.data.status === 'ok') {
      return { success: true, message: 'Health check passed' };
    }
    return { success: false, message: `Health check failed: ${response.status}` };
  }, results);
  
  // Test 2: User Registration
  let authToken;
  await runTest('User Registration', async () => {
    const userData = JSON.stringify({
      email: 'prodtest@example.com',
      password: 'password123',
      firstName: 'Production',
      lastName: 'Test'
    });
    
    const response = await makeRequest('POST', '/api/auth/register', userData);
    if (response.status === 201 && response.data.token) {
      authToken = response.data.token;
      return { success: true, message: 'User registered successfully' };
    }
    return { success: false, message: `Registration failed: ${response.status} - ${JSON.stringify(response.data)}` };
  }, results);
  
  // Test 3: User Login
  await runTest('User Login', async () => {
    const loginData = JSON.stringify({
      email: 'prodtest@example.com',
      password: 'password123'
    });
    
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      return { success: true, message: 'User logged in successfully' };
    }
    return { success: false, message: `Login failed: ${response.status} - ${JSON.stringify(response.data)}` };
  }, results);
  
  // Test 4: Create Project
  await runTest('Create Project', async () => {
    if (!authToken) {
      return { success: false, message: 'No auth token available' };
    }
    
    const projectData = JSON.stringify({
      title: 'Production Test Project',
      description: 'A project created during production testing',
      type: 'academic',
      category: 'technology',
      tags: ['production-test'],
      objectives: 'Test project creation in production',
      isPublic: true
    });
    
    const response = await makeRequest('POST', '/api/projects', projectData, authToken);
    if (response.status === 201 && response.data.data) {
      return { success: true, message: 'Project created successfully' };
    }
    return { success: false, message: `Project creation failed: ${response.status} - ${JSON.stringify(response.data)}` };
  }, results);
  
  // Test 5: Get Projects
  await runTest('Get Projects', async () => {
    const response = await makeRequest('GET', '/api/projects');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      return { success: true, message: `Retrieved ${response.data.data.length} projects` };
    }
    return { success: false, message: `Get projects failed: ${response.status} - ${JSON.stringify(response.data)}` };
  }, results);
  
  // Test 6: Get Feed
  await runTest('Get Feed', async () => {
    const response = await makeRequest('GET', '/api/feed');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      return { success: true, message: `Retrieved ${response.data.data.length} feed entries` };
    }
    return { success: false, message: `Get feed failed: ${response.status} - ${JSON.stringify(response.data)}` };
  }, results);
  
  // Print Results
  console.log('\n📊 Production Test Results:');
  console.log('==========================');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}: ${test.message}`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All production tests passed! Backend is working correctly on Render.com');
    console.log(`\n🔗 Your backend is live at: ${RENDER_URL}`);
    console.log('📋 Available endpoints:');
    console.log(`   - Health: ${RENDER_URL}/api/health`);
    console.log(`   - Auth: ${RENDER_URL}/api/auth/*`);
    console.log(`   - Projects: ${RENDER_URL}/api/projects`);
    console.log(`   - Feed: ${RENDER_URL}/api/feed`);
  } else {
    console.log('\n⚠️ Some production tests failed. Please check the issues above.');
  }
}

async function runTest(name, testFn, results) {
  try {
    const result = await testFn();
    results.tests.push({ name, ...result });
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ 
      name, 
      success: false, 
      message: `Test error: ${error.message}` 
    });
    results.failed++;
  }
}

function makeRequest(method, path, data, token) {
  return new Promise((resolve) => {
    const url = new URL(RENDER_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
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

testProduction();
