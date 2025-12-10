import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import {
  ProjectMember, Task, Milestone, Message, Session,
  VoiceNote, LearningContent, Recording, Deliverable, Certificate,
  LiveSession, ResearchSource, ResearchNote, DataSet,
  Stakeholder, ImpactStory, CommunityEvent, Idea,
  CoCreationRoom, ProjectWorkspace, BuildTool
} from '../types/index.js';
import {
  emitTaskCreated, emitTaskUpdated, emitTaskDeleted,
  emitMilestoneCreated, emitMilestoneUpdated,
  emitSessionCreated, emitSessionUpdated,
  emitMessageSent, emitVoiceNoteCreated,
  emitLearningContentCreated, emitDeliverableCreated, emitDeliverableUpdated,
  emitCertificateCreated, emitLiveSessionUpdated,
  emitResearchSourceCreated, emitResearchNoteCreated, emitDataSetCreated,
  emitStakeholderCreated, emitImpactStoryCreated, emitCommunityEventCreated,
  emitIdeaCreated, emitIdeaUpdated, emitMemberAdded
} from '../sse/sse.js';

const router = express.Router();
const db = DatabaseService.getInstance();

// Log that workspace routes are being loaded
console.log('✅ Workspace routes module loaded');

// Test route to verify workspace routes are loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Workspace routes are working!', timestamp: new Date().toISOString() });
});

// Get project members
router.get('/:projectId/members', authenticate, (req, res) => {
  try {
    const project = db.getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Convert team members to ProjectMember format
    const members: ProjectMember[] = project.team.map(member => {
      const user = db.getUserById(member.id);
      return {
        id: member.id,
        name: member.name,
        email: user?.email || '',
        avatar: member.avatar,
        role: member.role as ProjectMember['role'],
        status: 'active',
        joinedDate: project.createdAt,
        lastActive: user?.lastActive || new Date().toISOString(),
        skills: user?.skills,
        university: user?.university,
        program: user?.program,
        year: user?.graduationYear,
        isOnline: user?.isOnline,
      };
    });
    
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to project
router.post('/:projectId/members', authenticate, (req, res) => {
  try {
    const { email, role } = req.body;
    const project = db.getProjectById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check authorization
    if (project.authorId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({ error: 'Not authorized to add members' });
    }
    
    // Find user by email
    const user = db.getUsers().find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add to team if not already there
    if (!project.team.some(m => m.id === user.id)) {
      project.team.push({
        id: user.id,
        name: user.name,
        role: role || 'collaborator',
        avatar: user.avatar,
      });
      db.updateProject(project.id, { team: project.team });
    }
    
    const member: ProjectMember = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: role || 'collaborator',
      status: 'active',
      joinedDate: new Date().toISOString(),
      lastActive: user.lastActive,
      skills: user.skills,
      university: user.university,
      program: user.program,
      year: user.graduationYear,
      isOnline: user.isOnline,
    };
    
    emitMemberAdded(req.params.projectId, member);
    res.status(201).json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send message in workspace
router.post('/:projectId/messages', authenticate, (req: AuthRequest, res) => {
  try {
    const { recipientId, message: content } = req.body;
    const project = db.getProjectById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const user = db.getUserById((req as AuthRequest).user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const message: Message = {
      id: uuidv4(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      recipientId,
      projectId: req.params.projectId,
      content,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false,
    };
    
    const created = db.createMessage(message);
    emitMessageSent(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages
router.get('/:projectId/messages', authenticate, (req, res) => {
  try {
    const messages = db.getMessages(req.params.projectId);
    const result = Array.isArray(messages) ? messages : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching messages:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// Get tasks
router.get('/:projectId/tasks', authenticate, (req, res) => {
  try {
    const tasks = db.getTasks(req.params.projectId);
    const result = Array.isArray(tasks) ? tasks : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching tasks:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tasks' });
  }
});

// Create task
router.post('/:projectId/tasks', authenticate, (req: AuthRequest, res) => {
  try {
    const taskData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const project = db.getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const now = new Date().toISOString();
    const task: Task = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || user.name,
      assignedDate: now,
      dueDate: taskData.dueDate,
      completedDate: undefined,
      comments: [],
      attachments: [],
      tags: taskData.tags || [],
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createTask(task);
    // Emit SSE event
    emitTaskCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.put('/:projectId/tasks/:taskId', authenticate, (req: AuthRequest, res) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    if (!task || task.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const updates: Partial<Task> = { ...req.body };
    if (updates.status === 'done' && !updates.completedDate) {
      updates.completedDate = new Date().toISOString();
    } else if (updates.status !== 'done') {
      updates.completedDate = undefined;
    }
    
    const updated = db.updateTask(req.params.taskId, updates);
    if (updated) {
      emitTaskUpdated(req.params.projectId, updated);
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
router.delete('/:projectId/tasks/:taskId', authenticate, (req: AuthRequest, res) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    if (!task || task.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.createdBy !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this task' });
    }
    
    const taskId = req.params.taskId;
    db.deleteTask(taskId);
    emitTaskDeleted(req.params.projectId, taskId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to task
router.post('/:projectId/tasks/:taskId/comments', authenticate, (req: AuthRequest, res) => {
  try {
    const task = db.getTaskById(req.params.taskId);
    if (!task || task.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const comment = {
      id: uuidv4(),
      author: user.name,
      authorAvatar: user.avatar,
      content: req.body.content,
      timestamp: new Date().toISOString(),
    };
    
    task.comments.push(comment);
    const updated = db.updateTask(req.params.taskId, { comments: task.comments });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get milestones
router.get('/:projectId/milestones', authenticate, (req, res) => {
  try {
    const milestones = db.getMilestones(req.params.projectId);
    const result = Array.isArray(milestones) ? milestones : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching milestones:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch milestones' });
  }
});

// Create milestone
router.post('/:projectId/milestones', authenticate, (req, res) => {
  try {
    const milestoneData = req.body;
    const now = new Date().toISOString();
    
    const milestone: Milestone = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: milestoneData.title,
      description: milestoneData.description,
      dueDate: milestoneData.dueDate,
      status: milestoneData.status || 'upcoming',
      progress: milestoneData.progress || 0,
      tasks: milestoneData.tasks || [],
      source: milestoneData.source || 'manual',
      lastUpdated: now,
      createdAt: now,
    };
    
    const created = db.createMilestone(milestone);
    emitMilestoneCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SESSION BOARD ROUTES
// ============================================

// Get sessions for a project
router.get('/:projectId/sessions', authenticate, (req, res) => {
  try {
    const sessions = db.getSessions(req.params.projectId);
    const result = Array.isArray(sessions) ? sessions : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching sessions:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sessions' });
  }
});

// Get session by ID
router.get('/:projectId/sessions/:sessionId', authenticate, (req, res) => {
  try {
    const session = db.getSessionById(req.params.sessionId);
    if (!session || session.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create session
router.post('/:projectId/sessions', authenticate, (req: AuthRequest, res) => {
  try {
    const sessionData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const project = db.getProjectById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const now = new Date().toISOString();
    const scheduledDateTime = new Date(`${sessionData.scheduledDate}T${sessionData.scheduledTime || '00:00'}`);
    
    const session: Session = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: sessionData.title,
      description: sessionData.description,
      scheduledDate: scheduledDateTime.toISOString(),
      duration: sessionData.duration || 60,
      status: 'upcoming',
      type: sessionData.type || 'video',
      meetingLink: sessionData.type === 'video' ? `https://meet.google.com/${Math.random().toString(36).substring(7)}` : undefined,
      location: sessionData.location,
      agenda: sessionData.agenda || [],
      notes: sessionData.notes,
      recordings: [],
      attendees: [
        { name: user.name, avatar: user.avatar, userId: user.id, attended: false },
        ...(sessionData.attendees || [])
      ],
      isPublic: sessionData.isPublic || false,
      tags: sessionData.tags || [],
      maxParticipants: sessionData.maxParticipants,
      shareUrl: `https://ispora.com/sessions/${uuidv4()}`,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createSession(session);
    emitSessionCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update session
router.put('/:projectId/sessions/:sessionId', authenticate, (req: AuthRequest, res) => {
  try {
    const session = db.getSessionById(req.params.sessionId);
    if (!session || session.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const updated = db.updateSession(req.params.sessionId, req.body);
    if (updated) {
      emitSessionUpdated(req.params.projectId, updated);
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session
router.delete('/:projectId/sessions/:sessionId', authenticate, (req: AuthRequest, res) => {
  try {
    const session = db.getSessionById(req.params.sessionId);
    if (!session || session.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.createdBy !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this session' });
    }
    
    db.deleteSession(req.params.sessionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VOICE & CHAT ROUTES
// ============================================

// Get voice notes for a project
router.get('/:projectId/voice-notes', authenticate, (req, res) => {
  try {
    console.log(`[Workspace] GET /${req.params.projectId}/voice-notes`);
    const voiceNotes = db.getVoiceNotes(req.params.projectId);
    // Ensure we always return an array
    const result = Array.isArray(voiceNotes) ? voiceNotes : [];
    console.log(`[Workspace] Returning ${result.length} voice notes`);
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching voice notes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch voice notes' });
  }
});

// Create voice note
router.post('/:projectId/voice-notes', authenticate, (req: AuthRequest, res) => {
  try {
    const noteData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const voiceNote: VoiceNote = {
      id: uuidv4(),
      title: noteData.title,
      duration: noteData.duration,
      url: noteData.url,
      timestamp: new Date().toISOString(),
      sender: user.name,
      senderAvatar: user.avatar,
      projectId: req.params.projectId,
      tags: noteData.tags || [],
      transcript: noteData.transcript,
    };
    
    const created = db.createVoiceNote(voiceNote);
    emitVoiceNoteCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LEARNING VAULT ROUTES
// ============================================

// Get learning content for a project
router.get('/:projectId/learning-content', authenticate, (req, res) => {
  try {
    const content = db.getLearningContent(req.params.projectId);
    // Ensure we always return an array
    const result = Array.isArray(content) ? content : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching learning content:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch learning content' });
  }
});

// Create learning content
router.post('/:projectId/learning-content', authenticate, (req: AuthRequest, res) => {
  try {
    const contentData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const content: LearningContent = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: contentData.title,
      description: contentData.description,
      type: contentData.type,
      category: contentData.category || 'skills',
      duration: contentData.duration,
      thumbnail: contentData.thumbnail,
      url: contentData.url,
      progress: 0,
      rating: contentData.rating,
      uploadDate: now,
      lastAccessed: undefined,
      tags: contentData.tags || [],
      size: contentData.size,
      status: contentData.status || 'ready',
      uploadedBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createLearningContent(content);
    emitLearningContentCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update learning content progress
router.put('/:projectId/learning-content/:contentId', authenticate, (req: AuthRequest, res) => {
  try {
    const content = db.getLearningContentById(req.params.contentId);
    if (!content || content.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const updates: Partial<LearningContent> = {
      ...req.body,
      lastAccessed: new Date().toISOString(),
    };
    
    const updated = db.updateLearningContent(req.params.contentId, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get recordings for a project
router.get('/:projectId/recordings', authenticate, (req, res) => {
  try {
    const recordings = db.getRecordings(req.params.projectId);
    const result = Array.isArray(recordings) ? recordings : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching recordings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch recordings' });
  }
});

// Create recording
router.post('/:projectId/recordings', authenticate, (req: AuthRequest, res) => {
  try {
    const recordingData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recording: Recording = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: recordingData.title,
      description: recordingData.description,
      duration: recordingData.duration,
      url: recordingData.url,
      thumbnail: recordingData.thumbnail,
      timestamp: new Date().toISOString(),
      type: recordingData.type || 'both',
      tags: recordingData.tags || [],
      size: recordingData.size,
      status: recordingData.status || 'processing',
      uploadedBy: user.id,
      createdAt: new Date().toISOString(),
    };
    
    const created = db.createRecording(recording);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELIVERABLES ROUTES
// ============================================

// Get deliverables for a project
router.get('/:projectId/deliverables', authenticate, (req, res) => {
  try {
    const deliverables = db.getDeliverables(req.params.projectId);
    // Ensure we always return an array
    const result = Array.isArray(deliverables) ? deliverables : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching deliverables:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch deliverables' });
  }
});

// Create deliverable
router.post('/:projectId/deliverables', authenticate, (req: AuthRequest, res) => {
  try {
    const deliverableData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const deliverable: Deliverable = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: deliverableData.title,
      description: deliverableData.description,
      status: 'pending',
      submittedDate: now,
      fileName: deliverableData.fileName,
      fileSize: deliverableData.fileSize,
      fileUrl: deliverableData.fileUrl,
      feedback: undefined,
      submittedBy: user.id,
      reviewedBy: undefined,
      reviewedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createDeliverable(deliverable);
    emitDeliverableCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update deliverable (review/feedback)
router.put('/:projectId/deliverables/:deliverableId', authenticate, (req: AuthRequest, res) => {
  try {
    const deliverable = db.getDeliverableById(req.params.deliverableId);
    if (!deliverable || deliverable.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }
    
    const updates: Partial<Deliverable> = {
      ...req.body,
      reviewedBy: req.user!.id,
      reviewedAt: new Date().toISOString(),
    };
    
    const updated = db.updateDeliverable(req.params.deliverableId, updates);
    if (updated) {
      emitDeliverableUpdated(req.params.projectId, updated);
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CERTIFICATES ROUTES
// ============================================

// Get certificates for a project
router.get('/:projectId/certificates', authenticate, (req, res) => {
  try {
    const certificates = db.getCertificates(req.params.projectId);
    const result = Array.isArray(certificates) ? certificates : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching certificates:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch certificates' });
  }
});

// Create certificate
router.post('/:projectId/certificates', authenticate, (req: AuthRequest, res) => {
  try {
    const certData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const certificate: Certificate = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: certData.title,
      type: certData.type || 'completion',
      status: 'draft',
      progress: 0,
      requiredSessions: certData.requiredSessions || 0,
      completedSessions: 0,
      requiredTasks: certData.requiredTasks || 0,
      completedTasks: 0,
      issueDate: undefined,
      issuedTo: certData.issuedTo || user.id,
      issuedBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createCertificate(certificate);
    emitCertificateCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update certificate
router.put('/:projectId/certificates/:certificateId', authenticate, (req: AuthRequest, res) => {
  try {
    const certificate = db.getCertificateById(req.params.certificateId);
    if (!certificate || certificate.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    const updates: Partial<Certificate> = { ...req.body };
    if (updates.status === 'issued' && !updates.issueDate) {
      updates.issueDate = new Date().toISOString();
    }
    
    const updated = db.updateCertificate(req.params.certificateId, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LIVE SESSION ROUTES
// ============================================

// Get live sessions for a project
router.get('/:projectId/live-sessions', authenticate, (req, res) => {
  try {
    const sessions = db.getLiveSessions(req.params.projectId);
    const result = Array.isArray(sessions) ? sessions : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching live sessions:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch live sessions' });
  }
});

// Create live session
router.post('/:projectId/live-sessions', authenticate, (req: AuthRequest, res) => {
  try {
    const sessionData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const liveSession: LiveSession = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: sessionData.title || 'Live Session',
      description: sessionData.description,
      sessionTitle: sessionData.sessionTitle,
      sessionDescription: sessionData.sessionDescription,
      isHost: sessionData.isHost || true,
      participants: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isMuted: false,
          hasVideo: true,
          isCurrentUser: true,
          role: 'mentor',
          isOnline: true,
        },
      ],
      chatMessages: [],
      startedAt: undefined,
      endedAt: undefined,
      status: 'scheduled',
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createLiveSession(liveSession);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update live session
router.put('/:projectId/live-sessions/:sessionId', authenticate, (req: AuthRequest, res) => {
  try {
    const session = db.getLiveSessionById(req.params.sessionId);
    if (!session || session.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Live session not found' });
    }
    
    const updates: Partial<LiveSession> = { ...req.body };
    if (updates.status === 'active' && !updates.startedAt) {
      updates.startedAt = new Date().toISOString();
    } else if (updates.status === 'ended' && !updates.endedAt) {
      updates.endedAt = new Date().toISOString();
    }
    
    const updated = db.updateLiveSession(req.params.sessionId, updates);
    if (updated) {
      emitLiveSessionUpdated(req.params.projectId, updated);
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RESEARCH TOOLS ROUTES
// ============================================

// Get research sources
router.get('/:projectId/research-sources', authenticate, (req, res) => {
  try {
    const sources = db.getResearchSources(req.params.projectId);
    const result = Array.isArray(sources) ? sources : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching research sources:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch research sources' });
  }
});

// Create research source
router.post('/:projectId/research-sources', authenticate, (req: AuthRequest, res) => {
  try {
    const sourceData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const source: ResearchSource = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: sourceData.title,
      authors: sourceData.authors || [],
      year: sourceData.year,
      type: sourceData.type,
      url: sourceData.url,
      abstract: sourceData.abstract,
      keywords: sourceData.keywords || [],
      relevance: sourceData.relevance || 50,
      notes: sourceData.notes,
      addedBy: user.id,
      addedDate: now,
      favorite: sourceData.favorite || false,
      citations: sourceData.citations,
      doi: sourceData.doi,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createResearchSource(source);
    emitResearchSourceCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update research source
router.put('/:projectId/research-sources/:sourceId', authenticate, (req: AuthRequest, res) => {
  try {
    const source = db.getResearchSourceById(req.params.sourceId);
    if (!source || source.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Research source not found' });
    }
    
    const updated = db.updateResearchSource(req.params.sourceId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete research source
router.delete('/:projectId/research-sources/:sourceId', authenticate, (req: AuthRequest, res) => {
  try {
    const source = db.getResearchSourceById(req.params.sourceId);
    if (!source || source.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Research source not found' });
    }
    
    db.deleteResearchSource(req.params.sourceId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get research notes
router.get('/:projectId/research-notes', authenticate, (req, res) => {
  try {
    const notes = db.getResearchNotes(req.params.projectId);
    const result = Array.isArray(notes) ? notes : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching research notes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch research notes' });
  }
});

// Create research note
router.post('/:projectId/research-notes', authenticate, (req: AuthRequest, res) => {
  try {
    const noteData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const note: ResearchNote = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      author: user.id,
      createdDate: now,
      lastModified: now,
      sourceId: noteData.sourceId,
      shared: noteData.shared || false,
      category: noteData.category || 'observation',
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createResearchNote(note);
    emitResearchNoteCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update research note
router.put('/:projectId/research-notes/:noteId', authenticate, (req: AuthRequest, res) => {
  try {
    const note = db.getResearchNoteById(req.params.noteId);
    if (!note || note.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Research note not found' });
    }
    
    const updates: Partial<ResearchNote> = {
      ...req.body,
      lastModified: new Date().toISOString(),
    };
    
    const updated = db.updateResearchNote(req.params.noteId, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get data sets
router.get('/:projectId/data-sets', authenticate, (req, res) => {
  try {
    const dataSets = db.getDataSets(req.params.projectId);
    const result = Array.isArray(dataSets) ? dataSets : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching data sets:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch data sets' });
  }
});

// Create data set
router.post('/:projectId/data-sets', authenticate, (req: AuthRequest, res) => {
  try {
    const dataSetData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const dataSet: DataSet = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: dataSetData.name,
      description: dataSetData.description,
      type: dataSetData.type,
      size: dataSetData.size,
      format: dataSetData.format,
      uploadedBy: user.id,
      uploadedDate: now,
      tags: dataSetData.tags || [],
      public: dataSetData.public || false,
      url: dataSetData.url,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createDataSet(dataSet);
    emitDataSetCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COMMUNITY TOOLS ROUTES
// ============================================

// Get stakeholders
router.get('/:projectId/stakeholders', authenticate, (req, res) => {
  try {
    const stakeholders = db.getStakeholders(req.params.projectId);
    const result = Array.isArray(stakeholders) ? stakeholders : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching stakeholders:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stakeholders' });
  }
});

// Create stakeholder
router.post('/:projectId/stakeholders', authenticate, (req: AuthRequest, res) => {
  try {
    const stakeholderData = req.body;
    const now = new Date().toISOString();
    const stakeholder: Stakeholder = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: stakeholderData.name,
      organization: stakeholderData.organization,
      role: stakeholderData.role,
      type: stakeholderData.type,
      contactInfo: stakeholderData.contactInfo || {},
      influence: stakeholderData.influence || 50,
      interest: stakeholderData.interest || 50,
      engagement: stakeholderData.engagement || 'medium',
      notes: stakeholderData.notes,
      lastContact: stakeholderData.lastContact,
      avatar: stakeholderData.avatar,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createStakeholder(stakeholder);
    emitStakeholderCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update stakeholder
router.put('/:projectId/stakeholders/:stakeholderId', authenticate, (req: AuthRequest, res) => {
  try {
    const stakeholder = db.getStakeholderById(req.params.stakeholderId);
    if (!stakeholder || stakeholder.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Stakeholder not found' });
    }
    
    const updated = db.updateStakeholder(req.params.stakeholderId, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get impact stories
router.get('/:projectId/impact-stories', authenticate, (req, res) => {
  try {
    const stories = db.getImpactStories(req.params.projectId);
    const result = Array.isArray(stories) ? stories : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching impact stories:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch impact stories' });
  }
});

// Create impact story
router.post('/:projectId/impact-stories', authenticate, (req: AuthRequest, res) => {
  try {
    const storyData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const story: ImpactStory = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: storyData.title,
      description: storyData.description,
      category: storyData.category,
      author: user.id,
      authorAvatar: user.avatar,
      location: storyData.location,
      date: storyData.date || now,
      beneficiaries: storyData.beneficiaries || 0,
      metrics: storyData.metrics || { reach: 0, satisfaction: 0, sustainability: 0 },
      media: storyData.media || [],
      tags: storyData.tags || [],
      isVerified: false,
      likes: 0,
      shares: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createImpactStory(story);
    emitImpactStoryCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get community events
router.get('/:projectId/community-events', authenticate, (req, res) => {
  try {
    const events = db.getCommunityEvents(req.params.projectId);
    const result = Array.isArray(events) ? events : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching community events:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch community events' });
  }
});

// Create community event
router.post('/:projectId/community-events', authenticate, (req: AuthRequest, res) => {
  try {
    const eventData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const event: CommunityEvent = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      organizer: user.id,
      attendees: 0,
      maxAttendees: eventData.maxAttendees || 50,
      status: 'upcoming',
      requirements: eventData.requirements || [],
      isRegistered: false,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createCommunityEvent(event);
    emitCommunityEventCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INNOVATION HUB / FORGELAB ROUTES
// ============================================

// Get ideas
router.get('/:projectId/ideas', authenticate, (req, res) => {
  try {
    const ideas = db.getIdeas(req.params.projectId);
    const result = Array.isArray(ideas) ? ideas : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching ideas:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch ideas' });
  }
});

// Create idea
router.post('/:projectId/ideas', authenticate, (req: AuthRequest, res) => {
  try {
    const ideaData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const idea: Idea = {
      id: uuidv4(),
      projectId: req.params.projectId,
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category,
      author: user.name,
      authorAvatar: user.avatar,
      authorType: user.isDiaspora ? 'diaspora' : 'local',
      authorLocation: user.location,
      stage: 'ideation',
      status: 'active',
      tags: ideaData.tags || [],
      upvotes: 0,
      comments: 0,
      views: 0,
      feasibility: ideaData.feasibility || 50,
      impact: ideaData.impact || 50,
      effort: ideaData.effort || 50,
      isBookmarked: false,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createIdea(idea);
    emitIdeaCreated(req.params.projectId, created);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update idea
router.put('/:projectId/ideas/:ideaId', authenticate, (req: AuthRequest, res) => {
  try {
    const idea = db.getIdeaById(req.params.ideaId);
    if (!idea || idea.projectId !== req.params.projectId) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    const updated = db.updateIdea(req.params.ideaId, req.body);
    if (updated) {
      emitIdeaUpdated(req.params.projectId, updated);
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get co-creation rooms
router.get('/:projectId/co-creation-rooms', authenticate, (req, res) => {
  try {
    const rooms = db.getCoCreationRooms(req.params.projectId);
    const result = Array.isArray(rooms) ? rooms : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching co-creation rooms:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch co-creation rooms' });
  }
});

// Create co-creation room
router.post('/:projectId/co-creation-rooms', authenticate, (req: AuthRequest, res) => {
  try {
    const roomData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const room: CoCreationRoom = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: roomData.name,
      description: roomData.description,
      type: roomData.type,
      members: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: 'owner',
          isOnline: true,
        },
      ],
      files: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createCoCreationRoom(room);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project workspaces
router.get('/:projectId/workspaces', authenticate, (req, res) => {
  try {
    const workspaces = db.getProjectWorkspaces(req.params.projectId);
    const result = Array.isArray(workspaces) ? workspaces : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching project workspaces:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch project workspaces' });
  }
});

// Create project workspace
router.post('/:projectId/workspaces', authenticate, (req: AuthRequest, res) => {
  try {
    const workspaceData = req.body;
    const user = db.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const now = new Date().toISOString();
    const workspace: ProjectWorkspace = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: workspaceData.name,
      description: workspaceData.description,
      members: workspaceData.members || [],
      files: workspaceData.files || [],
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createProjectWorkspace(workspace);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get build tools
router.get('/:projectId/build-tools', authenticate, (req, res) => {
  try {
    const tools = db.getBuildTools(req.params.projectId);
    const result = Array.isArray(tools) ? tools : [];
    res.json(result);
  } catch (error: any) {
    console.error('[Workspace] Error fetching build tools:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch build tools' });
  }
});

// Create build tool
router.post('/:projectId/build-tools', authenticate, (req: AuthRequest, res) => {
  try {
    const toolData = req.body;
    const now = new Date().toISOString();
    const tool: BuildTool = {
      id: uuidv4(),
      projectId: req.params.projectId,
      name: toolData.name,
      type: toolData.type,
      status: 'active',
      config: toolData.config || {},
      createdAt: now,
      updatedAt: now,
    };
    
    const created = db.createBuildTool(tool);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

