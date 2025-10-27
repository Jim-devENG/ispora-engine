#!/usr/bin/env node

/**
 * Debug script to test iSpora backend endpoints
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test 1: Health Check
async function testHealth() {
  console.log('🔍 Testing health check...');
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/api/health`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Health check response:', res.statusCode, body);
        resolve(res.statusCode === 200);
      });
    });
    req.on('error', (err) => {
      console.log('Health check error:', err.message);
      resolve(false);
    });
  });
}

// Test 2: Login to get token
async function testLogin() {
  console.log('🔍 Testing login...');
  return new Promise((resolve) => {
    const data = JSON.stringify({
      email: 'demo@ispora.app',
      password: 'demo123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Login response:', res.statusCode, body);
        if (res.statusCode === 200) {
          const response = JSON.parse(body);
          resolve(response.token);
        } else {
          resolve(null);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('Login error:', err.message);
      resolve(null);
    });
    
    req.write(data);
    req.end();
  });
}

// Test 3: Project Creation
async function testProjectCreation(token) {
  console.log('🔍 Testing project creation...');
  return new Promise((resolve) => {
    const data = JSON.stringify({
      title: 'Debug Test Project',
      description: 'Testing project creation with debug output'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Project creation response:', res.statusCode, body);
        resolve(res.statusCode === 201);
      });
    });
    
    req.on('error', (err) => {
      console.log('Project creation error:', err.message);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

// Test 4: Feed Activity (without auth)
async function testFeedActivity() {
  console.log('🔍 Testing feed activity (no auth)...');
  return new Promise((resolve) => {
    const data = JSON.stringify({
      type: 'test_activity',
      title: 'Debug Test Activity',
      description: 'Testing feed activity with debug output'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/feed/activity',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Feed activity response:', res.statusCode, body);
        resolve(res.statusCode === 201);
      });
    });
    
    req.on('error', (err) => {
      console.log('Feed activity error:', err.message);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

// Test 5: Feed Activity (with auth)
async function testFeedActivityWithAuth(token) {
  console.log('🔍 Testing feed activity (with auth)...');
  return new Promise((resolve) => {
    const data = JSON.stringify({
      type: 'test_activity',
      title: 'Debug Test Activity Auth',
      description: 'Testing feed activity with auth and debug output'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/feed/activity',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Feed activity (auth) response:', res.statusCode, body);
        resolve(res.statusCode === 201);
      });
    });
    
    req.on('error', (err) => {
      console.log('Feed activity (auth) error:', err.message);
      resolve(false);
    });
    
    req.write(data);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🛡️ iSpora Backend Debug Tests\n');
  
  const healthOk = await testHealth();
  console.log('');
  
  if (!healthOk) {
    console.log('❌ Health check failed, stopping tests');
    return;
  }
  
  const token = await testLogin();
  console.log('');
  
  if (token) {
    await testProjectCreation(token);
    console.log('');
    
    await testFeedActivityWithAuth(token);
    console.log('');
  }
  
  await testFeedActivity();
  console.log('');
  
  console.log('✅ Debug tests completed');
}

runTests().catch(console.error);
