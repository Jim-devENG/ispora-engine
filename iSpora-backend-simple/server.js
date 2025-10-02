const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Initialize SQLite database
const db = new sqlite3.Database('./ispora.db', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Database connection established successfully');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            creator_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )`);

        // Sessions table
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            scheduled_at DATETIME NOT NULL,
            duration INTEGER DEFAULT 60,
            status TEXT DEFAULT 'upcoming',
            type TEXT DEFAULT 'video',
            meeting_link TEXT,
            location TEXT,
            is_public BOOLEAN DEFAULT 0,
            max_participants INTEGER,
            tags TEXT,
            agenda TEXT,
            notes TEXT,
            creator_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )`);

        // Tasks table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            assignee_id TEXT,
            due_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (assignee_id) REFERENCES users (id)
        )`);

        // Notifications table
        db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        console.log('✅ Database tables initialized');
    });
}

// CORS configuration - MUST be first
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        'https://ispora.app',
        'https://www.ispora.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Dev-Key']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
    res.json({
        success: true,
        message: 'CORS test successful!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No Origin Header',
        headers: req.headers
    });
});

// Feed endpoint
app.get('/api/feed', (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    
    db.all(`
        SELECT 'project' as type, id, title, description, created_at 
        FROM projects 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `, [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: rows.length
            }
        });
    });
});

// Projects endpoints
app.get('/api/projects', (req, res) => {
    const { mine } = req.query;
    
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.json({ success: true, data: rows });
    });
});

app.post('/api/projects', (req, res) => {
    const { title, description, status = 'active', creatorId } = req.body;
    const projectId = `proj_${Date.now()}`;
    
    db.run(`
        INSERT INTO projects (id, title, description, status, creator_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [projectId, title, description, status, creatorId, new Date().toISOString()], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.status(201).json({ success: true, data: { id: projectId } });
    });
});

// Sessions endpoints
app.get('/api/sessions', (req, res) => {
    const { projectId, status } = req.query;
    
    let query = 'SELECT * FROM sessions';
    let params = [];
    
    if (projectId) {
        query += ' WHERE project_id = ?';
        params.push(projectId);
    }
    
    if (status && status !== 'all') {
        if (projectId) {
            query += ' AND status = ?';
        } else {
            query += ' WHERE status = ?';
        }
        params.push(status);
    }
    
    query += ' ORDER BY scheduled_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.json({ success: true, data: rows });
    });
});

app.post('/api/sessions', (req, res) => {
    const {
        projectId, title, description, scheduledDate, scheduledTime, duration = 60,
        type = 'video', location, isPublic = false, maxParticipants, tags, agenda, meetingLink, creatorId
    } = req.body;
    
    const sessionId = `sess_${Date.now()}`;
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime || '00:00'}`);
    
    db.run(`
        INSERT INTO sessions (
            id, project_id, title, description, scheduled_at, duration,
            status, type, meeting_link, location, is_public, max_participants,
            tags, agenda, notes, creator_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        sessionId, projectId, title, description, scheduledAt.toISOString(), duration,
        'upcoming', type, meetingLink, location, isPublic ? 1 : 0, maxParticipants,
        tags || '', agenda || '', null, creatorId, new Date().toISOString()
    ], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.status(201).json({ success: true, data: { id: sessionId } });
    });
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
    const { projectId } = req.query;
    
    let query = 'SELECT * FROM tasks';
    let params = [];
    
    if (projectId) {
        query += ' WHERE project_id = ?';
        params.push(projectId);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.json({ success: true, data: rows });
    });
});

app.post('/api/tasks', (req, res) => {
    const {
        projectId, title, description, status = 'pending', priority = 'medium',
        assigneeId, dueDate, creatorId
    } = req.body;
    
    const taskId = `task_${Date.now()}`;
    
    db.run(`
        INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        taskId, projectId, title, description, status, priority,
        assigneeId, dueDate, new Date().toISOString()
    ], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.status(201).json({ success: true, data: { id: taskId } });
    });
});

// Notifications endpoint
app.get('/api/notifications', (req, res) => {
    const { filter = 'all' } = req.query;
    
    // For now, return mock notifications
    const notifications = [
        {
            id: 'notif_1',
            user_id: 'user_1',
            title: 'Welcome to iSpora!',
            message: 'Your account has been created successfully.',
            type: 'info',
            is_read: false,
            created_at: new Date().toISOString()
        },
        {
            id: 'notif_2',
            user_id: 'user_1',
            title: 'New Project Created',
            message: 'You have created a new project: "My First Project"',
            type: 'success',
            is_read: false,
            created_at: new Date().toISOString()
        }
    ];
    
    res.json({ success: true, data: notifications });
});

// Development endpoints
app.get('/api/dev/verify', (req, res) => {
    const devKey = req.headers['x-dev-key'];
    
    if (devKey === 'CHANGE_ME_STRONG_KEY') {
        res.json({ success: true, message: 'Dev access granted' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid dev key' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 iSpora Simple Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: development`);
    console.log(`🔗 Frontend URL: http://localhost:5173`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
