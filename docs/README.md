# iSpora System Architecture Blueprint

**Date:** 2025-01-31  
**Version:** 1.0.0  
**Status:** Complete - Single Source of Truth

---

## Overview

This directory contains the complete system architecture blueprint for the iSpora platform, synthesized from:
- Phase 1 implementation (Mongoose/MongoDB)
- Frontend audit artifacts (`/audit`)
- Missing systems identification
- Admin and workspace features
- Real-time and deployment considerations

---

## Documents

### 1. System Architecture (`system_architecture.md`)

**Purpose:** High-level system architecture overview

**Contents:**
- Technology stack (Frontend, Backend, Infrastructure)
- Component breakdown (129 React components)
- Route structure (Legacy + Phase 1 + Future)
- Database models (25 total)
- Communication flows
- Security architecture
- Deployment architecture
- Monitoring & logging
- Real-time communication
- Scalability considerations

**Use Case:** Understanding the overall system structure and technology choices

---

### 2. Dependency Matrix (`dependency_matrix.json`)

**Purpose:** Complete component dependency graph

**Contents:**
- Frontend components and their API dependencies
- Backend routes and their database dependencies
- Data flow paths
- Status indicators (✅ Implemented, ⚠️ Partial, ❌ Missing)

**Use Case:** Identifying what components depend on what, and what's blocking feature completion

**Format:** JSON for programmatic access

---

### 3. Phase Sequence Roadmap (`phase_sequence.md`)

**Purpose:** 6-phase implementation roadmap

**Contents:**
- Phase 1: Critical Fixes (✅ Complete)
- Phase 2: High-Priority Features (Notifications, Opportunities)
- Phase 3: Medium-Priority Features (Credits, Network)
- Phase 4: Workspace Tools (Research, Live Events, Learning)
- Phase 5: Advanced Features (Sessions, Feed enhancements)
- Phase 6: Admin Dashboard

**Each Phase Includes:**
- Objectives
- Implementation plan
- Routes to create
- Models to create
- Frontend components (status)
- Dependencies
- Deliverables

**Use Case:** Planning and executing backend phases systematically

---

### 4. Data Flow Diagram (`data_flow_diagram.mmd`)

**Purpose:** Visual data flow from frontend through API to database

**Format:** MermaidJS diagram

**Contents:**
- Authentication flow
- Project creation flow
- Project updates flow
- Task creation flow
- Feed flow
- Real-time feed flow (SSE)
- Notifications flow (Phase 2)

**Visualization:** 
- Solid lines = Implemented flows
- Dashed lines = Future flows (Phase 2+)

**Use Case:** Understanding how data moves through the system

**How to View:**
- Use any MermaidJS viewer (GitHub, VS Code, online)
- Or render as PNG/SVG using Mermaid CLI

---

### 5. API Dependency Graph (`api_dependency_graph.mmd`)

**Purpose:** Visual graph of all API endpoints grouped by domain

**Format:** MermaidJS diagram

**Contents:**
- Authentication Domain (✅ Implemented)
- Projects Domain (✅ Implemented)
- Tasks Domain (✅ Implemented)
- Feed Domain (✅ Implemented)
- Notifications Domain (❌ Phase 2)
- Opportunities Domain (❌ Phase 2)
- Credits Domain (❌ Phase 3)
- Network Domain (❌ Phase 3)
- Workspace Domain (❌ Phase 4)
- Admin Domain (❌ Phase 6)
- System Domain (✅ Implemented)

**Color Coding:**
- Green = ✅ Implemented
- Yellow = ⚠️ Partial/Mock
- Red = ❌ Missing
- Gray = Future (Phase 2+)

**Use Case:** Quick overview of API endpoint status by domain

**How to View:**
- Use any MermaidJS viewer (GitHub, VS Code, online)
- Or render as PNG/SVG using Mermaid CLI

---

## Quick Reference

### Current Implementation Status

**✅ Fully Implemented (Phase 1):**
- Authentication (register, login, me, logout, refresh)
- Projects CRUD (with objectives normalization)
- Project updates (`/api/v1/projects/updates?mine=true`)
- Tasks CRUD (MongoDB integrated)
- Feed (get, stream SSE, activity)
- System endpoints (health, ping, placeholder)

**⚠️ Partially Implemented:**
- Tasks legacy routes (mock data)
- Sessions endpoint (stub)

**❌ Not Implemented (Phase 2-6):**
- Notifications system (4 endpoints)
- Opportunities system (1 endpoint)
- Credits/Rewards system (4 endpoints)
- Network features (6 endpoints)
- Workspace tools (12 endpoints)
- Admin dashboard (6 endpoints)

**Total:** 43 endpoints needed, 25 models, 129 frontend components

---

## Architecture Highlights

### Dual Database System

**MongoDB (Mongoose) - Phase 1+:**
- `/api/v1/*` routes
- Modern ODM patterns
- Objectives normalization
- Project updates filtering

**SQLite/PostgreSQL (Knex.js) - Legacy:**
- `/api/*` routes (non-v1)
- Feed entries
- Legacy projects/users
- Gradual migration path

### Frontend Architecture

**129 React Components:**
- Core (5 components)
- Authentication (3 components)
- Projects (4 components)
- Workspace (6 components)
- Social (3 components)
- Features (3 components)
- UI components (85+ components)

**State Management:**
- React Context API
- LocalStorage (token/user)
- Custom hooks (useAuth, useMobile, useProfile)

### Real-time Communication

**Current (SSE):**
- `/api/feed/stream` - Server-Sent Events
- EventSource connection
- Heartbeat every 20 seconds
- Auto-reconnect

**Future (WebSocket):**
- Bidirectional communication
- Live chat
- Collaborative editing
- Real-time notifications

---

## Next Steps

### For Backend Development

1. **Review Architecture Documents**
   - Start with `system_architecture.md` for overview
   - Use `dependency_matrix.json` for component dependencies
   - Reference `phase_sequence.md` for implementation order

2. **Phase 2 Implementation**
   - Follow `phase_sequence.md` Phase 2 section
   - Create Notifications model and routes
   - Create Opportunities model and routes
   - Integrate with existing frontend components

3. **Testing**
   - Use frontend components to test endpoints
   - Verify data flow using `data_flow_diagram.mmd`
   - Check API status using `api_dependency_graph.mmd`

### For Frontend Development

1. **API Endpoint Status**
   - Check `api_dependency_graph.mmd` for endpoint availability
   - Reference `dependency_matrix.json` for component dependencies
   - Update API clients when endpoints are implemented

2. **Component Status**
   - All components are ready (129 total)
   - Waiting on backend endpoints for Phase 2-6 features
   - Check `phase_sequence.md` for endpoint timelines

---

## File Structure

```
docs/
├── README.md                    # This file - Index
├── system_architecture.md       # High-level architecture overview
├── dependency_matrix.json       # Component dependency matrix
├── phase_sequence.md            # 6-phase roadmap
├── data_flow_diagram.mmd        # MermaidJS data flow diagram
└── api_dependency_graph.mmd     # MermaidJS API dependency graph
```

---

## Viewing Mermaid Diagrams

### Online
- **Mermaid Live Editor:** https://mermaid.live/
- **GitHub:** Render automatically in Markdown files
- **VS Code:** Install "Markdown Preview Mermaid Support" extension

### Command Line
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Render to PNG
mmdc -i docs/data_flow_diagram.mmd -o docs/data_flow_diagram.png

# Render to SVG
mmdc -i docs/api_dependency_graph.mmd -o docs/api_dependency_graph.svg
```

---

## Related Documents

**Audit Artifacts:**
- `audit/frontend_feature_map.md` - Complete feature mapping
- `audit/api_endpoint_matrix.json` - All endpoints catalogued
- `audit/frontend_data_models.json` - All data models inferred
- `audit/audit_summary.md` - Executive summary

**Phase 1 Implementation:**
- `PHASE1_IMPLEMENTATION_SUMMARY.md` - Phase 1 summary
- `phase1_runbook.md` - Phase 1 setup guide
- `openapi.yaml` - OpenAPI specification

---

**End of Architecture Blueprint Index**

**Status:** ✅ Complete - Ready for Phase 2 Implementation

