const http = require('http');

// Test feed endpoints
async function testFeed() {
  console.log('Testing feed endpoints...');
  
  // Test 1: Get feed entries
  console.log('\n1. Testing get feed entries...');
  const feedResponse = await makeRequest('GET', '/api/feed', null);
  console.log('Feed Status:', feedResponse.status);
  console.log('Feed Response:', feedResponse.data);
  
  if (feedResponse.status === 200) {
    console.log('✅ Get feed successful');
    console.log(`Found ${feedResponse.data.data.length} feed entries`);
  } else {
    console.log('❌ Get feed failed');
  }
  
  // Test 2: Track activity
  console.log('\n2. Testing track activity...');
  const activityData = JSON.stringify({
    type: 'test',
    title: 'Test Activity',
    description: 'Testing activity tracking',
    category: 'test',
    metadata: { test: true }
  });
  
  const activityResponse = await makeRequest('POST', '/api/feed/activity', activityData);
  console.log('Activity Status:', activityResponse.status);
  console.log('Activity Response:', activityResponse.data);
  
  if (activityResponse.status === 201) {
    console.log('✅ Track activity successful');
  } else {
    console.log('❌ Track activity failed');
  }
  
  // Test 3: Get sessions
  console.log('\n3. Testing get sessions...');
  const sessionsResponse = await makeRequest('GET', '/api/feed/sessions', null);
  console.log('Sessions Status:', sessionsResponse.status);
  console.log('Sessions Response:', sessionsResponse.data);
  
  if (sessionsResponse.status === 200) {
    console.log('✅ Get sessions successful');
    console.log(`Found ${sessionsResponse.data.count} sessions`);
  } else {
    console.log('❌ Get sessions failed');
  }
  
  // Test 4: Test SSE stream (basic connection test)
  console.log('\n4. Testing SSE stream connection...');
  testSSEStream();
}

function testSSEStream() {
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
    console.log('SSE Status:', res.statusCode);
    console.log('SSE Headers:', res.headers);
    
    if (res.statusCode === 200 && res.headers['content-type'] === 'text/event-stream') {
      console.log('✅ SSE stream connection successful');
      
      let dataReceived = false;
      res.on('data', (chunk) => {
        const data = chunk.toString();
        console.log('SSE Data:', data);
        if (data.includes('connected') && !dataReceived) {
          dataReceived = true;
          console.log('✅ SSE stream data received');
          res.destroy();
        }
      });
      
      // Close after 3 seconds
      setTimeout(() => {
        res.destroy();
        if (!dataReceived) {
          console.log('❌ No SSE data received');
        }
      }, 3000);
    } else {
      console.log('❌ SSE stream connection failed');
    }
  });
  
  req.on('error', (error) => {
    console.log('❌ SSE stream error:', error.message);
  });
  
  req.end();
}

function makeRequest(method, path, data) {
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

testFeed();
