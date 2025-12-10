import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Database } from '../types/index.js';

const DATA_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DATA_DIR, 'database.json');

// Initialize empty database
const emptyDatabase: Database = {
  users: [],
  projects: [],
  opportunities: [],
  campaigns: [],
  tasks: [],
  milestones: [],
  feedItems: [],
  userActions: [],
  adminHighlights: [],
  connectionRequests: [],
  messages: [],
  sessions: [],
  uploadedFiles: [],
  voiceNotes: [],
  learningContent: [],
  recordings: [],
  deliverables: [],
  certificates: [],
  liveSessions: [],
  researchSources: [],
  researchNotes: [],
  dataSets: [],
  stakeholders: [],
  impactStories: [],
  communityEvents: [],
  ideas: [],
  coCreationRooms: [],
  projectWorkspaces: [],
  buildTools: []
};

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure database has all required properties
function ensureDatabaseStructure(db: any): Database {
  // Merge with emptyDatabase to ensure all properties exist
  const merged = { ...emptyDatabase, ...db };
  
  // Ensure all array properties exist and are arrays
  for (const key in emptyDatabase) {
    if (Array.isArray(emptyDatabase[key as keyof Database])) {
      if (!Array.isArray(merged[key as keyof Database])) {
        merged[key as keyof Database] = [] as any;
      }
    }
  }
  
  return merged as Database;
}

// Load database from file
function loadDatabase(): Database {
  if (!existsSync(DB_FILE)) {
    saveDatabase(emptyDatabase);
    return emptyDatabase;
  }
  
  try {
    const data = readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure all required properties exist
    const ensured = ensureDatabaseStructure(parsed);
    // Save back if structure was updated
    if (JSON.stringify(parsed) !== JSON.stringify(ensured)) {
      saveDatabase(ensured);
    }
    return ensured;
  } catch (error) {
    console.error('Error loading database:', error);
    return emptyDatabase;
  }
}

// Save database to file
function saveDatabase(db: Database): void {
  try {
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Get database instance
let database: Database = loadDatabase();

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database;

  private constructor() {
    this.db = loadDatabase();
    // Ensure all required properties exist (defensive check)
    this.db = ensureDatabaseStructure(this.db);
    // Save the ensured structure to disk
    saveDatabase(this.db);
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Save database to disk
  save(): void {
    saveDatabase(this.db);
  }

  // Get entire database
  getDatabase(): Database {
    return this.db;
  }

  // Users
  getUsers(): Database['users'] {
    return this.db.users;
  }

  getUserById(id: string): Database['users'][0] | undefined {
    return this.db.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): Database['users'][0] | undefined {
    return this.db.users.find(u => u.email === email);
  }

  createUser(user: Database['users'][0]): Database['users'][0] {
    this.db.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<Database['users'][0]>): Database['users'][0] | null {
    const index = this.db.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.db.users[index] = { ...this.db.users[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.users[index];
  }

  // Projects
  getProjects(): Database['projects'] {
    return this.db.projects;
  }

  getProjectById(id: string): Database['projects'][0] | undefined {
    return this.db.projects.find(p => p.id === id);
  }

  createProject(project: Database['projects'][0]): Database['projects'][0] {
    this.db.projects.push(project);
    this.save();
    return project;
  }

  updateProject(id: string, updates: Partial<Database['projects'][0]>): Database['projects'][0] | null {
    const index = this.db.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.db.projects[index] = { ...this.db.projects[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.db.projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.db.projects.splice(index, 1);
    this.save();
    return true;
  }

  // Opportunities
  getOpportunities(): Database['opportunities'] {
    return this.db.opportunities;
  }

  getOpportunityById(id: string): Database['opportunities'][0] | undefined {
    return this.db.opportunities.find(o => o.id === id);
  }

  createOpportunity(opportunity: Database['opportunities'][0]): Database['opportunities'][0] {
    this.db.opportunities.push(opportunity);
    this.save();
    return opportunity;
  }

  updateOpportunity(id: string, updates: Partial<Database['opportunities'][0]>): Database['opportunities'][0] | null {
    const index = this.db.opportunities.findIndex(o => o.id === id);
    if (index === -1) return null;
    this.db.opportunities[index] = { ...this.db.opportunities[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.opportunities[index];
  }

  // Campaigns
  getCampaigns(): Database['campaigns'] {
    return this.db.campaigns;
  }

  getCampaignById(id: string): Database['campaigns'][0] | undefined {
    return this.db.campaigns.find(c => c.id === id);
  }

  createCampaign(campaign: Database['campaigns'][0]): Database['campaigns'][0] {
    this.db.campaigns.push(campaign);
    this.save();
    return campaign;
  }

  updateCampaign(id: string, updates: Partial<Database['campaigns'][0]>): Database['campaigns'][0] | null {
    const index = this.db.campaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.db.campaigns[index] = { ...this.db.campaigns[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.campaigns[index];
  }

  // Tasks
  getTasks(projectId?: string): Database['tasks'] {
    if (!this.db.tasks) {
      this.db.tasks = [];
    }
    if (projectId) {
      return this.db.tasks.filter(t => t.projectId === projectId);
    }
    return this.db.tasks;
  }

  getTaskById(id: string): Database['tasks'][0] | undefined {
    return this.db.tasks.find(t => t.id === id);
  }

  createTask(task: Database['tasks'][0]): Database['tasks'][0] {
    this.db.tasks.push(task);
    this.save();
    return task;
  }

  updateTask(id: string, updates: Partial<Database['tasks'][0]>): Database['tasks'][0] | null {
    const index = this.db.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.db.tasks[index] = { ...this.db.tasks[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.db.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.db.tasks.splice(index, 1);
    this.save();
    return true;
  }

  // Milestones
  getMilestones(projectId?: string): Database['milestones'] {
    if (!this.db.milestones) {
      this.db.milestones = [];
    }
    if (projectId) {
      return this.db.milestones.filter(m => m.projectId === projectId);
    }
    return this.db.milestones;
  }

  getMilestoneById(id: string): Database['milestones'][0] | undefined {
    return this.db.milestones.find(m => m.id === id);
  }

  createMilestone(milestone: Database['milestones'][0]): Database['milestones'][0] {
    this.db.milestones.push(milestone);
    this.save();
    return milestone;
  }

  updateMilestone(id: string, updates: Partial<Database['milestones'][0]>): Database['milestones'][0] | null {
    const index = this.db.milestones.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.db.milestones[index] = { ...this.db.milestones[index], ...updates, lastUpdated: new Date().toISOString() };
    this.save();
    return this.db.milestones[index];
  }

  // Feed Items
  getFeedItems(): Database['feedItems'] {
    return this.db.feedItems;
  }

  createFeedItem(item: Database['feedItems'][0]): Database['feedItems'][0] {
    this.db.feedItems.push(item);
    this.save();
    return item;
  }

  updateFeedItem(id: string, updates: Partial<Database['feedItems'][0]>): Database['feedItems'][0] | null {
    const index = this.db.feedItems.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.db.feedItems[index] = { ...this.db.feedItems[index], ...updates };
    this.save();
    return this.db.feedItems[index];
  }

  // User Actions
  createUserAction(action: Database['userActions'][0]): Database['userActions'][0] {
    this.db.userActions.push(action);
    this.save();
    return action;
  }

  // Admin Highlights
  getAdminHighlights(): Database['adminHighlights'] {
    return this.db.adminHighlights;
  }

  createAdminHighlight(highlight: Database['adminHighlights'][0]): Database['adminHighlights'][0] {
    this.db.adminHighlights.push(highlight);
    this.save();
    return highlight;
  }

  // Connection Requests
  getConnectionRequests(userId?: string): Database['connectionRequests'] {
    if (userId) {
      return this.db.connectionRequests.filter(
        r => r.fromUserId === userId || r.toUserId === userId
      );
    }
    return this.db.connectionRequests;
  }

  createConnectionRequest(request: Database['connectionRequests'][0]): Database['connectionRequests'][0] {
    this.db.connectionRequests.push(request);
    this.save();
    return request;
  }

  updateConnectionRequest(id: string, updates: Partial<Database['connectionRequests'][0]>): Database['connectionRequests'][0] | null {
    const index = this.db.connectionRequests.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.db.connectionRequests[index] = { ...this.db.connectionRequests[index], ...updates };
    this.save();
    return this.db.connectionRequests[index];
  }

  // Messages
  getMessages(projectId?: string, userId?: string): Database['messages'] {
    if (!this.db.messages) {
      this.db.messages = [];
    }
    let messages = this.db.messages;
    if (projectId) {
      messages = messages.filter(m => m.projectId === projectId);
    }
    if (userId) {
      messages = messages.filter(m => m.senderId === userId || m.recipientId === userId);
    }
    return messages;
  }

  createMessage(message: Database['messages'][0]): Database['messages'][0] {
    this.db.messages.push(message);
    this.save();
    return message;
  }

  // Sessions
  getSessions(projectId?: string): Database['sessions'] {
    if (!this.db.sessions) {
      this.db.sessions = [];
    }
    if (projectId) {
      return this.db.sessions.filter(s => s.projectId === projectId);
    }
    return this.db.sessions;
  }

  getSessionById(id: string): Database['sessions'][0] | undefined {
    return this.db.sessions.find(s => s.id === id);
  }

  createSession(session: Database['sessions'][0]): Database['sessions'][0] {
    this.db.sessions.push(session);
    this.save();
    return session;
  }

  updateSession(id: string, updates: Partial<Database['sessions'][0]>): Database['sessions'][0] | null {
    const index = this.db.sessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.db.sessions[index] = { ...this.db.sessions[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.sessions[index];
  }

  deleteSession(id: string): boolean {
    const index = this.db.sessions.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.db.sessions.splice(index, 1);
    this.save();
    return true;
  }

  // Uploaded Files
  createUploadedFile(file: Database['uploadedFiles'][0]): Database['uploadedFiles'][0] {
    this.db.uploadedFiles.push(file);
    this.save();
    return file;
  }

  getUploadedFileById(id: string): Database['uploadedFiles'][0] | undefined {
    return this.db.uploadedFiles.find(f => f.id === id);
  }

  updateUploadedFile(id: string, updates: Partial<Database['uploadedFiles'][0]>): Database['uploadedFiles'][0] | null {
    const index = this.db.uploadedFiles.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.db.uploadedFiles[index] = { ...this.db.uploadedFiles[index], ...updates };
    this.save();
    return this.db.uploadedFiles[index];
  }

  // Voice Notes
  getVoiceNotes(projectId?: string): Database['voiceNotes'] {
    if (!this.db || !this.db.voiceNotes) {
      if (!this.db) {
        this.db = ensureDatabaseStructure({});
      }
      this.db.voiceNotes = [];
      this.save();
    }
    if (projectId) {
      return this.db.voiceNotes.filter(v => v && v.projectId === projectId);
    }
    return this.db.voiceNotes;
  }

  createVoiceNote(note: Database['voiceNotes'][0]): Database['voiceNotes'][0] {
    if (!this.db.voiceNotes) {
      this.db.voiceNotes = [];
    }
    this.db.voiceNotes.push(note);
    this.save();
    return note;
  }

  // Learning Content
  getLearningContent(projectId?: string): Database['learningContent'] {
    if (!this.db || !this.db.learningContent) {
      if (!this.db) {
        this.db = ensureDatabaseStructure({});
      }
      this.db.learningContent = [];
      this.save();
    }
    if (projectId) {
      return this.db.learningContent.filter(l => l && l.projectId === projectId);
    }
    return this.db.learningContent;
  }

  getLearningContentById(id: string): Database['learningContent'][0] | undefined {
    return this.db.learningContent.find(l => l.id === id);
  }

  createLearningContent(content: Database['learningContent'][0]): Database['learningContent'][0] {
    if (!this.db.learningContent) {
      this.db.learningContent = [];
    }
    this.db.learningContent.push(content);
    this.save();
    return content;
  }

  updateLearningContent(id: string, updates: Partial<Database['learningContent'][0]>): Database['learningContent'][0] | null {
    if (!this.db.learningContent) {
      this.db.learningContent = [];
    }
    const index = this.db.learningContent.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.db.learningContent[index] = { ...this.db.learningContent[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.learningContent[index];
  }

  // Recordings
  getRecordings(projectId?: string): Database['recordings'] {
    if (!this.db.recordings) {
      this.db.recordings = [];
    }
    if (projectId) {
      return this.db.recordings.filter(r => r.projectId === projectId);
    }
    return this.db.recordings;
  }

  createRecording(recording: Database['recordings'][0]): Database['recordings'][0] {
    if (!this.db.recordings) {
      this.db.recordings = [];
    }
    this.db.recordings.push(recording);
    this.save();
    return recording;
  }

  // Deliverables
  getDeliverables(projectId?: string): Database['deliverables'] {
    if (!this.db || !this.db.deliverables) {
      if (!this.db) {
        this.db = ensureDatabaseStructure({});
      }
      this.db.deliverables = [];
      this.save();
    }
    if (projectId) {
      return this.db.deliverables.filter(d => d && d.projectId === projectId);
    }
    return this.db.deliverables;
  }

  getDeliverableById(id: string): Database['deliverables'][0] | undefined {
    return this.db.deliverables.find(d => d.id === id);
  }

  createDeliverable(deliverable: Database['deliverables'][0]): Database['deliverables'][0] {
    if (!this.db.deliverables) {
      this.db.deliverables = [];
    }
    this.db.deliverables.push(deliverable);
    this.save();
    return deliverable;
  }

  updateDeliverable(id: string, updates: Partial<Database['deliverables'][0]>): Database['deliverables'][0] | null {
    if (!this.db.deliverables) {
      this.db.deliverables = [];
    }
    const index = this.db.deliverables.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.db.deliverables[index] = { ...this.db.deliverables[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.deliverables[index];
  }

  // Certificates
  getCertificates(projectId?: string): Database['certificates'] {
    if (!this.db.certificates) {
      this.db.certificates = [];
    }
    if (projectId) {
      return this.db.certificates.filter(c => c.projectId === projectId);
    }
    return this.db.certificates;
  }

  getCertificateById(id: string): Database['certificates'][0] | undefined {
    return this.db.certificates.find(c => c.id === id);
  }

  createCertificate(certificate: Database['certificates'][0]): Database['certificates'][0] {
    if (!this.db.certificates) {
      this.db.certificates = [];
    }
    this.db.certificates.push(certificate);
    this.save();
    return certificate;
  }

  updateCertificate(id: string, updates: Partial<Database['certificates'][0]>): Database['certificates'][0] | null {
    if (!this.db.certificates) {
      this.db.certificates = [];
    }
    const index = this.db.certificates.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.db.certificates[index] = { ...this.db.certificates[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.certificates[index];
  }

  // Live Sessions
  getLiveSessions(projectId?: string): Database['liveSessions'] {
    if (!this.db.liveSessions) {
      this.db.liveSessions = [];
    }
    if (projectId) {
      return this.db.liveSessions.filter(l => l.projectId === projectId);
    }
    return this.db.liveSessions;
  }

  getLiveSessionById(id: string): Database['liveSessions'][0] | undefined {
    return this.db.liveSessions.find(l => l.id === id);
  }

  createLiveSession(session: Database['liveSessions'][0]): Database['liveSessions'][0] {
    if (!this.db.liveSessions) {
      this.db.liveSessions = [];
    }
    this.db.liveSessions.push(session);
    this.save();
    return session;
  }

  updateLiveSession(id: string, updates: Partial<Database['liveSessions'][0]>): Database['liveSessions'][0] | null {
    if (!this.db.liveSessions) {
      this.db.liveSessions = [];
    }
    const index = this.db.liveSessions.findIndex(l => l.id === id);
    if (index === -1) return null;
    this.db.liveSessions[index] = { ...this.db.liveSessions[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.liveSessions[index];
  }

  // Research Sources
  getResearchSources(projectId?: string): Database['researchSources'] {
    if (!this.db.researchSources) {
      this.db.researchSources = [];
    }
    if (projectId) {
      return this.db.researchSources.filter(r => r.projectId === projectId);
    }
    return this.db.researchSources;
  }

  getResearchSourceById(id: string): Database['researchSources'][0] | undefined {
    return this.db.researchSources.find(r => r.id === id);
  }

  createResearchSource(source: Database['researchSources'][0]): Database['researchSources'][0] {
    if (!this.db.researchSources) {
      this.db.researchSources = [];
    }
    this.db.researchSources.push(source);
    this.save();
    return source;
  }

  updateResearchSource(id: string, updates: Partial<Database['researchSources'][0]>): Database['researchSources'][0] | null {
    if (!this.db.researchSources) {
      this.db.researchSources = [];
    }
    const index = this.db.researchSources.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.db.researchSources[index] = { ...this.db.researchSources[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.researchSources[index];
  }

  deleteResearchSource(id: string): boolean {
    const index = this.db.researchSources.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.db.researchSources.splice(index, 1);
    this.save();
    return true;
  }

  // Research Notes
  getResearchNotes(projectId?: string): Database['researchNotes'] {
    if (!this.db.researchNotes) {
      this.db.researchNotes = [];
    }
    if (projectId) {
      return this.db.researchNotes.filter(n => n.projectId === projectId);
    }
    return this.db.researchNotes;
  }

  getResearchNoteById(id: string): Database['researchNotes'][0] | undefined {
    return this.db.researchNotes.find(n => n.id === id);
  }

  createResearchNote(note: Database['researchNotes'][0]): Database['researchNotes'][0] {
    if (!this.db.researchNotes) {
      this.db.researchNotes = [];
    }
    this.db.researchNotes.push(note);
    this.save();
    return note;
  }

  updateResearchNote(id: string, updates: Partial<Database['researchNotes'][0]>): Database['researchNotes'][0] | null {
    if (!this.db.researchNotes) {
      this.db.researchNotes = [];
    }
    const index = this.db.researchNotes.findIndex(n => n.id === id);
    if (index === -1) return null;
    this.db.researchNotes[index] = { ...this.db.researchNotes[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.researchNotes[index];
  }

  deleteResearchNote(id: string): boolean {
    const index = this.db.researchNotes.findIndex(n => n.id === id);
    if (index === -1) return false;
    this.db.researchNotes.splice(index, 1);
    this.save();
    return true;
  }

  // Data Sets
  getDataSets(projectId?: string): Database['dataSets'] {
    if (!this.db.dataSets) {
      this.db.dataSets = [];
    }
    if (projectId) {
      return this.db.dataSets.filter(d => d.projectId === projectId);
    }
    return this.db.dataSets;
  }

  createDataSet(dataSet: Database['dataSets'][0]): Database['dataSets'][0] {
    if (!this.db.dataSets) {
      this.db.dataSets = [];
    }
    this.db.dataSets.push(dataSet);
    this.save();
    return dataSet;
  }

  // Stakeholders
  getStakeholders(projectId?: string): Database['stakeholders'] {
    if (!this.db.stakeholders) {
      this.db.stakeholders = [];
    }
    if (projectId) {
      return this.db.stakeholders.filter(s => s.projectId === projectId);
    }
    return this.db.stakeholders;
  }

  getStakeholderById(id: string): Database['stakeholders'][0] | undefined {
    return this.db.stakeholders.find(s => s.id === id);
  }

  createStakeholder(stakeholder: Database['stakeholders'][0]): Database['stakeholders'][0] {
    if (!this.db.stakeholders) {
      this.db.stakeholders = [];
    }
    this.db.stakeholders.push(stakeholder);
    this.save();
    return stakeholder;
  }

  updateStakeholder(id: string, updates: Partial<Database['stakeholders'][0]>): Database['stakeholders'][0] | null {
    if (!this.db.stakeholders) {
      this.db.stakeholders = [];
    }
    const index = this.db.stakeholders.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.db.stakeholders[index] = { ...this.db.stakeholders[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.stakeholders[index];
  }

  deleteStakeholder(id: string): boolean {
    const index = this.db.stakeholders.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.db.stakeholders.splice(index, 1);
    this.save();
    return true;
  }

  // Impact Stories
  getImpactStories(projectId?: string): Database['impactStories'] {
    if (!this.db.impactStories) {
      this.db.impactStories = [];
    }
    if (projectId) {
      return this.db.impactStories.filter(s => s.projectId === projectId);
    }
    return this.db.impactStories;
  }

  createImpactStory(story: Database['impactStories'][0]): Database['impactStories'][0] {
    if (!this.db.impactStories) {
      this.db.impactStories = [];
    }
    this.db.impactStories.push(story);
    this.save();
    return story;
  }

  // Community Events
  getCommunityEvents(projectId?: string): Database['communityEvents'] {
    if (!this.db.communityEvents) {
      this.db.communityEvents = [];
    }
    if (projectId) {
      return this.db.communityEvents.filter(e => e.projectId === projectId);
    }
    return this.db.communityEvents;
  }

  createCommunityEvent(event: Database['communityEvents'][0]): Database['communityEvents'][0] {
    if (!this.db.communityEvents) {
      this.db.communityEvents = [];
    }
    this.db.communityEvents.push(event);
    this.save();
    return event;
  }

  // Ideas
  getIdeas(projectId?: string): Database['ideas'] {
    if (!this.db.ideas) {
      this.db.ideas = [];
    }
    if (projectId) {
      return this.db.ideas.filter(i => i.projectId === projectId);
    }
    return this.db.ideas;
  }

  getIdeaById(id: string): Database['ideas'][0] | undefined {
    return this.db.ideas.find(i => i.id === id);
  }

  createIdea(idea: Database['ideas'][0]): Database['ideas'][0] {
    if (!this.db.ideas) {
      this.db.ideas = [];
    }
    this.db.ideas.push(idea);
    this.save();
    return idea;
  }

  updateIdea(id: string, updates: Partial<Database['ideas'][0]>): Database['ideas'][0] | null {
    if (!this.db.ideas) {
      this.db.ideas = [];
    }
    const index = this.db.ideas.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.db.ideas[index] = { ...this.db.ideas[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.db.ideas[index];
  }

  // Co-Creation Rooms
  getCoCreationRooms(projectId?: string): Database['coCreationRooms'] {
    if (!this.db.coCreationRooms) {
      this.db.coCreationRooms = [];
    }
    if (projectId) {
      return this.db.coCreationRooms.filter(r => r.projectId === projectId);
    }
    return this.db.coCreationRooms;
  }

  createCoCreationRoom(room: Database['coCreationRooms'][0]): Database['coCreationRooms'][0] {
    if (!this.db.coCreationRooms) {
      this.db.coCreationRooms = [];
    }
    this.db.coCreationRooms.push(room);
    this.save();
    return room;
  }

  // Project Workspaces
  getProjectWorkspaces(projectId?: string): Database['projectWorkspaces'] {
    if (!this.db.projectWorkspaces) {
      this.db.projectWorkspaces = [];
    }
    if (projectId) {
      return this.db.projectWorkspaces.filter(w => w.projectId === projectId);
    }
    return this.db.projectWorkspaces;
  }

  createProjectWorkspace(workspace: Database['projectWorkspaces'][0]): Database['projectWorkspaces'][0] {
    if (!this.db.projectWorkspaces) {
      this.db.projectWorkspaces = [];
    }
    this.db.projectWorkspaces.push(workspace);
    this.save();
    return workspace;
  }

  // Build Tools
  getBuildTools(projectId?: string): Database['buildTools'] {
    if (!this.db.buildTools) {
      this.db.buildTools = [];
    }
    if (projectId) {
      return this.db.buildTools.filter(t => t.projectId === projectId);
    }
    return this.db.buildTools;
  }

  createBuildTool(tool: Database['buildTools'][0]): Database['buildTools'][0] {
    if (!this.db.buildTools) {
      this.db.buildTools = [];
    }
    this.db.buildTools.push(tool);
    this.save();
    return tool;
  }
}

