const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'src/database/migrations');

// Read all migration files
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));

console.log(`Found ${files.length} migration files`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has the problematic UUID generation
  if (content.includes('lower(hex(randomblob(4)))')) {
    console.log(`Fixing ${file}...`);
    
    // Replace the complex UUID generation with simple one
    // This regex matches the entire problematic line
    const regex = /table\.uuid\('id'\)\.primary\(\)\.defaultTo\(knex\.raw\('\([^']+\)'\)\)/g;
    content = content.replace(regex, "table.uuid('id').primary().defaultTo(knex.raw('lower(hex(randomblob(16)))'))");
    
    fs.writeFileSync(filePath, content);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} migration files`);
