#!/usr/bin/env node

/**
 * 🛡️ DevOps Guardian: Comprehensive Test Suite
 * Tests all the fixes implemented for the 400 Bad Request issue
 */

const http = require('http');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
  firstName: 'DevOps',
  lastName: 'Guardian',
  email: `devops.test.${Date.now()}@ispora.app`,
  password: 'password123'
};

let authToken = null;
let testProjectId = null;

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.body.status === 'ok') {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

// Test 2: User Login (using seeded user)
async function testUserLogin() {
  console.log('🔍 Testing user login...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'demo@ispora.app',
      password: 'demo123'
    });
    
    if (response.statusCode === 200) {
      authToken = response.body.token;
      console.log('✅ User login passed');
      return true;
    } else {
      console.log('❌ User login failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
    return false;
  }
}

// Test 3: Project Creation with Missing Category (should use fallback)
async function testProjectCreationMissingCategory() {
  console.log('🔍 Testing project creation with missing category (fallback test)...');
  try {
    const projectData = {
      title: 'DevOps Guardian Test Project',
      description: 'This project tests the category fallback mechanism'
      // Intentionally missing category
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, projectData);
    
    if (response.statusCode === 201) {
      testProjectId = response.body.data.id;
      console.log('✅ Project creation with missing category passed (fallback worked)');
      console.log('📊 Project category:', response.body.data.category);
      return true;
    } else {
      console.log('❌ Project creation with missing category failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Project creation error:', error.message);
    return false;
  }
}

// Test 4: Project Creation with Valid Category
async function testProjectCreationValidCategory() {
  console.log('🔍 Testing project creation with valid category...');
  try {
    const projectData = {
      title: 'DevOps Guardian Test Project 2',
      description: 'This project tests the normal category validation',
      category: 'technology',
      type: 'academic',
      priority: 'high'
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, projectData);
    
    if (response.statusCode === 201) {
      console.log('✅ Project creation with valid category passed');
      console.log('📊 Project category:', response.body.data.category);
      return true;
    } else {
      console.log('❌ Project creation with valid category failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Project creation error:', error.message);
    return false;
  }
}

// Test 5: Placeholder Route
async function testPlaceholderRoute() {
  console.log('🔍 Testing placeholder route...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/placeholder/300/200',
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.body.includes('<svg')) {
      console.log('✅ Placeholder route passed');
      return true;
    } else {
      console.log('❌ Placeholder route failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Placeholder route error:', error.message);
    return false;
  }
}

// Test 6: Feed Activity Creation
async function testFeedActivityCreation() {
  console.log('🔍 Testing feed activity creation...');
  try {
    const activityData = {
      type: 'project_created',
      title: 'Test Activity',
      description: 'This is a test activity',
      category: 'general'
    };
    
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/feed/activity',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, activityData);
    
    if (response.statusCode === 201) {
      console.log('✅ Feed activity creation passed');
      return true;
    } else {
      console.log('❌ Feed activity creation failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Feed activity creation error:', error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🛡️ DevOps Guardian: Running comprehensive test suite...\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Project Creation (Missing Category)', fn: testProjectCreationMissingCategory },
    { name: 'Project Creation (Valid Category)', fn: testProjectCreationValidCategory },
    { name: 'Placeholder Route', fn: testPlaceholderRoute },
    { name: 'Feed Activity Creation', fn: testFeedActivityCreation }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} crashed:`, error.message);
      failed++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! iSpora backend is hardened and ready for deployment.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the issues above.');
  }
}

// Run the tests
runAllTests().catch(console.error);
