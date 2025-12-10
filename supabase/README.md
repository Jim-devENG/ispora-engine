# Supabase Migration Files

This directory contains SQL migrations and configuration for migrating Impact Engine from JSON database to Supabase PostgreSQL.

## Structure

```
supabase/
├── migrations/
│   └── 001_initial_schema.sql  # Initial schema with all tables
└── README.md                    # This file
```

## How to Apply Migrations

### Option 1: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** (or press Ctrl+Enter)

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 3: Using psql (if you have direct database access)

```bash
psql -h your-db-host -U postgres -d postgres -f migrations/001_initial_schema.sql
```

## Migration Order

Migrations are numbered and should be applied in order:
1. `001_initial_schema.sql` - Creates all tables, indexes, and triggers

## Verification

After applying migrations, verify:

1. **Tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Indexes exist:**
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

3. **Triggers exist:**
   ```sql
   SELECT trigger_name, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'public';
   ```

## Next Steps

After applying the schema:

1. Set up Row Level Security (RLS) policies (will be added in Phase 4)
2. Create Supabase Storage buckets (will be added in Phase 6)
3. Set up database functions if needed
4. Generate TypeScript types from the schema

## Notes

- All tables use UUID primary keys (via `uuid_generate_v4()`)
- Timestamps use `TIMESTAMPTZ` for timezone-aware dates
- JSONB columns are used for flexible nested data
- Foreign keys have appropriate `ON DELETE` actions (CASCADE, SET NULL)
- `updated_at` columns are automatically maintained via triggers

