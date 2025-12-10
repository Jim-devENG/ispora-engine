import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.js';

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  projectIds: Set<string>;
}

const clients = new Map<string, ClientConnection>();

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req) => {
    let clientId: string | null = null;
    let userId: string | null = null;

    // Authenticate connection
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        const decoded = jwt.verify(token, secret) as { userId: string; email: string };
        userId = decoded.userId;
        clientId = decoded.userId;
      } catch (error) {
        ws.close(1008, 'Invalid token');
        return;
      }
    } else {
      ws.close(1008, 'No token provided');
      return;
    }

    // Create client connection
    const connection: ClientConnection = {
      ws,
      userId: userId!,
      projectIds: new Set(),
    };

    clients.set(clientId!, connection);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established',
    }));

    // Handle messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        handleMessage(clientId!, data, connection);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      if (clientId) {
        clients.delete(clientId);
        // Notify others that user went offline
        broadcast({
          type: 'user_offline',
          userId: userId!,
        }, clientId);
      }
    });

    // Notify others that user came online
    broadcast({
      type: 'user_online',
      userId: userId!,
    }, clientId!);
  });
}

function handleMessage(clientId: string, data: any, connection: ClientConnection): void {
  switch (data.type) {
    case 'subscribe':
      // Subscribe to project updates
      if (data.projectId) {
        connection.projectIds.add(data.projectId);
      }
      break;

    case 'unsubscribe':
      // Unsubscribe from project updates
      if (data.projectId) {
        connection.projectIds.delete(data.projectId);
      }
      break;

    case 'typing':
      // Broadcast typing indicator
      if (data.projectId) {
        broadcastToProject(data.projectId, {
          type: 'typing',
          userId: connection.userId,
          projectId: data.projectId,
        }, clientId);
      }
      break;

    default:
      console.log('Unknown message type:', data.type);
  }
}

// Broadcast to all clients
function broadcast(message: any, excludeClientId?: string): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((connection, clientId) => {
    if (clientId !== excludeClientId && connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(messageStr);
    }
  });
}

// Broadcast to clients subscribed to a project
function broadcastToProject(projectId: string, message: any, excludeClientId?: string): void {
  const messageStr = JSON.stringify(message);
  clients.forEach((connection, clientId) => {
    if (
      clientId !== excludeClientId &&
      connection.projectIds.has(projectId) &&
      connection.ws.readyState === WebSocket.OPEN
    ) {
      connection.ws.send(messageStr);
    }
  });
}

// Helper functions to emit events from other parts of the application
export function emitFeedItemAdded(item: any): void {
  broadcast({
    type: 'feed_item_added',
    item,
  });
}

export function emitFeedItemUpdated(item: any): void {
  broadcast({
    type: 'feed_item_updated',
    item,
  });
}

export function emitProjectMemberJoined(projectId: string, member: any): void {
  broadcastToProject(projectId, {
    type: 'member_joined',
    projectId,
    member,
  });
}

export function emitTaskUpdated(projectId: string, task: any): void {
  broadcastToProject(projectId, {
    type: 'task_updated',
    projectId,
    task,
  });
}

export function emitMilestoneUpdated(projectId: string, milestone: any): void {
  broadcastToProject(projectId, {
    type: 'milestone_updated',
    projectId,
    milestone,
  });
}

export function emitMessageSent(projectId: string, message: any): void {
  broadcastToProject(projectId, {
    type: 'message_sent',
    projectId,
    message,
  });
}

export function emitSessionStarted(session: any): void {
  broadcast({
    type: 'session_started',
    session,
  });
}

export function emitSessionEnded(session: any): void {
  broadcast({
    type: 'session_ended',
    session,
  });
}

