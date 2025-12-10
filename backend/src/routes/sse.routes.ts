import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sseService } from '../sse/sse.js';

const router = express.Router();

/**
 * SSE endpoint for workspace updates
 * GET /api/sse/workspace/:projectId
 * 
 * Query params:
 * - token: JWT token for authentication (if not using Bearer header)
 * 
 * Events emitted:
 * - connected: Initial connection established
 * - heartbeat: Keep-alive ping (every 30s)
 * - task_created, task_updated, task_deleted
 * - milestone_created, milestone_updated
 * - session_created, session_updated
 * - message_sent
 * - voice_note_created
 * - learning_content_created
 * - deliverable_created, deliverable_updated
 * - certificate_created
 * - live_session_updated
 * - research_source_created
 * - research_note_created
 * - data_set_created
 * - stakeholder_created
 * - impact_story_created
 * - community_event_created
 * - idea_created, idea_updated
 * - member_added
 */
router.get('/workspace/:projectId', (req: AuthRequest, res: express.Response) => {
  // Get token from query param or Authorization header
  const token = (req.query.token as string) || 
                req.headers.authorization?.replace('Bearer ', '') || 
                null;

  // Authenticate
  const auth = sseService.authenticateConnection(token);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized - Invalid or missing token' });
    return;
  }

  const { userId, clientId } = auth;
  const projectId = req.params.projectId;

  // Add client connection
  sseService.addClient(clientId, userId, res, [projectId]);

  console.log(`[SSE] Client ${clientId} connected to workspace ${projectId}`);
});

/**
 * SSE endpoint for general workspace updates (all projects)
 * GET /api/sse/workspace
 */
router.get('/workspace', (req: AuthRequest, res: express.Response) => {
  const token = (req.query.token as string) || 
                req.headers.authorization?.replace('Bearer ', '') || 
                null;

  const auth = sseService.authenticateConnection(token);
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized - Invalid or missing token' });
    return;
  }

  const { userId, clientId } = auth;

  // Add client without specific project subscription
  sseService.addClient(clientId, userId, res, []);

  console.log(`[SSE] Client ${clientId} connected to general workspace updates`);
});

/**
 * Subscribe to additional project
 * POST /api/sse/workspace/:projectId/subscribe
 */
router.post('/workspace/:projectId/subscribe', authenticate, (req: AuthRequest, res) => {
  try {
    const projectId = req.params.projectId;
    const clientId = req.user!.id;

    sseService.subscribeToProject(clientId, projectId);
    res.json({ message: `Subscribed to project ${projectId}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Unsubscribe from project
 * POST /api/sse/workspace/:projectId/unsubscribe
 */
router.post('/workspace/:projectId/unsubscribe', authenticate, (req: AuthRequest, res) => {
  try {
    const projectId = req.params.projectId;
    const clientId = req.user!.id;

    sseService.unsubscribeFromProject(clientId, projectId);
    res.json({ message: `Unsubscribed from project ${projectId}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get SSE connection status
 * GET /api/sse/status
 */
router.get('/status', authenticate, (req: AuthRequest, res) => {
  try {
    const clientId = req.user!.id;
    const client = sseService.getClient(clientId);

    res.json({
      connected: !!client,
      projectIds: client ? Array.from(client.projectIds) : [],
      totalConnections: sseService.getConnectionCount(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

