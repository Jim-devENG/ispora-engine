const bcrypt = require('bcryptjs');
const db = require('./src/database/connection');

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Find demo user
    const user = await db('users').where({ email: 'demo@ispora.com' }).first();
    
    if (!user) {
      console.log('❌ Demo user not found');
      return;
    }
    
    console.log('✅ Demo user found:', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0
    });
    
    // Test password comparison
    const testPassword = 'demo123';
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log('🔍 Password test:');
    console.log(`  Test password: ${testPassword}`);
    console.log(`  Stored hash: ${user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'null'}`);
    console.log(`  Match result: ${isMatch}`);
    
    if (isMatch) {
      console.log('✅ Password comparison successful!');
    } else {
      console.log('❌ Password comparison failed!');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    db.destroy();
  }
}

testLogin();
