# Impact Engine Backend API

Backend API server for the Impact Engine application, built with Express.js and TypeScript.

## Features

- ✅ RESTful API endpoints for all frontend requirements
- ✅ JWT-based authentication
- ✅ File upload support (images, documents, videos, audio)
- ✅ WebSocket support for real-time features
- ✅ JSON file-based database (easily replaceable with real database)
- ✅ TypeScript for type safety

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Frontend URL (default: http://localhost:5173)

4. Run in development mode:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/validate` - Validate session

### User & Profile
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/:userId` - Get user by ID

### Feed
- `GET /api/feed` - Get feed items
- `POST /api/feed/actions` - Record user action
- `POST /api/feed/admin/highlights` - Create admin highlight
- `GET /api/feed/stats` - Get feed statistics

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:projectId` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:projectId` - Update project
- `POST /api/projects/:projectId/join` - Join project
- `GET /api/projects/:projectId/workspace` - Get workspace data

### Opportunities
- `GET /api/opportunities` - List opportunities
- `GET /api/opportunities/:opportunityId` - Get opportunity details
- `POST /api/opportunities` - Create opportunity
- `POST /api/opportunities/:opportunityId/apply` - Apply to opportunity
- `POST /api/opportunities/:opportunityId/save` - Save/bookmark opportunity

### Network
- `GET /api/network/users` - Get network users
- `POST /api/network/connect` - Send connection request
- `GET /api/network/requests` - Get connection requests
- `POST /api/network/requests/:requestId/accept` - Accept connection request
- `POST /api/network/requests/:requestId/decline` - Decline connection request

### Campaigns
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:campaignId` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/:campaignId/join` - Join campaign

### Workspace
- `GET /api/workspace/:projectId/members` - Get project members
- `POST /api/workspace/:projectId/members` - Add member to project
- `POST /api/workspace/:projectId/messages` - Send message
- `GET /api/workspace/:projectId/messages` - Get messages
- `GET /api/workspace/:projectId/tasks` - Get tasks
- `POST /api/workspace/:projectId/tasks` - Create task
- `PUT /api/workspace/:projectId/tasks/:taskId` - Update task
- `GET /api/workspace/:projectId/milestones` - Get milestones
- `POST /api/workspace/:projectId/milestones` - Create milestone
- `GET /api/workspace/:projectId/sessions` - Get sessions
- `POST /api/workspace/:projectId/sessions` - Create session

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/upload/:fileId` - Get file info

## WebSocket

Connect to `ws://localhost:3001/ws?token=<JWT_TOKEN>`

### Events

**Client → Server:**
- `subscribe` - Subscribe to project updates
- `unsubscribe` - Unsubscribe from project updates
- `typing` - Send typing indicator

**Server → Client:**
- `connected` - Connection established
- `feed_item_added` - New feed item
- `feed_item_updated` - Feed item updated
- `user_online` - User came online
- `user_offline` - User went offline
- `member_joined` - New project member
- `task_updated` - Task updated
- `milestone_updated` - Milestone updated
- `message_sent` - New message
- `session_started` - Session started
- `session_ended` - Session ended
- `typing` - User is typing

## Database

Currently uses a JSON file-based database stored in `data/database.json`. This can be easily replaced with a real database (PostgreSQL, MongoDB, etc.) by updating the `DatabaseService` class.

## File Structure

```
backend/
├── src/
│   ├── database/       # Database service
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── websocket/      # WebSocket handlers
│   └── server.ts       # Main server file
├── data/               # Database JSON file
├── uploads/            # Uploaded files
├── package.json
└── tsconfig.json
```

## Environment Variables

See `.env.example` for all available environment variables.

## Notes

- All timestamps are in ISO 8601 format
- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- File uploads are limited to 10MB by default (configurable)
- CORS is enabled for the frontend origin

