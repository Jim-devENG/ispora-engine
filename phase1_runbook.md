# Phase 1 Runbook: Critical Fixes Implementation

**Date:** 2025-01-31  
**Implementation:** Phase 1 Critical Fixes  
**Stack:** Node.js 18+ / 20+ with Express and Mongoose  
**Database:** MongoDB (Mongoose) + SQLite/PostgreSQL (Knex.js - existing)

---

## Overview

This runbook provides step-by-step instructions to set up, run, and test the Phase 1 implementation which includes:

1. **Objectives Normalization** - Frontend sends `objectives` as string, normalized to array for storage
2. **GET /api/projects/updates?mine=true** - Protected endpoint returning updates for user's projects
3. **Tasks Integration** - Tasks integrated with MongoDB (create, read, update status)

**Note:** Phase 1 uses MongoDB (Mongoose) while existing routes use SQLite/PostgreSQL (Knex.js). Both systems can run in parallel.

---

## Prerequisites

- **Node.js:** 18.x or 20.x
- **npm:** >= 8.0.0
- **MongoDB:** 4.4+ (for Phase 1 routes) - optional, server will start without it
- **PostgreSQL/SQLite:** For existing Knex.js routes

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `compression` - Response compression
- `cookie-parser` - Cookie parsing
- `jest` + `supertest` - Testing

### 2. Set Environment Variables

Create a `.env` file in the project root:

```bash
# Copy example file
cp .env.example .env
```

**Required Environment Variables:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# MongoDB Configuration (REQUIRED for Phase 1 routes)
MONGO_URI=mongodb://localhost:27017/ispora
# OR
MONGODB_URI=mongodb://localhost:27017/ispora

# Existing Database (SQLite/PostgreSQL) - Required for existing routes
DATABASE_URL=sqlite://data/dev.db
```

**Optional Environment Variables:**

```env
# Sentry (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Client URL (Optional)
CLIENT_URL=https://ispora.app

# Test Database (Optional)
MONGO_TEST_URI=mongodb://localhost:27017/ispora_test
```

---

## Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon (auto-restart on file changes).

**Expected Output:**

```
🚀 iSpora Backend Starting...
📅 Startup Time: 2025-01-31T12:00:00.000Z
🌍 Environment: development
🔧 Node Version: v20.x.x
📦 Port: 5000
🔍 Verifying database setup...
✅ Database connection successful
✅ Table 'users' exists
✅ Table 'projects' exists
🔗 Connecting to MongoDB for Phase 1 features...
✅ MongoDB connected successfully
✅ iSpora Backend Started Successfully!
🌐 Server running on port 5000
🏥 Health Check: http://localhost:5000/api/health
🏥 Render Health: http://localhost:5000/healthz
```

**Note:** If MongoDB is not configured, you'll see:
```
ℹ️  MongoDB not configured - Phase 1 Mongoose routes will not be available
   To enable Phase 1 features, set MONGO_URI or MONGODB_URI environment variable
```

The server will still start and existing Knex.js routes will work.

### Production Mode

```bash
npm start
```

---

## Testing

### Run All Tests

```bash
npm test
```

### Run Phase 1 Tests Only

```bash
# Test objectives normalization
npm test -- src/tests/projectsMongoose.test.js

# Test tasks integration
npm test -- src/tests/tasksMongoose.test.js
```

### Test Coverage

```bash
npm run test:coverage
```

**Expected Test Results:**

```
Phase 1: Projects API
  POST /api/v1/projects
    ✓ should create project with objectives as string (normalize to array)
    ✓ should create project with objectives as array (keep as array)
    ✓ should normalize objectives with comma-separated string
    ✓ should handle empty objectives string
    ✓ should require authentication
    ✓ should validate required fields

  GET /api/v1/projects/updates?mine=true
    ✓ should return updates for user projects only
    ✓ should return empty array if user has no projects
    ✓ should require authentication

Phase 1: Tasks API
  POST /api/v1/tasks
    ✓ should create task for user project
    ✓ should require authentication
    ✓ should validate required fields
    ✓ should verify project exists
    ✓ should prevent creating tasks for other users projects

  GET /api/v1/tasks/project/:projectId
    ✓ should get tasks for public project
    ✓ should require authentication for private projects

  PATCH /api/v1/tasks/:id/status
    ✓ should update task status
    ✓ should require authentication
    ✓ should validate status value
```

---

## API Endpoints

### Base URLs

- **Development:** `http://localhost:5000/api/v1`
- **Production:** `https://ispora-backend.onrender.com/api/v1`

### Phase 1 Endpoints

#### Authentication

**POST /api/v1/auth/register**
- Register a new user
- Returns JWT token

**POST /api/v1/auth/login**
- Login user
- Returns JWT token

#### Projects

**POST /api/v1/projects** (Protected)
- Create a new project
- **Phase 1 Fix:** Normalizes `objectives` from string to array

**GET /api/v1/projects**
- Get all public projects (paginated)

**GET /api/v1/projects/:id**
- Get project by ID

**GET /api/v1/projects/updates?mine=true** (Protected)
- **Phase 1 Fix:** Returns updates for user's projects only
- Requires authentication
- Query params: `mine=true`, `page`, `limit`

#### Tasks

**POST /api/v1/tasks** (Protected)
- **Phase 1 Fix:** Create task (integrated with MongoDB)
- Only project owner can create tasks

**GET /api/v1/tasks/project/:projectId**
- Get tasks for a project
- Public/protected based on project visibility

**PATCH /api/v1/tasks/:id/status** (Protected)
- Update task status
- Only project owner can update tasks

---

## Example API Calls

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "userType": "student"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "student"
    }
  }
}
```

### 2. Create Project with Objectives as String

```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Project",
    "description": "Project description",
    "objectives": "Objective 1\nObjective 2\nObjective 3",
    "type": "academic",
    "category": "Education"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "My Project",
    "description": "Project description",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "type": "academic",
    "category": "Education",
    "creator": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "createdAt": "2025-01-31T12:00:00.000Z"
  }
}
```

**🔑 Critical:** Notice `objectives` is returned as **array** even though it was sent as **string**.

### 3. Create Project with Objectives as Comma-Separated String

```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Project",
    "objectives": "Objective 1, Objective 2, Objective 3"
  }'
```

**Response:** Objectives normalized to array: `["Objective 1", "Objective 2", "Objective 3"]`

### 4. Get Project Updates (User's Projects Only)

```bash
curl -X GET "http://localhost:5000/api/v1/projects/updates?mine=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439013",
      "projectId": "507f1f77bcf86cd799439012",
      "project": {
        "id": "507f1f77bcf86cd799439012",
        "title": "My Project"
      },
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "email": "john@example.com",
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe"
      },
      "content": "Project milestone completed",
      "type": "update",
      "timestamp": "2025-01-31T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 5. Create Task

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation",
    "projectId": "507f1f77bcf86cd799439012",
    "status": "todo",
    "priority": "high"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation",
    "projectId": "507f1f77bcf86cd799439012",
    "status": "todo",
    "priority": "high",
    "createdAt": "2025-01-31T12:00:00.000Z"
  }
}
```

### 6. Update Task Status

```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/507f1f77bcf86cd799439014/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "done"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439014",
    "status": "done",
    "completedDate": "2025-01-31T12:00:00.000Z",
    "updatedAt": "2025-01-31T12:00:00.000Z"
  }
}
```

---

## Postman Collection

### Postman Sample Request

**Request:** POST /api/v1/projects

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (JSON):**
```json
{
  "title": "My Project",
  "description": "Project description",
  "objectives": "Objective 1\nObjective 2\nObjective 3",
  "type": "academic",
  "category": "Education"
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "title": "My Project",
    "description": "Project description",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "type": "academic",
    "category": "Education",
    "creator": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe"
    },
    "createdAt": "2025-01-31T12:00:00.000Z",
    "updatedAt": "2025-01-31T12:00:00.000Z"
  }
}
```

---

## Frontend Integration Notes

### Objectives Normalization

**Frontend Sends:**
```json
{
  "objectives": "Objective 1\nObjective 2\nObjective 3"
}
```

**Backend Stores:**
```javascript
{
  "objectives": ["Objective 1", "Objective 2", "Objective 3"]
}
```

**Frontend Receives:**
```json
{
  "objectives": ["Objective 1", "Objective 2", "Objective 3"]
}
```

**Normalization Rules:**
1. **String with newlines:** `"Obj1\nObj2"` → `["Obj1", "Obj2"]`
2. **String with commas:** `"Obj1, Obj2"` → `["Obj1", "Obj2"]`
3. **Array:** `["Obj1", "Obj2"]` → `["Obj1", "Obj2"]` (unchanged)
4. **Empty/null:** `""` or `null` → `[]`

### Project Updates Endpoint

**Frontend Request:**
```javascript
GET /api/v1/projects/updates?mine=true
Headers: Authorization: Bearer <token>
```

**Backend Response:**
```javascript
{
  success: true,
  data: [
    {
      id: "...",
      projectId: "...",
      project: { id: "...", title: "..." },
      author: { id: "...", name: "...", email: "..." },
      content: "...",
      timestamp: "..."
    }
  ],
  meta: { page: 1, limit: 20, total: 10, totalPages: 1 }
}
```

**Security:** Only returns updates for projects owned by authenticated user when `mine=true`.

### Tasks Integration

**Frontend Request:**
```javascript
POST /api/v1/tasks
Headers: Authorization: Bearer <token>
Body: {
  title: "...",
  projectId: "...",
  status: "todo"
}
```

**Backend Response:**
```javascript
{
  success: true,
  message: "Task created successfully",
  data: {
    id: "...",
    title: "...",
    projectId: "...",
    status: "todo",
    createdAt: "..."
  }
}
```

**Security:** Only project owner can create/update tasks.

---

## Testing by Frontend Team

### Priority 1: Test Objectives Normalization

**Test Cases:**
1. Send objectives as string (newline-separated) → Verify array returned
2. Send objectives as string (comma-separated) → Verify array returned
3. Send objectives as array → Verify array returned unchanged
4. Send empty string → Verify empty array returned
5. Send null → Verify empty array returned

**Endpoints to Test:**
- `POST /api/v1/projects` with various objectives formats

### Priority 2: Test Project Updates Endpoint

**Test Cases:**
1. Request with `mine=true` → Verify only user's project updates returned
2. Request with `mine=false` → Verify all public updates returned (if implemented)
3. Request without token → Verify 401 error
4. Request with invalid token → Verify 401 error

**Endpoints to Test:**
- `GET /api/v1/projects/updates?mine=true`

### Priority 3: Test Tasks Integration

**Test Cases:**
1. Create task for own project → Verify success
2. Create task for other user's project → Verify 403 error
3. Get tasks for public project → Verify success (no auth required)
4. Get tasks for private project → Verify 401 error
5. Update task status → Verify success
6. Update task status for other user's project → Verify 403 error

**Endpoints to Test:**
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/project/:projectId`
- `PATCH /api/v1/tasks/:id/status`

---

## Troubleshooting

### MongoDB Connection Failed

**Error:**
```
⚠️ MongoDB connection failed - Phase 1 routes will not be available
```

**Solution:**
1. Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
2. Check `MONGO_URI` or `MONGODB_URI` environment variable
3. Verify MongoDB connection string format: `mongodb://localhost:27017/ispora`

### Phase 1 Routes Return 404

**Cause:** MongoDB not configured or connection failed.

**Solution:**
1. Set `MONGO_URI` or `MONGODB_URI` environment variable
2. Ensure MongoDB is running
3. Restart server after setting environment variable

### Authentication Errors

**Error:** `401 Unauthorized - NO_TOKEN`

**Solution:**
1. Include `Authorization: Bearer <token>` header
2. Verify token is valid (not expired)
3. Login/register to get new token

**Error:** `401 Unauthorized - TOKEN_EXPIRED`

**Solution:**
1. Token has expired
2. Login again to get new token
3. Frontend should redirect to login page

### Objectives Not Normalized

**Symptom:** Objectives stored as string instead of array.

**Solution:**
1. Verify using `/api/v1/projects` endpoint (not `/api/projects`)
2. Check Project model pre-save hook is working
3. Verify objectives field in request body

---

## Architecture Notes

### Dual Database System

Phase 1 uses **MongoDB (Mongoose)** while existing routes use **SQLite/PostgreSQL (Knex.js)**.

**Route Prefixes:**
- **Existing routes:** `/api/auth`, `/api/projects`, `/api/tasks`
- **Phase 1 routes:** `/api/v1/auth`, `/api/v1/projects`, `/api/v1/tasks`

**Database Access:**
- **Knex.js routes:** Access SQLite/PostgreSQL
- **Mongoose routes:** Access MongoDB

**Benefits:**
- Can run both systems in parallel
- Existing functionality unaffected
- Gradual migration path
- Can disable MongoDB if not needed

### Models Location

**Mongoose Models:**
- `src/models/User.js`
- `src/models/Project.js`
- `src/models/ProjectUpdate.js`
- `src/models/Task.js`

**Routes Location:**
- `src/routes/authMongoose.js`
- `src/routes/projectsMongoose.js`
- `src/routes/tasksMongoose.js`

**Controllers Location:**
- `src/controllers/projectsMongoose.js`
- `src/controllers/tasksMongoose.js`

---

## Next Steps

1. **Frontend Integration:** Update frontend to use `/api/v1/*` endpoints
2. **Testing:** Run frontend tests against Phase 1 endpoints
3. **Monitoring:** Monitor MongoDB connection and Phase 1 route usage
4. **Migration:** Plan gradual migration from Knex.js to Mongoose (future phases)

---

**End of Runbook**

