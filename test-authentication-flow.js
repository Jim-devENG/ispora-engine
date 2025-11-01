/**
 * 🧪 Test Authentication Flow
 * Tests the full authentication and project creation flow to verify fixes
 */

require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'https://ispora-backend.onrender.com/api';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'testpassword123'
};

// Use Node's built-in fetch (available in Node 18+)
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
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

async function testAuthenticationFlow() {
  log('\n🧪 Testing Authentication Flow...\n', 'cyan');
  
  let authToken = null;
  let projectId = null;
  let testResults = {
    registration: false,
    login: false,
    tokenValidation: false,
    userLookup: false,
    projectCreation: false,
    feedCheck: false
  };
  
  try {
    // Step 1: Register a new user
    log('📝 Step 1: Registering new user...', 'blue');
    log(`   Email: ${TEST_USER.email}`, 'yellow');
    
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
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      throw new Error(`Registration failed: ${registerResponse.status} - ${errorText.substring(0, 200)}`);
    }
    
    const registerData = await registerResponse.json();
    if (registerData.success && registerData.token) {
      authToken = registerData.token;
      testResults.registration = true;
      log('✅ Registration successful!', 'green');
      log(`   Token received: ${authToken.substring(0, 20)}...`, 'yellow');
    } else {
      throw new Error('Registration failed - no token received');
    }
    
    // Step 2: Verify token by checking user profile
    log('\n📝 Step 2: Verifying token with user profile...', 'blue');
    const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.success && profileData.user) {
        testResults.tokenValidation = true;
        testResults.userLookup = true;
        log('✅ Token validated successfully!', 'green');
        log(`   User ID: ${profileData.user.id}`, 'yellow');
        log(`   User Email: ${profileData.user.email}`, 'yellow');
      } else {
        log('⚠️  Token valid but user data missing', 'yellow');
      }
    } else {
      log('⚠️  Profile check failed (might be normal)', 'yellow');
    }
    
    // Step 3: Create a test project
    log('\n📝 Step 3: Creating test project with valid token...', 'blue');
    const projectPayload = {
      title: `Test Project - ${new Date().toISOString()}`,
      description: 'This is a test project to verify authentication and project creation.',
      type: 'academic',
      category: 'education',
      tags: ['test', 'automation'],
      objectives: ['Verify authentication works', 'Test project creation'],
      priority: 'medium',
      university: 'Test University',
      mentorshipConnection: false,
      isPublic: true
    };
    
    const projectResponse = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectPayload)
    });
    
    const projectResult = await projectResponse.json();
    
    if (projectResponse.ok && projectResult.success) {
      projectId = projectResult.project?.id || projectResult.data?.id;
      testResults.projectCreation = true;
      log('✅ Project created successfully!', 'green');
      log(`   Project ID: ${projectId}`, 'yellow');
      log(`   Title: ${projectResult.project?.title || projectResult.data?.title}`, 'yellow');
    } else {
      log('❌ Project creation failed:', 'red');
      log(`   Status: ${projectResponse.status}`, 'red');
      log(`   Error: ${JSON.stringify(projectResult, null, 2)}`, 'red');
      throw new Error(`Project creation failed: ${projectResult.error || 'Unknown error'}`);
    }
    
    // Step 4: Check feed for the project
    log('\n📝 Step 4: Checking feed for new project...', 'blue');
    try {
      const feedResponse = await fetch(`${API_BASE_URL}/feed?page=1&limit=10`);
      if (feedResponse.ok) {
        const feedData = await feedResponse.json();
        if (feedData.success && feedData.data) {
          const ourProject = feedData.data.find(entry => 
            entry.project?.id === projectId || 
            entry.project_id === projectId ||
            entry.title?.includes('Test Project')
          );
          if (ourProject) {
            testResults.feedCheck = true;
            log('✅ Project found in feed!', 'green');
          } else {
            log('⚠️  Project not in feed yet (might need refresh)', 'yellow');
          }
        }
      }
    } catch (feedError) {
      log('⚠️  Feed check skipped:', 'yellow');
    }
    
    // Summary
    log('\n📊 Test Results Summary:', 'cyan');
    log('━'.repeat(50), 'cyan');
    
    const allPassed = Object.values(testResults).every(result => result === true);
    const passedCount = Object.values(testResults).filter(r => r === true).length;
    const totalTests = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      const color = passed ? 'green' : 'red';
      log(`   ${test.replace(/([A-Z])/g, ' $1').trim()}: ${status}`, color);
    });
    
    log('━'.repeat(50), 'cyan');
    log(`   Passed: ${passedCount}/${totalTests} tests`, passedCount === totalTests ? 'green' : 'yellow');
    
    if (allPassed) {
      log('\n✅ All authentication flow tests PASSED!', 'green');
      log('   Authentication and project creation are working correctly.', 'green');
    } else {
      log('\n⚠️  Some tests failed - check logs above for details', 'yellow');
    }
    
    log('\n🎯 What to check in production:', 'cyan');
    log('   1. Open browser console (F12)', 'yellow');
    log('   2. Try to create a project', 'yellow');
    log('   3. If you see "User not found", log out and log back in', 'yellow');
    log('   4. After logging in again, try creating a project', 'yellow');
    log('   5. Check console for any 401 errors', 'yellow');
    
  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    log(`   Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`, 'red');
    }
    
    log('\n🔍 Debugging Tips:', 'cyan');
    log('   1. Check if backend is running:', 'yellow');
    log(`      curl ${API_BASE_URL}/health`, 'yellow');
    log('   2. Check if token is being sent correctly', 'yellow');
    log('   3. Verify user exists in database', 'yellow');
    log('   4. Check backend logs for authentication errors', 'yellow');
    
    process.exit(1);
  }
}

// Run the test
testAuthenticationFlow();

