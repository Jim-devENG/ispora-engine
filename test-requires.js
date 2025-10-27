console.log('Testing backend dependencies...');

try {
  require('dotenv');
  console.log('✅ dotenv loaded');
} catch (e) {
  console.log('❌ dotenv error:', e.message);
}

try {
  require('express');
  console.log('✅ express loaded');
} catch (e) {
  console.log('❌ express error:', e.message);
}

try {
  require('bcrypt');
  console.log('✅ bcrypt loaded');
} catch (e) {
  console.log('❌ bcrypt error:', e.message);
}

try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken loaded');
} catch (e) {
  console.log('❌ jsonwebtoken error:', e.message);
}

try {
  require('knex');
  console.log('✅ knex loaded');
} catch (e) {
  console.log('❌ knex error:', e.message);
}

console.log('Dependency test complete');
