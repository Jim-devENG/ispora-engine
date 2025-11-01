#!/usr/bin/env node

/**
 * iSpora Integration Test Script
 * Tests the complete project creation flow end-to-end
 */

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          // Try to parse as JSON, but if it fails, return the raw data
          let body;
          try {
            body = data ? JSON.parse(data) : {};
          } catch (parseError) {
            // If it's not JSON (like SVG), return the raw data
            body = data;
          }
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        } catch (e) {
          reject(new Error(`Failed to process response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
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
    
    if (response.statusCode === 200) {
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

// Test 2: Placeholder API
async function testPlaceholderAPI() {
  console.log('🔍 Testing placeholder API...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/placeholder/40/40',
      method: 'GET'
    });
    
    if (response.statusCode === 200 && response.headers['content-type'] === 'image/svg+xml') {
      console.log('✅ Placeholder API passed');
      return true;
    } else if (response.statusCode === 200 && response.body.includes('<svg')) {
      console.log('✅ Placeholder API passed (SVG content detected)');
      return true;
    } else {
      console.log('❌ Placeholder API failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Placeholder API error:', error.message);
    return false;
  }
}

// Test 3: User Login
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
    
    if (response.statusCode === 200 && response.body.token) {
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

// Test 4: Project Creation with Category
async function testProjectCreationWithCategory() {
  console.log('🔍 Testing project creation with category...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      title: 'Integration Test Project',
      description: 'This project tests the complete integration flow',
      category: 'technology',
      type: 'academic',
      priority: 'high'
    });

    if (response.statusCode === 201 && response.body.success) {
      console.log('✅ Project creation with category passed');
      console.log('📊 Project ID:', response.body.data.id);
      return true;
    } else {
      console.log('❌ Project creation with category failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Project creation with category error:', error.message);
    return false;
  }
}

// Test 5: Project Creation without Category (fallback test)
async function testProjectCreationWithoutCategory() {
  console.log('🔍 Testing project creation without category (fallback test)...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      title: 'Fallback Test Project',
      description: 'This project tests the category fallback mechanism'
    });

    if (response.statusCode === 201 && response.body.success && response.body.data.category === 'Uncategorized') {
      console.log('✅ Project creation without category passed (fallback worked)');
      console.log('📊 Project category:', response.body.data.category);
      return true;
    } else {
      console.log('❌ Project creation without category failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Project creation without category error:', error.message);
    return false;
  }
}

// Test 6: Feed Activity Creation
async function testFeedActivityCreation() {
  console.log('🔍 Testing feed activity creation...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/feed/activity',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      type: 'project_created',
      title: 'Integration Test Activity',
      description: 'Testing feed activity creation'
    });

    if (response.statusCode === 201 && response.body.success) {
      console.log('✅ Feed activity creation passed');
      console.log('📊 Activity ID:', response.body.data.id);
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

// Test 7: Error Logging
async function testErrorLogging() {
  console.log('🔍 Testing error logging...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/logs',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      error: 'Test error message',
      stack: 'Test stack trace',
      componentStack: 'Test component stack',
      timestamp: new Date().toISOString(),
      userAgent: 'Test User Agent',
      url: 'http://localhost:3000/test'
    });

    if (response.statusCode === 200 && response.body.success) {
      console.log('✅ Error logging passed');
      return true;
    } else {
      console.log('❌ Error logging failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Error logging error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting iSpora Integration Tests...\n');
  
  const tests = [
    testHealthCheck,
    testPlaceholderAPI,
    testUserLogin,
    testProjectCreationWithCategory,
    testProjectCreationWithoutCategory,
    testFeedActivityCreation,
    testErrorLogging
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Test error:', error.message);
      failed++;
    }
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! iSpora integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);
