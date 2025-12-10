# Supabase Setup Guide for Impact Engine

## Overview
The Impact Engine frontend now uses Supabase as its only backend. To get the Workroom and other features working, you need to ensure your Supabase database is properly configured.

## Required Supabase Setup

### 1. **Database Schema**
The schema is already defined in `supabase/migrations/001_initial_schema.sql`. Make sure you've run this migration:

```sql
-- Run this in your Supabase SQL Editor
-- Or use Supabase CLI: supabase db push
```

### 2. **Row Level Security (RLS) Policies**

You need to enable RLS and create policies that allow authenticated users to read/write their own data. Here are the essential policies:

#### Projects Table
```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all public projects
CREATE POLICY "Users can read public projects"
ON projects FOR SELECT
TO authenticated
USING (is_public = true OR author_id = auth.uid());

-- Allow authenticated users to create projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

-- Allow users to delete their own projects
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

#### Profiles Table
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Users can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

#### Other Tables (Tasks, Sessions, Messages, etc.)
Apply similar RLS policies to all other tables:
- `tasks`
- `sessions`
- `messages`
- `voice_notes`
- `learning_content`
- `recordings`
- `deliverables`
- `certificates`
- `live_sessions`
- `stakeholders`
- `impact_stories`
- `community_events`
- `ideas`
- `co_creation_rooms`
- `research_sources`
- `research_notes`
- `data_sets`

**Pattern for all workspace tables:**
```sql
-- Enable RLS
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- Allow users to read data from projects they're part of
CREATE POLICY "Users can read project data"
ON <table_name> FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = <table_name>.project_id
    AND (projects.is_public = true OR projects.author_id = auth.uid())
  )
);

-- Allow users to insert data into projects they're part of
CREATE POLICY "Users can insert project data"
ON <table_name> FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = <table_name>.project_id
    AND (projects.is_public = true OR projects.author_id = auth.uid())
  )
);

-- Allow users to update/delete their own data
CREATE POLICY "Users can update own data"
ON <table_name> FOR UPDATE
TO authenticated
USING (true); -- Adjust based on your needs

CREATE POLICY "Users can delete own data"
ON <table_name> FOR DELETE
TO authenticated
USING (true); -- Adjust based on your needs
```

### 3. **Create at Least One Project**

The Workroom requires at least one project to exist. You can create one via:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project → Table Editor → `projects`
2. Click "Insert row"
3. Fill in required fields:
   - `title`: "My First Project"
   - `description`: "Project description"
   - `status`: "active"
   - `start_date`: Today's date
   - `category`: "research" (or any valid category)
   - `aspira_category`: "research" (or "mentorships", "university-campaigns", "community-service")
   - `university`: "Your University"
   - `author_id`: Your user's UUID (from `auth.users` table)
   - `author_name`: Your name
   - `is_public`: true

**Option B: Using SQL**
```sql
-- First, get your user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then create a project (replace <YOUR_USER_ID> with the UUID from above)
INSERT INTO projects (
  title,
  description,
  status,
  start_date,
  category,
  aspira_category,
  university,
  author_id,
  author_name,
  is_public
) VALUES (
  'My First Project',
  'This is my first project in Impact Engine',
  'active',
  CURRENT_DATE,
  'research',
  'research',
  'Your University',
  '<YOUR_USER_ID>',
  'Your Name',
  true
);
```

**Option C: Using the Frontend**
1. Navigate to "Create Project" in the app
2. Fill in the form and submit
3. The project will be created in Supabase

### 4. **Environment Variables**

Make sure your Vercel deployment has these environment variables set:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can find these in: Supabase Dashboard → Settings → API

### 5. **Authentication**

Ensure users can authenticate:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable the authentication methods you want (Email, Google, etc.)
3. Make sure email confirmation is configured appropriately

### 6. **Verify Setup**

After setup, verify:
1. ✅ You can log in to the app
2. ✅ You can see projects in the "Projects" page
3. ✅ You can navigate to the Workroom with a selected project
4. ✅ No console errors about missing project IDs

## Troubleshooting

### "No project ID provided to ProjectWorkspace"
- **Cause**: No project is selected when navigating to Workroom
- **Solution**: 
  1. Ensure you have at least one project in the `projects` table
  2. Navigate to "Projects" page first and select a project
  3. Then click "Open Workroom"

### "Navigating to Workroom undefined"
- **Cause**: `navigateToWorkroom()` is being called without a projectId
- **Solution**: This is now fixed - the app will automatically fetch the first available project or redirect to Project Dashboard

### "Failed to load project"
- **Cause**: RLS policies might be blocking access, or project doesn't exist
- **Solution**:
  1. Check RLS policies are correctly set up
  2. Verify the project exists in Supabase
  3. Check browser console for specific error messages

### Projects not showing up
- **Cause**: RLS policies might be too restrictive
- **Solution**: Ensure the "Users can read public projects" policy allows reading projects where `is_public = true`

## Next Steps

1. Run the migrations (`001_initial_schema.sql` and `002_create_profile_trigger.sql`)
2. Set up RLS policies for all tables
3. Create at least one project
4. Test the Workroom functionality
5. Create additional projects as needed

For more details, see the migration files in `supabase/migrations/`.

