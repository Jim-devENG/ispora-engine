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
  
  // Check if file contains the problematic UUID syntax
  if (content.includes('knex.raw(') && content.includes('randomblob')) {
    console.log(`Fixing ${file}...`);
    
    // Replace complex UUID generation with simple approach
    content = content.replace(
      /table\.uuid\('id'\)\.primary\(\)\.defaultTo\(knex\.raw\([^)]+\)\)/g,
      "table.uuid('id').primary()"
    );
    
    // Also fix any other similar patterns
    content = content.replace(
      /\.defaultTo\(knex\.raw\([^)]+\)\)/g,
      ''
    );
    
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✅ Fixed ${file}`);
  }
});

console.log(`\n🎉 Fixed ${fixedCount} migration files!`);
console.log('Now you can run: npx knex migrate:latest');