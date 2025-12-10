// Supabase Mutation Helpers
// This file contains all Supabase mutations for writing data
// These replace the old API POST/PUT/DELETE endpoints

import { supabase } from './supabaseClient';
import { getCurrentUser } from './auth';

// Helper to validate UUID format (basic check)
function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper to validate projectId before mutating
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

/**
 * Create a new project
 */
export async function createProject(projectData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated. Please log in to create a project.');
  }

  // Map frontend format to Supabase schema
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      description: projectData.description,
      project_type: projectData.projectType,
      category: projectData.category || projectData.projectType,
      priority: projectData.priority || 'medium',
      status: projectData.status || 'active',
      start_date: projectData.startDate,
      deadline: projectData.deadline || projectData.endDate,
      university: projectData.university,
      location: projectData.location,
      author_id: user.id,
      author_name: projectData.authorName || user.email,
      tags: projectData.tags || [],
      team: projectData.team || [],
      team_members: projectData.teamMembers || [],
      diaspora_positions: projectData.diasporaPositions || [],
      mentorship_connection: projectData.mentorshipConnection,
      is_public: projectData.isPublic !== false,
      aspira_category: projectData.aspiraCategory,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  // Map back to frontend format
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    startDate: data.start_date,
    deadline: data.deadline,
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
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Map frontend format to Supabase schema
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.deadline !== undefined) updateData.deadline = updates.deadline;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.team !== undefined) updateData.team = updates.team;
  if (updates.teamMembers !== undefined) updateData.team_members = updates.teamMembers;
  if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  // Map back to frontend format
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    startDate: data.start_date,
    deadline: data.deadline,
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
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Join a project
 */
export async function joinProject(projectId: string, data: { role: string; area: string }) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  // Get current project to update team members
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('team_members, team')
    .eq('id', projectId)
    .single();

  if (projectError) {
    throw projectError;
  }

  const teamMembers = project.team_members || [];
  const team = project.team || [];

  // Add user to team
  const newMember = {
    userId: user.id,
    name: user.email,
    role: data.role,
    area: data.area,
    joinedAt: new Date().toISOString(),
  };

  teamMembers.push(newMember);
  team.push({
    id: user.id,
    name: user.email,
    role: data.role,
    avatar: null,
  });

  const { data: updated, error } = await supabase
    .from('projects')
    .update({
      team_members: teamMembers,
      team: team,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error joining project:', error);
    throw error;
  }

  return updated;
}

// ============================================================================
// TASKS
// ============================================================================

/**
 * Create a task
 */
export async function createTask(projectId: string, taskData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      project_id: projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee,
      assigned_date: taskData.assignedDate || new Date().toISOString(),
      due_date: taskData.dueDate,
      tags: taskData.tags || [],
      comments: [],
      attachments: [],
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assignee: data.assignee,
    assignedDate: new Date(data.assigned_date),
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
    comments: data.comments || [],
    attachments: data.attachments || [],
    tags: data.tags || [],
  };
}

/**
 * Update a task
 */
export async function updateTask(projectId: string, taskId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
  if (updates.completedDate !== undefined) {
    updateData.completed_date = updates.completedDate;
  }
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.comments !== undefined) updateData.comments = updates.comments;
  if (updates.attachments !== undefined) updateData.attachments = updates.attachments;

  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('project_id', validProjectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    assignee: data.assignee,
    assignedDate: new Date(data.assigned_date),
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
    comments: data.comments || [],
    attachments: data.attachments || [],
    tags: data.tags || [],
  };
}

/**
 * Delete a task
 */
export async function deleteTask(projectId: string, taskId: string) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const validProjectId = validateProjectId(projectId);
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', validProjectId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  return { success: true };
}

// ============================================================================
// SESSIONS
// ============================================================================

/**
 * Create a session
 */
export async function createSession(projectId: string, sessionData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      project_id: projectId,
      title: sessionData.title,
      description: sessionData.description,
      scheduled_date: sessionData.scheduledDate,
      duration: sessionData.duration || 60,
      status: sessionData.status || 'upcoming',
      type: sessionData.type || 'video',
      meeting_link: sessionData.meetingLink,
      location: sessionData.location,
      agenda: sessionData.agenda || [],
      notes: sessionData.notes,
      recordings: sessionData.recordings || [],
      attendees: sessionData.attendees || [],
      is_public: sessionData.isPublic !== false,
      tags: sessionData.tags || [],
      max_participants: sessionData.maxParticipants,
      share_url: sessionData.shareUrl,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    scheduledDate: new Date(data.scheduled_date),
    duration: data.duration,
    status: data.status,
    type: data.type,
    meetingLink: data.meeting_link,
    location: data.location,
    agenda: data.agenda || [],
    notes: data.notes,
    recordings: data.recordings || [],
    attendees: data.attendees || [],
    isPublic: data.is_public,
    tags: data.tags || [],
    maxParticipants: data.max_participants,
    shareUrl: data.share_url,
  };
}

/**
 * Update a session
 */
export async function updateSession(projectId: string, sessionId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.agenda !== undefined) updateData.agenda = updates.agenda;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.recordings !== undefined) updateData.recordings = updates.recordings;
  if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
  if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants;

  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('project_id', validProjectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    scheduledDate: new Date(data.scheduled_date),
    duration: data.duration,
    status: data.status,
    type: data.type,
    meetingLink: data.meeting_link,
    location: data.location,
    agenda: data.agenda || [],
    notes: data.notes,
    recordings: data.recordings || [],
    attendees: data.attendees || [],
    isPublic: data.is_public,
    tags: data.tags || [],
    maxParticipants: data.max_participants,
    shareUrl: data.share_url,
  };
}

/**
 * Delete a session
 */
export async function deleteSession(projectId: string, sessionId: string) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const validProjectId = validateProjectId(projectId);
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)
    .eq('project_id', validProjectId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }

  return { success: true };
}

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Create a message
 */
export async function createMessage(projectId: string, messageData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      sender_id: user.id,
      sender_name: messageData.senderName || user.email,
      sender_avatar: messageData.senderAvatar,
      recipient_id: messageData.recipientId,
      content: messageData.content,
      type: messageData.type || 'text',
      duration: messageData.duration,
      file_url: messageData.fileUrl,
      file_name: messageData.fileName,
      file_size: messageData.fileSize,
      is_read: false,
      edited: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  return {
    id: data.id,
    senderId: data.sender_id,
    senderName: data.sender_name,
    senderAvatar: data.sender_avatar,
    recipientId: data.recipient_id,
    projectId: data.project_id,
    content: data.content,
    timestamp: new Date(data.timestamp),
    type: data.type,
    duration: data.duration,
    fileUrl: data.file_url,
    fileName: data.file_name,
    fileSize: data.file_size,
    isRead: data.is_read,
    edited: data.edited,
  };
}

// ============================================================================
// VOICE NOTES
// ============================================================================

/**
 * Create a voice note
 */
export async function createVoiceNote(projectId: string, noteData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('voice_notes')
    .insert({
      project_id: projectId,
      title: noteData.title,
      duration: noteData.duration,
      url: noteData.url,
      sender: noteData.sender || user.email,
      sender_avatar: noteData.senderAvatar,
      tags: noteData.tags || [],
      transcript: noteData.transcript,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating voice note:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    duration: data.duration,
    url: data.url,
    timestamp: new Date(data.timestamp),
    sender: data.sender,
    senderAvatar: data.sender_avatar,
    tags: data.tags || [],
    transcript: data.transcript,
  };
}

// ============================================================================
// STAKEHOLDERS
// ============================================================================

/**
 * Create a stakeholder
 */
export async function createStakeholder(projectId: string, stakeholderData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('stakeholders')
    .insert({
      project_id: projectId,
      name: stakeholderData.name,
      organization: stakeholderData.organization,
      role: stakeholderData.role,
      type: stakeholderData.type || 'community-leader',
      contact_info: stakeholderData.contactInfo || {},
      influence: stakeholderData.influence || 50,
      interest: stakeholderData.interest || 50,
      engagement: stakeholderData.engagement || 'medium',
      notes: stakeholderData.notes,
      last_contact: stakeholderData.lastContact,
      avatar: stakeholderData.avatar,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating stakeholder:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    organization: data.organization,
    role: data.role,
    type: data.type,
    contactInfo: data.contact_info || {},
    influence: data.influence || 50,
    interest: data.interest || 50,
    engagement: data.engagement,
    notes: data.notes,
    lastContact: data.last_contact,
    avatar: data.avatar,
  };
}

/**
 * Update a stakeholder
 */
export async function updateStakeholder(projectId: string, stakeholderId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.organization !== undefined) updateData.organization = updates.organization;
  if (updates.role !== undefined) updateData.role = updates.role;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.contactInfo !== undefined) updateData.contact_info = updates.contactInfo;
  if (updates.influence !== undefined) updateData.influence = updates.influence;
  if (updates.interest !== undefined) updateData.interest = updates.interest;
  if (updates.engagement !== undefined) updateData.engagement = updates.engagement;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.lastContact !== undefined) updateData.last_contact = updates.lastContact;
  if (updates.avatar !== undefined) updateData.avatar = updates.avatar;

  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('stakeholders')
    .update(updateData)
    .eq('id', stakeholderId)
    .eq('project_id', validProjectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating stakeholder:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    organization: data.organization,
    role: data.role,
    type: data.type,
    contactInfo: data.contact_info || {},
    influence: data.influence || 50,
    interest: data.interest || 50,
    engagement: data.engagement,
    notes: data.notes,
    lastContact: data.last_contact,
    avatar: data.avatar,
  };
}

// ============================================================================
// IMPACT STORIES
// ============================================================================

/**
 * Create an impact story
 */
export async function createImpactStory(projectId: string, storyData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('impact_stories')
    .insert({
      project_id: projectId,
      title: storyData.title,
      description: storyData.description,
      category: storyData.category || 'social',
      author: storyData.author || user.email,
      author_avatar: storyData.authorAvatar,
      location: storyData.location,
      date: storyData.date || new Date().toISOString().split('T')[0],
      beneficiaries: storyData.beneficiaries || 0,
      metrics: storyData.metrics || {},
      media: storyData.media || [],
      tags: storyData.tags || [],
      is_verified: storyData.isVerified || false,
      likes: storyData.likes || 0,
      shares: storyData.shares || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating impact story:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    author: data.author,
    authorAvatar: data.author_avatar,
    location: data.location,
    date: data.date,
    beneficiaries: data.beneficiaries || 0,
    metrics: data.metrics || {},
    media: data.media || [],
    tags: data.tags || [],
    isVerified: data.is_verified || false,
    likes: data.likes || 0,
    shares: data.shares || 0,
  };
}

// ============================================================================
// COMMUNITY EVENTS
// ============================================================================

/**
 * Create a community event
 */
export async function createCommunityEvent(projectId: string, eventData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('community_events')
    .insert({
      project_id: projectId,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type || 'workshop',
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      organizer: eventData.organizer || user.email,
      attendees: eventData.attendees || 0,
      max_attendees: eventData.maxAttendees,
      status: eventData.status || 'upcoming',
      requirements: eventData.requirements || [],
      is_registered: eventData.isRegistered || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating community event:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type,
    date: data.date,
    time: data.time,
    location: data.location,
    organizer: data.organizer,
    attendees: data.attendees || 0,
    maxAttendees: data.max_attendees,
    status: data.status,
    requirements: data.requirements || [],
    isRegistered: data.is_registered || false,
  };
}

// ============================================================================
// IDEAS
// ============================================================================

/**
 * Create an idea
 */
export async function createIdea(projectId: string, ideaData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      project_id: projectId,
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category || 'technology',
      author: ideaData.author || user.email,
      author_avatar: ideaData.authorAvatar,
      author_type: ideaData.authorType || 'student',
      author_location: ideaData.authorLocation,
      stage: ideaData.stage || 'ideation',
      status: ideaData.status || 'open',
      tags: ideaData.tags || [],
      upvotes: ideaData.upvotes || 0,
      comments: ideaData.comments || 0,
      views: ideaData.views || 0,
      feasibility: ideaData.feasibility || 0,
      impact: ideaData.impact || 0,
      effort: ideaData.effort || 0,
      is_bookmarked: ideaData.isBookmarked || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating idea:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    author: data.author,
    authorAvatar: data.author_avatar,
    authorType: data.author_type,
    authorLocation: data.author_location,
    stage: data.stage,
    status: data.status,
    tags: data.tags || [],
    upvotes: data.upvotes || 0,
    comments: data.comments || 0,
    views: data.views || 0,
    feasibility: data.feasibility || 0,
    impact: data.impact || 0,
    effort: data.effort || 0,
    isBookmarked: data.is_bookmarked || false,
  };
}

/**
 * Update an idea
 */
export async function updateIdea(projectId: string, ideaId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.stage !== undefined) updateData.stage = updates.stage;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.feasibility !== undefined) updateData.feasibility = updates.feasibility;
  if (updates.impact !== undefined) updateData.impact = updates.impact;
  if (updates.effort !== undefined) updateData.effort = updates.effort;
  if (updates.isBookmarked !== undefined) updateData.is_bookmarked = updates.isBookmarked;

  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('ideas')
    .update(updateData)
    .eq('id', ideaId)
    .eq('project_id', validProjectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating idea:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    author: data.author,
    authorAvatar: data.author_avatar,
    authorType: data.author_type,
    authorLocation: data.author_location,
    stage: data.stage,
    status: data.status,
    tags: data.tags || [],
    upvotes: data.upvotes || 0,
    comments: data.comments || 0,
    views: data.views || 0,
    feasibility: data.feasibility || 0,
    impact: data.impact || 0,
    effort: data.effort || 0,
    isBookmarked: data.is_bookmarked || false,
  };
}

// ============================================================================
// CO-CREATION ROOMS
// ============================================================================

/**
 * Create a co-creation room
 */
export async function createCoCreationRoom(projectId: string, roomData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('co_creation_rooms')
    .insert({
      project_id: projectId,
      name: roomData.name,
      description: roomData.description,
      type: roomData.type || 'public',
      members: roomData.members || [],
      files: roomData.files || [],
      is_active: roomData.isActive !== false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating co-creation room:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    type: data.type,
    members: data.members || [],
    files: data.files || [],
    isActive: data.is_active !== false,
  };
}

// ============================================================================
// RESEARCH SOURCES
// ============================================================================

/**
 * Create a research source
 */
export async function createResearchSource(projectId: string, sourceData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('research_sources')
    .insert({
      project_id: projectId,
      title: sourceData.title,
      authors: sourceData.authors || [],
      year: sourceData.year || new Date().getFullYear(),
      type: sourceData.type || 'journal',
      url: sourceData.url,
      abstract: sourceData.abstract,
      keywords: sourceData.keywords || [],
      relevance: sourceData.relevance || 0,
      notes: sourceData.notes,
      added_by: sourceData.addedBy || user.email,
      added_date: sourceData.addedDate || new Date().toISOString().split('T')[0],
      favorite: sourceData.favorite || false,
      citations: sourceData.citations,
      doi: sourceData.doi,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating research source:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    authors: data.authors || [],
    year: data.year,
    type: data.type,
    url: data.url,
    abstract: data.abstract,
    keywords: data.keywords || [],
    relevance: data.relevance || 0,
    notes: data.notes,
    addedBy: data.added_by,
    addedDate: data.added_date,
    favorite: data.favorite || false,
    citations: data.citations,
    doi: data.doi,
  };
}

/**
 * Update a research source
 */
export async function updateResearchSource(projectId: string, sourceId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.authors !== undefined) updateData.authors = updates.authors;
  if (updates.year !== undefined) updateData.year = updates.year;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.abstract !== undefined) updateData.abstract = updates.abstract;
  if (updates.keywords !== undefined) updateData.keywords = updates.keywords;
  if (updates.relevance !== undefined) updateData.relevance = updates.relevance;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.favorite !== undefined) updateData.favorite = updates.favorite;
  if (updates.citations !== undefined) updateData.citations = updates.citations;
  if (updates.doi !== undefined) updateData.doi = updates.doi;

  const validProjectId = validateProjectId(projectId);
  const { data, error } = await supabase
    .from('research_sources')
    .update(updateData)
    .eq('id', sourceId)
    .eq('project_id', validProjectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating research source:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    authors: data.authors || [],
    year: data.year,
    type: data.type,
    url: data.url,
    abstract: data.abstract,
    keywords: data.keywords || [],
    relevance: data.relevance || 0,
    notes: data.notes,
    addedBy: data.added_by,
    addedDate: data.added_date,
    favorite: data.favorite || false,
    citations: data.citations,
    doi: data.doi,
  };
}

/**
 * Delete a research source
 */
export async function deleteResearchSource(projectId: string, sourceId: string) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { error } = await supabase
    .from('research_sources')
    .delete()
    .eq('id', sourceId)
    .eq('project_id', projectId);

  if (error) {
    console.error('Error deleting research source:', error);
    throw error;
  }

  return { success: true };
}

// ============================================================================
// RESEARCH NOTES
// ============================================================================

/**
 * Create a research note
 */
export async function createResearchNote(projectId: string, noteData: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const { data, error } = await supabase
    .from('research_notes')
    .insert({
      project_id: projectId,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      author: noteData.author || user.email,
      created_date: noteData.createdDate || new Date().toISOString().split('T')[0],
      last_modified: noteData.lastModified || new Date().toISOString().split('T')[0],
      source_id: noteData.sourceId,
      shared: noteData.shared || false,
      category: noteData.category || 'observation',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating research note:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    author: data.author,
    createdDate: data.created_date,
    lastModified: data.last_modified,
    sourceId: data.source_id,
    shared: data.shared || false,
    category: data.category,
  };
}

/**
 * Update a research note
 */
export async function updateResearchNote(projectId: string, noteId: string, updates: any) {
  const { user, error: authError } = await getCurrentUser();
  if (authError || !user) {
    throw new Error(authError?.message || 'Not authenticated');
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString().split('T')[0],
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.sourceId !== undefined) updateData.source_id = updates.sourceId;
  if (updates.shared !== undefined) updateData.shared = updates.shared;
  if (updates.category !== undefined) updateData.category = updates.category;

  const { data, error } = await supabase
    .from('research_notes')
    .update(updateData)
    .eq('id', noteId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating research note:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    author: data.author,
    createdDate: data.created_date,
    lastModified: data.last_modified,
    sourceId: data.source_id,
    shared: data.shared || false,
    category: data.category,
  };
}

