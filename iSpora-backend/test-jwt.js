const jwt = require('jsonwebtoken');
const config = require('./src/config');

async function testJWT() {
  try {
    console.log('🧪 Testing JWT generation...');
    
    // Test JWT secret
    console.log('JWT Secret:', config.jwt.secret ? 'SET' : 'NOT SET');
    console.log('JWT Expires In:', config.jwt.expiresIn);
    
    // Test JWT generation
    const testPayload = { id: 'test-user-id' };
    const token = jwt.sign(testPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    
    console.log('✅ JWT generated successfully');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Test JWT verification
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('✅ JWT verified successfully');
    console.log('Decoded payload:', decoded);
    
  } catch (error) {
    console.error('❌ JWT test error:', error);
  }
}

testJWT();
