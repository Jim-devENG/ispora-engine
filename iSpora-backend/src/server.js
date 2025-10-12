const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Initialize monitoring and logging
const { initSentry } = require('./config/sentry');
const { createRequestLogger, logger, logError } = require('./config/logger');
const { closeConnections } = require('./config/redis');

// Initialize Sentry
initSentry();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const mentorshipRoutes = require('./routes/mentorship');
const communicationRoutes = require('./routes/communication');
const opportunityRoutes = require('./routes/opportunities');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/uploads');
const connectionRoutes = require('./routes/connections');
const sessionRoutes = require('./routes/sessions');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const billingRoutes = require('./routes/billing');
const securityRoutes = require('./routes/security');
const helpSupportRoutes = require('./routes/help-support');
const impactRoutes = require('./routes/impact');
const impactMeasurementsRoutes = require('./routes/impact-measurements');
const impactVerificationRoutes = require('./routes/impact-verification');
const projectWorkspaceRoutes = require('./routes/project-workspace');
const projectSessionsRoutes = require('./routes/project-sessions');
const projectTasksRoutes = require('./routes/project-tasks');
const projectMessagesRoutes = require('./routes/project-messages');
const projectLearningRoutes = require('./routes/project-learning');
const projectDeliverablesRoutes = require('./routes/project-deliverables');
const projectCertificatesRoutes = require('./routes/project-certificates');
const opportunityApplicationsRoutes = require('./routes/opportunity-applications');
const opportunitySavesRoutes = require('./routes/opportunity-saves');
const opportunityBoostsRoutes = require('./routes/opportunity-boosts');
const opportunityCommentsRoutes = require('./routes/opportunity-comments');
const opportunityAnalyticsRoutes = require('./routes/opportunity-analytics');
const networkDiscoveryRoutes = require('./routes/network-discovery');
const networkConnectionsRoutes = require('./routes/network-connections');
const networkProfileRoutes = require('./routes/network-profile');
const creditsRoutes = require('./routes/credits');
const badgesRoutes = require('./routes/badges');
const referralsRoutes = require('./routes/referrals');
const creditsSocialRoutes = require('./routes/credits-social');
const notificationCategoriesRoutes = require('./routes/notification-categories');
const notificationTemplatesRoutes = require('./routes/notification-templates');
const notificationAnalyticsRoutes = require('./routes/notification-analytics');
const notificationBatchesRoutes = require('./routes/notification-batches');
const feedRoutes = require('./routes/feed');
const devRoutes = require('./routes/dev');
const adminRoutes = require('./routes/admin');
const sessionsRoutes = require('./routes/sessions');
const tasksRoutes = require('./routes/tasks');
const deliverablesRoutes = require('./routes/deliverables');
const learningRoutes = require('./routes/learning');
const liveRoutes = require('./routes/live');
const researchRoutes = require('./routes/research');
const corsTestRoutes = require('./routes/cors-test');
// Mock routes removed - using real data only

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const comingSoon = require('./middleware/comingSoon');

// Import services
const socketService = require('./services/socketService');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://ispora.app',
      'https://www.ispora.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for development
  skip: (req) => {
    // Skip rate limiting in development or for localhost
    return process.env.NODE_ENV === 'development' || req.ip === '127.0.0.1' || req.ip === '::1';
  },
});

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
);

// CORS configuration - must be first
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://ispora.app',
      'https://www.ispora.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Dev-Key'],
  }),
);

// Handle preflight requests explicitly
app.options('*', cors());

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(createRequestLogger()); // Add structured logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
// Mock routes removed - using real data only
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/opportunities', opportunityRoutes);
// Real routes follow (will be shadowed by mocks on overlapping paths)
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/help-support', helpSupportRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/impact/measurements', impactMeasurementsRoutes);
app.use('/api/impact/verification', impactVerificationRoutes);
app.use('/api/project-workspace', projectWorkspaceRoutes);
app.use('/api/project-sessions', projectSessionsRoutes);
app.use('/api/project-tasks', projectTasksRoutes);
app.use('/api/project-messages', projectMessagesRoutes);
app.use('/api/project-learning', projectLearningRoutes);
app.use('/api/project-deliverables', projectDeliverablesRoutes);
app.use('/api/project-certificates', projectCertificatesRoutes);
app.use('/api/opportunity-applications', opportunityApplicationsRoutes);
app.use('/api/opportunity-saves', opportunitySavesRoutes);
app.use('/api/opportunity-boosts', opportunityBoostsRoutes);
app.use('/api/opportunity-comments', opportunityCommentsRoutes);
app.use('/api/opportunity-analytics', opportunityAnalyticsRoutes);
app.use('/api/network/discovery', networkDiscoveryRoutes);
app.use('/api/network/connections', networkConnectionsRoutes);
app.use('/api/network/profile', networkProfileRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/credits/social', creditsSocialRoutes);
app.use('/api/notification-categories', notificationCategoriesRoutes);
app.use('/api/notification-templates', notificationTemplatesRoutes);
app.use('/api/notification-analytics', notificationAnalyticsRoutes);
app.use('/api/notification-batches', notificationBatchesRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/deliverables', deliverablesRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/cors-test', corsTestRoutes);
// Mock routes removed - using real data only

// Coming Soon gate (place after auth route so login/register still works,
// and after protect can set req.user on routes that use it). We mount it late
// so earlier middleware like CORS and JSON parsing have already run.
app.use(comingSoon());

// Socket.IO setup
socketService.initialize(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 iSpora Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await closeConnections();
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await closeConnections();
  httpServer.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
