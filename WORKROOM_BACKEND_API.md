# Workroom Backend API Documentation

## Overview

This document describes all the backend APIs for the workroom tabs. All endpoints are prefixed with `/api/workspace/:projectId` and require authentication.

## Base URL
```
/api/workspace/:projectId
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Session Board

### Get Sessions
```
GET /api/workspace/:projectId/sessions
```
Returns all sessions for a project.

### Get Session by ID
```
GET /api/workspace/:projectId/sessions/:sessionId
```
Returns a specific session.

### Create Session
```
POST /api/workspace/:projectId/sessions
```
**Body:**
```json
{
  "title": "AI/ML Career Path Discussion",
  "description": "Discuss career opportunities",
  "scheduledDate": "2024-02-15",
  "scheduledTime": "14:00",
  "duration": 60,
  "type": "video",
  "location": "Online",
  "agenda": ["Review skills", "Explore paths"],
  "isPublic": false,
  "tags": ["career", "ai-ml"],
  "maxParticipants": 10
}
```

### Update Session
```
PUT /api/workspace/:projectId/sessions/:sessionId
```

### Delete Session
```
DELETE /api/workspace/:projectId/sessions/:sessionId
```

---

## 2. Task Manager

### Get Tasks
```
GET /api/workspace/:projectId/tasks
```

### Create Task
```
POST /api/workspace/:projectId/tasks
```
**Body:**
```json
{
  "title": "Complete feature engineering",
  "description": "Finish feature engineering for ML project",
  "status": "todo",
  "priority": "high",
  "assignee": "user-name",
  "dueDate": "2024-02-20",
  "tags": ["machine-learning", "python"]
}
```

### Update Task
```
PUT /api/workspace/:projectId/tasks/:taskId
```

### Delete Task
```
DELETE /api/workspace/:projectId/tasks/:taskId
```

### Add Comment to Task
```
POST /api/workspace/:projectId/tasks/:taskId/comments
```
**Body:**
```json
{
  "content": "Great progress on this task!"
}
```

---

## 3. Voice & Chat

### Get Voice Notes
```
GET /api/workspace/:projectId/voice-notes
```

### Create Voice Note
```
POST /api/workspace/:projectId/voice-notes
```
**Body:**
```json
{
  "title": "Voice message about feature engineering",
  "duration": 120,
  "url": "https://example.com/voice.mp3",
  "tags": ["discussion"],
  "transcript": "Optional transcript text"
}
```

---

## 4. Learning Vault

### Get Learning Content
```
GET /api/workspace/:projectId/learning-content
```

### Create Learning Content
```
POST /api/workspace/:projectId/learning-content
```
**Body:**
```json
{
  "title": "Introduction to Feature Engineering",
  "description": "Comprehensive guide",
  "type": "video",
  "category": "skills",
  "duration": 1245,
  "url": "https://example.com/video.mp4",
  "tags": ["machine-learning", "python"]
}
```

### Update Learning Content
```
PUT /api/workspace/:projectId/learning-content/:contentId
```

### Get Recordings
```
GET /api/workspace/:projectId/recordings
```

### Create Recording
```
POST /api/workspace/:projectId/recordings
```
**Body:**
```json
{
  "title": "Screen recording",
  "description": "Recording of session",
  "duration": 3600,
  "url": "https://example.com/recording.mp4",
  "type": "both",
  "size": 10485760
}
```

---

## 5. Deliverables

### Get Deliverables
```
GET /api/workspace/:projectId/deliverables
```

### Create Deliverable
```
POST /api/workspace/:projectId/deliverables
```
**Body:**
```json
{
  "title": "Machine Learning Project Report",
  "description": "Final report",
  "fileName": "ml_report.pdf",
  "fileSize": 2456789,
  "fileUrl": "https://example.com/report.pdf"
}
```

### Update Deliverable (Review/Feedback)
```
PUT /api/workspace/:projectId/deliverables/:deliverableId
```
**Body:**
```json
{
  "status": "approved",
  "feedback": "Excellent work!"
}
```

---

## 6. Certificates

### Get Certificates
```
GET /api/workspace/:projectId/certificates
```

### Create Certificate
```
POST /api/workspace/:projectId/certificates
```
**Body:**
```json
{
  "title": "Machine Learning Fundamentals",
  "type": "completion",
  "requiredSessions": 10,
  "requiredTasks": 8,
  "issuedTo": "user-id"
}
```

### Update Certificate
```
PUT /api/workspace/:projectId/certificates/:certificateId
```

---

## 7. Live Sessions

### Get Live Sessions
```
GET /api/workspace/:projectId/live-sessions
```

### Create Live Session
```
POST /api/workspace/:projectId/live-sessions
```
**Body:**
```json
{
  "title": "Live Coding Session",
  "description": "Real-time coding workshop",
  "isHost": true
}
```

### Update Live Session
```
PUT /api/workspace/:projectId/live-sessions/:sessionId
```

---

## 8. Research Tools

### Research Sources

#### Get Research Sources
```
GET /api/workspace/:projectId/research-sources
```

#### Create Research Source
```
POST /api/workspace/:projectId/research-sources
```
**Body:**
```json
{
  "title": "Machine Learning in Healthcare",
  "authors": ["Dr. Smith", "Dr. Jones"],
  "year": 2023,
  "type": "journal",
  "url": "https://example.com/paper",
  "abstract": "Paper abstract...",
  "keywords": ["ml", "healthcare"],
  "relevance": 85
}
```

#### Update Research Source
```
PUT /api/workspace/:projectId/research-sources/:sourceId
```

#### Delete Research Source
```
DELETE /api/workspace/:projectId/research-sources/:sourceId
```

### Research Notes

#### Get Research Notes
```
GET /api/workspace/:projectId/research-notes
```

#### Create Research Note
```
POST /api/workspace/:projectId/research-notes
```
**Body:**
```json
{
  "title": "Key findings",
  "content": "Notes content...",
  "tags": ["findings"],
  "category": "observation",
  "sourceId": "source-id",
  "shared": false
}
```

#### Update Research Note
```
PUT /api/workspace/:projectId/research-notes/:noteId
```

### Data Sets

#### Get Data Sets
```
GET /api/workspace/:projectId/data-sets
```

#### Create Data Set
```
POST /api/workspace/:projectId/data-sets
```
**Body:**
```json
{
  "name": "Survey Data 2024",
  "description": "Community survey results",
  "type": "survey",
  "size": 1048576,
  "format": "CSV",
  "tags": ["survey", "community"],
  "public": false,
  "url": "https://example.com/data.csv"
}
```

---

## 9. Community Tools

### Stakeholders

#### Get Stakeholders
```
GET /api/workspace/:projectId/stakeholders
```

#### Create Stakeholder
```
POST /api/workspace/:projectId/stakeholders
```
**Body:**
```json
{
  "name": "Dr. Amara Okafor",
  "organization": "Lagos Community Health Center",
  "role": "Medical Director",
  "type": "community-leader",
  "contactInfo": {
    "email": "amara@example.com",
    "phone": "+234-801-234-5678"
  },
  "influence": 85,
  "interest": 90,
  "engagement": "high"
}
```

#### Update Stakeholder
```
PUT /api/workspace/:projectId/stakeholders/:stakeholderId
```

### Impact Stories

#### Get Impact Stories
```
GET /api/workspace/:projectId/impact-stories
```

#### Create Impact Story
```
POST /api/workspace/:projectId/impact-stories
```
**Body:**
```json
{
  "title": "Community Health Initiative Success",
  "description": "Story description...",
  "category": "health",
  "location": "Lagos, Nigeria",
  "beneficiaries": 500,
  "metrics": {
    "reach": 1000,
    "satisfaction": 95,
    "sustainability": 80
  },
  "tags": ["health", "community"]
}
```

### Community Events

#### Get Community Events
```
GET /api/workspace/:projectId/community-events
```

#### Create Community Event
```
POST /api/workspace/:projectId/community-events
```
**Body:**
```json
{
  "title": "Health Workshop",
  "description": "Community health workshop",
  "type": "workshop",
  "date": "2024-03-15",
  "time": "10:00",
  "location": "Community Center",
  "maxAttendees": 50,
  "requirements": ["Registration required"]
}
```

---

## 10. Innovation Hub / ForgeLab

### Ideas

#### Get Ideas
```
GET /api/workspace/:projectId/ideas
```

#### Create Idea
```
POST /api/workspace/:projectId/ideas
```
**Body:**
```json
{
  "title": "AI-Powered Education Platform",
  "description": "Innovative idea description...",
  "category": "product",
  "tags": ["ai", "education"],
  "feasibility": 75,
  "impact": 90,
  "effort": 60
}
```

#### Update Idea
```
PUT /api/workspace/:projectId/ideas/:ideaId
```

### Co-Creation Rooms

#### Get Co-Creation Rooms
```
GET /api/workspace/:projectId/co-creation-rooms
```

#### Create Co-Creation Room
```
POST /api/workspace/:projectId/co-creation-rooms
```
**Body:**
```json
{
  "name": "Design Room",
  "description": "Room for design collaboration",
  "type": "design"
}
```

### Project Workspaces

#### Get Project Workspaces
```
GET /api/workspace/:projectId/workspaces
```

#### Create Project Workspace
```
POST /api/workspace/:projectId/workspaces
```
**Body:**
```json
{
  "name": "Development Workspace",
  "description": "Main development workspace"
}
```

### Build Tools

#### Get Build Tools
```
GET /api/workspace/:projectId/build-tools
```

#### Create Build Tool
```
POST /api/workspace/:projectId/build-tools
```
**Body:**
```json
{
  "name": "Code Editor",
  "type": "code-editor",
  "config": {
    "theme": "dark",
    "language": "typescript"
  }
}
```

---

## Production-Ready Features

All endpoints include:

1. **Authentication & Authorization**: All routes require authentication and check project ownership where applicable
2. **Error Handling**: Comprehensive try-catch blocks with meaningful error messages
3. **Validation**: Type checking and required field validation
4. **Data Integrity**: Project ID validation, user existence checks
5. **Timestamps**: Automatic createdAt and updatedAt management
6. **Status Management**: Automatic status transitions (e.g., task completion dates, session status)
7. **Resource Ownership**: Authorization checks for delete/update operations

---

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "projectId": "project-id",
  // ... resource data
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

