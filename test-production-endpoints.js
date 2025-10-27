const http = require('http');

console.log('🧪 Testing iSpora Backend on Render...\n');

const baseUrl = 'https://ispora-backend.onrender.com';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('1️⃣ Testing GET /api/health...');
    const healthResponse = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data, null, 2)}\n`);

    console.log('2️⃣ Testing POST /api/tasks...');
    const taskData = {
      title: 'Test Task from Production',
      description: 'This is a test task from production',
      priority: 'high',
      dueDate: '2025-02-01'
    };
    const taskResponse = await makeRequest('POST', '/api/tasks', taskData);
    console.log(`   Status: ${taskResponse.status}`);
    console.log(`   Response: ${JSON.stringify(taskResponse.data, null, 2)}\n`);

    console.log('3️⃣ Testing POST /api/feed/activity...');
    const activityData = {
      type: 'test',
      title: 'Test Activity from Production',
      description: 'This is a test activity from production',
      category: 'general',
      metadata: { test: true, source: 'production' }
    };
    const activityResponse = await makeRequest('POST', '/api/feed/activity', activityData);
    console.log(`   Status: ${activityResponse.status}`);
    console.log(`   Response: ${JSON.stringify(activityResponse.data, null, 2)}\n`);

    console.log('4️⃣ Testing GET /api/placeholder/40/40...');
    const placeholderResponse = await makeRequest('GET', '/api/placeholder/40/40');
    console.log(`   Status: ${placeholderResponse.status}`);
    console.log(`   Content-Type: ${placeholderResponse.headers['content-type']}`);
    console.log(`   Response Length: ${placeholderResponse.data.length} characters\n`);

    console.log('5️⃣ Testing GET /api/tasks...');
    const tasksResponse = await makeRequest('GET', '/api/tasks');
    console.log(`   Status: ${tasksResponse.status}`);
    console.log(`   Response: ${JSON.stringify(tasksResponse.data, null, 2)}\n`);

    console.log('✅ All production tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Start the test
runTests();
