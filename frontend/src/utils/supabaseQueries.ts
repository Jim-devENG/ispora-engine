// Supabase Query Helpers
// This file contains all Supabase queries for reading data
// These replace the old API GET endpoints

import { supabase } from './supabaseClient';
import type { Database } from '../types/supabase';

// Helper to validate UUID format (basic check)
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper to validate projectId before querying
function validateProjectId(projectId: string | undefined | null): string {
  if (!projectId) {
    throw new Error('Project ID is required');
  }
  if (!isValidUUID(projectId)) {
    throw new Error(`Invalid project ID format: ${projectId}. Expected UUID.`);
  }
  return projectId;
}

// ============================================================================
// PROJECTS
// ============================================================================

export interface ProjectFilters {
  status?: 'active' | 'still-open' | 'closed';
  category?: string;
  university?: string;
  search?: string;
}

/**
 * Get all projects with optional filters
 */
export async function getProjects(filters?: ProjectFilters) {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.university) {
    query = query.eq('university', filters.university);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  // Map Supabase schema to frontend Project interface
  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    startDate: p.start_date,
    deadline: p.deadline,
    closedDate: p.closed_date,
    category: p.category,
    aspiraCategory: p.aspira_category,
    tags: p.tags || [],
    team: p.team || [],
    university: p.university,
    location: p.location,
    authorId: p.author_id,
    authorName: p.author_name,
    projectType: p.project_type,
    priority: p.priority,
    mentorshipConnection: p.mentorship_connection,
    isPublic: p.is_public,
    teamMembers: p.team_members || [],
    diasporaPositions: p.diaspora_positions || [],
    progress: p.progress,
    metrics: p.metrics || {},
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Map Supabase schema to frontend Project interface
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    startDate: data.start_date,
    deadline: data.deadline,
    closedDate: data.closed_date,
    category: data.category,
    aspiraCategory: data.aspira_category,
    tags: data.tags || [],
    team: data.team || [],
    university: data.university,
    location: data.location,
    authorId: data.author_id,
    authorName: data.author_name,
    projectType: data.project_type,
    priority: data.priority,
    mentorshipConnection: data.mentorship_connection,
    isPublic: data.is_public,
    teamMembers: data.team_members || [],
    diasporaPositions: data.diaspora_positions || [],
    progress: data.progress,
    metrics: data.metrics || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================================================
// FEED ITEMS
// ============================================================================

export interface FeedFilters {
  type?: string;
  category?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  visibility?: 'public' | 'authenticated' | 'private' | 'all';
}

/**
 * Get feed items with optional filters
 */
export async function getFeedItems(filters?: FeedFilters) {
  let query = supabase
    .from('feed_items')
    .select('*');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.visibility && filters.visibility !== 'all') {
    query = query.eq('visibility', filters.visibility);
  }

  // Default sorting
  const sortField = filters?.sort?.split(':')[0] || 'timestamp';
  const sortOrder = filters?.sort?.includes('desc') ? 'desc' : 'desc';
  query = query.order(sortField, { ascending: sortOrder === 'asc' });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching feed items:', error);
    throw error;
  }

  // Map Supabase schema to frontend FeedItem interface
  return (data || []).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    timestamp: item.timestamp,
    likes: item.likes || 0,
    location: item.location,
    category: item.category,
    urgent: item.urgent || false,
    deadline: item.deadline,
    isLive: item.is_live || false,
    isPinned: item.is_pinned || false,
    isAdminCurated: item.is_admin_curated || false,
    authorId: item.author_id,
    authorName: item.author_name,
    authorAvatar: item.author_avatar,
    projectId: item.project_id,
    campaignId: item.campaign_id,
    opportunityId: item.opportunity_id,
    metadata: item.metadata || {},
    visibility: item.visibility,
    significance: item.significance,
    isAutoGenerated: item.is_auto_generated || false,
  }));
}

/**
 * Get feed stats
 */
export async function getFeedStats() {
  const { data, error } = await supabase
    .from('feed_items')
    .select('type, visibility', { count: 'exact', head: false });

  if (error) {
    console.error('Error fetching feed stats:', error);
    throw error;
  }

  // Calculate stats
  const total = data?.length || 0;
  const byType: Record<string, number> = {};
  const byVisibility: Record<string, number> = {};

  data?.forEach((item) => {
    byType[item.type] = (byType[item.type] || 0) + 1;
    byVisibility[item.visibility] = (byVisibility[item.visibility] || 0) + 1;
  });

  return {
    total,
    byType,
    byVisibility,
  };
}

// ============================================================================
// WORKSPACE ENTITIES - TASKS
// ============================================================================

/**
 * Get tasks for a project
 */
export async function getProjectTasks(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', validProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return (data || []).map((task) => ({
    id: task.id,
    projectId: task.project_id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    assignedDate: task.assigned_date,
    dueDate: task.due_date,
    completedDate: task.completed_date,
    comments: task.comments || [],
    attachments: task.attachments || [],
    tags: task.tags || [],
    createdBy: task.created_by,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - SESSIONS
// ============================================================================

/**
 * Get sessions for a project
 */
export async function getProjectSessions(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('project_id', validProjectId)
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  return (data || []).map((session) => ({
    id: session.id,
    projectId: session.project_id,
    title: session.title,
    description: session.description,
    scheduledDate: session.scheduled_date,
    duration: session.duration,
    status: session.status,
    type: session.type,
    meetingLink: session.meeting_link,
    location: session.location,
    agenda: session.agenda || [],
    notes: session.notes,
    recordings: session.recordings || [],
    attendees: session.attendees || [],
    isPublic: session.is_public || false,
    tags: session.tags || [],
    maxParticipants: session.max_participants,
    shareUrl: session.share_url,
    createdBy: session.created_by,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - MESSAGES
// ============================================================================

/**
 * Get messages for a project
 */
export async function getProjectMessages(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', validProjectId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  return (data || []).map((message) => ({
    id: message.id,
    senderId: message.sender_id,
    senderName: message.sender_name,
    senderAvatar: message.sender_avatar,
    recipientId: message.recipient_id,
    projectId: message.project_id,
    content: message.content,
    timestamp: message.timestamp,
    type: message.type,
    duration: message.duration,
    fileUrl: message.file_url,
    fileName: message.file_name,
    fileSize: message.file_size,
    isRead: message.is_read || false,
    edited: message.edited || false,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - VOICE NOTES
// ============================================================================

/**
 * Get voice notes for a project
 */
export async function getProjectVoiceNotes(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('voice_notes')
    .select('*')
    .eq('project_id', validProjectId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching voice notes:', error);
    throw error;
  }

  return (data || []).map((note) => ({
    id: note.id,
    title: note.title,
    duration: note.duration,
    url: note.url,
    timestamp: note.timestamp,
    sender: note.sender,
    senderAvatar: note.sender_avatar,
    projectId: note.project_id,
    tags: note.tags || [],
    transcript: note.transcript,
    createdAt: note.created_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - LEARNING CONTENT
// ============================================================================

/**
 * Get learning content for a project
 */
export async function getProjectLearningContent(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('learning_content')
    .select('*')
    .eq('project_id', validProjectId)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error fetching learning content:', error);
    throw error;
  }

  return (data || []).map((content) => ({
    id: content.id,
    projectId: content.project_id,
    title: content.title,
    description: content.description,
    type: content.type,
    category: content.category,
    duration: content.duration,
    thumbnail: content.thumbnail,
    url: content.url,
    progress: content.progress || 0,
    rating: content.rating,
    uploadDate: content.upload_date,
    lastAccessed: content.last_accessed,
    tags: content.tags || [],
    size: content.size,
    status: content.status,
    uploadedBy: content.uploaded_by,
    createdAt: content.created_at,
    updatedAt: content.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - DELIVERABLES
// ============================================================================

/**
 * Get deliverables for a project
 */
export async function getProjectDeliverables(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('project_id', validProjectId)
    .order('submitted_date', { ascending: false });

  if (error) {
    console.error('Error fetching deliverables:', error);
    throw error;
  }

  return (data || []).map((deliverable) => ({
    id: deliverable.id,
    projectId: deliverable.project_id,
    title: deliverable.title,
    description: deliverable.description,
    status: deliverable.status,
    submittedDate: deliverable.submitted_date,
    fileName: deliverable.file_name,
    fileSize: deliverable.file_size,
    fileUrl: deliverable.file_url,
    feedback: deliverable.feedback,
    submittedBy: deliverable.submitted_by,
    reviewedBy: deliverable.reviewed_by,
    reviewedAt: deliverable.reviewed_at,
    createdAt: deliverable.created_at,
    updatedAt: deliverable.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - MILESTONES
// ============================================================================

/**
 * Get milestones for a project
 */
export async function getProjectMilestones(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', validProjectId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }

  return (data || []).map((milestone) => ({
    id: milestone.id,
    projectId: milestone.project_id,
    title: milestone.title,
    description: milestone.description,
    dueDate: milestone.due_date,
    status: milestone.status,
    progress: milestone.progress || 0,
    tasks: milestone.tasks || [],
    source: milestone.source,
    lastUpdated: milestone.last_updated,
    createdAt: milestone.created_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - RESEARCH
// ============================================================================

/**
 * Get research sources for a project
 */
export async function getProjectResearchSources(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('research_sources')
    .select('*')
    .eq('project_id', validProjectId)
    .order('added_date', { ascending: false });

  if (error) {
    console.error('Error fetching research sources:', error);
    throw error;
  }

  return (data || []).map((source) => ({
    id: source.id,
    projectId: source.project_id,
    title: source.title,
    authors: source.authors || [],
    year: source.year,
    type: source.type,
    url: source.url,
    abstract: source.abstract,
    keywords: source.keywords || [],
    relevance: source.relevance || 0,
    notes: source.notes,
    addedBy: source.added_by,
    addedDate: source.added_date,
    favorite: source.favorite || false,
    citations: source.citations,
    doi: source.doi,
    createdAt: source.created_at,
    updatedAt: source.updated_at,
  }));
}

/**
 * Get research notes for a project
 */
export async function getProjectResearchNotes(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('research_notes')
    .select('*')
    .eq('project_id', validProjectId)
    .order('created_date', { ascending: false });

  if (error) {
    console.error('Error fetching research notes:', error);
    throw error;
  }

  return (data || []).map((note) => ({
    id: note.id,
    projectId: note.project_id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    author: note.author,
    createdDate: note.created_date,
    lastModified: note.last_modified,
    sourceId: note.source_id,
    shared: note.shared || false,
    category: note.category,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));
}

/**
 * Get data sets for a project
 */
export async function getProjectDataSets(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('data_sets')
    .select('*')
    .eq('project_id', validProjectId)
    .order('uploaded_date', { ascending: false });

  if (error) {
    console.error('Error fetching data sets:', error);
    throw error;
  }

  return (data || []).map((dataset) => ({
    id: dataset.id,
    projectId: dataset.project_id,
    name: dataset.name,
    description: dataset.description,
    type: dataset.type,
    size: dataset.size,
    format: dataset.format,
    uploadedBy: dataset.uploaded_by,
    uploadedDate: dataset.uploaded_date,
    tags: dataset.tags || [],
    public: dataset.public || false,
    url: dataset.url,
    createdAt: dataset.created_at,
    updatedAt: dataset.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - COMMUNITY
// ============================================================================

/**
 * Get stakeholders for a project
 */
export async function getProjectStakeholders(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .eq('project_id', validProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stakeholders:', error);
    throw error;
  }

  return (data || []).map((stakeholder) => ({
    id: stakeholder.id,
    projectId: stakeholder.project_id,
    name: stakeholder.name,
    organization: stakeholder.organization,
    role: stakeholder.role,
    type: stakeholder.type,
    contactInfo: stakeholder.contact_info || {},
    influence: stakeholder.influence || 0,
    interest: stakeholder.interest || 0,
    engagement: stakeholder.engagement,
    notes: stakeholder.notes,
    lastContact: stakeholder.last_contact,
    avatar: stakeholder.avatar,
    createdAt: stakeholder.created_at,
    updatedAt: stakeholder.updated_at,
  }));
}

/**
 * Get impact stories for a project
 */
export async function getProjectImpactStories(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('impact_stories')
    .select('*')
    .eq('project_id', validProjectId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching impact stories:', error);
    throw error;
  }

  return (data || []).map((story) => ({
    id: story.id,
    projectId: story.project_id,
    title: story.title,
    description: story.description,
    category: story.category,
    author: story.author,
    authorAvatar: story.author_avatar,
    location: story.location,
    date: story.date,
    beneficiaries: story.beneficiaries || 0,
    metrics: story.metrics || {},
    media: story.media || [],
    tags: story.tags || [],
    isVerified: story.is_verified || false,
    likes: story.likes || 0,
    shares: story.shares || 0,
    createdAt: story.created_at,
    updatedAt: story.updated_at,
  }));
}

/**
 * Get community events for a project
 */
export async function getProjectCommunityEvents(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('community_events')
    .select('*')
    .eq('project_id', validProjectId)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching community events:', error);
    throw error;
  }

  return (data || []).map((event) => ({
    id: event.id,
    projectId: event.project_id,
    title: event.title,
    description: event.description,
    type: event.type,
    date: event.date,
    time: event.time,
    location: event.location,
    organizer: event.organizer,
    attendees: event.attendees || 0,
    maxAttendees: event.max_attendees,
    status: event.status,
    requirements: event.requirements || [],
    isRegistered: event.is_registered || false,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - INNOVATION
// ============================================================================

/**
 * Get ideas for a project
 */
export async function getProjectIdeas(projectId?: string) {
  let query = supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    const validProjectId = validateProjectId(projectId);
    query = query.eq('project_id', validProjectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching ideas:', error);
    throw error;
  }

  return (data || []).map((idea) => ({
    id: idea.id,
    projectId: idea.project_id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    author: idea.author,
    authorAvatar: idea.author_avatar,
    authorType: idea.author_type,
    authorLocation: idea.author_location,
    stage: idea.stage,
    status: idea.status,
    tags: idea.tags || [],
    upvotes: idea.upvotes || 0,
    comments: idea.comments || 0,
    views: idea.views || 0,
    feasibility: idea.feasibility || 0,
    impact: idea.impact || 0,
    effort: idea.effort || 0,
    isBookmarked: idea.is_bookmarked || false,
    createdAt: idea.created_at,
    updatedAt: idea.updated_at,
  }));
}

/**
 * Get co-creation rooms for a project
 */
export async function getProjectCoCreationRooms(projectId?: string) {
  let query = supabase
    .from('co_creation_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    const validProjectId = validateProjectId(projectId);
    query = query.eq('project_id', validProjectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching co-creation rooms:', error);
    throw error;
  }

  return (data || []).map((room) => ({
    id: room.id,
    projectId: room.project_id,
    name: room.name,
    description: room.description,
    type: room.type,
    members: room.members || [],
    files: room.files || [],
    isActive: room.is_active !== false,
    createdAt: room.created_at,
    updatedAt: room.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - RECORDINGS & LIVE SESSIONS
// ============================================================================

/**
 * Get recordings for a project
 */
export async function getProjectRecordings(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('project_id', validProjectId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching recordings:', error);
    throw error;
  }

  return (data || []).map((recording) => ({
    id: recording.id,
    projectId: recording.project_id,
    title: recording.title,
    description: recording.description,
    duration: recording.duration,
    url: recording.url,
    thumbnail: recording.thumbnail,
    timestamp: recording.timestamp,
    type: recording.type,
    tags: recording.tags || [],
    size: recording.size,
    status: recording.status,
    uploadedBy: recording.uploaded_by,
    createdAt: recording.created_at,
  }));
}

/**
 * Get live sessions for a project
 */
export async function getProjectLiveSessions(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('project_id', validProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching live sessions:', error);
    throw error;
  }

  return (data || []).map((session) => ({
    id: session.id,
    projectId: session.project_id,
    title: session.title,
    description: session.description,
    sessionTitle: session.session_title,
    sessionDescription: session.session_description,
    isHost: session.is_host || false,
    participants: session.participants || [],
    chatMessages: session.chat_messages || [],
    startedAt: session.started_at,
    endedAt: session.ended_at,
    status: session.status,
    createdBy: session.created_by,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
  }));
}

// ============================================================================
// WORKSPACE ENTITIES - CERTIFICATES
// ============================================================================

/**
 * Get certificates for a project
 */
export async function getProjectCertificates(projectId: string) {
  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('project_id', validProjectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }

  return (data || []).map((cert) => ({
    id: cert.id,
    projectId: cert.project_id,
    title: cert.title,
    type: cert.type,
    status: cert.status,
    progress: cert.progress || 0,
    requiredSessions: cert.required_sessions || 0,
    completedSessions: cert.completed_sessions || 0,
    requiredTasks: cert.required_tasks || 0,
    completedTasks: cert.completed_tasks || 0,
    issueDate: cert.issue_date,
    issuedTo: cert.issued_to,
    issuedBy: cert.issued_by,
    createdAt: cert.created_at,
    updatedAt: cert.updated_at,
  }));
}

