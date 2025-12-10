import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.js';

export interface SSEClient {
  id: string;
  userId: string;
  response: Response;
  projectIds: Set<string>;
  lastEventId: number;
}

class SSEService {
  private clients = new Map<string, SSEClient>();
  private eventIdCounter = 0;

  /**
   * Authenticate SSE connection from token
   */
  authenticateConnection(token: string | null): { userId: string; clientId: string } | null {
    if (!token) return null;

    try {
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      const decoded = jwt.verify(token, secret) as { userId: string; email: string };
      return {
        userId: decoded.userId,
        clientId: decoded.userId,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Add a new SSE client connection
   */
  addClient(clientId: string, userId: string, response: Response, projectIds: string[] = []): void {
    // Set SSE headers
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    const client: SSEClient = {
      id: clientId,
      userId,
      response,
      projectIds: new Set(projectIds),
      lastEventId: this.eventIdCounter,
    };

    this.clients.set(clientId, client);

    // Send initial connection event
    this.sendToClient(clientId, 'connected', {
      message: 'SSE connection established',
      timestamp: new Date().toISOString(),
    });

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(clientId);
    });

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      if (this.clients.has(clientId)) {
        try {
          this.sendToClient(clientId, 'heartbeat', { timestamp: new Date().toISOString() });
        } catch (error) {
          // Client disconnected
          clearInterval(heartbeat);
          this.removeClient(clientId);
        }
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Remove a client connection
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Send event to a specific client
   */
  sendToClient(clientId: string, event: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      this.eventIdCounter++;
      const eventData = {
        id: this.eventIdCounter,
        event,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString(),
      };

      // Format as SSE
      client.response.write(`id: ${eventData.id}\n`);
      client.response.write(`event: ${event}\n`);
      client.response.write(`data: ${eventData.data}\n\n`);
      client.lastEventId = this.eventIdCounter;
    } catch (error) {
      console.error(`[SSE] Error sending to client ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }

  /**
   * Broadcast event to all clients subscribed to a project
   */
  broadcastToProject(projectId: string, event: string, data: any): void {
    let sentCount = 0;
    this.clients.forEach((client, clientId) => {
      if (client.projectIds.has(projectId)) {
        this.sendToClient(clientId, event, data);
        sentCount++;
      }
    });
    console.log(`[SSE] Broadcasted ${event} to ${sentCount} clients for project ${projectId}`);
  }

  /**
   * Broadcast event to all clients
   */
  broadcast(event: string, data: any): void {
    let sentCount = 0;
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, event, data);
      sentCount++;
    });
    console.log(`[SSE] Broadcasted ${event} to ${sentCount} clients`);
  }

  /**
   * Subscribe client to project updates
   */
  subscribeToProject(clientId: string, projectId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.projectIds.add(projectId);
      this.sendToClient(clientId, 'subscribed', {
        projectId,
        message: `Subscribed to project ${projectId} updates`,
      });
    }
  }

  /**
   * Unsubscribe client from project updates
   */
  unsubscribeFromProject(clientId: string, projectId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.projectIds.delete(projectId);
      this.sendToClient(clientId, 'unsubscribed', {
        projectId,
        message: `Unsubscribed from project ${projectId} updates`,
      });
    }
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): SSEClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all clients for a project
   */
  getProjectClients(projectId: string): SSEClient[] {
    const projectClients: SSEClient[] = [];
    this.clients.forEach((client) => {
      if (client.projectIds.has(projectId)) {
        projectClients.push(client);
      }
    });
    return projectClients;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.clients.size;
  }
}

// Singleton instance
export const sseService = new SSEService();

// Helper function to emit workspace events
export function emitWorkspaceEvent(projectId: string, event: string, data: any): void {
  sseService.broadcastToProject(projectId, event, data);
}

// Specific workspace event emitters
export function emitTaskUpdated(projectId: string, task: any): void {
  emitWorkspaceEvent(projectId, 'task_updated', { task });
}

export function emitTaskCreated(projectId: string, task: any): void {
  emitWorkspaceEvent(projectId, 'task_created', { task });
}

export function emitTaskDeleted(projectId: string, taskId: string): void {
  emitWorkspaceEvent(projectId, 'task_deleted', { taskId });
}

export function emitMilestoneUpdated(projectId: string, milestone: any): void {
  emitWorkspaceEvent(projectId, 'milestone_updated', { milestone });
}

export function emitMilestoneCreated(projectId: string, milestone: any): void {
  emitWorkspaceEvent(projectId, 'milestone_created', { milestone });
}

export function emitSessionUpdated(projectId: string, session: any): void {
  emitWorkspaceEvent(projectId, 'session_updated', { session });
}

export function emitSessionCreated(projectId: string, session: any): void {
  emitWorkspaceEvent(projectId, 'session_created', { session });
}

export function emitMessageSent(projectId: string, message: any): void {
  emitWorkspaceEvent(projectId, 'message_sent', { message });
}

export function emitVoiceNoteCreated(projectId: string, voiceNote: any): void {
  emitWorkspaceEvent(projectId, 'voice_note_created', { voiceNote });
}

export function emitLearningContentCreated(projectId: string, content: any): void {
  emitWorkspaceEvent(projectId, 'learning_content_created', { content });
}

export function emitDeliverableUpdated(projectId: string, deliverable: any): void {
  emitWorkspaceEvent(projectId, 'deliverable_updated', { deliverable });
}

export function emitDeliverableCreated(projectId: string, deliverable: any): void {
  emitWorkspaceEvent(projectId, 'deliverable_created', { deliverable });
}

export function emitCertificateCreated(projectId: string, certificate: any): void {
  emitWorkspaceEvent(projectId, 'certificate_created', { certificate });
}

export function emitLiveSessionUpdated(projectId: string, session: any): void {
  emitWorkspaceEvent(projectId, 'live_session_updated', { session });
}

export function emitResearchSourceCreated(projectId: string, source: any): void {
  emitWorkspaceEvent(projectId, 'research_source_created', { source });
}

export function emitResearchNoteCreated(projectId: string, note: any): void {
  emitWorkspaceEvent(projectId, 'research_note_created', { note });
}

export function emitDataSetCreated(projectId: string, dataSet: any): void {
  emitWorkspaceEvent(projectId, 'data_set_created', { dataSet });
}

export function emitStakeholderCreated(projectId: string, stakeholder: any): void {
  emitWorkspaceEvent(projectId, 'stakeholder_created', { stakeholder });
}

export function emitImpactStoryCreated(projectId: string, story: any): void {
  emitWorkspaceEvent(projectId, 'impact_story_created', { story });
}

export function emitCommunityEventCreated(projectId: string, event: any): void {
  emitWorkspaceEvent(projectId, 'community_event_created', { event });
}

export function emitIdeaCreated(projectId: string, idea: any): void {
  emitWorkspaceEvent(projectId, 'idea_created', { idea });
}

export function emitIdeaUpdated(projectId: string, idea: any): void {
  emitWorkspaceEvent(projectId, 'idea_updated', { idea });
}

export function emitMemberAdded(projectId: string, member: any): void {
  emitWorkspaceEvent(projectId, 'member_added', { member });
}

