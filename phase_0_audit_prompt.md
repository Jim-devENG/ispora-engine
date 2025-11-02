# Phase 0 Audit Prompt - Backend Rebuild Planning

**Purpose:** This prompt should be used when starting the Phase 0 backend rebuild to ensure all frontend expectations are met.

---

## 📋 Context

You are starting a **Phase 0 backend rebuild** for the iSpora application. The frontend is already built and deployed at `https://ispora.app`. The backend is partially implemented and deployed at `https://ispora-backend.onrender.com`.

**Critical:** The frontend expects **60+ API endpoints**, but the backend currently implements **only 25 endpoints**. Many features in the frontend are placeholder UI waiting for backend implementation.

---

## 🎯 Objective

Rebuild the backend **function by function** to match frontend expectations without breaking existing functionality or losing data flow logic.

---

## 📚 Required Reading

Before starting, read these diagnostic artifacts:

1. **`diagnostic_checklist.md`** - Complete diagnostic checklist
2. **`network_endpoints.json`** - All endpoints with implementation status
3. **`env_diagnostic_summary.md`** - Full system architecture and expectations

---

## 🔍 Phase 0 Audit Tasks

### Task 1: Verify Current State

**Actions:**
1. Test all **implemented endpoints** (25 endpoints) using the frontend
2. Verify authentication flow works end-to-end
3. Confirm project creation → feed update flow works
4. Check SSE stream connection stability
5. Verify all error responses match frontend expectations

**Deliverable:** Status report of all 25 implemented endpoints (✅ Working / ❌ Broken)

---

### Task 2: Identify Missing Endpoints

**Actions:**
1. Compare `network_endpoints.json` with current backend routes
2. List all **not_implemented** endpoints that frontend expects
3. Prioritize missing endpoints by:
   - **Priority 1:** Critical for core functionality (Projects Updates, Notifications)
   - **Priority 2:** Important features (Opportunities, Credits, Network)
   - **Priority 3:** Nice-to-have features (Admin, Research, Live Events)

**Deliverable:** Prioritized list of 35+ missing endpoints with frontend usage locations

---

### Task 3: Database Schema Audit

**Actions:**
1. Review current database schema (Users, Projects, Feed Entries, Sessions)
2. Identify missing tables needed for:
   - Notifications
   - Opportunities
   - Credits/Badges
   - Network connections
   - Admin data
   - Research tools
   - Live events
   - Learning content
   - Deliverables

3. Design database schema for missing features
4. Plan migrations for new tables

**Deliverable:** Database schema design document with migration plan

---

### Task 4: Request/Response Structure Verification

**Actions:**
1. For each implemented endpoint, verify request/response structure matches frontend expectations
2. Identify any discrepancies in:
   - Field names (e.g., `first_name` vs `firstName`)
   - Data types (e.g., `objectives` as string vs array)
   - Nested structures (e.g., `author.name` vs `authorName`)
   - Error response formats

3. Document all discrepancies

**Deliverable:** Request/response structure alignment report

---

### Task 5: Authentication & Authorization Audit

**Actions:**
1. Verify JWT token flow works correctly
2. Check all protected routes use `authenticateToken` middleware
3. Verify error codes match frontend expectations:
   - `TOKEN_EXPIRED`
   - `INVALID_TOKEN`
   - `NO_TOKEN`
   - `USER_NOT_FOUND` (should return `TOKEN_EXPIRED`)

4. Test token refresh endpoint
5. Verify CORS configuration allows frontend origin

**Deliverable:** Authentication flow verification report

---

### Task 6: Real-time Features Audit

**Actions:**
1. Test SSE stream connection (`/api/feed/stream`)
2. Verify heartbeat messages sent every 20 seconds
3. Check connection reconnection logic
4. Verify message types handled correctly (`connected`, `welcome`, `ping`, `message`)
5. Test CORS headers for SSE endpoint

**Deliverable:** SSE connection stability report

---

### Task 7: Error Handling Audit

**Actions:**
1. For each endpoint, verify error responses match frontend expectations:
   - 400 Bad Request → `{ success: false, error: "...", code: "..." }`
   - 401 Unauthorized → `{ success: false, error: "...", code: "TOKEN_EXPIRED" }`
   - 404 Not Found → `{ success: false, error: "Route not found", path: "...", method: "..." }`
   - 500 Server Error → `{ success: false, error: "Server error" }`

2. Verify CORS headers included in all error responses
3. Test error handling in frontend interceptor

**Deliverable:** Error response format verification report

---

### Task 8: Missing Features Planning

**Actions:**
1. For each missing endpoint, analyze frontend usage:
   - Which component calls it?
   - What data does it expect?
   - What response format is expected?
   - Is it protected (requires auth)?

2. Design API endpoints for missing features:
   - Request structure
   - Response structure
   - Database schema
   - Business logic

3. Create implementation plan ordered by priority

**Deliverable:** Missing features implementation plan

---

## 🚀 Rebuild Strategy

### Phase 0: Audit & Planning (Current)
- ✅ Diagnostic artifacts created
- ✅ System architecture documented
- ✅ Endpoints inventory completed
- ⏳ **Next:** Use this prompt to perform detailed audit

### Phase 1: Critical Endpoints (Priority 1)
- Implement `/api/projects/updates`
- Implement `/api/notifications` (full CRUD)
- Implement `/api/opportunities` (list endpoint)

### Phase 2: Important Features (Priority 2)
- Implement `/api/credits/*` endpoints
- Implement `/api/network/*` endpoints
- Implement `/api/tasks` database integration

### Phase 3: Additional Features (Priority 3)
- Implement `/api/admin/*` endpoints
- Implement `/api/research/*` endpoints
- Implement `/api/live/*` endpoints
- Implement `/api/learning/*` endpoints
- Implement `/api/deliverables` endpoints

### Phase 4: Enhancement & Optimization
- Add pagination to all list endpoints
- Add filtering/sorting
- Add caching where appropriate
- Performance optimization

---

## 📝 Implementation Guidelines

### 1. Preserve Existing Functionality
- **DO NOT** break existing endpoints
- **DO NOT** change response structures without frontend updates
- **DO** maintain backward compatibility

### 2. Follow Frontend Expectations
- Use response structure: `{ success: boolean, data: ..., message: ... }`
- Include error codes: `{ success: false, error: "...", code: "..." }`
- Return empty arrays: `{ success: true, data: [] }` for missing endpoints
- Include CORS headers in all responses

### 3. Authentication First
- All mutating endpoints (POST, PUT, DELETE) should require authentication
- Use `authenticateToken` middleware
- Return clear error codes for auth failures

### 4. Database First
- Design database schema before implementing endpoints
- Use migrations for schema changes
- Seed test data for development

### 5. Testing First
- Write tests for each endpoint before implementation
- Test happy path and error cases
- Verify frontend can consume the API

---

## 🎯 Success Criteria

**Phase 0 Audit Complete When:**
- ✅ All 25 implemented endpoints verified working
- ✅ All 35+ missing endpoints identified and prioritized
- ✅ Database schema designed for all features
- ✅ Request/response structures aligned with frontend
- ✅ Authentication flow verified
- ✅ SSE connection stable
- ✅ Error handling verified
- ✅ Implementation plan created

---

## 📦 Deliverables

After completing Phase 0 Audit, provide:

1. **Audit Report** - Status of all endpoints
2. **Missing Endpoints List** - Prioritized with frontend usage
3. **Database Schema Design** - All tables and relationships
4. **Request/Response Alignment Report** - Any discrepancies found
5. **Authentication Verification Report** - Flow and error codes
6. **SSE Connection Report** - Stability and message handling
7. **Error Handling Report** - Response formats verified
8. **Implementation Plan** - Ordered by priority with timeline

---

**Ready to Begin:** Start with Task 1 and work through each audit task systematically.

---

**Questions to Answer During Audit:**

1. Which endpoints are currently broken or inconsistent?
2. What database tables need to be created?
3. What response structures need to be aligned?
4. Which missing endpoints are most critical?
5. What's the implementation order for missing endpoints?
6. Are there any frontend assumptions that need backend changes?

---

**End of Phase 0 Audit Prompt**

