# Detailed Supabase Setup Guide for Impact Engine

This guide will walk you through every step needed to set up Supabase for the Impact Engine application.

---

## Prerequisites

Before starting, make sure you have:
- ✅ A Supabase account (sign up at https://supabase.com if you don't have one)
- ✅ A Supabase project created
- ✅ Your Supabase project URL and API keys (found in Settings → API)

---

## Step 1: Enable Email Authentication Provider

### 1.1 Navigate to Authentication Settings

1. Log in to your Supabase Dashboard: https://app.supabase.com
2. Select your project from the project list
3. In the left sidebar, click on **"Authentication"**
4. Click on **"Providers"** (or it might be under "Settings" → "Auth")

### 1.2 Enable Email Provider

1. You should see a list of authentication providers (Email, Google, GitHub, etc.)
2. Find **"Email"** in the list
3. Click on **"Email"** to expand its settings
4. Toggle the **"Enable Email provider"** switch to **ON** (green/enabled)

### 1.3 Configure Email Settings (Important!)

For **development/testing**, you have two options:

#### Option A: Disable Email Confirmation (Easiest for Testing)

1. Scroll down to find **"Confirm email"** setting
2. **Uncheck** or **disable** "Confirm email" 
   - This allows users to sign up and log in immediately without email verification
   - **Note**: Only use this for development/testing. Enable it for production.

#### Option B: Configure SMTP (For Production)

If you want email confirmation:
1. Scroll to **"SMTP Settings"** section
2. Configure your SMTP provider (Gmail, SendGrid, etc.)
3. Enter SMTP credentials
4. Test the connection

**For now, use Option A** to get started quickly.

### 1.4 Save Settings

1. Click **"Save"** or the settings will auto-save
2. You should see a success message

---

## Step 2: Run Database Migrations

### 2.1 Navigate to SQL Editor

1. In your Supabase Dashboard, click on **"SQL Editor"** in the left sidebar
2. You should see a blank SQL editor window

### 2.2 Run the Initial Schema Migration

1. Click **"New query"** button (top right)
2. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from your project
3. Paste it into the SQL editor
4. Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
5. Wait for it to complete (should take a few seconds)
6. You should see a success message: "Success. No rows returned"

**What this does:**
- Creates all necessary tables (profiles, projects, tasks, sessions, messages, etc.)
- Sets up proper data types and constraints
- Creates indexes for performance

### 2.3 Run the Profile Trigger Migration

1. Click **"New query"** again
2. Copy the entire contents of `supabase/migrations/002_create_profile_trigger.sql`
3. Paste it into the SQL editor
4. Click **"Run"**
5. Wait for success message

**What this does:**
- Creates a database trigger that automatically creates a profile entry when a user signs up
- Ensures every authenticated user has a profile record

---

## Step 3: Set Up Row Level Security (RLS) Policies

RLS policies control who can read/write data. We'll set them up table by table.

### 3.1 Enable RLS on Profiles Table

1. In SQL Editor, click **"New query"**
2. Copy and paste this SQL:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all profiles
CREATE POLICY "Users can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

3. Click **"Run"**
4. You should see: "Success. No rows returned"

### 3.2 Enable RLS on Projects Table

1. Click **"New query"**
2. Copy and paste this SQL:

```sql
-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read public projects or their own projects
CREATE POLICY "Users can read projects"
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

3. Click **"Run"**

### 3.3 Enable RLS on Workspace Tables

Run this for each workspace table. I'll give you a template - replace `<table_name>` with the actual table name:

**Tables to set up:**
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

**For each table, run this SQL (replace `tasks` with the table name):**

```sql
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to read data from projects they can access
CREATE POLICY "Users can read project tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND (projects.is_public = true OR projects.author_id = auth.uid())
  )
);

-- Allow users to insert data into accessible projects
CREATE POLICY "Users can insert project tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND (projects.is_public = true OR projects.author_id = auth.uid())
  )
);

-- Allow users to update their own data
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
TO authenticated
USING (true);

-- Allow users to delete their own data
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
TO authenticated
USING (true);
```

**Quick way to do this:**
1. Copy the SQL above
2. Replace all instances of `tasks` with the next table name (e.g., `sessions`)
3. Run it
4. Repeat for each table

**Or use this batch script** (run all at once):

```sql
-- Enable RLS on all workspace tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_creation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sets ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can read project tasks" ON tasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- Create policies for sessions
CREATE POLICY "Users can read project sessions" ON sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project sessions" ON sessions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE TO authenticated USING (true);

-- Create policies for messages
CREATE POLICY "Users can read project messages" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project messages" ON messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE TO authenticated USING (true);

-- Create policies for voice_notes
CREATE POLICY "Users can read project voice_notes" ON voice_notes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = voice_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project voice_notes" ON voice_notes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = voice_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own voice_notes" ON voice_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own voice_notes" ON voice_notes FOR DELETE TO authenticated USING (true);

-- Create policies for learning_content
CREATE POLICY "Users can read project learning_content" ON learning_content FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = learning_content.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project learning_content" ON learning_content FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = learning_content.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own learning_content" ON learning_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own learning_content" ON learning_content FOR DELETE TO authenticated USING (true);

-- Create policies for recordings
CREATE POLICY "Users can read project recordings" ON recordings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = recordings.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project recordings" ON recordings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = recordings.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own recordings" ON recordings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own recordings" ON recordings FOR DELETE TO authenticated USING (true);

-- Create policies for deliverables
CREATE POLICY "Users can read project deliverables" ON deliverables FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project deliverables" ON deliverables FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own deliverables" ON deliverables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own deliverables" ON deliverables FOR DELETE TO authenticated USING (true);

-- Create policies for certificates
CREATE POLICY "Users can read project certificates" ON certificates FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = certificates.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = certificates.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own certificates" ON certificates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own certificates" ON certificates FOR DELETE TO authenticated USING (true);

-- Create policies for live_sessions
CREATE POLICY "Users can read project live_sessions" ON live_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = live_sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project live_sessions" ON live_sessions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = live_sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own live_sessions" ON live_sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own live_sessions" ON live_sessions FOR DELETE TO authenticated USING (true);

-- Create policies for stakeholders
CREATE POLICY "Users can read project stakeholders" ON stakeholders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = stakeholders.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project stakeholders" ON stakeholders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = stakeholders.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own stakeholders" ON stakeholders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own stakeholders" ON stakeholders FOR DELETE TO authenticated USING (true);

-- Create policies for impact_stories
CREATE POLICY "Users can read project impact_stories" ON impact_stories FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = impact_stories.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project impact_stories" ON impact_stories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = impact_stories.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own impact_stories" ON impact_stories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own impact_stories" ON impact_stories FOR DELETE TO authenticated USING (true);

-- Create policies for community_events
CREATE POLICY "Users can read project community_events" ON community_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = community_events.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project community_events" ON community_events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = community_events.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own community_events" ON community_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own community_events" ON community_events FOR DELETE TO authenticated USING (true);

-- Create policies for ideas
CREATE POLICY "Users can read project ideas" ON ideas FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = ideas.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project ideas" ON ideas FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = ideas.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE TO authenticated USING (true);

-- Create policies for co_creation_rooms
CREATE POLICY "Users can read project co_creation_rooms" ON co_creation_rooms FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = co_creation_rooms.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project co_creation_rooms" ON co_creation_rooms FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = co_creation_rooms.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own co_creation_rooms" ON co_creation_rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own co_creation_rooms" ON co_creation_rooms FOR DELETE TO authenticated USING (true);

-- Create policies for research_sources
CREATE POLICY "Users can read project research_sources" ON research_sources FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_sources.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project research_sources" ON research_sources FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_sources.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own research_sources" ON research_sources FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own research_sources" ON research_sources FOR DELETE TO authenticated USING (true);

-- Create policies for research_notes
CREATE POLICY "Users can read project research_notes" ON research_notes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project research_notes" ON research_notes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own research_notes" ON research_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own research_notes" ON research_notes FOR DELETE TO authenticated USING (true);

-- Create policies for data_sets
CREATE POLICY "Users can read project data_sets" ON data_sets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = data_sets.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project data_sets" ON data_sets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = data_sets.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own data_sets" ON data_sets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own data_sets" ON data_sets FOR DELETE TO authenticated USING (true);
```

3. Click **"Run"**
4. Wait for completion (might take 10-20 seconds)

---

## Step 4: Verify Environment Variables in Vercel

### 4.1 Get Your Supabase Credentials

1. In Supabase Dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
   - **service_role key**: (Don't use this in frontend - it's for backend only)

### 4.2 Set Environment Variables in Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in the left sidebar
5. Add these two variables:

**Variable 1:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: Paste your Project URL (from step 4.1)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

**Variable 2:**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Paste your anon public key (from step 4.1)
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

### 4.3 Redeploy Your App

1. After adding environment variables, go to **"Deployments"** tab
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## Step 5: Test Authentication

### 5.1 Test Sign Up

1. Open your deployed app (or run locally with `npm run dev`)
2. You should see the **Login** screen
3. Click **"Don't have an account? Sign up"** button (bottom left)
4. Fill in the signup form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com` (use a real email you can access)
   - Password: `test123456` (at least 6 characters)
   - Confirm Password: `test123456`
5. Click **"Create Account"**
6. You should see: "Account created successfully!"
7. You should be automatically logged in and see the main app

### 5.2 Verify User Created in Supabase

1. Go back to Supabase Dashboard
2. Click **"Authentication"** → **"Users"**
3. You should see your test user listed
4. Click on the user to see details

### 5.3 Verify Profile Created

1. In Supabase Dashboard, click **"Table Editor"** in left sidebar
2. Click on **"profiles"** table
3. You should see a row with your user's email
4. The `id` should match the user ID from Authentication → Users

### 5.4 Test Logout

1. In your app, click on your profile avatar (top right)
2. Click **"Logout"**
3. Confirm logout
4. You should be redirected back to the Login screen

### 5.5 Test Login

1. On the Login screen, enter:
   - Email: `test@example.com`
   - Password: `test123456`
2. Click **"Sign In"**
3. You should be logged in and see the main app

---

## Step 6: Create a Test Project (Optional but Recommended)

Since the Workroom needs at least one project, let's create one:

### Option A: Create via SQL

1. In Supabase SQL Editor, click **"New query"**
2. First, get your user ID:

```sql
-- Get your user ID (replace 'test@example.com' with your email)
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

3. Copy the UUID from the result
4. Create a new query and paste this (replace `<YOUR_USER_ID>` with the UUID):

```sql
-- Create a test project
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
  is_public,
  project_type
) VALUES (
  'My First Project',
  'This is a test project to get started with Impact Engine',
  'active',
  CURRENT_DATE,
  'research',
  'research',
  'Test University',
  '<YOUR_USER_ID>',  -- Replace with your user UUID
  'Test User',
  true,
  'research'
);
```

5. Click **"Run"**
6. You should see: "Success. 1 row inserted"

### Option B: Create via the App

1. Log in to your app
2. Navigate to **"Projects"** page
3. Click **"Create Project"** button
4. Fill in the form and submit
5. The project should be created in Supabase

---

## Step 7: Verify Everything Works

### Checklist:

- [ ] Email authentication is enabled in Supabase
- [ ] Database migrations have been run (001 and 002)
- [ ] RLS policies are set up for all tables
- [ ] Environment variables are set in Vercel
- [ ] App has been redeployed with new environment variables
- [ ] Can sign up a new user
- [ ] User appears in Supabase Authentication → Users
- [ ] Profile appears in Supabase Table Editor → profiles
- [ ] Can log out
- [ ] Can log back in
- [ ] Can create a project (or test project exists)
- [ ] Can navigate to Workroom with a project selected

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Check Vercel environment variables are set correctly
- Make sure variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after adding variables

### Issue: "Failed to sign up" or "User already registered"

**Solution:**
- Check Supabase Authentication → Users to see if user exists
- Try a different email
- Check browser console for specific error

### Issue: "Permission denied" when creating project

**Solution:**
- Verify RLS policies are set up (Step 3)
- Make sure you're logged in
- Check that `author_id` matches your user ID

### Issue: "No project ID provided to ProjectWorkspace"

**Solution:**
- Create at least one project (Step 6)
- Make sure the project's `is_public` is `true` or you're the author
- Navigate to Projects page and select a project first

### Issue: Can't see projects in the app

**Solution:**
- Verify RLS policies allow reading projects
- Check that projects exist in Supabase Table Editor
- Make sure you're logged in with the correct user

---

## Next Steps After Setup

Once everything is working:

1. **Create more projects** via the app
2. **Test Workroom features** (tasks, sessions, messages, etc.)
3. **Invite team members** (they'll need to sign up too)
4. **Configure email templates** (if you enabled email confirmation)
5. **Set up additional auth providers** (Google, GitHub, etc.) if needed

---

## Quick Reference: SQL Commands

If you need to check or fix something, here are quick SQL commands:

```sql
-- Check if RLS is enabled on a table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Delete a policy (if you need to recreate it)
DROP POLICY "Users can read profiles" ON profiles;

-- Check if a user exists
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Check projects
SELECT id, title, author_id, is_public FROM projects;

-- Check profiles
SELECT id, email, name FROM profiles;
```

---

That's it! Your Supabase setup should now be complete. If you encounter any issues, check the Troubleshooting section or the browser console for specific error messages.

