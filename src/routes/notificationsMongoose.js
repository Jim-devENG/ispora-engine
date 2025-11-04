/**
 * Notifications Routes (Mongoose)
 * Phase 2: Notifications endpoints + SSE streaming
 */

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationsMongoose');
const {
  getPreferences,
  updatePreferences,
  muteNotifications
} = require('../controllers/notificationPreferencesMongoose');
const { verifyToken } = require('../middleware/authMongoose');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// All notification routes require authentication
router.use(verifyToken);

/**
 * GET /api/v1/notifications
 * Get all notifications for authenticated user
 * Query params: page, limit, read, type
 */
router.get('/', getNotifications);

/**
 * GET /api/v1/notifications/stream
 * SSE stream for real-time notifications
 */
router.get('/stream', async (req, res) => {
  // 🛡️ DevOps Guardian: Strictly validate origin
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ispora.app', 'https://www.ispora.app', 'http://localhost:5173'];
  
  if (!origin || !allowedOrigins.includes(origin)) {
    console.error(`[SSE Notifications] ❌ CORS blocked: ${origin || 'no-origin'}`);
    res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed for SSE stream',
      allowedOrigins
    });
    return;
  }
  
  console.log(`[SSE Notifications] ✅ Connection established from: ${origin}`);
  
  // Set SSE headers with proper CORS
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'X-Accel-Buffering': 'no' // Disable nginx buffering for SSE
  });
  
  // Flush headers immediately
  res.flushHeaders();
  console.log('[SSE Notifications] Headers flushed, connection ready');
  
  const userId = req.user._id;
  let heartbeat = null;
  let notificationWatch = null;
  
  // Phase 2.1: Load user preferences for filtering
  const notificationPreferenceService = require('../services/notificationPreferenceService');
  let userPreferences = null;
  try {
    userPreferences = await notificationPreferenceService.getPreferences(userId);
  } catch (error) {
    logger.warn({ error: error.message, userId: userId.toString() }, 'Failed to load preferences, defaulting to allow all');
    // Continue with default (allow all) if preferences can't be loaded
  }
  
  // Send initial connection message
  try {
    const connectedMessage = JSON.stringify({
      type: 'connected',
      message: 'Connected to notifications stream',
      userId: userId.toString(),
      timestamp: new Date().toISOString()
    });
    res.write(`data: ${connectedMessage}\n\n`);
    res.flush && res.flush();
    console.log('[SSE Notifications] Connection message sent');
  } catch (error) {
    console.error('[SSE Notifications] ❌ Error sending connection message:', error.message);
    if (heartbeat) clearInterval(heartbeat);
    if (notificationWatch) notificationWatch.close();
    return;
  }
  
  // Watch for new notifications using MongoDB change streams
  try {
    const notificationCollection = Notification.collection;
    const changeStream = notificationCollection.watch([
      { $match: { 'fullDocument.userId': userId } }
    ], {
      fullDocument: 'updateLookup'
    });
    
    changeStream.on('change', async (change) => {
      try {
        if (change.operationType === 'insert' || change.operationType === 'update') {
          const notification = change.fullDocument;
          
          // Verify this notification belongs to the user
          if (notification.userId.toString() === userId.toString()) {
            // Phase 2.1: Check if user preferences allow realtime delivery for this notification
            let shouldDeliver = true;
            
            if (userPreferences) {
              try {
                shouldDeliver = await notificationPreferenceService.checkIfDeliveryAllowed(
                  userId,
                  notification.type,
                  'realtime'
                );
              } catch (prefError) {
                logger.warn({ error: prefError.message, notificationType: notification.type }, 'Failed to check preferences, defaulting to allow');
                // Fail open - deliver if preference check fails
                shouldDeliver = true;
              }
            }

            // Only send via SSE if preferences allow
            if (shouldDeliver) {
              const notificationMessage = JSON.stringify({
                type: 'notification',
                event: change.operationType === 'insert' ? 'new' : 'updated',
                data: {
                  id: notification._id.toString(),
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  read: notification.read,
                  relatedId: notification.relatedId?.toString(),
                  relatedType: notification.relatedType,
                  metadata: notification.metadata || {},
                  createdAt: notification.createdAt
                },
                timestamp: new Date().toISOString()
              });
              
              res.write(`data: ${notificationMessage}\n\n`);
              res.flush && res.flush();
              console.log('[SSE Notifications] Notification sent to stream (preference allowed)');
            } else {
              console.log('[SSE Notifications] Notification filtered by preferences (realtime disabled)');
              logger.debug({ 
                notificationId: notification._id.toString(),
                notificationType: notification.type,
                userId: userId.toString()
              }, 'Notification filtered by user preferences');
            }
          }
        }
      } catch (error) {
        logger.error({ error: error.message }, 'Error processing notification change stream');
      }
    });
    
    changeStream.on('error', (error) => {
      console.error('[SSE Notifications] ❌ Change stream error:', error.message);
      logger.error({ error: error.message }, 'Notification change stream error');
    });
    
    notificationWatch = changeStream;
  } catch (error) {
    console.error('[SSE Notifications] ❌ Failed to create change stream:', error.message);
    logger.error({ error: error.message }, 'Failed to create notification change stream');
    // Fall back to polling if change streams are not available
  }
  
  // Send heartbeat every 20 seconds to keep connection alive
  heartbeat = setInterval(() => {
    const pingMessage = JSON.stringify({
      type: 'ping',
      timestamp: new Date().toISOString()
    });
    
    try {
      res.write(`data: ${pingMessage}\n\n`);
      if (typeof res.flush === 'function') {
        res.flush();
      }
      console.log('[SSE Notifications] Ping sent');
    } catch (error) {
      console.error('[SSE Notifications] ❌ Error sending ping:', error.message);
      clearInterval(heartbeat);
      if (notificationWatch) notificationWatch.close();
      logger.error({ error: error.message }, 'SSE notifications heartbeat failed');
    }
  }, 20000); // 20 seconds
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('[SSE Notifications] Client disconnected');
    clearInterval(heartbeat);
    if (notificationWatch) {
      notificationWatch.close();
    }
    logger.info({ userId: userId.toString() }, 'SSE notifications client disconnected');
  });
  
  req.on('error', (error) => {
    console.error('[SSE Notifications] ❌ Connection error:', error.message);
    clearInterval(heartbeat);
    if (notificationWatch) {
      notificationWatch.close();
    }
    logger.error({ error: error.message }, 'SSE notifications connection error');
  });
  
  res.on('error', (error) => {
    console.error('[SSE Notifications] ❌ Response error:', error.message);
    clearInterval(heartbeat);
    if (notificationWatch) {
      notificationWatch.close();
    }
    logger.error({ error: error.message }, 'SSE notifications response error');
  });
});

/**
 * GET /api/v1/notifications/:id
 * Get single notification by ID
 */
router.get('/:id', getNotification);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', markAsRead);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', markAllAsRead);

/**
 * DELETE /api/v1/notifications/:id
 * Delete notification
 */
router.delete('/:id', deleteNotification);

/**
 * Phase 2.1: Notification Preferences
 */

/**
 * GET /api/v1/notifications/preferences
 * Get user's notification preferences
 */
router.get('/preferences', getPreferences);

/**
 * PUT /api/v1/notifications/preferences
 * Update user's notification preferences
 */
router.put('/preferences', updatePreferences);

/**
 * POST /api/v1/notifications/mute
 * Mute notifications until a specific date
 */
router.post('/mute', muteNotifications);

module.exports = router;

