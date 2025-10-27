const http = require('http');

// Test projects flow
async function testProjects() {
  console.log('Testing projects flow...');
  
  // First, register and login to get a token
  console.log('\n1. Getting authentication token...');
  
  const registerData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });
  
  const registerResponse = await makeRequest('POST', '/api/auth/register', registerData);
  console.log('Register Status:', registerResponse.status);
  
  if (registerResponse.status !== 201) {
    console.log('❌ Registration failed');
    return;
  }
  
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });
  
  const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
  console.log('Login Status:', loginResponse.status);
  
  if (loginResponse.status !== 200 || !loginResponse.data.token) {
    console.log('❌ Login failed');
    return;
  }
  
  const token = loginResponse.data.token;
  console.log('✅ Authentication successful');
  
  // Test 2: Create a project
  console.log('\n2. Testing project creation...');
  const projectData = JSON.stringify({
    title: 'Test Project',
    description: 'A test project description',
    type: 'academic',
    category: 'technology',
    tags: ['test', 'academic'],
    objectives: 'Test objectives',
    teamMembers: ['Test User'],
    diasporaPositions: ['Developer'],
    priority: 'high',
    university: 'Test University',
    mentorshipConnection: true,
    isPublic: true
  });
  
  const createResponse = await makeRequest('POST', '/api/projects', projectData, token);
  console.log('Create Project Status:', createResponse.status);
  console.log('Create Project Response:', createResponse.data);
  
  if (createResponse.status === 201) {
    console.log('✅ Project creation successful');
    
    // Test 3: Get all projects
    console.log('\n3. Testing get all projects...');
    const getResponse = await makeRequest('GET', '/api/projects', null);
    console.log('Get Projects Status:', getResponse.status);
    console.log('Get Projects Response:', getResponse.data);
    
    if (getResponse.status === 200) {
      console.log('✅ Get projects successful');
      console.log(`Found ${getResponse.data.data.length} projects`);
      
      // Test 4: Get specific project
      if (getResponse.data.data.length > 0) {
        const projectId = getResponse.data.data[0].id;
        console.log(`\n4. Testing get specific project (${projectId})...`);
        
        const getOneResponse = await makeRequest('GET', `/api/projects/${projectId}`, null);
        console.log('Get Project Status:', getOneResponse.status);
        console.log('Get Project Response:', getOneResponse.data);
        
        if (getOneResponse.status === 200) {
          console.log('✅ Get specific project successful');
          console.log('\n🎉 All projects tests passed!');
        } else {
          console.log('❌ Get specific project failed');
        }
      }
    } else {
      console.log('❌ Get projects failed');
    }
  } else {
    console.log('❌ Project creation failed');
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

testProjects();
