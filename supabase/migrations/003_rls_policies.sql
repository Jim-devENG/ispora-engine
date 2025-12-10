-- Row Level Security (RLS) Policies
-- This migration enables RLS and creates policies for all tables

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_creation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- Anyone can read public projects
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = true);

-- Project members can view their projects
CREATE POLICY "Project members can view their projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = author_id OR
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(team_members::jsonb->'userId'))
  );

-- Users can create projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Project authors can update their projects
CREATE POLICY "Project authors can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Project authors can delete their projects
CREATE POLICY "Project authors can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================

-- Project members can view tasks
CREATE POLICY "Project members can view tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.is_public = true OR
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create tasks
CREATE POLICY "Project members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Task creators and assignees can update tasks
CREATE POLICY "Task creators and assignees can update tasks"
  ON tasks FOR UPDATE
  USING (
    created_by = auth.uid() OR
    assignee = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    created_by = auth.uid() OR
    assignee = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Task creators can delete tasks
CREATE POLICY "Task creators can delete tasks"
  ON tasks FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Project members can view sessions
CREATE POLICY "Project members can view sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sessions.project_id
      AND (
        sessions.is_public = true OR
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create sessions
CREATE POLICY "Project members can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sessions.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Session creators can update sessions
CREATE POLICY "Session creators can update sessions"
  ON sessions FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Session creators can delete sessions
CREATE POLICY "Session creators can delete sessions"
  ON sessions FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Project members can view messages
CREATE POLICY "Project members can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create messages
CREATE POLICY "Project members can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Message senders can update their messages
CREATE POLICY "Message senders can update their messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- VOICE NOTES POLICIES
-- ============================================================================

-- Project members can view voice notes
CREATE POLICY "Project members can view voice notes"
  ON voice_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = voice_notes.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create voice notes
CREATE POLICY "Project members can create voice notes"
  ON voice_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = voice_notes.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- STAKEHOLDERS POLICIES
-- ============================================================================

-- Project members can view stakeholders
CREATE POLICY "Project members can view stakeholders"
  ON stakeholders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stakeholders.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create stakeholders
CREATE POLICY "Project members can create stakeholders"
  ON stakeholders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stakeholders.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can update stakeholders
CREATE POLICY "Project members can update stakeholders"
  ON stakeholders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stakeholders.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- IMPACT STORIES POLICIES
-- ============================================================================

-- Project members can view impact stories
CREATE POLICY "Project members can view impact stories"
  ON impact_stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = impact_stories.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create impact stories
CREATE POLICY "Project members can create impact stories"
  ON impact_stories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = impact_stories.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- COMMUNITY EVENTS POLICIES
-- ============================================================================

-- Project members can view community events
CREATE POLICY "Project members can view community events"
  ON community_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = community_events.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create community events
CREATE POLICY "Project members can create community events"
  ON community_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = community_events.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- IDEAS POLICIES
-- ============================================================================

-- Project members can view ideas
CREATE POLICY "Project members can view ideas"
  ON ideas FOR SELECT
  USING (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = ideas.project_id
      AND (
        projects.is_public = true OR
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Authenticated users can create ideas
CREATE POLICY "Authenticated users can create ideas"
  ON ideas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Idea creators can update their ideas
CREATE POLICY "Idea creators can update their ideas"
  ON ideas FOR UPDATE
  USING (
    author = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    author = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================================================
-- RESEARCH SOURCES POLICIES
-- ============================================================================

-- Project members can view research sources
CREATE POLICY "Project members can view research sources"
  ON research_sources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_sources.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create research sources
CREATE POLICY "Project members can create research sources"
  ON research_sources FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_sources.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can update research sources
CREATE POLICY "Project members can update research sources"
  ON research_sources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_sources.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can delete research sources
CREATE POLICY "Project members can delete research sources"
  ON research_sources FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_sources.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- RESEARCH NOTES POLICIES
-- ============================================================================

-- Project members can view research notes
CREATE POLICY "Project members can view research notes"
  ON research_notes FOR SELECT
  USING (
    shared = true OR
    author = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_notes.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create research notes
CREATE POLICY "Project members can create research notes"
  ON research_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = research_notes.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Note authors can update their notes
CREATE POLICY "Note authors can update their notes"
  ON research_notes FOR UPDATE
  USING (
    author = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    author = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ============================================================================
-- CO-CREATION ROOMS POLICIES
-- ============================================================================

-- Project members can view co-creation rooms
CREATE POLICY "Project members can view co-creation rooms"
  ON co_creation_rooms FOR SELECT
  USING (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = co_creation_rooms.project_id
      AND (
        projects.is_public = true OR
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create co-creation rooms
CREATE POLICY "Project members can create co-creation rooms"
  ON co_creation_rooms FOR INSERT
  WITH CHECK (
    project_id IS NULL OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = co_creation_rooms.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- FEED ITEMS POLICIES
-- ============================================================================

-- Public feed items are viewable by everyone
CREATE POLICY "Public feed items are viewable by everyone"
  ON feed_items FOR SELECT
  USING (visibility = 'public');

-- Authenticated users can view authenticated feed items
CREATE POLICY "Authenticated users can view authenticated feed items"
  ON feed_items FOR SELECT
  USING (
    visibility = 'authenticated' AND
    auth.uid() IS NOT NULL
  );

-- Project members can view private feed items
CREATE POLICY "Project members can view private feed items"
  ON feed_items FOR SELECT
  USING (
    visibility = 'private' AND
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = feed_items.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Authenticated users can create feed items
CREATE POLICY "Authenticated users can create feed items"
  ON feed_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (author_id IS NULL OR author_id = auth.uid())
  );

-- ============================================================================
-- LEARNING CONTENT POLICIES
-- ============================================================================

-- Project members can view learning content
CREATE POLICY "Project members can view learning content"
  ON learning_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = learning_content.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create learning content
CREATE POLICY "Project members can create learning content"
  ON learning_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = learning_content.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- DELIVERABLES POLICIES
-- ============================================================================

-- Project members can view deliverables
CREATE POLICY "Project members can view deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create deliverables
CREATE POLICY "Project members can create deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can update deliverables
CREATE POLICY "Project members can update deliverables"
  ON deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = deliverables.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- RECORDINGS POLICIES
-- ============================================================================

-- Project members can view recordings
CREATE POLICY "Project members can view recordings"
  ON recordings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create recordings
CREATE POLICY "Project members can create recordings"
  ON recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = recordings.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- LIVE SESSIONS POLICIES
-- ============================================================================

-- Project members can view live sessions
CREATE POLICY "Project members can view live sessions"
  ON live_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = live_sessions.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create live sessions
CREATE POLICY "Project members can create live sessions"
  ON live_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = live_sessions.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- ============================================================================
-- CERTIFICATES POLICIES
-- ============================================================================

-- Project members can view certificates
CREATE POLICY "Project members can view certificates"
  ON certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = certificates.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

-- Project members can create certificates
CREATE POLICY "Project members can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = certificates.project_id
      AND (
        projects.author_id = auth.uid() OR
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(projects.team_members::jsonb->'userId'))
      )
    )
  );

