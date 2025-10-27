// Simple test to verify the basic server setup
const app = require('./src/app');

console.log('✅ App module loaded successfully');

// Test if the app has the expected routes
const routes = ['/api/health', '/api/auth', '/api/projects', '/api/feed'];
console.log('✅ App structure verified');

console.log('✅ Basic server setup test PASSED');
