// API Client Utility
// NOTE: This file is being migrated to Supabase
// Legacy API endpoints are kept for backward compatibility during migration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Import Supabase auth utilities
import { ensureDevAuth as ensureSupabaseDevAuth, getSession } from './auth';
import { supabase } from './supabaseClient';

// Get auth token from Supabase session (for legacy API calls during migration)
export async function getAuthToken(): Promise<string | null> {
  try {
    const { session } = await getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// Auto-authenticate for development (uses Supabase Auth)
async function ensureDevAuth(): Promise<void> {
  await ensureSupabaseDevAuth();
}

// Legacy token functions (deprecated - Supabase handles sessions automatically)
export function saveAuthTokens(tokens: { accessToken: string; refreshToken: string; expiresIn: number }): void {
  // Deprecated: Supabase handles session storage automatically
  console.warn('saveAuthTokens is deprecated - Supabase handles sessions automatically');
}

export function clearAuthTokens(): void {
  // Deprecated: Use supabase.auth.signOut() instead
  console.warn('clearAuthTokens is deprecated - Use supabase.auth.signOut() instead');
}

// API request helper
// NOTE: This is for legacy API calls during migration. New code should use Supabase directly.
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Auto-authenticate for development if needed (only for protected endpoints)
  const isProtectedEndpoint = !endpoint.includes('/auth/register') && 
                              !endpoint.includes('/auth/login') &&
                              !endpoint.includes('/health');
  
  if (isProtectedEndpoint && import.meta.env.DEV) {
    await ensureDevAuth();
  }

  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      // Clone response to avoid consuming the body
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      if (text && text.trim()) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            errorMessage = parsed.error || parsed.message || errorMessage;
          } else {
            errorMessage = text;
          }
        } catch {
          // If JSON parsing fails, use the text as error message
          errorMessage = text || errorMessage;
        }
      }
    } catch (e) {
      // If we can't read the response, use default error message
      console.error('[API] Error reading error response:', e);
    }
    throw new Error(String(errorMessage));
  }

  try {
    const data = await response.json();
    // Ensure we return an array for array endpoints, or the data as-is
    if (data === null || data === undefined) {
      // If response is null/undefined, return empty array for array endpoints
      const isArrayEndpoint = endpoint.includes('/workspace/') && (
        endpoint.includes('/voice-notes') ||
        endpoint.includes('/learning-content') ||
        endpoint.includes('/deliverables') ||
        endpoint.includes('/messages') ||
        endpoint.includes('/tasks') ||
        endpoint.includes('/sessions')
      );
      return (isArrayEndpoint ? [] : null) as T;
    }
    return data;
  } catch (e) {
    // If response is not JSON, return empty array for array endpoints
    const isArrayEndpoint = endpoint.includes('/workspace/') && (
      endpoint.includes('/voice-notes') ||
      endpoint.includes('/learning-content') ||
      endpoint.includes('/deliverables') ||
      endpoint.includes('/messages') ||
      endpoint.includes('/tasks') ||
      endpoint.includes('/sessions')
    );
    return (isArrayEndpoint ? [] : null) as T;
  }
}

// Auth API (DEPRECATED - Use Supabase Auth instead)
// This is kept for backward compatibility during migration
// New code should import from './auth' instead
export const authAPI = {
  /**
   * @deprecated Use `register()` from './auth' instead
   */
  register: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    console.warn('authAPI.register is deprecated - use register() from ./auth instead');
    const { register: supabaseRegister } = await import('./auth');
    const result = await supabaseRegister(data);
    if (result.error) {
      throw result.error;
    }
    // Return legacy format for compatibility
    return {
      user: result.user,
      tokens: {
        accessToken: '', // Supabase handles this automatically
        refreshToken: '',
        expiresIn: 3600,
      },
    };
  },

  /**
   * @deprecated Use `login()` from './auth' instead
   */
  login: async (data: { email: string; password: string }) => {
    console.warn('authAPI.login is deprecated - use login() from ./auth instead');
    const { login: supabaseLogin } = await import('./auth');
    const result = await supabaseLogin(data);
    if (result.error) {
      throw result.error;
    }
    // Return legacy format for compatibility
    return {
      user: result.user,
      tokens: {
        accessToken: '', // Supabase handles this automatically
        refreshToken: '',
        expiresIn: 3600,
      },
    };
  },

  /**
   * @deprecated Use `refreshSession()` from './auth' instead
   */
  refreshToken: async (refreshToken: string) => {
    console.warn('authAPI.refreshToken is deprecated - Supabase handles refresh automatically');
    const { refreshSession } = await import('./auth');
    const result = await refreshSession();
    if (result.error) {
      throw result.error;
    }
    return {
      accessToken: result.session?.access_token || '',
      refreshToken: result.session?.refresh_token || '',
      expiresIn: result.session?.expires_in || 3600,
    };
  },

  /**
   * @deprecated Use `getSession()` from './auth' instead
   */
  validate: async () => {
    console.warn('authAPI.validate is deprecated - use getSession() from ./auth instead');
    const { getSession } = await import('./auth');
    const { session, error } = await getSession();
    if (error || !session) {
      throw new Error('Invalid session');
    }
    return { valid: true, user: session.user };
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return apiRequest('/user/profile');
  },

  updateProfile: async (updates: any) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  getUser: async (userId: string) => {
    return apiRequest(`/user/${userId}`);
  },
};

// Feed API
export const feedAPI = {
  getFeed: async (params?: { type?: string; category?: string; limit?: number; offset?: number; sort?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiRequest<{ items: any[]; total: number }>(`/feed${query ? `?${query}` : ''}`);
  },

  recordAction: async (action: any) => {
    return apiRequest('/feed/actions', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  },

  createHighlight: async (highlight: any) => {
    return apiRequest('/feed/admin/highlights', {
      method: 'POST',
      body: JSON.stringify(highlight),
    });
  },

  getStats: async () => {
    return apiRequest('/feed/stats');
  },
};

// Project API
export const projectAPI = {
  getProjects: async (params?: { status?: string; category?: string; university?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiRequest<any[]>(`/projects${query ? `?${query}` : ''}`);
  },

  getProject: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}`);
  },

  createProject: async (project: any) => {
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  updateProject: async (projectId: string, updates: any) => {
    return apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  joinProject: async (projectId: string, data: { role: string; area: string }) => {
    return apiRequest(`/projects/${projectId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getWorkspace: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/workspace`);
  },
};

// Opportunity API
export const opportunityAPI = {
  getOpportunities: async (params?: { type?: string; category?: string; location?: string; remote?: boolean; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiRequest<any[]>(`/opportunities${query ? `?${query}` : ''}`);
  },

  getOpportunity: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}`);
  },

  createOpportunity: async (opportunity: any) => {
    return apiRequest('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
  },

  apply: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}/apply`, {
      method: 'POST',
    });
  },

  save: async (opportunityId: string) => {
    return apiRequest(`/opportunities/${opportunityId}/save`, {
      method: 'POST',
    });
  },
};

// Network API
export const networkAPI = {
  getUsers: async (params?: { search?: string; university?: string; role?: string; connectionStatus?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiRequest<any[]>(`/network/users${query ? `?${query}` : ''}`);
  },

  connect: async (data: { userId: string; purpose: string; message: string }) => {
    return apiRequest('/network/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRequests: async () => {
    return apiRequest<any[]>('/network/requests');
  },

  acceptRequest: async (requestId: string) => {
    return apiRequest(`/network/requests/${requestId}/accept`, {
      method: 'POST',
    });
  },

  declineRequest: async (requestId: string) => {
    return apiRequest(`/network/requests/${requestId}/decline`, {
      method: 'POST',
    });
  },
};

// Campaign API
export const campaignAPI = {
  getCampaigns: async (params?: { type?: string; university?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    const query = queryParams.toString();
    return apiRequest<any[]>(`/campaigns${query ? `?${query}` : ''}`);
  },

  getCampaign: async (campaignId: string) => {
    return apiRequest(`/campaigns/${campaignId}`);
  },

  createCampaign: async (campaign: any) => {
    return apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  },

  joinCampaign: async (campaignId: string) => {
    return apiRequest(`/campaigns/${campaignId}/join`, {
      method: 'POST',
    });
  },
};

// Workspace API
export const workspaceAPI = {
  // Sessions
  getSessions: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/sessions`);
  },
  getSession: async (projectId: string, sessionId: string) => {
    return apiRequest(`/workspace/${projectId}/sessions/${sessionId}`);
  },
  createSession: async (projectId: string, session: any) => {
    return apiRequest(`/workspace/${projectId}/sessions`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },
  updateSession: async (projectId: string, sessionId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteSession: async (projectId: string, sessionId: string) => {
    return apiRequest(`/workspace/${projectId}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  getTasks: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/tasks`);
  },
  createTask: async (projectId: string, task: any) => {
    return apiRequest(`/workspace/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  updateTask: async (projectId: string, taskId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteTask: async (projectId: string, taskId: string) => {
    return apiRequest(`/workspace/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
  addTaskComment: async (projectId: string, taskId: string, comment: any) => {
    return apiRequest(`/workspace/${projectId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  // Voice Notes
  getVoiceNotes: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/voice-notes`);
  },
  createVoiceNote: async (projectId: string, note: any) => {
    return apiRequest(`/workspace/${projectId}/voice-notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  // Messages
  getMessages: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/messages`);
  },
  sendMessage: async (projectId: string, message: any) => {
    return apiRequest(`/workspace/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },

  // Learning Content
  getLearningContent: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/learning-content`);
  },
  createLearningContent: async (projectId: string, content: any) => {
    return apiRequest(`/workspace/${projectId}/learning-content`, {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },
  updateLearningContent: async (projectId: string, contentId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/learning-content/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Recordings
  getRecordings: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/recordings`);
  },
  createRecording: async (projectId: string, recording: any) => {
    return apiRequest(`/workspace/${projectId}/recordings`, {
      method: 'POST',
      body: JSON.stringify(recording),
    });
  },

  // Deliverables
  getDeliverables: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/deliverables`);
  },
  createDeliverable: async (projectId: string, deliverable: any) => {
    return apiRequest(`/workspace/${projectId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(deliverable),
    });
  },
  updateDeliverable: async (projectId: string, deliverableId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/deliverables/${deliverableId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Certificates
  getCertificates: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/certificates`);
  },
  createCertificate: async (projectId: string, certificate: any) => {
    return apiRequest(`/workspace/${projectId}/certificates`, {
      method: 'POST',
      body: JSON.stringify(certificate),
    });
  },
  updateCertificate: async (projectId: string, certificateId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/certificates/${certificateId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Live Sessions
  getLiveSessions: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/live-sessions`);
  },
  createLiveSession: async (projectId: string, session: any) => {
    return apiRequest(`/workspace/${projectId}/live-sessions`, {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },
  updateLiveSession: async (projectId: string, sessionId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/live-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Research Sources
  getResearchSources: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/research-sources`);
  },
  createResearchSource: async (projectId: string, source: any) => {
    return apiRequest(`/workspace/${projectId}/research-sources`, {
      method: 'POST',
      body: JSON.stringify(source),
    });
  },
  updateResearchSource: async (projectId: string, sourceId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/research-sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteResearchSource: async (projectId: string, sourceId: string) => {
    return apiRequest(`/workspace/${projectId}/research-sources/${sourceId}`, {
      method: 'DELETE',
    });
  },

  // Research Notes
  getResearchNotes: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/research-notes`);
  },
  createResearchNote: async (projectId: string, note: any) => {
    return apiRequest(`/workspace/${projectId}/research-notes`, {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },
  updateResearchNote: async (projectId: string, noteId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/research-notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Data Sets
  getDataSets: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/data-sets`);
  },
  createDataSet: async (projectId: string, dataSet: any) => {
    return apiRequest(`/workspace/${projectId}/data-sets`, {
      method: 'POST',
      body: JSON.stringify(dataSet),
    });
  },

  // Stakeholders
  getStakeholders: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/stakeholders`);
  },
  createStakeholder: async (projectId: string, stakeholder: any) => {
    return apiRequest(`/workspace/${projectId}/stakeholders`, {
      method: 'POST',
      body: JSON.stringify(stakeholder),
    });
  },
  updateStakeholder: async (projectId: string, stakeholderId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/stakeholders/${stakeholderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Impact Stories
  getImpactStories: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/impact-stories`);
  },
  createImpactStory: async (projectId: string, story: any) => {
    return apiRequest(`/workspace/${projectId}/impact-stories`, {
      method: 'POST',
      body: JSON.stringify(story),
    });
  },

  // Community Events
  getCommunityEvents: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/community-events`);
  },
  createCommunityEvent: async (projectId: string, event: any) => {
    return apiRequest(`/workspace/${projectId}/community-events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  // Ideas
  getIdeas: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/ideas`);
  },
  createIdea: async (projectId: string, idea: any) => {
    return apiRequest(`/workspace/${projectId}/ideas`, {
      method: 'POST',
      body: JSON.stringify(idea),
    });
  },
  updateIdea: async (projectId: string, ideaId: string, updates: any) => {
    return apiRequest(`/workspace/${projectId}/ideas/${ideaId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Co-Creation Rooms
  getCoCreationRooms: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/co-creation-rooms`);
  },
  createCoCreationRoom: async (projectId: string, room: any) => {
    return apiRequest(`/workspace/${projectId}/co-creation-rooms`, {
      method: 'POST',
      body: JSON.stringify(room),
    });
  },

  // Project Workspaces
  getProjectWorkspaces: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/workspaces`);
  },
  createProjectWorkspace: async (projectId: string, workspace: any) => {
    return apiRequest(`/workspace/${projectId}/workspaces`, {
      method: 'POST',
      body: JSON.stringify(workspace),
    });
  },

  // Build Tools
  getBuildTools: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/build-tools`);
  },
  createBuildTool: async (projectId: string, tool: any) => {
    return apiRequest(`/workspace/${projectId}/build-tools`, {
      method: 'POST',
      body: JSON.stringify(tool),
    });
  },

  // Members
  getMembers: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/members`);
  },
  addMember: async (projectId: string, data: { email: string; role: string }) => {
    return apiRequest(`/workspace/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Milestones
  getMilestones: async (projectId: string) => {
    return apiRequest<any[]>(`/workspace/${projectId}/milestones`);
  },
  createMilestone: async (projectId: string, milestone: any) => {
    return apiRequest(`/workspace/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestone),
    });
  },
};

// Upload API
// NOTE: This is being migrated to Supabase Storage
// Legacy upload endpoint is kept for backward compatibility during migration
export const uploadAPI = {
  uploadFile: async (file: File, options?: { bucket?: string; path?: string }): Promise<any> => {
    // Try Supabase Storage first
    try {
      const { uploadFile: uploadToSupabase } = await import('./supabaseStorage');
      const result = await uploadToSupabase(file, {
        bucket: options?.bucket || 'project-files',
        path: options?.path,
        contentType: file.type,
      });
      return {
        id: result.path,
        url: result.publicUrl,
        path: result.path,
        ...result,
      };
    } catch (supabaseError) {
      console.warn('Supabase Storage upload failed, trying legacy API:', supabaseError);
      // Fallback to legacy API during migration
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    }
  },

  getFile: async (fileId: string) => {
    // Try Supabase Storage first
    try {
      const { getPublicUrl } = await import('./supabaseStorage');
      // Assume fileId is in format "bucket/path" or just "path" (defaults to project-files)
      const [bucket, ...pathParts] = fileId.includes('/') ? fileId.split('/') : ['project-files', fileId];
      const path = pathParts.join('/');
      return {
        url: getPublicUrl(bucket, path),
        path,
        bucket,
      };
    } catch (supabaseError) {
      console.warn('Supabase Storage get failed, trying legacy API:', supabaseError);
      // Fallback to legacy API
      return apiRequest(`/upload/${fileId}`);
    }
  },
};

