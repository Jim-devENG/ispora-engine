const http = require('http');

// Comprehensive smoke test for deployed backend
async function smokeTest() {
  console.log('🧪 Starting iSpora Backend Smoke Tests...\n');
  
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
      email: 'smoketest@example.com',
      password: 'password123',
      firstName: 'Smoke',
      lastName: 'Test'
    });
    
    const response = await makeRequest('POST', '/api/auth/register', userData);
    if (response.status === 201 && response.data.token) {
      authToken = response.data.token;
      return { success: true, message: 'User registered successfully' };
    }
    return { success: false, message: `Registration failed: ${response.status}` };
  }, results);
  
  // Test 3: User Login
  await runTest('User Login', async () => {
    const loginData = JSON.stringify({
      email: 'smoketest@example.com',
      password: 'password123'
    });
    
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      return { success: true, message: 'User logged in successfully' };
    }
    return { success: false, message: `Login failed: ${response.status}` };
  }, results);
  
  // Test 4: Get User Profile
  await runTest('Get User Profile', async () => {
    if (!authToken) {
      return { success: false, message: 'No auth token available' };
    }
    
    const response = await makeRequest('GET', '/api/auth/me', null, authToken);
    if (response.status === 200 && response.data.user) {
      return { success: true, message: 'User profile retrieved successfully' };
    }
    return { success: false, message: `Get profile failed: ${response.status}` };
  }, results);
  
  // Test 5: Create Project
  let projectId;
  await runTest('Create Project', async () => {
    if (!authToken) {
      return { success: false, message: 'No auth token available' };
    }
    
    const projectData = JSON.stringify({
      title: 'Smoke Test Project',
      description: 'A project created during smoke testing',
      type: 'academic',
      category: 'technology',
      tags: ['smoke-test', 'automated'],
      objectives: 'Test project creation functionality',
      teamMembers: ['Smoke Test User'],
      diasporaPositions: ['Developer'],
      priority: 'high',
      university: 'Test University',
      mentorshipConnection: true,
      isPublic: true
    });
    
    const response = await makeRequest('POST', '/api/projects', projectData, authToken);
    if (response.status === 201 && response.data.data) {
      projectId = response.data.data.id;
      return { success: true, message: 'Project created successfully' };
    }
    return { success: false, message: `Project creation failed: ${response.status}` };
  }, results);
  
  // Test 6: Get All Projects
  await runTest('Get All Projects', async () => {
    const response = await makeRequest('GET', '/api/projects');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      return { success: true, message: `Retrieved ${response.data.data.length} projects` };
    }
    return { success: false, message: `Get projects failed: ${response.status}` };
  }, results);
  
  // Test 7: Get Specific Project
  await runTest('Get Specific Project', async () => {
    if (!projectId) {
      return { success: false, message: 'No project ID available' };
    }
    
    const response = await makeRequest('GET', `/api/projects/${projectId}`);
    if (response.status === 200 && response.data.data) {
      return { success: true, message: 'Project retrieved successfully' };
    }
    return { success: false, message: `Get project failed: ${response.status}` };
  }, results);
  
  // Test 8: Get Feed
  await runTest('Get Feed', async () => {
    const response = await makeRequest('GET', '/api/feed');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      return { success: true, message: `Retrieved ${response.data.data.length} feed entries` };
    }
    return { success: false, message: `Get feed failed: ${response.status}` };
  }, results);
  
  // Test 9: Track Activity
  await runTest('Track Activity', async () => {
    const activityData = JSON.stringify({
      type: 'smoke_test',
      title: 'Smoke Test Activity',
      description: 'Activity created during smoke testing',
      category: 'test',
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
    
    const response = await makeRequest('POST', '/api/feed/activity', activityData);
    if (response.status === 201 && response.data.data) {
      return { success: true, message: 'Activity tracked successfully' };
    }
    return { success: false, message: `Track activity failed: ${response.status}` };
  }, results);
  
  // Test 10: Get Sessions
  await runTest('Get Sessions', async () => {
    const response = await makeRequest('GET', '/api/feed/sessions');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      return { success: true, message: `Retrieved ${response.data.data.length} sessions` };
    }
    return { success: false, message: `Get sessions failed: ${response.status}` };
  }, results);
  
  // Test 11: SSE Stream (Basic Connection)
  await runTest('SSE Stream Connection', async () => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/feed/stream',
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      };
      
      const req = http.request(options, (res) => {
        if (res.statusCode === 200 && res.headers['content-type'] === 'text/event-stream') {
          let dataReceived = false;
          res.on('data', (chunk) => {
            const data = chunk.toString();
            if (data.includes('connected') && !dataReceived) {
              dataReceived = true;
              res.destroy();
              resolve({ success: true, message: 'SSE stream connected successfully' });
            }
          });
          
          setTimeout(() => {
            res.destroy();
            if (!dataReceived) {
              resolve({ success: false, message: 'SSE stream connection timeout' });
            }
          }, 3000);
        } else {
          resolve({ success: false, message: `SSE stream failed: ${res.statusCode}` });
        }
      });
      
      req.on('error', (error) => {
        resolve({ success: false, message: `SSE stream error: ${error.message}` });
      });
      
      req.end();
    });
  }, results);
  
  // Print Results
  console.log('\n📊 Smoke Test Results:');
  console.log('====================');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}: ${test.message}`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All smoke tests passed! Backend is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some smoke tests failed. Please check the issues above.');
    process.exit(1);
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

smokeTest();
