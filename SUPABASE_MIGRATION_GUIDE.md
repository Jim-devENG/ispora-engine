# Supabase Migration Guide

This document tracks the migration from Node.js/Express + JSON database to Supabase-only backend.

## Migration Status

- [x] **Phase 1: Schema + Supabase Client Setup** ✅
- [ ] **Phase 2: Move Auth to Supabase Auth**
- [ ] **Phase 3: Read Paths (GET) → Supabase**
- [ ] **Phase 4: Write Paths (POST/PUT/DELETE) → Supabase**
- [ ] **Phase 5: Realtime via Supabase Realtime**
- [ ] **Phase 6: File Uploads → Supabase Storage**
- [ ] **Phase 7: Remove Node/Express Backend**

---

## Phase 1: Schema + Supabase Client Setup ✅

### Completed

1. ✅ Created comprehensive SQL schema (`supabase/migrations/001_initial_schema.sql`)
   - All 25+ tables from JSON database structure
   - Proper foreign key relationships
   - Indexes for performance
   - Triggers for `updated_at` timestamps
   - Row Level Security ready (policies to be added in Phase 4)

2. ✅ Added Supabase client dependency to frontend
   - `@supabase/supabase-js` added to `frontend/package.json`

3. ✅ Created Supabase client configuration
   - `frontend/src/utils/supabaseClient.ts` - Main client instance
   - `frontend/src/types/supabase.ts` - TypeScript types placeholder

4. ✅ Updated environment templates
   - `backend/env-template.txt` - Added Supabase config
   - `frontend/.env.example` - Added Supabase config

### Next Steps

1. **Set up Supabase Project:**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project (or create new one)
   supabase link --project-ref your-project-ref
   ```

2. **Run Migration:**
   ```bash
   # Apply the schema migration
   supabase db push
   # OR manually run the SQL in Supabase Dashboard > SQL Editor
   ```

3. **Get API Keys:**
   - Go to Supabase Dashboard > Settings > API
   - Copy `Project URL` → `VITE_SUPABASE_URL`
   - Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend, if needed)

4. **Update Environment Files:**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your Supabase credentials
   
   # Backend (if still using during migration)
   cp backend/env-template.txt backend/.env
   # Edit backend/.env with your Supabase credentials
   ```

5. **Generate TypeScript Types:**
   ```bash
   # After running migrations, generate types from your Supabase schema
   npx supabase gen types typescript --project-id your-project-id > frontend/src/types/supabase.ts
   ```

---

## Phase 2: Move Auth to Supabase Auth (Next)

### Tasks

1. Replace `authAPI` calls with Supabase Auth:
   - `supabase.auth.signUp()` for registration
   - `supabase.auth.signInWithPassword()` for login
   - `supabase.auth.signOut()` for logout
   - `supabase.auth.getSession()` for session management

2. Update `ProfileProvider` to use Supabase Auth user

3. Create profile in `profiles` table on user signup (via Supabase trigger or frontend)

4. Mark `backend/src/routes/auth.routes.ts` as deprecated

---

## Database Schema Overview

### Core Tables

- **profiles** - User profile data (extends Supabase Auth users)
- **projects** - Impact projects
- **opportunities** - Job/internship opportunities
- **campaigns** - Community campaigns
- **feed_items** - Impact Feed entries
- **tasks** - Project tasks
- **milestones** - Project milestones
- **sessions** - Mentorship/workshop sessions
- **messages** - Workspace messages
- **voice_notes** - Voice messages
- **learning_content** - Learning materials
- **recordings** - Session recordings
- **deliverables** - Project deliverables
- **certificates** - Achievement certificates
- **live_sessions** - Live collaboration sessions
- **research_sources** - Research references
- **research_notes** - Research notes
- **data_sets** - Research datasets
- **stakeholders** - Community stakeholders
- **impact_stories** - Impact narratives
- **community_events** - Community events
- **ideas** - Innovation ideas
- **co_creation_rooms** - Collaboration rooms
- **project_workspaces** - Project workspaces
- **build_tools** - Development tools
- **uploaded_files** - File metadata
- **user_actions** - User activity log
- **admin_highlights** - Admin-curated highlights
- **connection_requests** - Network connection requests

### Key Design Decisions

1. **Profiles Table:**
   - Uses `auth.users.id` as primary key (foreign key to Supabase Auth)
   - Stores all profile data that was in `UserProfile` interface
   - JSONB columns for complex nested data (availability, socialLinks, etc.)

2. **Project-Scoped Entities:**
   - Most workspace entities have `project_id` foreign key
   - Enables efficient filtering and RLS policies

3. **Timestamps:**
   - All tables have `created_at` (TIMESTAMPTZ)
   - Most tables have `updated_at` (TIMESTAMPTZ) with auto-update trigger

4. **Arrays:**
   - PostgreSQL arrays (`TEXT[]`) for simple lists (tags, skills, etc.)
   - JSONB for complex nested structures (team members, metadata, etc.)

---

## Migration Checklist

Before starting each phase, ensure:

- [ ] Supabase project is set up
- [ ] Migrations are applied
- [ ] Environment variables are configured
- [ ] TypeScript types are generated
- [ ] Local development environment is working
- [ ] No breaking changes to existing functionality (during transition)

---

## Rollback Plan

If issues arise during migration:

1. **Keep Node/Express backend running** until migration is complete
2. **Dual-write approach**: Write to both JSON DB and Supabase during transition
3. **Feature flags**: Use environment variables to toggle between old/new implementations
4. **Gradual rollout**: Migrate one feature/domain at a time

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** Phase 1 Complete
**Next Phase:** Phase 2 - Move Auth to Supabase Auth

