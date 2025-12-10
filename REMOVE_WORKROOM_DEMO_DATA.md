# Removing Demo Data from Workroom Components

## Overview
All workroom components currently use mock/demo data. This document outlines the plan to replace all demo data with API calls to the backend.

## API Utilities Created
✅ **`workspaceAPI`** has been added to `frontend/src/utils/api.ts` with all necessary methods for:
- Sessions
- Tasks (with comments)
- Voice Notes
- Messages
- Learning Content
- Recordings
- Deliverables
- Certificates
- Live Sessions
- Research Sources, Notes, Data Sets
- Stakeholders, Impact Stories, Community Events
- Ideas, Co-Creation Rooms, Project Workspaces, Build Tools

## Components to Update

### 1. SessionBoard.tsx
**Current:** Uses `mockSessions` array
**Action:** 
- Replace with `useState` and `useEffect` to fetch from `workspaceAPI.getSessions(projectId)`
- Remove `mockSessions` array
- Add loading/error states
- Transform API response dates from ISO strings to Date objects

### 2. TaskManager.tsx
**Current:** Uses `mockTasks` and `mockProjectMembers` arrays
**Action:**
- Fetch tasks from `workspaceAPI.getTasks(projectId)`
- Fetch members from `workspaceAPI.getMembers(projectId)`
- Remove all mock data
- Transform API response dates

### 3. VoiceChat.tsx
**Current:** Uses `mockMessages` and `mockVoiceNotes` arrays
**Action:**
- Fetch messages from `workspaceAPI.getMessages(projectId)`
- Fetch voice notes from `workspaceAPI.getVoiceNotes(projectId)`
- Remove all mock data
- Transform API response dates

### 4. LearningVault.tsx
**Current:** Uses `mockContent` and `mockRecordings` arrays
**Action:**
- Fetch content from `workspaceAPI.getLearningContent(projectId)`
- Fetch recordings from `workspaceAPI.getRecordings(projectId)`
- Remove all mock data
- Transform API response dates

### 5. DeliverableSubmissions.tsx
**Current:** Likely uses mock data
**Action:**
- Fetch from `workspaceAPI.getDeliverables(projectId)`
- Remove mock data

### 6. CertificateManager.tsx
**Current:** Likely uses mock data
**Action:**
- Fetch from `workspaceAPI.getCertificates(projectId)`
- Remove mock data

### 7. LiveSession.tsx
**Current:** Likely uses mock data
**Action:**
- Fetch from `workspaceAPI.getLiveSessions(projectId)`
- Remove mock data

### 8. ResearchTools.tsx
**Current:** Uses `researchSources` and `researchNotes` mock state
**Action:**
- Fetch sources from `workspaceAPI.getResearchSources(projectId)`
- Fetch notes from `workspaceAPI.getResearchNotes(projectId)`
- Fetch datasets from `workspaceAPI.getDataSets(projectId)`
- Remove all mock data initialization

### 9. CommunityTools.tsx
**Current:** Uses `stakeholders`, `impactStories`, `communityEvents` mock state
**Action:**
- Fetch stakeholders from `workspaceAPI.getStakeholders(projectId)`
- Fetch stories from `workspaceAPI.getImpactStories(projectId)`
- Fetch events from `workspaceAPI.getCommunityEvents(projectId)`
- Remove all mock data initialization

### 10. ForgeLab.tsx / InnovationHub.tsx
**Current:** Uses `ideas`, `coCreationRooms` mock state
**Action:**
- Fetch ideas from `workspaceAPI.getIdeas(projectId)`
- Fetch rooms from `workspaceAPI.getCoCreationRooms(projectId)`
- Fetch workspaces from `workspaceAPI.getProjectWorkspaces(projectId)`
- Fetch tools from `workspaceAPI.getBuildTools(projectId)`
- Remove all mock data initialization

### 11. ProjectWorkspace.tsx
**Current:** Uses `mockProjects` array
**Action:**
- Fetch projects from `projectAPI.getProjects()`
- Remove `mockProjects` array
- Use real project data

## Implementation Pattern

For each component:

1. **Import API:**
```typescript
import { workspaceAPI } from '../../src/utils/api';
```

2. **Add state for data:**
```typescript
const [sessions, setSessions] = useState<Session[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

3. **Fetch on mount:**
```typescript
useEffect(() => {
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await workspaceAPI.getSessions(projectId);
      // Transform dates if needed
      const transformed = data.map(s => ({
        ...s,
        scheduledDate: new Date(s.scheduledDate),
      }));
      setSessions(transformed);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
      setSessions([]); // Empty array instead of mock data
    } finally {
      setIsLoading(false);
    }
  };
  
  if (projectId) {
    fetchSessions();
  }
}, [projectId]);
```

4. **Remove mock data:**
- Delete all `mock*` arrays
- Remove any `useState` initializations with mock data

5. **Handle empty states:**
- Show appropriate empty state UI when arrays are empty
- Don't fall back to mock data on error

## Date Transformation

Backend returns ISO date strings. Components may need Date objects:
```typescript
// Transform single date
scheduledDate: new Date(session.scheduledDate)

// Transform array of dates
dates: session.dates?.map(d => new Date(d))
```

## Error Handling

Always:
- Show empty arrays on error (not mock data)
- Display error message to user
- Log error to console for debugging

## Testing Checklist

After updating each component:
- [ ] No mock data arrays remain
- [ ] Data loads from API on mount
- [ ] Loading state shows while fetching
- [ ] Error state handles failures gracefully
- [ ] Empty state shows when no data
- [ ] Create/Update/Delete operations refresh data
- [ ] Dates are properly transformed
- [ ] Component works with real projectId from props

## Notes

- All components should receive `projectId` as a prop
- If `projectId` is not available, show appropriate message
- Don't fetch data if `projectId` is undefined/null
- Consider adding refresh functionality after create/update/delete operations

