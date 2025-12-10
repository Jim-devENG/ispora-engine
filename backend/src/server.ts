import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import feedRoutes from './routes/feed.routes.js';
import projectRoutes from './routes/project.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import networkRoutes from './routes/network.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import sseRoutes from './routes/sse.routes.js';

// WebSocket handler
import { setupWebSocket } from './websocket/websocket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = parseInt(process.env.WS_PORT || '3002');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow any localhost port for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for debugging
app.use((req, res, next) => {
  if (req.path.startsWith('/api/workspace')) {
    console.log(`[${req.method}] ${req.path}`, req.params, req.query);
  }
  next();
});

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/campaigns', campaignRoutes);
// Register workspace routes with error handling
try {
  app.use('/api/workspace', workspaceRoutes);
  console.log('✅ Workspace routes registered at /api/workspace');
  console.log('✅ Workspace routes object type:', typeof workspaceRoutes);
} catch (error) {
  console.error('❌ Error registering workspace routes:', error);
}
app.use('/api/upload', uploadRoutes);
app.use('/api/sse', sseRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server: server, path: '/ws' });
setupWebSocket(wss);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`📡 SSE endpoints available at /api/sse/workspace/:projectId`);
  console.log(`📁 Upload directory: ${path.join(process.cwd(), uploadDir)}`);
});

export default app;

