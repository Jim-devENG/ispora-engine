# MongoDB Setup for Render.com Deployment

**Complete guide to setting up MongoDB for iSpora on Render.com**

---

## 🎯 Overview

**Render.com does NOT provide managed MongoDB** (unlike PostgreSQL), so you need to:

1. **Use MongoDB Atlas** (cloud MongoDB - free tier available)
2. **Configure environment variable** in Render dashboard
3. **Whitelist Render IPs** in MongoDB Atlas
4. **Update render.yaml** (already done ✅)

---

## 📋 Step-by-Step Setup

### Step 1: Create MongoDB Atlas Account & Cluster

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Click "Try Free" or "Sign Up"

2. **Create Free Cluster:**
   - Click "Build a Database"
   - Choose **"Free" (M0)**
   - Select cloud provider: **AWS** (recommended)
   - Select region closest to your Render region:
     - If Render is in US East: Choose `us-east-1` or nearby
     - If Render is in US West: Choose `us-west-1` or nearby
   - Name your cluster: `ispora-cluster` (or your choice)
   - Click "Create Cluster"

3. **Wait for Cluster to Build:**
   - This takes 3-5 minutes
   - You'll see "Your cluster is ready!" when done

---

### Step 2: Create Database User

1. **Go to Database Access:**
   - In MongoDB Atlas dashboard, click "Database Access" (left sidebar)
   - Click "Add New Database User"

2. **Configure User:**
   - **Authentication Method:** Password
   - **Username:** `ispora_user` (or your choice)
   - **Password:** Click "Autogenerate Secure Password" or create your own
   - **⚠️ IMPORTANT:** Copy and save the password! You'll need it for the connection string.
   - **Database User Privileges:** 
     - Select "Atlas admin" OR
     - Select "Read and write to any database"
   - Click "Add User"

---

### Step 3: Configure Network Access (Whitelist IPs)

1. **Go to Network Access:**
   - In MongoDB Atlas dashboard, click "Network Access" (left sidebar)
   - Click "Add IP Address"

2. **Whitelist Render IP Addresses:**
   
   **Option A: Development/Testing (Less Secure):**
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Click "Confirm"
   - ⚠️ **Warning:** This allows access from any IP. Use only for development.

   **Option B: Production (More Secure):**
   - You'll need Render's IP addresses (they change, so this is harder)
   - **Better:** Use `0.0.0.0/0` but restrict by:
     - Strong database user password
     - MongoDB Atlas firewall rules
     - Connection string includes password (required)

   **Recommended:** Use `0.0.0.0/0` for now, but:
   - Use strong passwords
   - Enable MongoDB Atlas authentication
   - Monitor connection logs

3. **Confirm Whitelist:**
   - Status should show "Active"
   - Your IP will be listed

---

### Step 4: Get Connection String

1. **Go to Database:**
   - In MongoDB Atlas dashboard, click "Database" (left sidebar)
   - Click "Connect" on your cluster

2. **Choose Connection Method:**
   - Click "Connect your application"
   - **Driver:** Node.js
   - **Version:** Latest (4.1 or later)

3. **Copy Connection String:**
   - You'll see: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Replace placeholders:**
     - Replace `<username>` with your database username (e.g., `ispora_user`)
     - Replace `<password>` with your database user password (from Step 2)
     - Add database name: Change `/?` to `/ispora?`

4. **Final Connection String:**
   ```
   mongodb+srv://ispora_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ispora?retryWrites=true&w=majority
   ```
   - **Example:**
   ```
   mongodb+srv://ispora_user:MySecurePass123@cluster0.abc123.mongodb.net/ispora?retryWrites=true&w=majority
   ```

---

### Step 5: Configure Render.com Environment Variable

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Sign in to your account

2. **Select Your Service:**
   - Find your service: `ispora-backend`
   - Click on it

3. **Go to Environment:**
   - Click "Environment" tab (left sidebar)

4. **Add Environment Variable:**
   - Click "Add Environment Variable"
   - **Key:** `MONGO_URI`
   - **Value:** Your MongoDB Atlas connection string (from Step 4)
   - **Example Value:**
     ```
     mongodb+srv://ispora_user:MySecurePass123@cluster0.abc123.mongodb.net/ispora?retryWrites=true&w=majority
     ```
   - Click "Save Changes"

5. **Redeploy (Optional but Recommended):**
   - After adding environment variable, Render will automatically redeploy
   - Or click "Manual Deploy" → "Deploy latest commit"

---

### Step 6: Verify Connection

1. **Check Deployment Logs:**
   - In Render dashboard, go to "Logs" tab
   - Look for MongoDB connection messages:
     ```
     🔗 Connecting to MongoDB for Phase 1 features...
     🔗 Connecting to MongoDB...
        URI: mongodb+srv://***@cluster0.xxxxx.mongodb.net/ispora
        Attempt: 1/4
     ✅ MongoDB connected successfully
        Database: ispora
        Host: cluster0-shard-00-00.xxxxx.mongodb.net:27017
     ```

2. **Check Health Endpoint:**
   - Visit: `https://ispora-backend.onrender.com/api/v1/health`
   - Should show:
     ```json
     {
       "success": true,
       "status": "ok",
       "mongoDB": {
         "status": "connected",
         "isConnected": true,
         "database": "ispora",
         "health": {
           "healthy": true,
           "status": "connected"
         }
       }
     }
     ```

3. **Test Phase 3 Routes:**
   - Try accessing Phase 3 routes (they shouldn't return 503 anymore)
   - Example: `GET /api/v1/profile/me` (with auth token)

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created and ready
- [ ] Database user created with password saved
- [ ] IP address whitelisted (`0.0.0.0/0` or specific IPs)
- [ ] Connection string obtained and tested
- [ ] `MONGO_URI` environment variable set in Render
- [ ] Render service redeployed
- [ ] Deployment logs show "✅ MongoDB connected successfully"
- [ ] Health endpoint shows MongoDB as connected
- [ ] Phase 3 routes work (no 503 errors)

---

## 🔒 Security Best Practices

1. **Use Strong Passwords:**
   - Database user password should be strong (12+ characters)
   - Include uppercase, lowercase, numbers, special characters

2. **Monitor Connections:**
   - Check MongoDB Atlas "Network Access" logs
   - Review connection attempts

3. **Rotate Credentials:**
   - Change database user password periodically
   - Update `MONGO_URI` in Render after changing password

4. **Enable MongoDB Atlas Features:**
   - Enable "Database Access" → Require strong passwords
   - Enable monitoring and alerts

5. **Backup Strategy:**
   - MongoDB Atlas M0 (free) includes daily backups
   - Consider upgrading for more frequent backups

---

## 🐛 Troubleshooting

### Connection Timeout

**Problem:** `MongoServerError: connection timed out`

**Solutions:**
1. Check Network Access whitelist includes `0.0.0.0/0`
2. Verify connection string is correct
3. Check Render logs for detailed error messages
4. Try connecting from MongoDB Atlas "Connect" → "MongoDB Shell" to test

### Authentication Failed

**Problem:** `MongoServerError: bad auth`

**Solutions:**
1. Verify username and password are correct in connection string
2. URL-encode special characters in password (e.g., `@` → `%40`)
3. Check database user exists and has correct privileges
4. Reset database user password and update connection string

### Cluster Not Available

**Problem:** `MongoServerError: Server selection timed out`

**Solutions:**
1. Check if MongoDB Atlas cluster is paused (free tier pauses after inactivity)
2. Go to MongoDB Atlas → Database → Click "Resume" on cluster
3. Wait 2-3 minutes for cluster to resume
4. Verify cluster status shows "Active"

### Render Logs Show "MongoDB not configured"

**Problem:** Health endpoint shows MongoDB as disconnected

**Solutions:**
1. Verify `MONGO_URI` environment variable is set in Render
2. Check variable name is exactly `MONGO_URI` (case-sensitive)
3. Verify connection string is complete and correct
4. Redeploy service after adding environment variable

---

## 📊 Cost Information

### MongoDB Atlas Free Tier (M0):

- **Storage:** 512 MB
- **RAM:** Shared
- **Backups:** Daily snapshots (retained for 2 days)
- **Network:** Free egress (within cloud provider region)
- **Price:** **FREE forever** ✅

**Limitations:**
- 512 MB storage may be limiting for large apps
- Shared RAM (can be slower under load)
- No auto-scaling

**When to Upgrade:**
- When you exceed 512 MB storage
- When you need better performance
- When you need more frequent backups

---

## 🚀 Quick Setup Commands

After setting up MongoDB Atlas, you only need to:

1. **Copy connection string from Atlas**
2. **Add to Render environment variables:**
   - Key: `MONGO_URI`
   - Value: Your connection string
3. **Redeploy (automatic)**
4. **Verify in logs**

That's it! No code changes needed. ✅

---

## 📝 Summary

**What Render Provides:**
- ✅ PostgreSQL database (managed)
- ✅ Web service hosting
- ✅ Environment variables

**What You Need to Provide:**
- ⚠️ MongoDB (use MongoDB Atlas - free tier available)

**What's Already Done:**
- ✅ `render.yaml` configured with `MONGO_URI` variable
- ✅ Server code handles MongoDB connection gracefully
- ✅ Health endpoint includes MongoDB status
- ✅ Connection retry logic for reliability

**What You Need to Do:**
1. Create MongoDB Atlas account & cluster (5 minutes)
2. Get connection string (2 minutes)
3. Add `MONGO_URI` to Render environment variables (1 minute)
4. Verify connection in logs (1 minute)

**Total Time: ~10 minutes** 🎉

---

**Need Help?**
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Render Environment Variables: https://render.com/docs/environment-variables
- iSpora Setup Guide: `docs/MONGODB_SETUP_GUIDE.md`

