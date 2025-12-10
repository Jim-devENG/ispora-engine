-- ============================================================================
-- QUICK SETUP: Row Level Security Policies for Impact Engine
-- ============================================================================
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- This sets up all RLS policies needed for the app to work
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can read profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can read projects"
ON projects FOR SELECT
TO authenticated
USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- ============================================================================
-- WORKSPACE TABLES (Tasks, Sessions, Messages, etc.)
-- ============================================================================

-- Helper function to create policies for a workspace table
-- We'll use this pattern for all workspace tables

-- TASKS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert project tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

CREATE POLICY "Users can read project tasks" ON tasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE TO authenticated USING (true);

-- SESSIONS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert project sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

CREATE POLICY "Users can read project sessions" ON sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project sessions" ON sessions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE TO authenticated USING (true);

-- MESSAGES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project messages" ON messages;
DROP POLICY IF EXISTS "Users can insert project messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

CREATE POLICY "Users can read project messages" ON messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project messages" ON messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = messages.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE TO authenticated USING (true);

-- VOICE NOTES
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project voice_notes" ON voice_notes;
DROP POLICY IF EXISTS "Users can insert project voice_notes" ON voice_notes;
DROP POLICY IF EXISTS "Users can update own voice_notes" ON voice_notes;
DROP POLICY IF EXISTS "Users can delete own voice_notes" ON voice_notes;

CREATE POLICY "Users can read project voice_notes" ON voice_notes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = voice_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project voice_notes" ON voice_notes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = voice_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own voice_notes" ON voice_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own voice_notes" ON voice_notes FOR DELETE TO authenticated USING (true);

-- LEARNING CONTENT
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project learning_content" ON learning_content;
DROP POLICY IF EXISTS "Users can insert project learning_content" ON learning_content;
DROP POLICY IF EXISTS "Users can update own learning_content" ON learning_content;
DROP POLICY IF EXISTS "Users can delete own learning_content" ON learning_content;

CREATE POLICY "Users can read project learning_content" ON learning_content FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = learning_content.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project learning_content" ON learning_content FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = learning_content.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own learning_content" ON learning_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own learning_content" ON learning_content FOR DELETE TO authenticated USING (true);

-- RECORDINGS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project recordings" ON recordings;
DROP POLICY IF EXISTS "Users can insert project recordings" ON recordings;
DROP POLICY IF EXISTS "Users can update own recordings" ON recordings;
DROP POLICY IF EXISTS "Users can delete own recordings" ON recordings;

CREATE POLICY "Users can read project recordings" ON recordings FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = recordings.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project recordings" ON recordings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = recordings.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own recordings" ON recordings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own recordings" ON recordings FOR DELETE TO authenticated USING (true);

-- DELIVERABLES
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project deliverables" ON deliverables;
DROP POLICY IF EXISTS "Users can insert project deliverables" ON deliverables;
DROP POLICY IF EXISTS "Users can update own deliverables" ON deliverables;
DROP POLICY IF EXISTS "Users can delete own deliverables" ON deliverables;

CREATE POLICY "Users can read project deliverables" ON deliverables FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project deliverables" ON deliverables FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own deliverables" ON deliverables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own deliverables" ON deliverables FOR DELETE TO authenticated USING (true);

-- CERTIFICATES
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project certificates" ON certificates;
DROP POLICY IF EXISTS "Users can insert project certificates" ON certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can delete own certificates" ON certificates;

CREATE POLICY "Users can read project certificates" ON certificates FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = certificates.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = certificates.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own certificates" ON certificates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own certificates" ON certificates FOR DELETE TO authenticated USING (true);

-- LIVE SESSIONS
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project live_sessions" ON live_sessions;
DROP POLICY IF EXISTS "Users can insert project live_sessions" ON live_sessions;
DROP POLICY IF EXISTS "Users can update own live_sessions" ON live_sessions;
DROP POLICY IF EXISTS "Users can delete own live_sessions" ON live_sessions;

CREATE POLICY "Users can read project live_sessions" ON live_sessions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = live_sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project live_sessions" ON live_sessions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = live_sessions.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own live_sessions" ON live_sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own live_sessions" ON live_sessions FOR DELETE TO authenticated USING (true);

-- STAKEHOLDERS
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project stakeholders" ON stakeholders;
DROP POLICY IF EXISTS "Users can insert project stakeholders" ON stakeholders;
DROP POLICY IF EXISTS "Users can update own stakeholders" ON stakeholders;
DROP POLICY IF EXISTS "Users can delete own stakeholders" ON stakeholders;

CREATE POLICY "Users can read project stakeholders" ON stakeholders FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = stakeholders.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project stakeholders" ON stakeholders FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = stakeholders.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own stakeholders" ON stakeholders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own stakeholders" ON stakeholders FOR DELETE TO authenticated USING (true);

-- IMPACT STORIES
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project impact_stories" ON impact_stories;
DROP POLICY IF EXISTS "Users can insert project impact_stories" ON impact_stories;
DROP POLICY IF EXISTS "Users can update own impact_stories" ON impact_stories;
DROP POLICY IF EXISTS "Users can delete own impact_stories" ON impact_stories;

CREATE POLICY "Users can read project impact_stories" ON impact_stories FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = impact_stories.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project impact_stories" ON impact_stories FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = impact_stories.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own impact_stories" ON impact_stories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own impact_stories" ON impact_stories FOR DELETE TO authenticated USING (true);

-- COMMUNITY EVENTS
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project community_events" ON community_events;
DROP POLICY IF EXISTS "Users can insert project community_events" ON community_events;
DROP POLICY IF EXISTS "Users can update own community_events" ON community_events;
DROP POLICY IF EXISTS "Users can delete own community_events" ON community_events;

CREATE POLICY "Users can read project community_events" ON community_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = community_events.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project community_events" ON community_events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = community_events.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own community_events" ON community_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own community_events" ON community_events FOR DELETE TO authenticated USING (true);

-- IDEAS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert project ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete own ideas" ON ideas;

CREATE POLICY "Users can read project ideas" ON ideas FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = ideas.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project ideas" ON ideas FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = ideas.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own ideas" ON ideas FOR DELETE TO authenticated USING (true);

-- CO-CREATION ROOMS
ALTER TABLE co_creation_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project co_creation_rooms" ON co_creation_rooms;
DROP POLICY IF EXISTS "Users can insert project co_creation_rooms" ON co_creation_rooms;
DROP POLICY IF EXISTS "Users can update own co_creation_rooms" ON co_creation_rooms;
DROP POLICY IF EXISTS "Users can delete own co_creation_rooms" ON co_creation_rooms;

CREATE POLICY "Users can read project co_creation_rooms" ON co_creation_rooms FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = co_creation_rooms.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project co_creation_rooms" ON co_creation_rooms FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = co_creation_rooms.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own co_creation_rooms" ON co_creation_rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own co_creation_rooms" ON co_creation_rooms FOR DELETE TO authenticated USING (true);

-- RESEARCH SOURCES
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project research_sources" ON research_sources;
DROP POLICY IF EXISTS "Users can insert project research_sources" ON research_sources;
DROP POLICY IF EXISTS "Users can update own research_sources" ON research_sources;
DROP POLICY IF EXISTS "Users can delete own research_sources" ON research_sources;

CREATE POLICY "Users can read project research_sources" ON research_sources FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_sources.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project research_sources" ON research_sources FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_sources.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own research_sources" ON research_sources FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own research_sources" ON research_sources FOR DELETE TO authenticated USING (true);

-- RESEARCH NOTES
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project research_notes" ON research_notes;
DROP POLICY IF EXISTS "Users can insert project research_notes" ON research_notes;
DROP POLICY IF EXISTS "Users can update own research_notes" ON research_notes;
DROP POLICY IF EXISTS "Users can delete own research_notes" ON research_notes;

CREATE POLICY "Users can read project research_notes" ON research_notes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project research_notes" ON research_notes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = research_notes.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own research_notes" ON research_notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own research_notes" ON research_notes FOR DELETE TO authenticated USING (true);

-- DATA SETS
ALTER TABLE data_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read project data_sets" ON data_sets;
DROP POLICY IF EXISTS "Users can insert project data_sets" ON data_sets;
DROP POLICY IF EXISTS "Users can update own data_sets" ON data_sets;
DROP POLICY IF EXISTS "Users can delete own data_sets" ON data_sets;

CREATE POLICY "Users can read project data_sets" ON data_sets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = data_sets.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can insert project data_sets" ON data_sets FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = data_sets.project_id AND (projects.is_public = true OR projects.author_id = auth.uid()))
);
CREATE POLICY "Users can update own data_sets" ON data_sets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own data_sets" ON data_sets FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- DONE! All RLS policies are now set up
-- ============================================================================

