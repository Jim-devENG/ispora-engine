# Server-Sent Events (SSE) Implementation for Workspace

## Overview

Server-Sent Events (SSE) have been implemented for real-time workspace updates. This provides a simpler alternative to WebSockets for one-way server-to-client communication.

## Backend Implementation

### Files Created

1. **`backend/src/sse/sse.ts`** - SSE service with client management
2. **`backend/src/routes/sse.routes.ts`** - SSE endpoint routes

### SSE Service Features

- **Client Management**: Tracks connected clients per project
- **Authentication**: JWT token-based authentication
- **Heartbeat**: Automatic keep-alive pings every 30 seconds
- **Reconnection**: Automatic reconnection handling
- **Event Broadcasting**: Broadcast events to all clients subscribed to a project

### SSE Endpoints

#### Connect to Workspace Updates
```
GET /api/sse/workspace/:projectId?token=<JWT_TOKEN>
```

**Headers (Alternative):**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:** Server-Sent Events stream

#### Connect to All Workspaces
```
GET /api/sse/workspace?token=<JWT_TOKEN>
```

#### Subscribe to Additional Project
```
POST /api/sse/workspace/:projectId/subscribe
Authorization: Bearer <JWT_TOKEN>
```

#### Unsubscribe from Project
```
POST /api/sse/workspace/:projectId/unsubscribe
Authorization: Bearer <JWT_TOKEN>
```

#### Get Connection Status
```
GET /api/sse/status
Authorization: Bearer <JWT_TOKEN>
```

### Events Emitted

All workspace CRUD operations emit SSE events:

#### Tasks
- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted

#### Milestones
- `milestone_created` - New milestone created
- `milestone_updated` - Milestone updated

#### Sessions
- `session_created` - New session created
- `session_updated` - Session updated

#### Messages & Voice
- `message_sent` - New message sent
- `voice_note_created` - New voice note created

#### Learning & Deliverables
- `learning_content_created` - New learning content added
- `deliverable_created` - New deliverable submitted
- `deliverable_updated` - Deliverable reviewed/updated
- `certificate_created` - New certificate issued

#### Live Sessions
- `live_session_updated` - Live session status changed

#### Research Tools
- `research_source_created` - New research source added
- `research_note_created` - New research note created
- `data_set_created` - New dataset added

#### Community Tools
- `stakeholder_created` - New stakeholder added
- `impact_story_created` - New impact story created
- `community_event_created` - New community event created

#### Innovation Hub
- `idea_created` - New idea created
- `idea_updated` - Idea updated

#### Members
- `member_added` - New member added to project

#### System Events
- `connected` - Connection established
- `heartbeat` - Keep-alive ping
- `subscribed` - Subscribed to project
- `unsubscribed` - Unsubscribed from project

### Event Data Format

Each event includes:
```json
{
  "id": 123,
  "event": "task_created",
  "data": {
    "task": { /* task object */ }
  },
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

## Frontend Implementation

### Files Created

1. **`frontend/src/utils/sse.ts`** - SSE client utility

### Usage Example

```typescript
import { subscribeToWorkspaceEvents } from '@/utils/sse';

// Subscribe to workspace events
const client = await subscribeToWorkspaceEvents('project-id', {
  task_created: (event) => {
    console.log('New task:', event.data.task);
    // Update UI
  },
  task_updated: (event) => {
    console.log('Task updated:', event.data.task);
    // Update UI
  },
  message_sent: (event) => {
    console.log('New message:', event.data.message);
    // Add message to chat
  },
  // ... other event handlers
});

// Disconnect when done
import { disconnectWorkspaceSSE } from '@/utils/sse';
disconnectWorkspaceSSE('project-id');
```

### Integration with Components

#### Example: TaskManager Component

```typescript
import { useEffect } from 'react';
import { subscribeToWorkspaceEvents, disconnectWorkspaceSSE } from '@/utils/sse';

useEffect(() => {
  if (!projectId) return;

  let client: any;

  subscribeToWorkspaceEvents(projectId, {
    task_created: (event) => {
      setTasks(prev => [...prev, event.data.task]);
    },
    task_updated: (event) => {
      setTasks(prev => prev.map(t => 
        t.id === event.data.task.id ? event.data.task : t
      ));
    },
    task_deleted: (event) => {
      setTasks(prev => prev.filter(t => t.id !== event.data.taskId));
    },
  }).then(c => client = c);

  return () => {
    if (client) {
      disconnectWorkspaceSSE(projectId);
    }
  };
}, [projectId]);
```

## Advantages of SSE over WebSocket

1. **Simpler Protocol**: HTTP-based, easier to implement
2. **Automatic Reconnection**: Built into EventSource API
3. **One-Way Communication**: Perfect for server-to-client updates
4. **No Special Server Setup**: Works with standard HTTP servers
5. **Better for Read-Only Updates**: Ideal for workspace notifications

## Integration Points

SSE events are automatically emitted when:
- Tasks are created, updated, or deleted
- Milestones are created or updated
- Sessions are created or updated
- Messages are sent
- Voice notes are created
- Learning content is added
- Deliverables are submitted or reviewed
- Certificates are issued
- Live sessions are updated
- Research sources/notes/datasets are created
- Stakeholders are added
- Impact stories are created
- Community events are created
- Ideas are created or updated
- Members are added to projects

## Testing

### Test SSE Connection

```bash
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/sse/workspace/1
```

### Test with Browser

```javascript
const token = 'YOUR_JWT_TOKEN';
const eventSource = new EventSource(
  `http://localhost:3001/api/sse/workspace/1?token=${token}`
);

eventSource.addEventListener('task_created', (e) => {
  console.log('Task created:', JSON.parse(e.data));
});

eventSource.addEventListener('message_sent', (e) => {
  console.log('Message sent:', JSON.parse(e.data));
});
```

## Next Steps

1. Integrate SSE client into workspace components
2. Replace polling with SSE where applicable
3. Add error handling and reconnection UI feedback
4. Consider using SSE for feed updates as well

