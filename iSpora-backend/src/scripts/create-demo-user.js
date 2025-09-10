const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

async function createDemoUser() {
  try {
    console.log('Creating demo user...');

    // Check if demo user already exists
    const existingUser = await db('users')
      .where({ email: 'demo@ispora.com' })
      .first();

    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email: demo@ispora.com');
      console.log('Password: demo123');
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
      username: 'demo_user',
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('users').insert(userData);

    console.log('Demo user created successfully!');
    console.log('Email: demo@ispora.com');
    console.log('Password: demo123');
    console.log('User ID:', userId);

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    process.exit(0);
  }
}

createDemoUser();
