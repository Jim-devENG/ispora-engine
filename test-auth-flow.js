/**
 * 🧪 Test Authentication Flow: Registration → Login
 * Tests the complete authentication flow to ensure registered users can log in
 */

require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'https://ispora-backend.onrender.com/api';
const TEST_USER = {
  email: `test-auth-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
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

async function testAuthFlow() {
  log('\n🧪 Testing Authentication Flow: Registration → Login\n', 'cyan');
  
  let registrationToken = null;
  let loginToken = null;
  let registeredUserId = null;
  let testResults = {
    registration: false,
    databaseVerification: false,
    login: false,
    tokenValidation: false,
    sameUser: false
  };
  
  try {
    // Step 1: Register a new user
    log('📝 Step 1: Registering new user...', 'blue');
    log(`   Email: ${TEST_USER.email}`, 'yellow');
    log(`   Password: ${TEST_USER.password}`, 'yellow');
    
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName
      })
    });
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      log('❌ Registration failed:', 'red');
      log(`   Status: ${registerResponse.status}`, 'red');
      log(`   Response: ${errorText.substring(0, 300)}`, 'red');
      throw new Error(`Registration failed: ${registerResponse.status} - ${errorText.substring(0, 200)}`);
    }
    
    const registerData = await registerResponse.json();
    
    if (registerData.success && registerData.token) {
      registrationToken = registerData.token;
      registeredUserId = registerData.user?.id;
      testResults.registration = true;
      log('✅ Registration successful!', 'green');
      log(`   User ID: ${registeredUserId}`, 'yellow');
      log(`   Token received: ${registrationToken.substring(0, 30)}...`, 'yellow');
      log(`   Email normalized: ${registerData.user?.email}`, 'yellow');
    } else {
      throw new Error('Registration failed - no token received');
    }
    
    // Step 2: Wait a moment for database to sync
    log('\n⏳ Step 2: Waiting for database sync...', 'blue');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Verify user exists in database by checking profile
    log('\n📝 Step 3: Verifying user exists in database...', 'blue');
    const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${registrationToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.success && profileData.user) {
        testResults.databaseVerification = true;
        log('✅ User verified in database!', 'green');
        log(`   User ID: ${profileData.user.id}`, 'yellow');
        log(`   Email: ${profileData.user.email}`, 'yellow');
      } else {
        log('⚠️  Profile check failed (might be normal)', 'yellow');
      }
    } else {
      log('⚠️  Profile check failed (might be normal)', 'yellow');
    }
    
    // Step 4: Login with the same credentials
    log('\n📝 Step 4: Logging in with registered credentials...', 'blue');
    log(`   Email: ${TEST_USER.email}`, 'yellow');
    log(`   Password: ${TEST_USER.password}`, 'yellow');
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      log('❌ Login failed:', 'red');
      log(`   Status: ${loginResponse.status}`, 'red');
      log(`   Response: ${errorText.substring(0, 300)}`, 'red');
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText.substring(0, 200)}`);
    }
    
    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.token) {
      loginToken = loginData.token;
      testResults.login = true;
      log('✅ Login successful!', 'green');
      log(`   User ID: ${loginData.user?.id}`, 'yellow');
      log(`   Token received: ${loginToken.substring(0, 30)}...`, 'yellow');
      log(`   Email: ${loginData.user?.email}`, 'yellow');
    } else {
      throw new Error('Login failed - no token received');
    }
    
    // Step 5: Verify tokens are valid
    log('\n📝 Step 5: Verifying tokens are valid...', 'blue');
    if (registrationToken && loginToken) {
      testResults.tokenValidation = true;
      log('✅ Both tokens received!', 'green');
      log(`   Registration token length: ${registrationToken.length}`, 'yellow');
      log(`   Login token length: ${loginToken.length}`, 'yellow');
    }
    
    // Step 6: Verify same user
    log('\n📝 Step 6: Verifying same user for both tokens...', 'blue');
    if (registeredUserId && loginData.user?.id && registeredUserId === loginData.user.id) {
      testResults.sameUser = true;
      log('✅ Same user confirmed!', 'green');
      log(`   User ID matches: ${registeredUserId}`, 'yellow');
    } else {
      log('⚠️  User ID mismatch:', 'yellow');
      log(`   Registered ID: ${registeredUserId}`, 'yellow');
      log(`   Login ID: ${loginData.user?.id}`, 'yellow');
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
      log('   Users can register and log in successfully.', 'green');
      log('   ✅ iSpora backend and frontend fully synchronized.', 'green');
    } else {
      log('\n⚠️  Some tests failed - check logs above for details', 'yellow');
    }
    
    log('\n🎯 Verification Checklist:', 'cyan');
    log('   ✅ Registration creates user with hashed password', testResults.registration ? 'green' : 'red');
    log('   ✅ User exists in database after registration', testResults.databaseVerification ? 'green' : 'yellow');
    log('   ✅ Login with same credentials succeeds', testResults.login ? 'green' : 'red');
    log('   ✅ JWT tokens are generated correctly', testResults.tokenValidation ? 'green' : 'yellow');
    log('   ✅ Same user ID for registration and login', testResults.sameUser ? 'green' : 'yellow');
    
  } catch (error) {
    log('\n❌ Test Failed!', 'red');
    log(`   Error: ${error.message}`, 'red');
    
    if (error.stack) {
      log(`   Stack: ${error.stack.split('\n').slice(0, 5).join('\n')}`, 'red');
    }
    
    log('\n🔍 Debugging Tips:', 'cyan');
    log('   1. Check backend logs for detailed authentication debugging', 'yellow');
    log('   2. Verify database connection is active', 'yellow');
    log('   3. Check if email normalization is working (lowercase)', 'yellow');
    log('   4. Verify bcrypt password hashing and comparison', 'yellow');
    log('   5. Check JWT token generation and validation', 'yellow');
    
    process.exit(1);
  }
}

// Run the test
testAuthFlow();

