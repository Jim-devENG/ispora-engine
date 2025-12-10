# Workroom Setup & Dependencies

## Overview
This document outlines all the workroom functionalities, their dependencies, and how to verify they're working correctly.

## Workroom Tabs & Their Backend Dependencies

### 1. Session Board (`SessionBoard.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/sessions` - Get all sessions
  - `GET /api/workspace/:projectId/sessions/:sessionId` - Get specific session
  - `POST /api/workspace/:projectId/sessions` - Create session
  - `PUT /api/workspace/:projectId/sessions/:sessionId` - Update session
  - `DELETE /api/workspace/:projectId/sessions/:sessionId` - Delete session
- **Database Methods:** `getSessions()`, `createSession()`, `updateSession()`, `deleteSession()`
- **Dependencies:** None

### 2. Task Manager (`TaskManager.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/tasks` - Get all tasks
  - `POST /api/workspace/:projectId/tasks` - Create task
  - `PUT /api/workspace/:projectId/tasks/:taskId` - Update task
  - `DELETE /api/workspace/:projectId/tasks/:taskId` - Delete task
  - `POST /api/workspace/:projectId/tasks/:taskId/comments` - Add comment
  - `GET /api/workspace/:projectId/members` - Get project members
- **Database Methods:** `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `getMembers()`
- **Dependencies:** Project members API

### 3. Voice & Chat (`VoiceChat.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/messages` - Get messages
  - `POST /api/workspace/:projectId/messages` - Send message
  - `GET /api/workspace/:projectId/voice-notes` - Get voice notes
  - `POST /api/workspace/:projectId/voice-notes` - Create voice note
- **Database Methods:** `getMessages()`, `sendMessage()`, `getVoiceNotes()`, `createVoiceNote()`
- **Dependencies:** None

### 4. Learning Vault (`LearningVault.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/learning-content` - Get learning content
  - `POST /api/workspace/:projectId/learning-content` - Create learning content
  - `PUT /api/workspace/:projectId/learning-content/:contentId` - Update learning content
  - `GET /api/workspace/:projectId/recordings` - Get recordings
  - `POST /api/workspace/:projectId/recordings` - Create recording
- **Database Methods:** `getLearningContent()`, `createLearningContent()`, `updateLearningContent()`, `getRecordings()`, `createRecording()`
- **Dependencies:** None

### 5. Deliverables (`DeliverableSubmissions.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/deliverables` - Get deliverables
  - `POST /api/workspace/:projectId/deliverables` - Create deliverable
  - `PUT /api/workspace/:projectId/deliverables/:deliverableId` - Update deliverable
- **Database Methods:** `getDeliverables()`, `createDeliverable()`, `updateDeliverable()`
- **Dependencies:** None

### 6. Certificates (`CertificateManager.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/certificates` - Get certificates
  - `POST /api/workspace/:projectId/certificates` - Create certificate
  - `PUT /api/workspace/:projectId/certificates/:certificateId` - Update certificate
- **Database Methods:** `getCertificates()`, `createCertificate()`, `updateCertificate()`
- **Dependencies:** Sessions and Tasks APIs (for progress calculation)

### 7. Live Session (`LiveSession.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/live-sessions` - Get live sessions
  - `POST /api/workspace/:projectId/live-sessions` - Create/join live session
  - `PUT /api/workspace/:projectId/live-sessions/:sessionId` - Update live session
  - `GET /api/workspace/:projectId/messages` - Get chat messages
  - `POST /api/workspace/:projectId/messages` - Send chat message
  - `GET /api/workspace/:projectId/members` - Get participants
- **Database Methods:** `getLiveSessions()`, `createLiveSession()`, `updateLiveSession()`, `getMessages()`, `sendMessage()`, `getMembers()`
- **Dependencies:** Messages and Members APIs

### 8. Research Tools (`ResearchTools.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/research-sources` - Get research sources
  - `POST /api/workspace/:projectId/research-sources` - Create research source
  - `PUT /api/workspace/:projectId/research-sources/:sourceId` - Update research source
  - `DELETE /api/workspace/:projectId/research-sources/:sourceId` - Delete research source
  - `GET /api/workspace/:projectId/research-notes` - Get research notes
  - `POST /api/workspace/:projectId/research-notes` - Create research note
  - `PUT /api/workspace/:projectId/research-notes/:noteId` - Update research note
  - `GET /api/workspace/:projectId/data-sets` - Get data sets
  - `POST /api/workspace/:projectId/data-sets` - Create data set
- **Database Methods:** `getResearchSources()`, `createResearchSource()`, `updateResearchSource()`, `deleteResearchSource()`, `getResearchNotes()`, `createResearchNote()`, `updateResearchNote()`, `getDataSets()`, `createDataSet()`
- **Dependencies:** None

### 9. Innovation Hub / ForgeLab (`ForgeLab.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/ideas` - Get ideas
  - `POST /api/workspace/:projectId/ideas` - Create idea
  - `PUT /api/workspace/:projectId/ideas/:ideaId` - Update idea
  - `GET /api/workspace/:projectId/co-creation-rooms` - Get co-creation rooms
  - `POST /api/workspace/:projectId/co-creation-rooms` - Create co-creation room
  - `GET /api/workspace/:projectId/workspaces` - Get project workspaces
  - `POST /api/workspace/:projectId/workspaces` - Create project workspace
  - `GET /api/workspace/:projectId/build-tools` - Get build tools
  - `POST /api/workspace/:projectId/build-tools` - Create build tool
- **Database Methods:** `getIdeas()`, `createIdea()`, `updateIdea()`, `getCoCreationRooms()`, `createCoCreationRoom()`, `getProjectWorkspaces()`, `createProjectWorkspace()`, `getBuildTools()`, `createBuildTool()`
- **Dependencies:** None

### 10. Community Tools (`CommunityTools.tsx`)
- **Backend Routes:**
  - `GET /api/workspace/:projectId/stakeholders` - Get stakeholders
  - `POST /api/workspace/:projectId/stakeholders` - Create stakeholder
  - `PUT /api/workspace/:projectId/stakeholders/:stakeholderId` - Update stakeholder
  - `GET /api/workspace/:projectId/impact-stories` - Get impact stories
  - `POST /api/workspace/:projectId/impact-stories` - Create impact story
  - `GET /api/workspace/:projectId/community-events` - Get community events
  - `POST /api/workspace/:projectId/community-events` - Create community event
- **Database Methods:** `getStakeholders()`, `createStakeholder()`, `updateStakeholder()`, `getImpactStories()`, `createImpactStory()`, `getCommunityEvents()`, `createCommunityEvent()`
- **Dependencies:** None

## Common Dependencies

### Authentication
All workspace routes require authentication via JWT token in the `Authorization: Bearer <token>` header.

### Project ID
All routes require a valid `projectId` parameter. The project must exist in the database.

### Database Collections
All workspace entities are stored in the following database collections:
- `sessions`
- `tasks`
- `milestones`
- `messages`
- `voiceNotes`
- `learningContent`
- `recordings`
- `deliverables`
- `certificates`
- `liveSessions`
- `researchSources`
- `researchNotes`
- `dataSets`
- `stakeholders`
- `impactStories`
- `communityEvents`
- `ideas`
- `coCreationRooms`
- `projectWorkspaces`
- `buildTools`

## Troubleshooting 404 Errors

### Step 1: Verify Backend Server is Running
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Step 2: Test Workspace Routes are Loaded
```bash
curl http://localhost:3001/api/workspace/test
```
Should return: `{"message":"Workspace routes are working!","timestamp":"..."}`

### Step 3: Check Backend Logs
When the server starts, you should see:
- `✅ Workspace routes module loaded`
- `✅ Workspace routes registered at /api/workspace`

### Step 4: Verify Authentication
All workspace routes require authentication. Make sure:
1. User is logged in (token exists in localStorage)
2. Token is valid and not expired
3. Token is being sent in the `Authorization` header

### Step 5: Check Route Matching
The frontend calls: `/api/workspace/:projectId/voice-notes`
The backend route is: `/:projectId/voice-notes` (mounted at `/api/workspace`)

So the full path should match: `/api/workspace/:projectId/voice-notes`

### Step 6: Restart Backend Server
If routes aren't working:
1. Stop the backend server (Ctrl+C)
2. Restart it: `cd backend && npm run dev`
3. Check the console for the loading messages

## Expected Behavior

### Empty State
When there's no data, routes should return empty arrays `[]`, not 404 errors.

### Error Responses
- **401 Unauthorized:** Missing or invalid authentication token
- **404 Not Found:** Route doesn't exist (shouldn't happen if routes are loaded)
- **500 Internal Server Error:** Database or server error

## Next Steps

1. **Restart Backend Server:** Ensure it's running the latest code
2. **Check Console Logs:** Look for the workspace route loading messages
3. **Test Test Route:** Call `/api/workspace/test` to verify routes are loaded
4. **Check Authentication:** Verify token is being sent correctly
5. **Check Project ID:** Ensure the project ID exists in the database

