const fs = require('fs');
const path = require('path');

// Directory containing migration files
const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');

// Get all migration files
const files = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));

console.log(`Found ${files.length} migration files to check...`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has syntax errors
  if (content.includes('table.uuid(\'id\').primary()')) {
    console.log(`Fixing ${file}...`);
    
    // Fix the malformed UUID primary key lines
    content = content.replace(
      /table\.uuid\('id'\)\.primary\(\)[^;]*/g,
      "table.uuid('id').primary()"
    );
    
    // Remove any extra characters that might be left
    content = content.replace(/\)\)\)/g, ')');
    content = content.replace(/\)\)/g, ')');
    
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} migration files!`);
console.log('Now you can run: npx knex migrate:latest');