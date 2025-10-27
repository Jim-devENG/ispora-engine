const http = require('http');

console.log('Testing backend startup...');

// Test if we can require the server
try {
  const server = require('./iSpora-backend/src/server.js');
  console.log('✅ Server module loaded successfully');
  
  // Test health endpoint after a short delay
  setTimeout(() => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ Health endpoint responded with status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ Health response:', data);
        process.exit(0);
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Health endpoint error:', error.message);
      process.exit(1);
    });
    
    req.end();
  }, 2000);
  
} catch (error) {
  console.log('❌ Server module error:', error.message);
  process.exit(1);
}
