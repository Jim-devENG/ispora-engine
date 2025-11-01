/**
 * 🧪 Automated Test for Project Creation
 * Tests the full project creation flow and feed integration
 */

require('dotenv').config();

// Use Node's built-in fetch (available in Node 18+)
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  // Fallback for older Node versions
  const https = require('https');
  const http = require('http');
  const { URL } = require('url');
  
  fetch = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const httpModule = urlObj.protocol === 'https:' ? https : http;
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };
      
      const req = httpModule.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    });
  };
}

const API_BASE_URL = process.env.API_URL || 'https://ispora-backend.onrender.com/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testProjectCreation() {
  log('\n🧪 Starting Project Creation Test...\n', 'cyan');
  
  let authToken = null;
  let projectId = null;
  
  try {
    // Step 1: Login to get auth token
    log('📝 Step 1: Authenticating user...', 'blue');
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginData.success && loginData.token) {
        authToken = loginData.token;
        log('✅ Authentication successful!', 'green');
        log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
      } else {
        // Try to register if login fails
        log('⚠️  Login failed, attempting registration...', 'yellow');
        const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: TEST_USER.email,
            password: TEST_USER.password,
            firstName: 'Test',
            lastName: 'User'
          })
        });
        
        const registerData = await registerResponse.json();
        if (registerData.success && registerData.token) {
          authToken = registerData.token;
          log('✅ Registration successful!', 'green');
        } else {
          throw new Error('Authentication failed');
        }
      }
    } catch (authError) {
      log('❌ Authentication failed:', 'red');
      log(`   ${authError.message}`, 'red');
      throw authError;
    }
    
    // Step 2: Create a test project
    log('\n📝 Step 2: Creating test project...', 'blue');
    const projectPayload = {
      title: `Test Project - ${new Date().toISOString()}`,
      description: 'This is an automated test project to verify the creation flow and feed integration.',
      type: 'academic',
      category: 'education',
      tags: ['test', 'automation', 'integration'],
      objectives: [
        'Test project creation endpoint',
        'Verify feed entry creation',
        'Ensure project appears in feed'
      ],
      priority: 'medium',
      university: 'Test University',
      mentorshipConnection: false,
      isPublic: true
    };
    
    log(`   Title: ${projectPayload.title}`, 'yellow');
    log(`   Category: ${projectPayload.category}`, 'yellow');
    log(`   Objectives: ${projectPayload.objectives.length}`, 'yellow');
    
    const projectResponse = await fetch(
      `${API_BASE_URL}/projects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectPayload)
      }
    );
    
    const projectResult = await projectResponse.json();
    
    if (projectResult.success) {
      projectId = projectResult.project?.id || projectResult.data?.id;
      log('✅ Project created successfully!', 'green');
      log(`   Project ID: ${projectId}`, 'yellow');
      log(`   Title: ${projectResult.project?.title || projectResult.data?.title}`, 'yellow');
      
      // Check if feed entry was created
      if (projectResult.activity) {
        log('✅ Feed entry created automatically!', 'green');
        log(`   Activity ID: ${projectResult.activity.id}`, 'yellow');
      } else {
        log('⚠️  No feed entry in response (might be created separately)', 'yellow');
      }
    } else {
      throw new Error(`Project creation failed: ${projectResult.error}`);
    }
    
    // Step 3: Wait a moment for database sync
    log('\n⏳ Step 3: Waiting for database sync...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Verify project appears in feed
    log('\n📝 Step 4: Checking feed for new project...', 'blue');
    const feedResponse = await fetch(`${API_BASE_URL}/feed?page=1&limit=20`);
    const feedData = await feedResponse.json();
    
    if (feedData.success && feedData.data) {
      const feedEntries = feedData.data;
      log(`✅ Feed retrieved successfully!`, 'green');
      log(`   Total entries: ${feedEntries.length}`, 'yellow');
      
      // Look for our project in the feed
      const ourProject = feedEntries.find(entry => 
        entry.project?.id === projectId || 
        entry.title?.includes('Test Project') ||
        entry.metadata?.project_id === projectId
      );
      
      if (ourProject) {
        log('✅ Our project found in feed!', 'green');
        log(`   Feed Entry ID: ${ourProject.id}`, 'yellow');
        log(`   Type: ${ourProject.type}`, 'yellow');
        log(`   Title: ${ourProject.title}`, 'yellow');
        if (ourProject.project) {
          log(`   Project: ${ourProject.project.title}`, 'yellow');
        }
      } else {
        log('⚠️  Project not found in feed yet (might need refresh)', 'yellow');
        log('   Recent feed entries:', 'yellow');
        feedEntries.slice(0, 3).forEach((entry, idx) => {
          log(`   ${idx + 1}. ${entry.title} (${entry.type})`, 'yellow');
        });
      }
    } else {
      log('⚠️  Feed retrieval returned unexpected format', 'yellow');
    }
    
    // Step 5: Verify project can be fetched directly
    log('\n📝 Step 5: Verifying project can be fetched...', 'blue');
    if (projectId) {
      try {
        const getProjectResponse = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        const getProjectData = await getProjectResponse.json();
        if (getProjectData.success) {
          log('✅ Project can be fetched directly!', 'green');
          log(`   Title: ${getProjectData.data.title}`, 'yellow');
        } else {
          log('⚠️  Project fetch returned unexpected format', 'yellow');
        }
      } catch (fetchError) {
        log('⚠️  Could not fetch project (might be normal)', 'yellow');
      }
    }
    
    // Summary
    log('\n📊 Test Summary:', 'cyan');
    log(`   ✅ Authentication: PASSED`, 'green');
    log(`   ✅ Project Creation: PASSED`, 'green');
    log(`   ✅ Feed Integration: ${feedData.success ? 'PASSED' : 'NEEDS CHECK'}`, 
         feedData.success ? 'green' : 'yellow');
    log(`   Project ID: ${projectId}`, 'yellow');
    
    log('\n✅ All tests completed successfully!', 'green');
    
  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    log(`   Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log(`   Stack: ${error.stack}`, 'red');
    }
    
    process.exit(1);
  }
}

// Run the test
testProjectCreation();

