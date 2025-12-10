-- Impact Engine - Initial Supabase Schema
-- This migration creates all tables needed to replace the JSON database
-- Generated from backend/src/types/index.ts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security on all tables
-- RLS policies will be added in subsequent migrations

-- ============================================================================
-- USER & AUTHENTICATION
-- ============================================================================

-- Profiles table (extends Supabase Auth users)
-- Note: Supabase Auth handles authentication, this table stores profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  title TEXT DEFAULT '',
  website TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  twitter TEXT,
  avatar TEXT,
  university TEXT DEFAULT '',
  graduation_year TEXT DEFAULT '',
  program TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  expertise TEXT[] DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('mentor', 'professional', 'alumni', 'student', 'researcher', 'entrepreneur')),
  experience INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  interests TEXT[] DEFAULT '{}',
  mutual_connections INTEGER DEFAULT 0,
  response_rate INTEGER DEFAULT 0,
  is_diaspora BOOLEAN DEFAULT false,
  diaspora_location TEXT,
  home_country TEXT,
  availability JSONB DEFAULT '{"mentoring": false, "collaboration": false, "consultation": false}',
  open_to TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  achievements JSONB DEFAULT '[]',
  universities JSONB DEFAULT '[]',
  privacy JSONB DEFAULT '{"profileVisibility": "public", "contactVisibility": "alumni", "professionalVisibility": "public"}',
  preferences JSONB DEFAULT '{"language": "en", "timezone": "UTC", "theme": "light"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS & OPPORTUNITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'still-open', 'closed')),
  start_date DATE NOT NULL,
  deadline DATE,
  closed_date DATE,
  category TEXT NOT NULL,
  aspira_category TEXT NOT NULL CHECK (aspira_category IN ('mentorships', 'university-campaigns', 'community-service', 'research')),
  tags TEXT[] DEFAULT '{}',
  team JSONB DEFAULT '[]',
  university TEXT NOT NULL,
  location TEXT DEFAULT '',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  project_type TEXT CHECK (project_type IN ('mentorship', 'academic', 'career', 'community', 'collaboration')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  mentorship_connection BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  team_members JSONB DEFAULT '[]',
  diaspora_positions JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('scholarship', 'job', 'internship', 'fellowship', 'accelerator', 'grant', 'event', 'community', 'others')),
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  remote BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  amount JSONB,
  duration TEXT,
  commitment TEXT,
  posted_by JSONB NOT NULL,
  university TEXT,
  tags TEXT[] DEFAULT '{}',
  applicants INTEGER DEFAULT 0,
  deadline DATE,
  event_date DATE,
  posted_date DATE NOT NULL,
  featured BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false,
  boost INTEGER DEFAULT 0,
  saved BOOLEAN DEFAULT false,
  applied BOOLEAN DEFAULT false,
  experience_level TEXT DEFAULT 'any' CHECK (experience_level IN ('entry', 'mid', 'senior', 'any')),
  category TEXT NOT NULL,
  eligibility TEXT[] DEFAULT '{}',
  application_link TEXT,
  comments INTEGER DEFAULT 0,
  full_description TEXT,
  application_process TEXT[] DEFAULT '{}',
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mentorship', 'research', 'education', 'community')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed')),
  university TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT false,
  participant_goal INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  funding_goal NUMERIC DEFAULT 0,
  current_funding NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by JSONB NOT NULL,
  image TEXT,
  spots_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FEED & SOCIAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS feed_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('project', 'campaign', 'opportunity', 'milestone', 'success_story', 'funding_success', 'live_event', 'workroom_live', 'project_closing', 'admin_highlight', 'achievement', 'certification', 'collaboration')),
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  urgent BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  is_live BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_admin_curated BOOLEAN DEFAULT false,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'authenticated', 'private')),
  significance TEXT NOT NULL DEFAULT 'medium' CHECK (significance IN ('low', 'medium', 'high', 'critical')),
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  user_location TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('project_created', 'project_joined', 'project_completed', 'campaign_launched', 'campaign_joined', 'milestone_achieved', 'opportunity_posted', 'opportunity_applied', 'funding_received', 'session_started', 'session_completed', 'certification_earned', 'achievement_unlocked', 'collaboration_started', 'mentor_match', 'workspace_created')),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'campaign', 'opportunity', 'session', 'certification', 'achievement', 'workspace', 'collaboration')),
  entity_title TEXT NOT NULL,
  entity_category TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'authenticated', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('top_mentor', 'spotlighted_opportunity', 'impact_stat', 'featured_project', 'announcement', 'success_spotlight', 'community_milestone')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  cta_text TEXT,
  cta_link TEXT,
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'authenticated')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL
);

-- ============================================================================
-- NETWORKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_user_name TEXT NOT NULL,
  from_user_avatar TEXT,
  from_user_title TEXT NOT NULL,
  from_user_company TEXT NOT NULL,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORKSPACE ENTITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee TEXT NOT NULL,
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  comments JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'completed')),
  progress INTEGER DEFAULT 0,
  tasks TEXT[] DEFAULT '{}',
  source TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled', 'rescheduled')),
  type TEXT NOT NULL CHECK (type IN ('video', 'phone', 'in-person')),
  meeting_link TEXT,
  location TEXT,
  agenda TEXT[] DEFAULT '{}',
  notes TEXT,
  recordings JSONB DEFAULT '[]',
  attendees JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  max_participants INTEGER,
  share_url TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  recipient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice', 'file')),
  duration INTEGER,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  url TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sender UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_avatar TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LEARNING & DELIVERABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'quiz', 'assignment', 'recording')),
  category TEXT NOT NULL CHECK (category IN ('orientation', 'skills', 'reflections', 'tools', 'recordings')),
  duration INTEGER,
  thumbnail TEXT,
  url TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  rating INTEGER,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  size INTEGER,
  status TEXT DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('screen', 'webcam', 'both')),
  tags TEXT[] DEFAULT '{}',
  size INTEGER NOT NULL,
  status TEXT DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'needs-revision')),
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  feedback TEXT,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('completion', 'achievement', 'milestone')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'issued')),
  progress INTEGER DEFAULT 0,
  required_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  required_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  issue_date TIMESTAMPTZ,
  issued_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issued_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_title TEXT,
  session_description TEXT,
  is_host BOOLEAN DEFAULT false,
  participants JSONB DEFAULT '[]',
  chat_messages JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RESEARCH
-- ============================================================================

CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('journal', 'conference', 'book', 'report', 'website', 'thesis')),
  url TEXT,
  abstract TEXT,
  keywords TEXT[] DEFAULT '{}',
  relevance INTEGER DEFAULT 0,
  notes TEXT,
  added_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  favorite BOOLEAN DEFAULT false,
  citations INTEGER,
  doi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  source_id UUID REFERENCES research_sources(id) ON DELETE SET NULL,
  shared BOOLEAN DEFAULT false,
  category TEXT NOT NULL CHECK (category IN ('hypothesis', 'observation', 'methodology', 'insight', 'todo', 'question')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('survey', 'experimental', 'observational', 'secondary', 'qualitative')),
  size INTEGER NOT NULL,
  format TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_date TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  public BOOLEAN DEFAULT false,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMUNITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('community-leader', 'government', 'ngo', 'business', 'academic', 'beneficiary')),
  contact_info JSONB DEFAULT '{}',
  influence INTEGER DEFAULT 0,
  interest INTEGER DEFAULT 0,
  engagement TEXT NOT NULL DEFAULT 'medium' CHECK (engagement IN ('high', 'medium', 'low')),
  notes TEXT,
  last_contact TIMESTAMPTZ,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('education', 'health', 'economic', 'social', 'environment')),
  author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_avatar TEXT,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  beneficiaries INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  media TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workshop', 'meeting', 'outreach', 'celebration', 'training')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  organizer UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attendees INTEGER DEFAULT 0,
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  requirements TEXT[] DEFAULT '{}',
  is_registered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INNOVATION HUB / FORGE LAB
-- ============================================================================

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('product', 'service', 'process', 'business-model', 'technology')),
  author UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_avatar TEXT,
  author_type TEXT NOT NULL CHECK (author_type IN ('diaspora', 'local', 'student')),
  author_location TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'ideation' CHECK (stage IN ('ideation', 'validation', 'development', 'pilot', 'scaling')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on-hold', 'completed', 'archived')),
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  feasibility INTEGER DEFAULT 0,
  impact INTEGER DEFAULT 0,
  effort INTEGER DEFAULT 0,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS co_creation_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('brainstorming', 'design', 'development', 'review', 'planning')),
  members JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  members JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS build_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('code-editor', 'design-tool', 'database', 'api', 'deployment')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FILE UPLOADS
-- ============================================================================

CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  duration INTEGER,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('processing', 'ready', 'failed')),
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_author_id ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_university ON projects(university);

-- Feed Items
CREATE INDEX IF NOT EXISTS idx_feed_items_author_id ON feed_items(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_project_id ON feed_items(project_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_timestamp ON feed_items(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_visibility ON feed_items(visibility);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON sessions(scheduled_date);

-- Connection Requests
CREATE INDEX IF NOT EXISTS idx_connection_requests_from_user_id ON connection_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_to_user_id ON connection_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_items_updated_at BEFORE UPDATE ON feed_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connection_requests_updated_at BEFORE UPDATE ON connection_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_content_updated_at BEFORE UPDATE ON learning_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recordings_updated_at BEFORE UPDATE ON recordings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_sessions_updated_at BEFORE UPDATE ON live_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_sources_updated_at BEFORE UPDATE ON research_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_notes_updated_at BEFORE UPDATE ON research_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sets_updated_at BEFORE UPDATE ON data_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_impact_stories_updated_at BEFORE UPDATE ON impact_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_events_updated_at BEFORE UPDATE ON community_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_co_creation_rooms_updated_at BEFORE UPDATE ON co_creation_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_workspaces_updated_at BEFORE UPDATE ON project_workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_tools_updated_at BEFORE UPDATE ON build_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

