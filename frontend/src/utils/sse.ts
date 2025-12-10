import { getAuthToken } from './api.js';

export interface SSEEvent {
  id: number;
  event: string;
  data: any;
  timestamp: string;
}

export type SSEEventHandler = (event: SSEEvent) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers = new Map<string, SSEEventHandler[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;
  private projectId?: string;

  constructor(projectId?: string) {
    this.projectId = projectId;
    const token = getAuthToken();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    if (projectId) {
      this.url = `${baseUrl}/api/sse/workspace/${projectId}?token=${token}`;
    } else {
      this.url = `${baseUrl}/api/sse/workspace?token=${token}`;
    }
  }

  /**
   * Connect to SSE endpoint
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.url);

        this.eventSource.onopen = () => {
          console.log('[SSE] Connected to workspace updates');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              this.disconnect();
              this.connect().catch(console.error);
            }, delay);
          } else {
            console.error('[SSE] Max reconnection attempts reached');
            reject(new Error('Failed to connect to SSE after multiple attempts'));
          }
        };

        // Handle all event types
        this.eventSource.addEventListener('connected', (e: MessageEvent) => {
          const data = JSON.parse(e.data);
          this.handleEvent('connected', data);
        });

        this.eventSource.addEventListener('heartbeat', (e: MessageEvent) => {
          // Silent heartbeat, no need to log
        });

        // Workspace events
        const eventTypes = [
          'task_created', 'task_updated', 'task_deleted',
          'milestone_created', 'milestone_updated',
          'session_created', 'session_updated',
          'message_sent',
          'voice_note_created',
          'learning_content_created',
          'deliverable_created', 'deliverable_updated',
          'certificate_created',
          'live_session_updated',
          'research_source_created',
          'research_note_created',
          'data_set_created',
          'stakeholder_created',
          'impact_story_created',
          'community_event_created',
          'idea_created', 'idea_updated',
          'member_added',
          'subscribed', 'unsubscribed',
        ];

        eventTypes.forEach(eventType => {
          this.eventSource!.addEventListener(eventType, (e: MessageEvent) => {
            const data = JSON.parse(e.data);
            this.handleEvent(eventType, data);
          });
        });

        // Generic message handler for any other events
        this.eventSource.onmessage = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            this.handleEvent('message', data);
          } catch (error) {
            console.error('[SSE] Error parsing message:', error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[SSE] Disconnected from workspace updates');
    }
  }

  /**
   * Subscribe to a specific event type
   */
  on(event: string, handler: SSEEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  /**
   * Unsubscribe from a specific event type
   */
  off(event: string, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming event
   */
  private handleEvent(event: string, data: any): void {
    const eventData: SSEEvent = {
      id: Date.now(),
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    // Call all handlers for this event type
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          console.error(`[SSE] Error in handler for ${event}:`, error);
        }
      });
    }

    // Also call 'all' handlers
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          console.error('[SSE] Error in * handler:', error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Singleton instances per project
const clients = new Map<string, SSEClient>();

/**
 * Get or create SSE client for a project
 */
export function getSSEClient(projectId?: string): SSEClient {
  const key = projectId || 'general';
  
  if (!clients.has(key)) {
    clients.set(key, new SSEClient(projectId));
  }
  
  return clients.get(key)!;
}

/**
 * Connect to workspace SSE for a project
 */
export async function connectWorkspaceSSE(projectId: string): Promise<SSEClient> {
  const client = getSSEClient(projectId);
  
  if (!client.isConnected()) {
    await client.connect();
  }
  
  return client;
}

/**
 * Disconnect from workspace SSE
 */
export function disconnectWorkspaceSSE(projectId?: string): void {
  const key = projectId || 'general';
  const client = clients.get(key);
  
  if (client) {
    client.disconnect();
    clients.delete(key);
  }
}

/**
 * Subscribe to workspace events
 */
export function subscribeToWorkspaceEvents(
  projectId: string,
  handlers: { [event: string]: SSEEventHandler }
): Promise<SSEClient> {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await connectWorkspaceSSE(projectId);
      
      // Register all handlers
      Object.entries(handlers).forEach(([event, handler]) => {
        client.on(event, handler);
      });
      
      resolve(client);
    } catch (error) {
      reject(error);
    }
  });
}

