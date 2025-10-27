const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Hash password for demo user
  const saltRounds = 12;
  const password = 'demo123';
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  // Inserts seed entries
  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@ispora.app',
      password_hash: passwordHash,
      first_name: 'Demo',
      last_name: 'User',
      user_type: 'student',
      username: 'demo',
      is_verified: true,
      email_verified: true,
      profile_completed: true,
      status: 'active',
      is_online: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'admin@ispora.app',
      password_hash: passwordHash,
      first_name: 'Admin',
      last_name: 'User',
      user_type: 'admin',
      username: 'admin',
      is_verified: true,
      email_verified: true,
      profile_completed: true,
      status: 'active',
      is_online: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
  
  console.log('✅ Seeded users table');
  console.log('📧 Demo User: demo@ispora.app / demo123');
  console.log('📧 Admin User: admin@ispora.app / demo123');
};
