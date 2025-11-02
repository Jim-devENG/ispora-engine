# 🚀 Deployment Workflow - Test Before Deploy

## Pre-Deployment Checklist

**ALWAYS run tests before deploying!**

### 1. Run Pre-Deployment Tests
```bash
npm run test:pre-deploy
```

This tests:
- ✅ Database connection
- ✅ All tables exist
- ✅ Migrations have run
- ✅ Can create users
- ✅ Can create projects
- ✅ Can create feed entries
- ✅ Can query feed
- ✅ Can query projects

### 2. Run Database Diagnostic
```bash
npm run test:diagnose
```

This shows:
- Database connection status
- Table existence
- Data counts
- Migration status

### 3. Run Full Pre-Deploy Check
```bash
npm run guard:pre-deploy
```

This runs:
- Deployment guard checks
- DevOps guardian tests
- Pre-deployment tests

### 4. Manual Verification
- ✅ Check local database has data
- ✅ Verify migrations ran
- ✅ Test project creation locally
- ✅ Test feed population locally

## Deployment Process

### Before Pushing to Git:

1. **Run Tests**:
   ```bash
   npm run test:pre-deploy
   ```
   - If tests fail → **DO NOT DEPLOY**
   - Fix issues first
   - Run tests again

2. **Check Database**:
   ```bash
   npm run test:diagnose
   ```
   - Verify tables exist
   - Verify data exists

3. **Commit Changes**:
   ```bash
   git add -A
   git commit -m "Your commit message"
   ```

4. **Push to Remote**:
   ```bash
   git push origin main
   ```
   - Pre-push hook will run tests automatically
   - If tests fail, push will be blocked

### After Pushing:

1. **Monitor Render Deployment**:
   - Check Render logs
   - Verify migrations run successfully
   - Verify database verification passes
   - Verify tests run in build process

2. **Verify Deployment**:
   - Check health endpoint: `https://ispora-backend.onrender.com/api/health`
   - Test project creation
   - Test feed population
   - Check Render logs for errors

## Test Commands

```bash
# Run all pre-deployment tests
npm run test:pre-deploy

# Run database diagnostic
npm run test:diagnose

# Run full pre-deploy check (guard + tests)
npm run guard:pre-deploy

# Run migrations
npm run migrate

# Run quick pre-deploy (migrate + test)
npm run pre-deploy
```

## What Tests Check

### ✅ Database Connection Test
- Verifies database is accessible
- Tests basic query execution

### ✅ Tables Exist Test
- Checks: users, projects, feed_entries, sessions
- Fails if any table is missing

### ✅ Migrations Status Test
- Verifies migrations have been run
- Checks migration count (should be ≥ 4)

### ✅ Create User Test
- Creates a test user
- Verifies user is saved correctly
- Cleans up after test

### ✅ Create Project Test
- Creates a test project
- Verifies project is saved correctly
- Tests foreign key relationships
- Cleans up after test

### ✅ Create Feed Entry Test
- Creates a test feed entry
- Tests metadata storage (TEXT/JSON)
- Verifies metadata parsing
- Tests foreign key relationships
- Cleans up after test

### ✅ Query Feed Test
- Queries feed entries
- Verifies query works
- Tests pagination

### ✅ Query Projects Test
- Queries projects
- Verifies query works
- Tests ordering

## Failure Scenarios

### If Tests Fail:
1. **DO NOT DEPLOY**
2. Check error messages
3. Fix the issues
4. Run tests again
5. Only deploy when all tests pass

### Common Issues:

**Missing Tables**:
- Run: `npm run migrate`
- Verify migrations succeeded
- Run tests again

**Database Connection Failed**:
- Check `DATABASE_URL` environment variable
- Verify database is running
- Check connection string format

**Create Tests Fail**:
- Check foreign key constraints
- Verify user exists before creating project
- Check table structure matches code

## Integration with CI/CD

### Render Build Process:
1. `npm install` - Install dependencies
2. `npm run migrate` - Run migrations
3. `npm run test:pre-deploy` - Run tests ← **NEW**
4. `npm run seed --if-present` - Seed data (optional)

If any step fails, deployment is blocked.

## Success Criteria

**All tests must pass before deployment:**
- ✅ 8/8 tests passed
- ✅ No database errors
- ✅ All CRUD operations work
- ✅ Feed and projects query successfully

## Monitoring

After deployment:
1. Check Render logs for test results
2. Verify database verification passed
3. Test production endpoints
4. Monitor for errors

---

**Remember: Test Before Deploy! 🧪✅**

