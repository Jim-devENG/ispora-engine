# iSpora System Architecture

**Date:** 2025-01-31  
**Version:** 1.0.0  
**Status:** Production (Phase 1 Complete)

---

## Overview

iSpora is a full-stack diaspora engagement platform connecting students, professionals, and mentors through projects, opportunities, and collaboration tools. The system uses a dual-database architecture supporting both legacy SQL (Knex.js) and modern MongoDB (Mongoose) implementations.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  React 18 + TypeScript + Vite                                   │
│  - 129 React Components                                          │
│  - Context API (Auth, Navigation, Profile)                      │
│  - API Client (Axios + Fetch)                                    │
│  - Real-time (EventSource/SSE)                                   │
│  Deployed: https://ispora.app                                   │
└────────────────────┬────────────────────────────────────────────┘
                      │ HTTPS
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  Express.js 4.18                                                  │
│  - CORS (strict origin whitelist)                                │
│  - Helmet (security headers)                                     │
│  - Rate Limiting                                                 │
│  - JWT Authentication                                            │
│  Deployed: https://ispora-backend.onrender.com                   │
└────────────────────┬────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐        ┌────────▼────────┐
│  MongoDB        │        │  PostgreSQL/    │
│  (Mongoose)     │        │  SQLite         │
│  Phase 1+       │        │  Legacy         │
│                 │        │                 │
│  - Users        │        │  - Users        │
│  - Projects     │        │  - Projects     │
│  - Tasks        │        │  - Feed Entries │
│  - Updates      │        │  - Sessions     │
└─────────────────┘        └─────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework:** React 18.2+ with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **State Management:** React Context API
- **UI Library:** Radix UI (129 components)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **API Client:** Axios + native Fetch
- **Real-time:** EventSource (SSE)

### Backend
- **Runtime:** Node.js 18+ / 20+
- **Framework:** Express.js 4.18
- **Databases:**
  - **MongoDB** (Mongoose) - Phase 1+ features
  - **PostgreSQL/SQLite** (Knex.js) - Legacy features
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Joi
- **Logging:** Pino
- **Error Tracking:** Sentry (optional)
- **Security:** Helmet, CORS, Rate Limiting

### Infrastructure
- **Frontend Hosting:** Namecheap (GitHub Actions CI/CD)
- **Backend Hosting:** Render.com
- **Database:** MongoDB Atlas (future), PostgreSQL (Render)
- **Monitoring:** Render health checks, Sentry
- **CDN:** Namecheap static hosting

---

## Component Breakdown

### Frontend Components (129 Total)

**Core (5):**
- `Layout.tsx` - Main app container
- `Dashboard.tsx` - Impact Feed (2,224 lines)
- `Sidebar.tsx` - Navigation
- `NavigationContext.tsx` - Route management
- `AuthContext.tsx` - Authentication state

**Authentication (3):**
- `LoginPage.tsx` - Login/Register
- `ProtectedRoute.tsx` - Route guard
- `authService.ts` - API client

**Projects (4):**
- `CreateProject.tsx` - Project creation (1,397 lines)
- `MyProjects.tsx` - User's projects (863 lines)
- `ProjectDetail.tsx` - Project view (2,123 lines)
- `ProjectDashboard.tsx` - Project overview

**Workspace (6):**
- `TaskManager.tsx` - Task management
- `ResearchTools.tsx` - Research sources/notes
- `LiveSession.tsx` - Live events
- `LearningVault.tsx` - Learning content
- `DeliverableSubmissions.tsx` - Deliverables
- `SessionBoard.tsx` - Session management

**Social (3):**
- `FeedService.tsx` - Feed fetching + SSE
- `NotificationsPage.tsx` - Notifications (895 lines)
- `MyNetwork.tsx` - Network management (1,473 lines)

**Features (3):**
- `OpportunitiesPage.tsx` - Opportunities (919 lines)
- `CreditsPage.tsx` - Credits/Rewards (1,243 lines)
- `AdminDashboard.tsx` - Admin panel (1,004 lines)

**UI Components (85+):**
- Radix UI wrappers
- Form components
- Modal components
- Card components

---

## Backend Architecture

### Route Structure

**Legacy Routes (Knex.js/SQLite/PostgreSQL):**
- `/api/auth` - Authentication (register, login, me, logout, refresh)
- `/api/projects` - Projects CRUD
- `/api/feed` - Feed entries + SSE stream
- `/api/tasks` - Tasks (mock data)
- `/api/placeholder` - Image placeholders
- `/api/health` - Health checks
- `/api/ping` - Uptime ping
- `/api/sessions` - Sessions (stub)

**Phase 1 Routes (Mongoose/MongoDB):**
- `/api/v1/auth` - Authentication (register, login)
- `/api/v1/projects` - Projects with objectives normalization
- `/api/v1/projects/updates?mine=true` - User's project updates
- `/api/v1/tasks` - Tasks integrated with MongoDB

**Future Routes (Phase 2-6):**
- `/api/v1/notifications` - Notifications system
- `/api/v1/opportunities` - Opportunities
- `/api/v1/credits` - Credits/Rewards
- `/api/v1/network` - Network features
- `/api/v1/admin` - Admin dashboard
- `/api/v1/research` - Research tools
- `/api/v1/live` - Live events
- `/api/v1/learning` - Learning vault
- `/api/v1/deliverables` - Deliverables

### Database Models

**MongoDB (Mongoose) - Phase 1:**
1. **User** - User accounts with password hashing
2. **Project** - Projects with objectives normalization
3. **ProjectUpdate** - Project updates/announcements
4. **Task** - Tasks linked to projects

**MongoDB (Mongoose) - Phase 2-6 (Planned):**
5. **Notification** - User notifications
6. **Opportunity** - Job/scholarship opportunities
7. **Credit** - Credits/Rewards tracking
8. **Badge** - User badges
9. **CreditActivity** - Credit activity history
10. **LeaderboardEntry** - Leaderboard rankings
11. **NetworkUser** - Network discovery
12. **Connection** - User connections
13. **ConnectionRequest** - Connection requests
14. **ResearchSource** - Research sources
15. **ResearchNote** - Research notes
16. **Dataset** - Research datasets
17. **LiveEvent** - Live events
18. **ChatMessage** - Event chat messages
19. **Recording** - Session recordings
20. **LearningContent** - Learning materials
21. **Deliverable** - Project deliverables
22. **Report** - User/content reports
23. **AdminStats** - System statistics

**SQLite/PostgreSQL (Knex.js) - Legacy:**
- `users` - Legacy user table
- `projects` - Legacy projects table
- `feed_entries` - Feed entries
- `sessions` - Session tracking

---

## Data Models (25 Total)

See `audit/frontend_data_models.json` for complete schema definitions.

**Core Models:**
- User (id, email, name, userType, roles)
- Project (id, title, objectives[], owner, visibility)
- ProjectUpdate (id, projectId, author, content, type)
- Task (id, title, projectId, assignee, status, priority)
- FeedEntry (id, type, title, author, project, metadata)

**Social Models:**
- Notification (id, type, title, message, read, actionRequired)
- NetworkUser (id, name, email, expertise, connectionStatus)
- Connection (id, userId1, userId2, connectedAt)
- ConnectionRequest (id, fromUserId, toUserId, status)

**Feature Models:**
- Opportunity (id, title, type, organization, location, amount)
- CreditStats (totalCredits, creditsThisMonth, rank, level)
- Badge (id, name, description, icon, earnedAt)
- LeaderboardEntry (rank, userId, totalCredits, change)

**Workspace Models:**
- ResearchSource (id, title, authors, type, url, doi)
- ResearchNote (id, title, content, tags, category)
- LiveEvent (id, title, startTime, endTime)
- ChatMessage (id, sender, message, timestamp, eventId)
- Recording (id, title, url, duration)
- LearningContent (id, title, type, url)
- Deliverable (id, title, status, fileName, projectId)

---

## Communication Flow

### Authentication Flow
```
User → Frontend (LoginPage) 
  → POST /api/v1/auth/login 
  → Backend (authMongoose.js) 
  → MongoDB (User.findByEmail) 
  → JWT Generation 
  → Response (token + user)
  → Frontend (localStorage.token)
  → Dashboard (protected)
```

### Project Creation Flow
```
User → Frontend (CreateProject) 
  → POST /api/v1/projects (objectives: string)
  → Backend (projectsMongoose.js)
  → Objectives Normalization (string → array)
  → MongoDB (Project.create)
  → Feed Entry Creation
  → Response (project + feed entry)
  → Frontend (refreshFeed + refreshProjects events)
  → Dashboard (updated feed)
```

### Real-time Feed Flow
```
Frontend (FeedService) 
  → GET /api/feed/stream?token=xxx (EventSource)
  → Backend (feed.js - SSE)
  → SQLite/PostgreSQL (feed_entries query)
  → Stream (connected, welcome, ping every 20s)
  → Frontend (handleRealtimeUpdate)
  → Dashboard (live updates)
```

---

## External Integrations

**Current:**
- **Render.com** - Backend hosting + health checks
- **Namecheap** - Frontend hosting (static)
- **GitHub Actions** - CI/CD for frontend
- **Sentry** - Error tracking (optional)

**Planned (Phase 2-6):**
- **MongoDB Atlas** - Production MongoDB hosting
- **Cloudinary** - Image/media storage
- **Paystack** - Payment processing (opportunities)
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications (optional)

---

## Security Architecture

### Authentication
- **JWT Tokens** - 7-day expiry
- **Password Hashing** - bcryptjs (12 rounds)
- **Token Refresh** - `/api/auth/refresh` endpoint
- **Session Validation** - User lookup on every request

### Authorization
- **Route Protection** - `verifyToken` middleware
- **Project Ownership** - Task creation requires ownership
- **Private Projects** - Visibility-based access control

### CORS
- **Whitelist:** `https://ispora.app`, `https://www.ispora.app`, `http://localhost:5173`
- **Credentials:** Enabled
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With

### Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 200 per window
- **Exclusions:** Health checks, Render monitoring

---

## Deployment Architecture

### Frontend (Namecheap)
```
GitHub Repository
  → GitHub Actions (deploy.yml)
  → Build (Vite)
  → FTP Upload (Namecheap)
  → Static Hosting
  → https://ispora.app
```

### Backend (Render.com)
```
GitHub Repository
  → Render.com (auto-deploy)
  → Build (npm install + migrate)
  → Start (node src/server.js)
  → Health Checks (/healthz)
  → https://ispora-backend.onrender.com
```

### Database
```
Development:
  - SQLite (data/dev.db)
  - MongoDB (localhost:27017/ispora)

Production:
  - PostgreSQL (Render managed)
  - MongoDB Atlas (future)
```

---

## Monitoring & Logging

### Application Logging
- **Pino** - Structured JSON logging
- **Log Levels:** error, warn, info, debug
- **Output:** Console + file (development)

### Error Tracking
- **Sentry** - Error aggregation (optional)
- **Error Codes:** TOKEN_EXPIRED, INVALID_TOKEN, NO_TOKEN, etc.

### Health Monitoring
- **Render Health Checks:** `/healthz` endpoint
- **Uptime Ping:** `/api/ping` endpoint
- **Health Cache:** 5-second cache for health endpoint

---

## Real-time Communication

### Server-Sent Events (SSE)
**Endpoint:** `GET /api/feed/stream`

**Implementation:**
- EventSource connection (frontend)
- Token passed as query param (EventSource limitation)
- Heartbeat every 20 seconds
- Message types: `connected`, `welcome`, `ping`, `message`
- Auto-reconnect on disconnect

**Use Cases:**
- Live feed updates
- Notification streaming (future)
- Activity tracking

### Future: WebSocket (Phase 4)
- Bidirectional communication
- Live chat
- Collaborative editing
- Real-time notifications

---

## Admin Module Overview

**Status:** ❌ Not Implemented (Phase 6)

**Planned Features:**
- User management (ban, suspend, activate)
- System statistics dashboard
- Content moderation (reports)
- Feed management
- Bulk operations

**Endpoints (Planned):**
- `GET /api/v1/admin/stats` - System statistics
- `GET /api/v1/admin/users` - User list
- `POST /api/v1/admin/users/:id/:action` - User actions
- `GET /api/v1/admin/reports` - Content reports
- `POST /api/v1/admin/reports/:id/:action` - Report actions

---

## Scalability Considerations

### Current Architecture
- **Single Backend Instance** - Render.com auto-scaling
- **Database Connection Pooling** - MongoDB (10 connections), PostgreSQL (2-10)
- **Caching** - Health endpoint cache (5s)

### Future Optimizations
- **CDN** - Static asset delivery (Cloudinary)
- **Redis** - Session cache, rate limiting
- **Load Balancing** - Multiple backend instances
- **Database Replication** - MongoDB replica set
- **Queue System** - Bull (background jobs)

---

## Next Phase Dependencies

See `docs/phase_sequence.md` for detailed roadmap.

**Phase 1:** ✅ Complete
- Objectives normalization
- Project updates endpoint
- Tasks MongoDB integration

**Phase 2-3:** High Priority
- Notifications system
- Opportunities system
- Credits/Rewards system

**Phase 4-5:** Medium Priority
- Network features
- Workspace tools (research, live events, learning)

**Phase 6:** Low Priority
- Admin dashboard
- Advanced reporting

---

**End of System Architecture Overview**

