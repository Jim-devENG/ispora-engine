-- Enable Realtime for all tables
-- This migration enables Supabase Realtime on all tables that need real-time updates

-- Enable Realtime on projects
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Enable Realtime on feed_items
ALTER PUBLICATION supabase_realtime ADD TABLE feed_items;

-- Enable Realtime on tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable Realtime on sessions
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Enable Realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime on voice_notes
ALTER PUBLICATION supabase_realtime ADD TABLE voice_notes;

-- Enable Realtime on learning_content
ALTER PUBLICATION supabase_realtime ADD TABLE learning_content;

-- Enable Realtime on deliverables
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;

-- Enable Realtime on milestones
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;

-- Enable Realtime on research_sources
ALTER PUBLICATION supabase_realtime ADD TABLE research_sources;

-- Enable Realtime on research_notes
ALTER PUBLICATION supabase_realtime ADD TABLE research_notes;

-- Enable Realtime on data_sets
ALTER PUBLICATION supabase_realtime ADD TABLE data_sets;

-- Enable Realtime on stakeholders
ALTER PUBLICATION supabase_realtime ADD TABLE stakeholders;

-- Enable Realtime on impact_stories
ALTER PUBLICATION supabase_realtime ADD TABLE impact_stories;

-- Enable Realtime on community_events
ALTER PUBLICATION supabase_realtime ADD TABLE community_events;

-- Enable Realtime on ideas
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

-- Enable Realtime on co_creation_rooms
ALTER PUBLICATION supabase_realtime ADD TABLE co_creation_rooms;

-- Enable Realtime on recordings
ALTER PUBLICATION supabase_realtime ADD TABLE recordings;

-- Enable Realtime on live_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE live_sessions;

-- Enable Realtime on certificates
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;

