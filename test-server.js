const http = require('http');

// Test the health endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      if (json.status === 'ok') {
        console.log('✅ Health check PASSED');
        process.exit(0);
      } else {
        console.log('❌ Health check FAILED - unexpected response');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Health check FAILED - invalid JSON response');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Health check FAILED - connection error:', error.message);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.log('❌ Health check FAILED - timeout');
  req.destroy();
  process.exit(1);
});

req.end();
