const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'src/database/migrations');
const files = fs.readdirSync(migrationsDir);

const sqliteUuid =
  "(lower(hex(randomblob(4))) || \\'-\\' || lower(hex(randomblob(2))) || \\'-4\\' || substr(lower(hex(randomblob(2))),2) || \\'-\\' || substr(\\'89ab\\',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || \\'-\\' || lower(hex(randomblob(6))))";

files.forEach((file) => {
  if (file.endsWith('.js')) {
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('gen_random_uuid()')) {
      content = content.replace(/gen_random_uuid\(\)/g, sqliteUuid);
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${file}`);
    }
  }
});

console.log('Migration fixes complete!');
