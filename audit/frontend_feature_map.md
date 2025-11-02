# iSpora Frontend Feature Map - Complete Backend Dependency Analysis

**Date:** 2025-01-31  
**Audit Type:** Forensic Frontend Analysis  
**Purpose:** Developer-ready backend blueprint based on frontend expectations

---

## Executive Summary

This document provides a complete forensic audit of the iSpora frontend application. It extracts every intended functionality, user flow, and backend dependency to create a comprehensive blueprint for backend implementation.

**Key Findings:**
- **129 React Components** analyzed across 7 major feature areas
- **60+ API Endpoints** expected by frontend
- **35+ Missing Endpoints** not yet implemented in backend
- **15+ User Flows** mapped with backend dependencies
- **20+ Data Models** inferred from frontend usage

---

## 1. Application Architecture

### 1.1 Technology Stack

**Frontend Framework:**
- React 18.2+ with TypeScript
- Vite build tool
- React Router DOM for navigation (custom NavigationContext wrapper)

**State Management:**
- React Context API (AuthContext, NavigationContext, ProfileContext, OnboardingContext)
- LocalStorage for token/user persistence
- Custom hooks (useAuth, useMobile, useProfile)

**UI Components:**
- Radix UI primitives (129 UI components)
- Tailwind CSS for styling
- Lucide React for icons
- Sonner for toast notifications

**API Clients:**
- Axios (`src/services/apiClient.ts`, `src/services/apiClient-v2.ts`)
- Native `fetch` API (extensive use in components)
- EventSource for Server-Sent Events (SSE)

### 1.2 Application Structure

```
iSpora-frontend/
├── components/          # 129 React components
│   ├── core/           # Dashboard, Layout, Sidebar, Navigation
│   ├── auth/           # LoginPage, AuthContext, ProtectedRoute
│   ├── projects/       # CreateProject, MyProjects, ProjectDetail, ProjectWorkspace
│   ├── workspace/      # TaskManager, ResearchTools, LiveSession, LearningVault
│   ├── social/         # Dashboard (feed), NotificationsPage, MyNetwork
│   ├── opportunities/  # OpportunitiesPage, BrowseOpportunities
│   ├── admin/          # AdminDashboard, AdminConsole, AdminFeedManager
│   └── ui/             # 85+ Radix UI component wrappers
├── src/
│   ├── services/       # API clients, auth service, data persistence
│   ├── hooks/          # Custom React hooks
│   └── components/     # Mobile-specific components
└── public/             # Static assets, icons, manifests
```

---

## 2. User Flows & Backend Dependencies

### 2.1 Authentication Flow

**Flow:** Registration → Login → Dashboard

**User Actions:**
1. User visits `/login` page
2. User selects "Login" or "Register" tab
3. User enters credentials (email, password, firstName, lastName, userType)
4. Frontend calls authentication endpoint
5. Frontend stores token in `localStorage`
6. Frontend redirects to Dashboard

**Backend Dependencies:**
- `POST /api/auth/register` - User registration
  - Request: `{ email, password, firstName, lastName, userType?, username? }`
  - Response: `{ success: true, token: string, user: User }`
  
- `POST /api/auth/login` - User login
  - Request: `{ email, password }`
  - Response: `{ success: true, token: string, user: User }`
  
- `GET /api/auth/me` - Get current user (on app init)
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, user: User }`
  
- `POST /api/auth/logout` - User logout
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, message: "Logout successful" }`
  
- `POST /api/auth/refresh` - Refresh token
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true, token: string, expiresIn: string }`

**Components Involved:**
- `LoginPage.tsx` - Login/Register UI
- `AuthContext.tsx` - Auth state management
- `authService.ts` - API calls
- `ProtectedRoute.tsx` - Route guard

**Data Model:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'professional' | 'mentor' | 'admin';
  username?: string;
  avatar?: string;
  isOnline?: boolean;
  lastLogin?: string;
}
```

**Status:** ✅ Implemented

---

### 2.2 Project Creation Flow

**Flow:** Dashboard → Create Project → Form → Submit → Dashboard

**User Actions:**
1. User clicks "Create Project" from Dashboard or Sidebar
2. User navigates to Create Project page
3. User fills project form:
   - Basic info (title, description, type, category)
   - Objectives (string input, not array)
   - Team members (name, email, role)
   - Diaspora positions (preset or custom)
   - Settings (priority, university, mentorship connection, visibility)
4. User submits form
5. Frontend calls `POST /api/projects`
6. On success: Frontend dispatches `refreshFeed` and `refreshProjects` events
7. Frontend navigates to Project Dashboard
8. Frontend shows toast: "Project created successfully!"

**Backend Dependencies:**
- `POST /api/projects` - Create project (protected)
  - Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
  - Request Body:
    ```json
    {
      "title": "string (required)",
      "description": "string",
      "type": "string (mentorship|academic|career|community|collaboration)",
      "category": "string (education|healthcare|technology|...)",
      "tags": ["string"],
      "objectives": "string (required - sent as string, NOT array!)",
      "teamMembers": [
        {
          "name": "string",
          "email": "string",
          "role": "string"
        }
      ],
      "diasporaPositions": [
        {
          "title": "string",
          "description": "string",
          "responsibilities": ["string"],
          "requirements": ["string"],
          "commitment": "string",
          "category": "leadership|technical|advisory|mentorship|support"
        }
      ],
      "priority": "low|medium|high",
      "university": "string",
      "mentorshipConnection": boolean,
      "isPublic": boolean
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "project": {
        "id": "uuid",
        "title": "string",
        "description": "string",
        "creator": {
          "id": "string",
          "email": "string",
          "name": "string",
          "first_name": "string",
          "last_name": "string"
        },
        "created_at": "ISO date",
        "updated_at": "ISO date",
        "...": "other project fields"
      }
    }
    ```

**Components Involved:**
- `CreateProject.tsx` - Project creation form (1,397 lines)
- `Layout.tsx` - Navigation and event handling
- `MyProjects.tsx` - Listens for `refreshProjects` event
- `Dashboard.tsx` - Listens for `refreshFeed` event
- `FeedService.tsx` - Tracks project creation activity

**Data Model:**
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  type: 'mentorship' | 'academic' | 'career' | 'community' | 'collaboration';
  category: string;
  tags: string[];
  objectives: string; // IMPORTANT: String, not array!
  teamMembers: TeamMember[];
  diasporaPositions: DiasporaPosition[];
  priority: 'low' | 'medium' | 'high';
  university?: string;
  mentorshipConnection: boolean;
  isPublic: boolean;
  creator: {
    id: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface DiasporaPosition {
  id?: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  commitment: string;
  category: 'leadership' | 'technical' | 'advisory' | 'mentorship' | 'support';
  isActive?: boolean;
}
```

**Status:** ✅ Implemented (with minor fixes needed for objectives string format)

---

### 2.3 Feed/Browse Flow

**Flow:** Dashboard → Impact Feed → View Posts → Interact (Like/Comment/Share)

**User Actions:**
1. User lands on Dashboard (default view: Impact Feed)
2. Frontend automatically fetches feed items
3. Frontend establishes SSE connection to `/api/feed/stream`
4. User scrolls through feed items
5. User can like, comment, or share posts
6. Frontend tracks user activity

**Backend Dependencies:**
- `GET /api/feed` - Get feed items
  - Query Params: `?page=1&limit=20&realtime=true`
  - Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "string",
          "type": "string",
          "title": "string",
          "description": "string",
          "category": "string",
          "metadata": {},
          "author": {
            "name": "string",
            "email": "string"
          },
          "project": {
            "title": "string",
            "id": "string"
          } | null,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "created_at": "ISO date",
          "updated_at": "ISO date"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100
      }
    }
    ```
  
- `GET /api/feed/stream` - Server-Sent Events stream
  - Query Params: `?token=<jwt>&devKey=<devKey>` (EventSource limitation)
  - Connection Type: SSE (text/event-stream)
  - Messages:
    - `connected`: Initial connection message
    - `welcome`: Welcome message after 1 second
    - `ping`: Heartbeat every 20 seconds
    - `message`: Real feed updates
  
- `POST /api/feed/activity` - Track user activity (optional auth)
  - Request Body:
    ```json
    {
      "type": "string (e.g., 'project_created', 'like', 'comment')",
      "title": "string",
      "description": "string",
      "category": "string",
      "metadata": {}
    }
    ```
  
- `GET /api/feed/sessions` - Get live sessions (alias for `/api/sessions`)
  - Response: `{ success: true, activeSessions: [], total: 0 }`

**Components Involved:**
- `Dashboard.tsx` - Main feed display (2,224 lines)
- `FeedService.tsx` - Feed fetching and SSE connection
- `LiveFeed.tsx` - Feed item rendering
- `ImpactOverviewCards.tsx` - Statistics cards

**Data Model:**
```typescript
interface FeedEntry {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  metadata: Record<string, any>;
  author: {
    name: string;
    email: string;
  } | null;
  project: {
    title: string;
    id: string;
  } | null;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  updated_at: string;
}
```

**Status:** ✅ Implemented (SSE working, activity tracking working)

---

### 2.4 Project Management Flow

**Flow:** Dashboard → My Projects → View Project → Project Detail → Join Project

**User Actions:**
1. User clicks "Projects" in sidebar
2. Frontend fetches user's projects (`GET /api/projects?mine=true`)
3. Frontend fetches project updates (`GET /api/projects/updates?mine=true`)
4. User clicks on a project
5. Frontend navigates to Project Detail page
6. User can join project with role/area selection
7. User navigates to appropriate workspace based on area

**Backend Dependencies:**
- `GET /api/projects` - List all projects (public)
  - Query Params: `?mine=true` (filter to user's projects)
  - Response: `{ success: true, data: Project[] }`
  
- `GET /api/projects/updates` - Get project updates ❌ NOT IMPLEMENTED
  - Query Params: `?mine=true`
  - Expected Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "string",
          "projectId": "string",
          "title": "string",
          "description": "string",
          "type": "string",
          "timestamp": "ISO date"
        }
      ]
    }
    ```
  
- `GET /api/projects/:id` - Get project by ID (public)
  - Response: `{ success: true, project: Project }`

**Components Involved:**
- `MyProjects.tsx` - Projects list (863 lines)
- `ProjectDetail.tsx` - Project detail view (2,123 lines)
- `ProjectDashboard.tsx` - Project overview dashboard

**Status:** ⚠️ Partial (updates endpoint missing)

---

### 2.5 Workspace Flow

**Flow:** Project Detail → Join Project → Select Role/Area → Workspace

**User Actions:**
1. User views project detail
2. User clicks "Join Project"
3. User selects role and area (mentorship, work-opportunities, research, community, partnerships, campaigns)
4. Frontend navigates to appropriate workspace:
   - `mentorship` → MentorshipWorkspace
   - `workroom` → ProjectWorkspace
   - `research` → ProjectDashboard
   - `community` → Dashboard (Impact Feed)
   - `partnerships` → Dashboard (Impact Feed)
   - `campaigns` → Dashboard (Impact Feed)
5. Workspace loads with project-specific tools

**Backend Dependencies:**

**Workspace Tools:**
- `GET /api/tasks` - Get project tasks
  - Response: `{ success: true, tasks: Task[], total: number }`
  
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

**Research Tools:**
- `GET /api/research/sources` - Get research sources ❌ NOT IMPLEMENTED
- `POST /api/research/sources` - Create research source ❌ NOT IMPLEMENTED
- `GET /api/research/notes` - Get research notes ❌ NOT IMPLEMENTED
- `POST /api/research/notes` - Create research note ❌ NOT IMPLEMENTED
- `GET /api/research/datasets` - Get datasets ❌ NOT IMPLEMENTED

**Live Events:**
- `GET /api/live/events` - Get live events ❌ NOT IMPLEMENTED
- `GET /api/live/events/:id/chat` - Get event chat ❌ NOT IMPLEMENTED
- `POST /api/live/events/:id/chat` - Send chat message ❌ NOT IMPLEMENTED

**Learning Vault:**
- `GET /api/learning/recordings` - Get recordings ❌ NOT IMPLEMENTED
- `GET /api/learning/content` - Get learning content ❌ NOT IMPLEMENTED

**Deliverables:**
- `GET /api/deliverables` - Get deliverables ❌ NOT IMPLEMENTED
- `POST /api/deliverables` - Submit deliverable ❌ NOT IMPLEMENTED

**Sessions:**
- `GET /api/sessions` - Get sessions (stub - returns empty array)
- `PUT /api/sessions/:id` - Update session ❌ NOT IMPLEMENTED
- `DELETE /api/sessions/:id` - Delete session ❌ NOT IMPLEMENTED

**Components Involved:**
- `ProjectWorkspace.tsx` - Main workspace container
- `MentorshipWorkspace.tsx` - Mentorship-specific workspace
- `workspace/TaskManager.tsx` - Task management
- `workspace/ResearchTools.tsx` - Research tools
- `workspace/LiveSession.tsx` - Live event sessions
- `workspace/LearningVault.tsx` - Learning content
- `workspace/DeliverableSubmissions.tsx` - Deliverable submissions
- `workspace/SessionBoard.tsx` - Session management

**Status:** ⚠️ Partial (tasks implemented as mock data, most workspace tools not implemented)

---

### 2.6 Opportunities Flow

**Flow:** Dashboard → Opportunities → Browse/Filter → Apply

**User Actions:**
1. User clicks "Opportunities" in sidebar
2. Frontend fetches opportunities with filters:
   - Category/Type
   - Location
   - Remote only
   - Experience level
   - Search query
3. User browses opportunities
4. User can filter and search
5. User clicks "Apply" (future: application flow)

**Backend Dependencies:**
- `GET /api/opportunities` - List opportunities ❌ NOT IMPLEMENTED
  - Query Params:
    - `type`: string (job|scholarship|internship|volunteer|event)
    - `q`: string (search query)
    - `location`: string
    - `remote`: boolean
    - `experience`: string (entry|mid|senior)
  - Expected Response:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "string",
          "title": "string",
          "type": "string",
          "category": "string",
          "description": "string",
          "organization": "string",
          "location": {
            "city": "string",
            "country": "string",
            "remote": boolean
          },
          "amount": {
            "currency": "string",
            "value": number
          },
          "deadline": "ISO date",
          "requirements": ["string"],
          "tags": ["string"],
          "created_at": "ISO date"
        }
      ]
    }
    ```

**Components Involved:**
- `OpportunitiesPage.tsx` - Opportunities list (919 lines)
- `BrowseOpportunities.tsx` - Browse interface
- `FeaturedOpportunitiesWidget.tsx` - Featured opportunities widget

**Status:** ❌ Not Implemented

---

### 2.7 Credits/Rewards Flow

**Flow:** Dashboard → Credits → View Stats/Badges/Leaderboard

**User Actions:**
1. User clicks "Credits" in sidebar
2. Frontend fetches:
   - Credits overview
   - User badges
   - Leaderboard (with timeframe filter)
   - Credit activities
3. User views stats, badges, and leaderboard
4. User can export report

**Backend Dependencies:**
- `GET /api/credits/overview` - Get credits overview ❌ NOT IMPLEMENTED
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "string",
          "name": "string",
          "totalCredits": number,
          "level": number
        },
        "stats": {
          "totalCredits": number,
          "creditsThisMonth": number,
          "rank": number,
          "nextMilestone": number
        }
      }
    }
    ```
  
- `GET /api/credits/badges` - Get user badges ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: Badge[] }`
  
- `GET /api/credits/leaderboard` - Get leaderboard ❌ NOT IMPLEMENTED
  - Query Params: `?timeframe=week|month|year|all`
  - Response: `{ success: true, data: LeaderboardEntry[] }`
  
- `GET /api/credits/activities` - Get credit activities ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: CreditActivity[] }`

**Components Involved:**
- `CreditsPage.tsx` - Credits page (1,243 lines)

**Status:** ❌ Not Implemented

---

### 2.8 Notifications Flow

**Flow:** Dashboard → Notifications → View/Filter → Mark Read/Delete

**User Actions:**
1. User clicks "Notifications" in sidebar or header
2. Frontend fetches notifications with filter (all|unread|action-required)
3. User views notifications
4. User can mark as read (individual or all)
5. User can delete notifications

**Backend Dependencies:**
- `GET /api/notifications` - Get notifications ❌ NOT IMPLEMENTED
  - Query Params: `?filter=all|unread|action-required`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "notifications": [
          {
            "id": "string",
            "type": "string",
            "title": "string",
            "message": "string",
            "read": boolean,
            "actionRequired": boolean,
            "actionUrl": "string",
            "created_at": "ISO date"
          }
        ],
        "stats": {
          "total": number,
          "unread": number,
          "actionRequired": number
        }
      }
    }
    ```
  
- `PUT /api/notifications/:id/read` - Mark as read ❌ NOT IMPLEMENTED
  - Response: `{ success: true }`
  
- `PUT /api/notifications/mark-all-read` - Mark all as read ❌ NOT IMPLEMENTED
  - Response: `{ success: true }`
  
- `DELETE /api/notifications/:id` - Delete notification ❌ NOT IMPLEMENTED
  - Response: `{ success: true }`

**Components Involved:**
- `NotificationsPage.tsx` - Notifications page (895 lines)
- `SessionNotifications.tsx` - Session-specific notifications

**Status:** ❌ Not Implemented

---

### 2.9 Network Flow

**Flow:** Dashboard → My Network → Discover → Connect → Manage Connections

**User Actions:**
1. User clicks "My Network" in sidebar
2. Frontend fetches:
   - Discovery users (potential connections)
   - Existing connections
   - Connection requests (incoming/outgoing)
3. User can send connection request with purpose and message
4. User can accept/decline connection requests
5. User can view profiles

**Backend Dependencies:**
- `GET /api/network/discovery` - Discover users ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: NetworkUser[] }`
  
- `GET /api/network/connections` - Get connections ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: Connection[] }`
  
- `GET /api/network/connections/requests` - Get connection requests ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: ConnectionRequest[] }`
  
- `POST /api/network/connections/requests` - Send connection request ❌ NOT IMPLEMENTED
  - Request Body: `{ userId: string, purpose: string, message: string }`
  
- `POST /api/network/connections/requests/:id/accept` - Accept request ❌ NOT IMPLEMENTED
  
- `POST /api/network/connections/requests/:id/decline` - Decline request ❌ NOT IMPLEMENTED

**Components Involved:**
- `MyNetwork.tsx` - Network page (1,473 lines)
- `UserProfileModal.tsx` - User profile modal
- `AlmaMaterConnection.tsx` - Alma mater connections
- `FindAlumni.tsx` - Find alumni feature

**Status:** ❌ Not Implemented

---

### 2.10 Admin Flow

**Flow:** Admin Dashboard → Users/Stats/Reports → Manage

**User Actions:**
1. Admin user accesses Admin Dashboard
2. Frontend fetches:
   - Users list
   - System statistics
   - Reports
3. Admin can:
   - View user details
   - Ban/suspend users
   - View system stats
   - Manage reports

**Backend Dependencies:**
- `GET /api/users` - List users (admin) ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: User[] }`
  
- `GET /api/admin/stats` - Get admin statistics ❌ NOT IMPLEMENTED
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "totalUsers": number,
        "activeUsers": number,
        "newUsersToday": number,
        "totalProjects": number,
        "totalOpportunities": number,
        "totalMentorships": number,
        "systemHealth": "string",
        "uptime": "string",
        "responseTime": "string",
        "...": "other stats"
      }
    }
    ```
  
- `GET /api/admin/reports` - Get reports ❌ NOT IMPLEMENTED
  - Response: `{ success: true, data: Report[] }`
  
- `POST /api/admin/users/:id/:action` - User action (ban, suspend) ❌ NOT IMPLEMENTED
- `POST /api/admin/users/bulk/:action` - Bulk user action ❌ NOT IMPLEMENTED
- `POST /api/admin/reports/:id/:action` - Report action ❌ NOT IMPLEMENTED

**Components Involved:**
- `AdminDashboard.tsx` - Admin dashboard (1,004 lines)
- `AdminConsole.tsx` - Admin console
- `AdminFeedManager.tsx` - Feed management

**Status:** ❌ Not Implemented

---

## 3. Component Dependencies & API Calls

### 3.1 Core Components

**Layout.tsx**
- Role: Main application container
- Navigation routing
- Event handling (`refreshFeed`, `refreshProjects`)
- Project creation orchestration

**Dashboard.tsx** (2,224 lines)
- Role: Main dashboard with Impact Feed
- API Calls:
  - `GET /api/feed?page=1&limit=20&realtime=true`
  - `GET /api/feed/stream` (SSE)
  - `POST /api/feed/activity`
- Features:
  - Feed display with pagination
  - Real-time updates via SSE
  - Social interactions (like, comment, share)
  - Statistics cards

**Sidebar.tsx**
- Role: Navigation sidebar
- No direct API calls
- Navigation routing only

### 3.2 Project Components

**CreateProject.tsx** (1,397 lines)
- Role: Project creation form
- API Calls:
  - `POST /api/projects`
- Features:
  - Multi-step form
  - Team member management
  - Diaspora position configuration
  - Objectives input (string, not array!)

**MyProjects.tsx** (863 lines)
- Role: User's projects list
- API Calls:
  - `GET /api/projects?mine=true`
  - `GET /api/projects/updates?mine=true` ❌ NOT IMPLEMENTED
- Features:
  - Project list with filters
  - Project updates display
  - Auto-refresh every 30 seconds
  - Event listener for `refreshProjects`

**ProjectDetail.tsx** (2,123 lines)
- Role: Project detail view
- API Calls:
  - `GET /api/projects/:id`
- Features:
  - Project information display
  - Team members list
  - Diaspora positions
  - Join project flow
  - Task/milestone preview

**ProjectWorkspace.tsx**
- Role: Project workspace container
- API Calls:
  - Workspace-specific tools (tasks, research, etc.)
- Features:
  - Tabbed workspace interface
  - Integration with workspace tools

### 3.3 Workspace Components

**TaskManager.tsx**
- Role: Task management
- API Calls:
  - `GET /api/tasks`
  - `POST /api/tasks` (protected)
  - `PUT /api/tasks/:id` (protected)
  - `DELETE /api/tasks/:id` (protected)
- Status: ⚠️ Mock data (not database-integrated)

**ResearchTools.tsx**
- Role: Research source/note management
- API Calls:
  - `GET /api/research/sources` ❌ NOT IMPLEMENTED
  - `POST /api/research/sources` ❌ NOT IMPLEMENTED
  - `GET /api/research/notes` ❌ NOT IMPLEMENTED
  - `POST /api/research/notes` ❌ NOT IMPLEMENTED
  - `GET /api/research/datasets` ❌ NOT IMPLEMENTED
- Features:
  - Research source management
  - Note taking
  - Dataset tracking

**LiveSession.tsx**
- Role: Live event sessions
- API Calls:
  - `GET /api/live/events` ❌ NOT IMPLEMENTED
  - `GET /api/live/events/:id/chat` ❌ NOT IMPLEMENTED
  - `POST /api/live/events/:id/chat` ❌ NOT IMPLEMENTED
- Features:
  - Live event display
  - Chat functionality
  - Video/audio integration

**LearningVault.tsx**
- Role: Learning content management
- API Calls:
  - `GET /api/learning/recordings` ❌ NOT IMPLEMENTED
  - `GET /api/learning/content` ❌ NOT IMPLEMENTED

**DeliverableSubmissions.tsx**
- Role: Deliverable submission tracking
- API Calls:
  - `GET /api/deliverables` ❌ NOT IMPLEMENTED
  - Auto-refresh every 30 seconds

**SessionBoard.tsx**
- Role: Session management
- API Calls:
  - `GET /api/sessions` (stub)
  - `PUT /api/sessions/:id` ❌ NOT IMPLEMENTED
  - `DELETE /api/sessions/:id` ❌ NOT IMPLEMENTED

### 3.4 Social Components

**NotificationsPage.tsx** (895 lines)
- Role: Notifications management
- API Calls:
  - `GET /api/notifications?filter=...` ❌ NOT IMPLEMENTED
  - `PUT /api/notifications/:id/read` ❌ NOT IMPLEMENTED
  - `PUT /api/notifications/mark-all-read` ❌ NOT IMPLEMENTED
  - `DELETE /api/notifications/:id` ❌ NOT IMPLEMENTED

**MyNetwork.tsx** (1,473 lines)
- Role: Network management
- API Calls:
  - `GET /api/network/discovery` ❌ NOT IMPLEMENTED
  - `GET /api/network/connections` ❌ NOT IMPLEMENTED
  - `GET /api/network/connections/requests` ❌ NOT IMPLEMENTED
  - `POST /api/network/connections/requests` ❌ NOT IMPLEMENTED
  - `POST /api/network/connections/requests/:id/accept` ❌ NOT IMPLEMENTED
  - `POST /api/network/connections/requests/:id/decline` ❌ NOT IMPLEMENTED

### 3.5 Feature Components

**OpportunitiesPage.tsx** (919 lines)
- Role: Opportunities browsing
- API Calls:
  - `GET /api/opportunities?type=...&q=...&location=...&remote=...&experience=...` ❌ NOT IMPLEMENTED

**CreditsPage.tsx** (1,243 lines)
- Role: Credits and rewards
- API Calls:
  - `GET /api/credits/overview` ❌ NOT IMPLEMENTED
  - `GET /api/credits/badges` ❌ NOT IMPLEMENTED
  - `GET /api/credits/leaderboard?timeframe=...` ❌ NOT IMPLEMENTED
  - `GET /api/credits/activities` ❌ NOT IMPLEMENTED

**AdminDashboard.tsx** (1,004 lines)
- Role: Admin dashboard
- API Calls:
  - `GET /api/users` ❌ NOT IMPLEMENTED
  - `GET /api/admin/stats` ❌ NOT IMPLEMENTED
  - `GET /api/admin/reports` ❌ NOT IMPLEMENTED
  - `POST /api/admin/users/:id/:action` ❌ NOT IMPLEMENTED
  - `POST /api/admin/users/bulk/:action` ❌ NOT IMPLEMENTED
  - `POST /api/admin/reports/:id/:action` ❌ NOT IMPLEMENTED

---

## 4. Real-time Features

### 4.1 Server-Sent Events (SSE)

**Endpoint:** `GET /api/feed/stream`

**Implementation:**
- Frontend creates `EventSource` connection
- Token passed as query parameter (EventSource limitation: no headers)
- Backend sends heartbeat every 20 seconds
- Frontend handles message types: `connected`, `welcome`, `ping`, `message`
- Frontend auto-reconnects on error after 5 seconds

**Component:** `FeedService.tsx` → `createRealtimeConnection()`

**Status:** ✅ Implemented

### 4.2 Activity Tracking

**Endpoint:** `POST /api/feed/activity`

**Usage:**
- Tracks user interactions (like, comment, share, project creation)
- Optional authentication (works for anonymous users too)
- Used throughout application for analytics

**Component:** `FeedService.tsx` → `trackUserActivity()`

**Status:** ✅ Implemented

---

## 5. Authentication & Authorization

### 5.1 Token Storage

- **Location:** `localStorage`
- **Keys:** `token`, `user`
- **Format:** JWT token string, User JSON object

### 5.2 Token Usage

- **Header:** `Authorization: Bearer <token>`
- **Exception:** SSE stream (token in query param)
- **Dev Key:** Optional header `X-Dev-Key: <devKey>`

### 5.3 Error Handling

**401 Unauthorized:**
- Frontend clears `localStorage`
- Shows toast: "Session expired. Please log in again."
- Redirects to `/login` after 2 seconds
- Error codes handled: `TOKEN_EXPIRED`, `INVALID_TOKEN`, `NO_TOKEN`

**Implementation:** `apiClient-v2.ts` → Response interceptor

---

## 6. Data Transformation & Normalization

### 6.1 Feed Items

**Frontend Expects:**
```typescript
{
  authorName: string,
  authorAvatar: string,
  authorId: string
}
```

**Backend May Return:**
```typescript
{
  author: {
    name: string,
    avatar: string,
    id: string
  }
}
```

**Transformation:** `FeedService.tsx` normalizes structure:
```typescript
authorName: item.authorName || item.author?.name || 'Unknown User'
```

### 6.2 Projects List

**Frontend Handles:**
- `Array.isArray(projJson.data) ? projJson.data : Array.isArray(projJson) ? projJson : []`
- Supports both `{ data: [...] }` and `[...]` formats

### 6.3 Objectives Field

**CRITICAL:** Frontend sends `objectives` as **string**, not array!
- User input: Multi-line textarea
- Sent to backend: `"Objective 1\nObjective 2\nObjective 3"`
- Backend must accept string and parse if needed

---

## 7. Error Handling Patterns

### 7.1 API Error Responses

**Expected Format:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "message": "User-friendly message"
}
```

### 7.2 Error Codes Handled

- `TOKEN_EXPIRED` → "Session expired. Please log in again."
- `INVALID_TOKEN` → "Invalid session. Please log in again."
- `NO_TOKEN` → "Please log in to continue."
- `USER_NOT_FOUND` → Treated as `TOKEN_EXPIRED`
- `MISSING_REQUIRED_FIELDS` → Shows missing fields
- `INVALID_CREDENTIALS` → "Invalid email or password"

### 7.3 Error Display

- **Toast Notifications:** `sonner` toast library
- **Error States:** Loading/error states in components
- **Fallbacks:** Empty arrays for list endpoints, null for object endpoints

---

## 8. Special Features

### 8.1 Placeholder Images

**Endpoint:** `GET /api/placeholder/:width/:height`

**Usage:**
- Avatar placeholders
- Image placeholders
- Redirects to `https://placehold.co/${w}x${h}?text=+`

**Status:** ✅ Implemented

### 8.2 Health Checks

**Endpoints:**
- `GET /api/health` - Frontend health check
- `GET /healthz` - Render.com health check

**Status:** ✅ Implemented

### 8.3 Ping Endpoint

**Endpoint:** `GET /api/ping`

**Usage:** Prevents Render.com cold starts

**Status:** ✅ Implemented

---

## 9. Mobile Considerations

### 9.1 Mobile Components

- `MobileNavigation.tsx`
- `MobileBottomNav.tsx`
- `MobileViewport.tsx`
- `MobileCard.tsx`

### 9.2 Responsive Patterns

- Conditional rendering based on `useMobile()` hook
- Mobile-specific layouts
- Touch-optimized interactions

---

## 10. Environment Configuration

### 10.1 API Base URL

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';
```

### 10.2 Build-time Variables

- `VITE_API_URL` - Set at build time (not runtime)
- Frontend must rebuild if API URL changes

---

**End of Frontend Feature Map**

