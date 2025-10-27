# 🧠 CURSOR AI DEVOPS LAW: Backend Deployment Stability

## Objective
Ensure that the backend always deploys successfully to Render.com without manual intervention.

## 🎯 Core Rules (NEVER VIOLATE)

### 1. **Root Directory Structure Law**
- Backend MUST be in root directory, NOT nested in subdirectories
- Root `package.json` MUST contain backend configuration
- Entry file MUST be `src/server.js` (or `server.js` in root)
- Render looks for `package.json` in root - if not found, deployment fails

### 2. **Package.json Validation Law**
```json
{
  "name": "ispora-backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js"
  }
}
```
- `"start"` script MUST exist and point to valid entry file
- `"main"` field MUST point to entry file
- All backend dependencies MUST be listed

### 3. **Entry File Law**
- `src/server.js` MUST exist and be executable
- MUST listen on `process.env.PORT || 5000`
- MUST have health endpoint at `/api/health`
- MUST use CommonJS `require()` syntax (not ES modules)

### 4. **Render Configuration Law**
```yaml
services:
  - type: web
    name: ispora-backend
    env: node
    buildCommand: npm install && npm run migrate --if-present && npm run seed --if-present
    startCommand: npm start
```
- NO `rootDir` specified (uses root)
- Commands run from root directory
- Health check path: `/api/health`

### 5. **Pre-Deployment Validation Law**
Before ANY push to main:
1. Run `npm start` locally
2. Verify server starts without errors
3. Test `http://localhost:5000/api/health` returns 200 OK
4. If ANY step fails, fix before pushing

### 6. **Automatic Repair Protocol**
If deployment structure is broken:
1. Move all backend files to root directory
2. Update root `package.json` with backend config
3. Remove `rootDir` from `render.yaml`
4. Test locally with `npm start`
5. Commit and push fixes

## 🚨 CRITICAL SUCCESS PATTERNS

### ✅ CORRECT Structure:
```
/trumpet (root)
├── package.json (backend config)
├── src/server.js (entry point)
├── src/ (backend code)
├── iSpora-frontend/ (frontend)
└── render.yaml
```

### ❌ WRONG Structure:
```
/trumpet (root)
├── iSpora-backend/
│   ├── package.json
│   └── src/server.js
└── render.yaml (with rootDir: iSpora-backend)
```

## 🔄 ENFORCEMENT PROTOCOL

1. **Every Code Change**: Validate structure before commit
2. **Every Push**: Run local `npm start` test
3. **Every Deployment Failure**: Apply automatic repair protocol
4. **Every Render Error**: Check root directory structure first

## 🎯 SUCCESS METRICS

- ✅ `npm start` runs without errors
- ✅ Health endpoint returns 200 OK
- ✅ Render deployment succeeds automatically
- ✅ No "Missing script: start" errors
- ✅ No manual fixes required

## 🚀 DEPLOYMENT COMMANDS

```bash
# Test locally before pushing
npm start

# Test health endpoint
curl http://localhost:5000/api/health

# Deploy to Render (automatic on push to main)
git push origin main
```

---

**This law ensures 100% deployment success rate on Render.com** 🎯
