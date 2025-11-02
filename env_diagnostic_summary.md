# iSpora Environment Diagnostic Summary

**Date:** 2025-01-31  
**Snapshot Type:** Pre-Rebuild Architecture Freeze  
**Status:** Complete Diagnostic Capture

---

## Executive Summary

This document captures the complete state of the iSpora application before backend rebuild. The system consists of:

- **Frontend:** React 18 + TypeScript deployed at `https://ispora.app`
- **Backend:** Express.js API deployed at `https://ispora-backend.onrender.com`
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Architecture:** Monorepo with separate frontend/backend repos

**Key Finding:** Frontend expects **60+ API endpoints**, but backend currently implements **only 25 endpoints**. Many features are frontend-only with placeholder UI.

---

## 1. System Architecture

### 1.1 Repository Structure

```
iSpora/
├── iSpora-frontend/          # React frontend application
│   ├── components/           # 129 React components
│   ├── src/                  # Services, hooks, utilities
│   ├── public/               # Static assets
│   └── package.json          # Frontend dependencies
│
├── src/                      # Backend Express.js API
│   ├── routes/               # API route handlers
│   ├── controllers/          # Business logic
│   ├── middleware/            # Auth, error handling
│   ├── database/             # Migrations, seeds
│   └── server.js             # Entry point
│
└── package.json              # Backend dependencies
```

### 1.2 Technology Stack

**Frontend:**
- React 18.2+
- TypeScript 5.x
- Vite (build tool)
- Tailwind CSS
- Radix UI (component library)
- Lucide React (icons)
- React Router DOM (routing)
- Axios + native `fetch` (API calls)
- Sonner (toast notifications)

**Backend:**
- Node.js 22.16.0
- Express.js 4.18.2
- Knex.js (query builder)
- SQLite3 (dev) / PostgreSQL (production)
- JWT (authentication)
- Bcrypt (password hashing)
- CORS middleware
- Helmet (security headers)
- Morgan (HTTP logging - dev only)
- Pino (structured logging)

### 1.3 Deployment

**Frontend:**
- Platform: Namecheap hosting
- Deployment: GitHub Actions (`.github/workflows/deploy.yml`)
- URL: `https://ispora.app`
- Build command: `npm run build`
- FTP deployment via GitHub Actions

**Backend:**
- Platform: Render.com
- Deployment: Automatic from Git push to `main` branch
- URL: `https://ispora-backend.onrender.com`
- Build command: `npm run migrate && npm run test:pre-deploy`
- Environment: Node.js 22.16.0

---

## 2. API Endpoints Inventory

### 2.1 Implemented Endpoints (Working)

#### Authentication (`/api/auth`)
- ✅ `POST /api/auth/register` - User registration
- ✅ `POST /api/auth/login` - User login
- ✅ `GET /api/auth/me` - Get current user (protected)
- ✅ `POST /api/auth/logout` - Logout (protected)
- ✅ `POST /api/auth/refresh` - Refresh token (protected)

#### Projects (`/api/projects`)
- ✅ `POST /api/projects` - Create project (protected)
- ✅ `GET /api/projects` - List all projects (public)
- ✅ `GET /api/projects/:id` - Get project by ID (public)
- ❌ `GET /api/projects/updates` - **NOT IMPLEMENTED** (expected by frontend)

#### Feed (`/api/feed`)
- ✅ `GET /api/feed` - Get feed entries (public)
- ✅ `GET /api/feed/stream` - SSE stream for real-time updates
- ✅ `POST /api/feed/activity` - Track user activity (optional auth)
- ✅ `GET /api/feed/sessions` - Get live sessions (alias for `/api/sessions`)

#### Tasks (`/api/tasks`)
- ✅ `GET /api/tasks` - List tasks (mock data)
- ✅ `GET /api/tasks/:id` - Get task by ID (mock data)
- ✅ `POST /api/tasks` - Create task (protected, mock data)
- ✅ `PUT /api/tasks/:id` - Update task (protected, mock data)
- ✅ `DELETE /api/tasks/:id` - Delete task (protected, mock data)

#### System
- ✅ `GET /api/health` - Health check
- ✅ `GET /healthz` - Render.com health check
- ✅ `GET /api/ping` - Ping endpoint (prevents cold starts)
- ✅ `GET /api/placeholder/:w/:h` - Placeholder image redirect
- ✅ `POST /api/logs` - Client-side error logging
- ✅ `GET /api/sessions` - Sessions endpoint (stub - returns empty array)

**Total Implemented: 25 endpoints**

### 2.2 Missing Endpoints (Expected by Frontend)

#### Opportunities (`/api/opportunities`)
- ❌ `GET /api/opportunities` - List opportunities
  - **Used in:** `iSpora-frontend/components/OpportunitiesPage.tsx`
  - **Expected query params:** `type`, `q`, `location`, `remote`, `experience`

#### Credits System (`/api/credits`)
- ❌ `GET /api/credits/overview` - User credits overview
- ❌ `GET /api/credits/badges` - User badges
- ❌ `GET /api/credits/leaderboard` - Leaderboard
- ❌ `GET /api/credits/activities` - Credit activities
  - **Used in:** `iSpora-frontend/components/CreditsPage.tsx`

#### Notifications (`/api/notifications`)
- ❌ `GET /api/notifications` - List notifications
- ❌ `POST /api/notifications/:id/read` - Mark notification as read
- ❌ `POST /api/notifications/mark-all-read` - Mark all as read
- ❌ `DELETE /api/notifications/:id` - Delete notification
  - **Used in:** `iSpora-frontend/components/NotificationsPage.tsx`

#### Network (`/api/network`)
- ❌ `GET /api/network/discovery` - Discover connections
- ❌ `GET /api/network/connections` - Get connections
- ❌ `GET /api/network/connections/requests` - Get connection requests
- ❌ `POST /api/network/connections/requests/:id/accept` - Accept request
- ❌ `POST /api/network/connections/requests/:id/decline` - Decline request
  - **Used in:** `iSpora-frontend/components/MyNetwork.tsx`

#### Admin (`/api/admin`)
- ❌ `GET /api/users` - List users (admin)
- ❌ `GET /api/admin/stats` - Admin statistics
- ❌ `GET /api/admin/reports` - Admin reports
- ❌ `POST /api/admin/users/:id/:action` - User actions (ban, suspend)
- ❌ `POST /api/admin/users/bulk/:action` - Bulk user actions
- ❌ `POST /api/admin/reports/:id/:action` - Report actions
  - **Used in:** `iSpora-frontend/components/AdminDashboard.tsx`

#### Research Tools (`/api/research`)
- ❌ `GET /api/research/sources` - List research sources
- ❌ `POST /api/research/sources` - Create research source
- ❌ `GET /api/research/notes` - List research notes
- ❌ `POST /api/research/notes` - Create research note
- ❌ `GET /api/research/datasets` - List datasets
  - **Used in:** `iSpora-frontend/components/workspace/ResearchTools.tsx`

#### Live Events (`/api/live`)
- ❌ `GET /api/live/events` - List live events
- ❌ `POST /api/live/events` - Create live event
- ❌ `GET /api/live/events/:id/chat` - Get event chat
- ❌ `POST /api/live/events/:id/chat` - Send chat message
  - **Used in:** `iSpora-frontend/components/workspace/LiveSession.tsx`

#### Learning Vault (`/api/learning`)
- ❌ `GET /api/learning/recordings` - List recordings
- ❌ `GET /api/learning/content` - Get learning content
  - **Used in:** `iSpora-frontend/components/workspace/LearningVault.tsx`

#### Deliverables (`/api/deliverables`)
- ❌ `GET /api/deliverables` - List deliverables
- ❌ `POST /api/deliverables` - Submit deliverable
  - **Used in:** `iSpora-frontend/components/workspace/DeliverableSubmissions.tsx`

**Total Missing: 35+ endpoints**

---

## 3. Request/Response Structures

### 3.1 Authentication Flow

**Registration Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "student"
}
```

**Registration Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "student",
    "created_at": "2025-01-31T...",
    "updated_at": "2025-01-31T..."
  }
}
```

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "...": "other fields"
  }
}
```

### 3.2 Project Creation

**Create Project Request:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "type": "research",
  "category": "education",
  "tags": ["tag1", "tag2"],
  "objectives": "Objective as string (not array!)",
  "teamMembers": [
    {
      "name": "Member Name",
      "role": "role",
      "email": "email@example.com"
    }
  ],
  "diasporaPositions": [
    {
      "position": "position",
      "location": "location"
    }
  ],
  "priority": "high",
  "university": "University Name",
  "mentorshipConnection": true,
  "isPublic": true
}
```

**Create Project Response:**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "title": "Project Title",
    "description": "Project description",
    "creator": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "created_at": "2025-01-31T...",
    "updated_at": "2025-01-31T...",
    "...": "other project fields"
  }
}
```

**List Projects Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Description",
      "creator": {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "created_at": "2025-01-31T...",
      "updated_at": "2025-01-31T..."
    }
  ]
}
```

### 3.3 Feed System

**Get Feed Request:**
```
GET /api/feed?page=1&limit=20&realtime=true
```

**Get Feed Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "project_created",
      "title": "New Project Created",
      "description": "Description",
      "category": "general",
      "metadata": {
        "project_id": "uuid",
        "action": "created"
      },
      "author": {
        "name": "John Doe",
        "email": "user@example.com"
      },
      "project": {
        "title": "Project Title",
        "id": "uuid"
      } | null,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "created_at": "2025-01-31T...",
      "updated_at": "2025-01-31T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**SSE Stream Messages:**
```json
// Connected message
{
  "type": "connected",
  "message": "Connected to feed stream",
  "timestamp": "2025-01-31T..."
}

// Welcome message
{
  "type": "welcome",
  "message": "Welcome to iSpora feed stream",
  "timestamp": "2025-01-31T..."
}

// Ping (every 20 seconds)
{
  "type": "ping",
  "timestamp": "2025-01-31T..."
}
```

### 3.4 Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Session expired",
  "code": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please log in again."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Route not found",
  "path": "/api/missing",
  "method": "GET",
  "timestamp": "2025-01-31T..."
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: email, password",
  "code": "MISSING_REQUIRED_FIELDS",
  "missingFields": ["email", "password"]
}
```

---

## 4. Authentication & Security

### 4.1 JWT Token Flow

1. **Token Generation:**
   - Secret: `process.env.JWT_SECRET` (REQUIRED - no fallbacks)
   - Expiry: `process.env.JWT_EXPIRES_IN || '7d'`
   - Payload: `{ id: userId, email: email }`

2. **Token Storage:**
   - Frontend: `localStorage.getItem('token')`
   - Sent in header: `Authorization: Bearer <token>`
   - For SSE: Token passed as query param (EventSource limitation)

3. **Token Verification:**
   - Middleware: `src/middleware/auth.js` → `authenticateToken`
   - Verifies JWT signature
   - Validates user exists in database
   - Attaches user to `req.user`

4. **Error Codes:**
   - `TOKEN_EXPIRED` - Token has expired
   - `INVALID_TOKEN` - Token is malformed
   - `NO_TOKEN` - Missing Authorization header
   - `USER_NOT_FOUND` → Treated as `TOKEN_EXPIRED` (returns "Session expired")

### 4.2 CORS Configuration

**Allowed Origins:**
- `https://ispora.app`
- `https://www.ispora.app`
- `http://localhost:5173`

**CORS Headers:**
- `Access-Control-Allow-Origin: <origin>`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin`

**Special Cases:**
- Render health checks: Allow no-origin requests
- Placeholder images: Allow no-origin for direct image requests
- SSE stream: Strict origin validation with CORS headers

### 4.3 Security Headers

**Helmet Configuration:**
- `contentSecurityPolicy: false` (disabled for API)
- `crossOriginEmbedderPolicy: false`

**Rate Limiting:**
- Window: 15 minutes
- Max requests: 200 per IP
- Excluded: Health checks, CORS preflight, Render monitoring

---

## 5. Database Schema

### 5.1 Tables

**Users:**
- `id` (UUID, primary key)
- `email` (string, unique, lowercase)
- `password_hash` (string, bcrypt)
- `first_name` (string)
- `last_name` (string)
- `user_type` (string, default: 'student')
- `username` (string, unique)
- `is_verified` (boolean, default: true)
- `email_verified` (boolean, default: true)
- `profile_completed` (boolean, default: false)
- `status` (string, default: 'active')
- `last_login` (timestamp, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Projects:**
- `id` (UUID, primary key)
- `title` (string, required)
- `description` (text)
- `type` (string)
- `category` (string)
- `tags` (text, JSON stringified)
- `objectives` (text, string - NOT array)
- `team_members` (text, JSON stringified)
- `diaspora_positions` (text, JSON stringified)
- `priority` (string)
- `university` (string)
- `mentorship_connection` (boolean)
- `is_public` (boolean)
- `owner_id` (UUID, foreign key → users.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Feed Entries:**
- `id` (UUID, primary key)
- `type` (string, required)
- `title` (string)
- `description` (text)
- `category` (string)
- `metadata` (text, JSON stringified)
- `author_id` (UUID, foreign key → users.id)
- `author_email` (string)
- `project_id` (UUID, foreign key → projects.id, nullable)
- `likes` (integer, default: 0)
- `comments` (integer, default: 0)
- `shares` (integer, default: 0)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Sessions:**
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key → users.id)
- `session_data` (text, JSON stringified)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 5.2 Migrations

- `001_create_users_table.js`
- `002_create_projects_table.js`
- `003_create_feed_entries_table.js`
- `004_create_sessions_table.js`

### 5.3 Database Configuration

**Development:**
- Client: `sqlite3`
- Database: `data/dev.db`
- File path: `./data/dev.db`

**Production:**
- Client: `postgresql`
- Database: `DATABASE_URL` environment variable
- Connection: Render.com managed PostgreSQL

---

## 6. Real-time Features

### 6.1 Server-Sent Events (SSE)

**Endpoint:** `GET /api/feed/stream`

**Connection Flow:**
1. Frontend creates `EventSource` connection
2. Token passed as query parameter (`?token=<jwt>`)
3. Backend sends initial `connected` message
4. Backend sends `welcome` message after 1 second
5. Backend sends `ping` every 20 seconds (heartbeat)
6. Frontend handles `onmessage` events
7. Frontend auto-reconnects on error after 5 seconds

**Connection Management:**
- Headers: `text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`
- CORS: Strict origin validation
- Heartbeat: 20 seconds
- Auto-reconnect: 5 seconds after error

---

## 7. Dependencies & Configuration

### 7.1 Frontend Dependencies

**Core:**
- `react`: ^18.2.0
- `typescript`: ^5.x
- `vite`: ^5.x
- `react-router-dom`: ^6.x

**UI:**
- `tailwindcss`: ^3.x
- `@radix-ui/*`: Multiple packages
- `lucide-react`: ^0.552.0
- `sonner`: ^2.0.7 (toast notifications)

**API:**
- `axios`: ^1.x
- Native `fetch` API

### 7.2 Backend Dependencies

**Core:**
- `express`: ^4.18.2
- `node`: 22.16.0

**Database:**
- `knex`: ^3.1.0
- `sqlite3`: ^5.1.6 (dev)
- `pg`: ^8.11.3 (production)

**Authentication:**
- `jsonwebtoken`: ^9.0.2
- `bcrypt`: ^5.1.1

**Middleware:**
- `cors`: ^2.8.5
- `helmet`: ^7.1.0
- `express-rate-limit`: ^7.1.5
- `morgan`: ^1.10.1 (dev only)
- `pino`: ^8.16.2 (logging)

**Utilities:**
- `uuid`: ^9.0.1
- `joi`: ^17.11.0 (validation)
- `dotenv`: ^16.3.1

### 7.3 Environment Variables

**Frontend (`.env`):**
```env
VITE_API_URL=https://ispora-backend.onrender.com/api
```

**Backend (`.env`):**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<required-secret>
JWT_EXPIRES_IN=7d
DATABASE_URL=<postgresql-connection-string>
SENTRY_DSN=<optional-sentry-dsn>
```

---

## 8. Known Issues & Runtime Problems

### 8.1 Current Issues

1. **401 Errors on Project Creation:**
   - Status: ✅ FIXED (JWT verification now includes database lookup)
   - Previous: "User not found" when token was valid but user missing from DB
   - Fix: Middleware now verifies user exists before allowing access

2. **404 Errors on Placeholder Images:**
   - Status: ✅ FIXED (placeholder route implemented)
   - Previous: `/api/placeholder/:w/:h` returned 404
   - Fix: Route redirects to `https://placehold.co/${w}x${h}?text=+`

3. **SSE Connection Errors:**
   - Status: ✅ IMPROVED (CORS headers fixed, heartbeat added)
   - Previous: 502 Bad Gateway errors
   - Fix: Proper SSE headers, CORS validation, 20s heartbeat

4. **Missing Endpoints:**
   - Status: ❌ NOT FIXED (expected for rebuild)
   - 35+ endpoints expected by frontend but not implemented
   - Affects: Opportunities, Credits, Notifications, Network, Admin, Research, Live Events, Learning, Deliverables

5. **Tasks Mock Data:**
   - Status: ⚠️ PARTIAL (mock data only)
   - Tasks CRUD endpoints exist but return mock data
   - No database integration for tasks

6. **Projects Updates Endpoint:**
   - Status: ❌ NOT IMPLEMENTED
   - Frontend expects `GET /api/projects/updates?mine=true`
   - Returns 404 currently

### 8.2 Frontend Error Patterns

**Console Errors:**
- `TypeError: Cannot read properties of undefined (reading 'charAt')` - ✅ FIXED (safety checks added)
- `Unknown realtime update` - ✅ FIXED (silent handling of `connected`, `welcome`, `ping`)
- `Sentry not initialized: No valid DSN provided` - ⚠️ EXPECTED (optional feature)
- `GET https://ispora.app/api/placeholder/40/40 404` - ✅ FIXED (route implemented)

**Network Errors:**
- CORS policy blocking - ✅ FIXED (strict origin validation)
- 401 Unauthorized - ✅ IMPROVED (clear error codes)
- 404 Not Found - ⚠️ PARTIAL (many endpoints not implemented)

---

## 9. Frontend Expectations Snapshot

### 9.1 API Client Behavior

**Base Configuration:**
- API Base URL: `VITE_API_URL || 'https://ispora-backend.onrender.com/api'`
- Timeout: 10 seconds (axios)
- Default headers: `Content-Type: application/json`
- Auth header: `Authorization: Bearer <token>` (from `localStorage.getItem('token')`)
- Dev key header: `X-Dev-Key: <devKey>` (from `localStorage.getItem('devKey')`)

**Request Interceptor:**
- Adds token from `localStorage` to all requests
- Adds dev key if available
- No token? Request proceeds (some endpoints are public)

**Response Interceptor:**
- 401 errors trigger:
  1. Clear `localStorage` (token, user)
  2. Show toast notification with error message
  3. Redirect to `/login` after 2 seconds (if not already on login page)

**Error Code Handling:**
- `TOKEN_EXPIRED` → "Session expired. Please log in again."
- `INVALID_TOKEN` → "Invalid session. Please log in again."
- `NO_TOKEN` → "Please log in to continue."
- `USER_NOT_FOUND` / `SESSION_EXPIRED` → "Session expired. Please log in again."

### 9.2 Response Structure Expectations

**Success Response Pattern:**
```json
{
  "success": true,
  "data": [...],
  "message": "Optional message"
}
```

**Alternate Success Pattern (for compatibility):**
```json
{
  "success": true,
  "project": {...},
  "user": {...}
}
```

**Error Response Pattern:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "message": "User-friendly message"
}
```

### 9.3 Data Transformation Expectations

**Feed Items:**
- Frontend expects `authorName`, `authorAvatar`, `authorId`
- Backend may return `author.name`, `author.avatar`, `author.id`
- Frontend transforms: `authorName = item.authorName || item.author?.name || 'Unknown User'`

**Projects:**
- Frontend handles both `data` and direct array responses
- Projects list: `Array.isArray(projJson.data) ? projJson.data : Array.isArray(projJson) ? projJson : []`

**Pagination:**
- Frontend expects `pagination` object with `page`, `limit`, `total`
- Query params: `?page=1&limit=20`

### 9.4 Real-time Updates

**SSE Connection:**
- Frontend creates `EventSource` connection to `/api/feed/stream?token=<jwt>`
- Handles message types: `connected`, `welcome`, `ping`, `message`
- Auto-reconnects on error after 5 seconds
- Silently handles `connected`, `welcome`, `ping` (no console spam)

**Feed Refresh:**
- After project creation, frontend dispatches `refreshFeed` custom event
- Dashboard listens for `refreshFeed` event and refetches feed
- Projects page listens for `refreshProjects` event and refetches projects

### 9.5 Placeholder Images

**Usage Pattern:**
- Frontend uses `VITE_API_URL/api/placeholder/40/40` for avatar placeholders
- Expects 302 redirect to `https://placehold.co/40x40?text=+`
- Must work without CORS (direct image tag requests)

### 9.6 Authentication Flow

**Registration → Login Flow:**
1. User registers → receives JWT token
2. Token stored in `localStorage.setItem('token', token)`
3. User data stored in `localStorage.setItem('user', JSON.stringify(user))`
4. User redirected to dashboard
5. All subsequent requests include token in `Authorization` header

**Login → Dashboard Flow:**
1. User logs in → receives JWT token
2. Token stored in `localStorage`
3. Frontend fetches `/api/auth/me` to verify token
4. User redirected to dashboard
5. Dashboard fetches feed, projects, etc.

**Logout Flow:**
1. User clicks logout → calls `/api/auth/logout`
2. Clears `localStorage` (token, user)
3. Redirects to `/login`

**Token Expiry Handling:**
1. Backend returns 401 with `TOKEN_EXPIRED` code
2. Frontend interceptor catches 401
3. Clears `localStorage`
4. Shows toast: "Session expired. Please log in again."
5. Redirects to `/login` after 2 seconds

### 9.7 Missing Endpoint Handling

**Current Behavior:**
- Frontend makes request to missing endpoint
- Receives 404 response
- Frontend handles gracefully (shows empty state or error message)
- No crashes, but features don't work

**Expected Behavior (Post-Rebuild):**
- All endpoints should return valid responses
- Empty arrays for list endpoints: `{ success: true, data: [] }`
- Proper error responses for invalid requests

---

## 10. Critical Dependencies

### 10.1 Frontend → Backend Dependencies

1. **JWT Token Validation:**
   - Backend MUST verify token signature
   - Backend MUST verify user exists in database
   - Backend MUST return clear error codes

2. **CORS Headers:**
   - Backend MUST allow `https://ispora.app` origin
   - Backend MUST allow credentials
   - Backend MUST handle OPTIONS preflight requests

3. **Response Structure:**
   - Backend MUST return `{ success: boolean, ... }` structure
   - Backend MUST return data in `data` field or top-level array
   - Backend MUST include error codes in error responses

4. **SSE Stream:**
   - Backend MUST send proper SSE headers
   - Backend MUST send heartbeat every 20 seconds
   - Backend MUST handle connection errors gracefully

5. **Placeholder Images:**
   - Backend MUST redirect to `placehold.co`
   - Backend MUST allow no-origin requests (for image tags)

### 10.2 Backend Dependencies

1. **JWT_SECRET:**
   - MUST be set in environment
   - NO fallbacks (security)
   - Used for signing and verifying tokens

2. **Database Connection:**
   - SQLite for development
   - PostgreSQL for production
   - Migrations MUST run on startup

3. **CORS Configuration:**
   - Strict origin validation
   - No wildcards
   - Allow no-origin for health checks

---

## 11. Deployment Considerations

### 11.1 Render.com Backend

**Health Checks:**
- Endpoint: `/healthz`
- Must return 200 OK always
- Used by Render for service health monitoring

**Cold Starts:**
- Ping endpoint: `/api/ping` (keeps instance awake)
- SSE heartbeat: 20 seconds (prevents idle timeout)

**Build Process:**
1. Install dependencies: `npm install`
2. Run migrations: `npm run migrate`
3. Run tests: `npm run test:pre-deploy`
4. Start server: `npm start`

### 11.2 Frontend Deployment

**Build Process:**
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Deploy: GitHub Actions → FTP to Namecheap

**Environment Variables:**
- `VITE_API_URL` set at build time (not runtime)
- Must rebuild if API URL changes

---

## 12. Recommendations for Rebuild

### 12.1 Priority 1: Core Endpoints (Working)
- ✅ Keep authentication endpoints as-is
- ✅ Keep project CRUD endpoints as-is
- ✅ Keep feed endpoints as-is
- ✅ Keep health/ping endpoints as-is

### 12.2 Priority 2: Implement Missing Critical Endpoints
- 🔴 Implement `/api/projects/updates`
- 🔴 Implement `/api/notifications` (all CRUD)
- 🔴 Implement `/api/opportunities`
- 🟡 Implement `/api/credits/*` endpoints
- 🟡 Implement `/api/network/*` endpoints

### 12.3 Priority 3: Implement Additional Features
- 🟢 Implement `/api/admin/*` endpoints
- 🟢 Implement `/api/research/*` endpoints
- 🟢 Implement `/api/live/*` endpoints
- 🟢 Implement `/api/learning/*` endpoints
- 🟢 Implement `/api/deliverables` endpoints

### 12.4 Priority 4: Enhance Existing Endpoints
- 🔵 Replace tasks mock data with database integration
- 🔵 Enhance sessions endpoint with real data
- 🔵 Add pagination to all list endpoints
- 🔵 Add filtering/sorting to list endpoints

---

## 13. Testing Strategy

### 13.1 Current Tests

**Pre-Deployment Tests:**
- Database connection test
- Table existence test
- Migration status test
- User creation test
- Project creation test
- Feed entry creation test
- Feed query test
- Projects query test

**All tests: ✅ PASSING**

### 13.2 Recommended Tests for Rebuild

1. **Unit Tests:**
   - Controller functions
   - Middleware functions
   - Utility functions

2. **Integration Tests:**
   - Full authentication flow
   - Project creation → feed update
   - SSE connection lifecycle

3. **API Tests:**
   - All endpoint responses
   - Error handling
   - CORS validation
   - Authentication requirement validation

4. **End-to-End Tests:**
   - User registration → login → dashboard
   - Project creation → feed update
   - Token expiry → redirect to login

---

## 14. Documentation Artifacts

### 14.1 Generated Files

1. ✅ `diagnostic_checklist.md` - Complete diagnostic checklist
2. ✅ `network_endpoints.json` - All endpoints with status
3. ✅ `env_diagnostic_summary.md` - This document

### 14.2 Existing Documentation

- `AUTHENTICATION_FLOW.md` - Authentication documentation
- `DATABASE_ANALYSIS.md` - Database structure
- `DEPLOYMENT.md` - Deployment guide
- `README.md` - Project overview

---

**End of Diagnostic Summary**

**Next Step:** Use `phase_0_audit_prompt.md` for Phase 0 rebuild planning.

