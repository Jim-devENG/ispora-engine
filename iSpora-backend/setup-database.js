const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data', 'ispora.db');
const db = new sqlite3.Database(dbPath);

console.log('Setting up database...');

db.serialize(() => {
  // Create users table with all necessary columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT UNIQUE,
      title TEXT,
      company TEXT,
      location TEXT,
      bio TEXT,
      avatar_url TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      website_url TEXT,
      user_type TEXT DEFAULT 'student',
      status TEXT DEFAULT 'active',
      email_verified BOOLEAN DEFAULT 0,
      profile_completed BOOLEAN DEFAULT 0,
      is_online BOOLEAN DEFAULT 0,
      is_verified BOOLEAN DEFAULT 0,
      last_login DATETIME,
      skills TEXT,
      interests TEXT,
      education TEXT,
      experience TEXT,
      preferences TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table with all necessary columns
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      detailed_description TEXT,
      creator_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'draft',
      type TEXT DEFAULT 'academic',
      difficulty_level TEXT DEFAULT 'beginner',
      start_date DATE,
      end_date DATE,
      deadline DATE,
      max_participants INTEGER DEFAULT 1,
      current_participants INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT 1,
      requires_approval BOOLEAN DEFAULT 0,
      cover_image_url TEXT,
      category TEXT,
      location TEXT,
      tags TEXT,
      skills_required TEXT,
      learning_objectives TEXT,
      resources TEXT,
      deliverables TEXT,
      budget DECIMAL(10,2),
      currency TEXT DEFAULT 'USD',
      estimated_hours INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create feed table
  db.run(`
    CREATE TABLE IF NOT EXISTS feed (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create opportunities table
  db.run(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      company TEXT,
      location TEXT,
      type TEXT,
      posted_by TEXT REFERENCES users(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT 1,
      posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create network connections table
  db.run(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      connected_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create credits table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_credits (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      balance INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data
  db.run(`
    INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, username, is_verified) 
    VALUES ('user-1', 'demo@example.com', 'hashed_password', 'Demo', 'User', 'demouser', 1)
  `);

  db.run(`
    INSERT OR IGNORE INTO feed (id, type, title, description) 
    VALUES ('feed-1', 'project', 'New Project Created', 'A new project has been created successfully')
  `);

  db.run(`
    INSERT OR IGNORE INTO feed (id, type, title, description) 
    VALUES ('feed-2', 'update', 'Project Alpha Update', 'Milestone 1 achieved for Project Alpha')
  `);

  db.run(`
    INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, is_read) 
    VALUES ('notif-1', 'user-1', 'Welcome to iSpora!', 'Your account has been created successfully.', 'info', 0)
  `);

  db.run(`
    INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, is_read) 
    VALUES ('notif-2', 'user-1', 'New Message', 'You have a new message from John Doe.', 'message', 0)
  `);

  db.run(`
    INSERT OR IGNORE INTO opportunities (id, title, description, company, location, type, posted_by) 
    VALUES ('opp-1', 'Software Engineer', 'Join our amazing team!', 'TechCorp', 'San Francisco', 'job', 'user-1')
  `);

  db.run(`
    INSERT OR IGNORE INTO user_credits (id, user_id, balance) 
    VALUES ('credits-1', 'user-1', 100)
  `);

  console.log('✅ Database setup complete!');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed.');
  }
});
