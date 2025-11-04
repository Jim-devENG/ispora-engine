# Database Architecture Overview

**Date:** 2025-02-01  
**Status:** Dual-Database System (MongoDB + PostgreSQL/SQLite)

---

## Current Architecture

### **Original Backend** (Knex.js + PostgreSQL/SQLite)

**Database:** PostgreSQL (production) / SQLite (development)  
**ORM:** Knex.js  
**Routes:** `/api/*`

**Tables:**
- `users`
- `projects`
- `feed_entries`
- `sessions`

**Configuration:**
- `src/knexfile.js` - Knex configuration
- `DATABASE_URL` environment variable (PostgreSQL connection string)
- SQLite file: `data/dev.db` (development)

**Status:** ✅ **Active** - Original routes still use this database

---

### **Phase 1, 2, 3 Backend** (Mongoose + MongoDB)

**Database:** MongoDB  
**ORM:** Mongoose  
**Routes:** `/api/v1/*`

**Collections:**
- `users`
- `projects`
- `projectupdates`
- `tasks`
- `notifications`
- `opportunities`
- `notificationpreferences`
- `opportunityengagements`
- `opportunitymetrics`
- `profiles`
- `follows`
- `comments`
- `reactions`
- `feedpreferences`

**Configuration:**
- `src/config/database.js` - MongoDB connection
- `MONGO_URI` or `MONGODB_URI` environment variable
- MongoDB connection is **OPTIONAL** - server starts without it

**Status:** ⚠️ **Optional** - Phase 1/2/3 routes require MongoDB to work

---

## Server Behavior

### When MongoDB IS Available:
✅ Server connects to both databases  
✅ Original routes (`/api/*`) use PostgreSQL/SQLite  
✅ Phase 1/2/3 routes (`/api/v1/*`) use MongoDB  
✅ Both systems run in parallel

### When MongoDB IS NOT Available:
✅ Server still starts successfully  
✅ Original routes (`/api/*`) work normally  
❌ Phase 1/2/3 routes (`/api/v1/*`) return errors or don't work  
⚠️ Server logs warning: "MongoDB not configured - Phase 1 Mongoose routes will not be available"

---

## Test Behavior

### When MongoDB IS Available:
✅ All tests run normally  
✅ Phase 3 tests connect to MongoDB  
✅ Tests clean up after themselves

### When MongoDB IS NOT Available:
✅ Tests skip gracefully (no failures)  
⚠️ Warning displayed: "⚠️ MongoDB not available for tests. Skipping tests."  
✅ `SKIP_TESTS` flag is set  
✅ Cleanup is skipped (no errors)

---

## Environment Variables

### Required for Original Routes:
```env
DATABASE_URL=postgresql://user:pass@host:5432/ispora
# OR for SQLite (development)
DATABASE_URL=sqlite://data/dev.db
```

### Required for Phase 1/2/3 Routes:
```env
MONGO_URI=mongodb://localhost:27017/ispora
# OR
MONGODB_URI=mongodb://localhost:27017/ispora
# OR for MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ispora
```

---

## Current Situation

### Tests Failing Because MongoDB Not Available?

**Answer:** Yes, tests are correctly skipping when MongoDB isn't available. This is **expected behavior**.

**Why?**
- Phase 3 features require MongoDB
- Tests are correctly detecting MongoDB isn't available
- Tests are gracefully skipping instead of failing
- This is the correct behavior!

### Should We Use MongoDB or PostgreSQL?

**Current Design:**
- Original routes use PostgreSQL/SQLite (Knex.js)
- Phase 1/2/3 routes use MongoDB (Mongoose)
- Both systems run in parallel

**Options:**
1. **Keep Current Architecture** (Recommended)
   - Keep dual-database system
   - Phase 1/2/3 features require MongoDB
   - Original features use PostgreSQL/SQLite
   - Both systems work independently

2. **Migrate Phase 3 to PostgreSQL**
   - Rewrite Phase 3 features to use Knex.js
   - Use PostgreSQL instead of MongoDB
   - More work, but consolidates databases

3. **Migrate Everything to MongoDB**
   - Migrate original routes to MongoDB
   - Single database system
   - Requires data migration

---

## Recommendation

**Keep the dual-database architecture** for now:
- ✅ Phase 1/2/3 features are already built with MongoDB
- ✅ Original routes continue working with PostgreSQL/SQLite
- ✅ Both systems can run independently
- ✅ Gradual migration path possible later

**To Use Phase 3 Features:**
1. Install/start MongoDB locally or use MongoDB Atlas
2. Set `MONGO_URI` environment variable
3. Restart server
4. Phase 3 routes will work

**To Run Phase 3 Tests:**
1. Ensure MongoDB is running
2. Set `MONGO_TEST_URI` environment variable (optional)
3. Run tests: `npm test`
4. Tests will connect to MongoDB and run normally

---

## Next Steps

1. **If you want to use Phase 3 features:**
   - Set up MongoDB (local or Atlas)
   - Set `MONGO_URI` environment variable
   - Restart server

2. **If you want to keep using only PostgreSQL:**
   - Phase 3 routes won't work
   - Original routes will continue working
   - Tests will skip gracefully

3. **If you want to migrate Phase 3 to PostgreSQL:**
   - This requires rewriting Phase 3 features
   - Significant development effort
   - Not recommended unless necessary

---

## Summary

✅ **Tests are working correctly** - they skip gracefully when MongoDB isn't available  
✅ **Original backend uses PostgreSQL/SQLite** (Knex.js)  
✅ **Phase 3 features use MongoDB** (Mongoose)  
✅ **Both systems can run in parallel**  
⚠️ **Phase 3 features require MongoDB** - set `MONGO_URI` to use them

**The test errors you're seeing are expected** - tests are correctly detecting MongoDB isn't available and skipping instead of failing. This is the correct behavior!

