const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./src/database/connection');

async function createDemoUser() {
  try {
    console.log('🔧 Creating demo user...');
    
    // Check if demo user already exists
    const existingUser = await db('users').where({ email: 'demo@ispora.com' }).first();
    
    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email);
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('demo123', salt);
    
    // Create demo user
    const userId = uuidv4();
    const userData = {
      id: userId,
      email: 'demo@ispora.com',
      password_hash: passwordHash,
      first_name: 'Demo',
      last_name: 'User',
      user_type: 'student',
      username: 'demo',
      is_verified: true,
      email_verified: true,
      profile_completed: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    await db('users').insert(userData);
    
    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@ispora.com');
    console.log('🔑 Password: demo123');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    db.destroy();
  }
}

createDemoUser();
