# Database Setup

This directory contains database migrations and seeds for the iSpora backend.

## Migrations

Migrations are located in the `migrations/` directory and are run in order:

1. `001_create_users_table.js` - Creates the users table with authentication fields
2. `002_create_projects_table.js` - Creates the projects table for user projects
3. `003_create_feed_entries_table.js` - Creates the feed_entries table for activity feed
4. `004_create_sessions_table.js` - Creates the sessions table for user sessions

## Seeds

Seeds are located in the `seeds/` directory and populate the database with initial data:

1. `001_seed_users.js` - Creates demo and admin users
2. `002_seed_projects.js` - Creates sample projects
3. `003_seed_feed_entries.js` - Creates sample feed entries

## Commands

```bash
# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run seeds
npm run seed

# Run both migrations and seeds
npm run migrate && npm run seed
```

## Demo Users

After running seeds, you can use these demo accounts:

- **Demo User**: `demo@ispora.app` / `demo123`
- **Admin User**: `admin@ispora.app` / `demo123`

## Database Configuration

- **Development**: SQLite database at `./data/dev.db`
- **Production**: PostgreSQL using `DATABASE_URL` environment variable
- **Test**: In-memory SQLite database

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string for production
- `DB_CLIENT` - Database client ('sqlite3' or 'pg')
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL connection details
