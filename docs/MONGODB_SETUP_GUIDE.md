# MongoDB Setup Guide

**Complete guide to setting up MongoDB for iSpora Phase 1/2/3 features**

---

## 🎯 Quick Start

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create Free Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free (M0 cluster is free forever)

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" (M0)
   - Select cloud provider and region
   - Name your cluster (e.g., "ispora-cluster")

3. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `ispora_user` (or your choice)
   - Password: Generate secure password (save it!)
   - Role: `Atlas admin` or `Read and write to any database`

4. **Whitelist IP Address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your Render.com IP addresses

5. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/ispora`)

6. **Set Environment Variable:**
   ```bash
   export MONGO_URI=mongodb+srv://ispora_user:your_password@ispora-cluster.xxxxx.mongodb.net/ispora?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB (Development)

#### Windows:

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows → MSI package
   - Download and install

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)

3. **Start MongoDB:**
   ```powershell
   # Start MongoDB service
   net start MongoDB
   
   # Verify it's running
   mongosh
   ```

4. **Set Environment Variable:**
   ```powershell
   # In PowerShell
   $env:MONGO_URI="mongodb://localhost:27017/ispora"
   
   # Or add to .env file
   MONGO_URI=mongodb://localhost:27017/ispora
   ```

#### macOS:

1. **Install MongoDB:**
   ```bash
   # Using Homebrew
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB:**
   ```bash
   # Start MongoDB service
   brew services start mongodb-community
   
   # Verify it's running
   mongosh
   ```

3. **Set Environment Variable:**
   ```bash
   export MONGO_URI=mongodb://localhost:27017/ispora
   ```

#### Linux (Ubuntu/Debian):

1. **Install MongoDB:**
   ```bash
   # Import MongoDB public key
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   
   # Add MongoDB repository
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   
   # Install MongoDB
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB:**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Verify it's running
   mongosh
   ```

3. **Set Environment Variable:**
   ```bash
   export MONGO_URI=mongodb://localhost:27017/ispora
   ```

---

## 🧪 Test MongoDB Connection

After setting up MongoDB, test the connection:

```bash
# Run test script
npm run test:mongodb
```

**Expected Output:**
```
🧪 Testing MongoDB Connection...

📋 Configuration:
   URI: mongodb://***@localhost:27017/ispora
   Environment: development

🔗 Connecting to MongoDB...
✅ MongoDB connected successfully
   Database: ispora
   Host: localhost:27017

✅ Connection Status:
   State: connected (1)
   Host: localhost:27017
   Database: ispora
   Retries: 0

🏥 Running health check...
✅ Health Check: PASSED
   Message: MongoDB connection is healthy
   Database: ispora
   Host: localhost:27017

📊 Testing database operations...
✅ Database operation successful
   Users in database: 0

✅ MongoDB connection test completed successfully!
```

---

## 📋 Environment Variables

### Development (.env file):

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/ispora

# OR for MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ispora?retryWrites=true&w=majority
```

### Production (Render.com):

1. Go to your Render dashboard
2. Select your service
3. Go to "Environment"
4. Add environment variable:
   - Key: `MONGO_URI`
   - Value: Your MongoDB Atlas connection string

---

## 🔍 Verify MongoDB is Working

### Check Server Logs:

When you start the server, you should see:
```
🔗 Connecting to MongoDB for Phase 1 features...
🔗 Connecting to MongoDB...
   URI: mongodb://***@localhost:27017/ispora
   Attempt: 1/4
✅ MongoDB connected successfully
   Database: ispora
   Host: localhost:27017
```

### Check Health Endpoint:

```bash
# Check health endpoint
curl http://localhost:5000/api/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-02-01T12:00:00.000Z",
  "environment": "development",
  "mongoDB": {
    "status": "connected",
    "isConnected": true,
    "readyState": 1,
    "database": "ispora",
    "host": "localhost",
    "port": 27017,
    "health": {
      "healthy": true,
      "status": "connected",
      "message": "MongoDB connection is healthy"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Connection Fails Immediately:

**Problem:** `MongoServerError: connection timed out`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   # OR
   brew services list
   ```

2. Verify connection string:
   ```bash
   # Test connection string
   mongosh "mongodb://localhost:27017/ispora"
   ```

3. Check firewall/network settings

### MongoDB Atlas Connection Issues:

**Problem:** `MongoServerError: bad auth` or `connection timeout`

**Solutions:**
1. Verify username and password are correct
2. Check IP whitelist (add `0.0.0.0/0` for development)
3. Verify connection string format
4. Check if cluster is paused (Atlas free tier pauses after inactivity)

### Connection Works but Routes Fail:

**Problem:** Routes return 503 "MONGO_NOT_AVAILABLE"

**Solutions:**
1. Check MongoDB health:
   ```bash
   npm run test:mongodb
   ```

2. Verify environment variable is set:
   ```bash
   echo $MONGO_URI
   # OR in Windows
   echo %MONGO_URI%
   ```

3. Restart server after setting environment variable

### Retry Logic Working:

If you see multiple retry attempts in logs:
```
⚠️ MongoDB connection failed (attempt 1/4): ...
   Retrying in 1 seconds...
⚠️ MongoDB connection failed (attempt 2/4): ...
   Retrying in 2 seconds...
```

This means:
- Connection is being attempted
- Server will continue retrying
- After 3 retries, it will give up gracefully
- Server continues running (routes return 503)

---

## 📚 Additional Resources

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com/
- **MongoDB Community Edition:** https://www.mongodb.com/try/download/community
- **Mongoose Documentation:** https://mongoosejs.com/docs/
- **Connection String Format:** https://docs.mongodb.com/manual/reference/connection-string/

---

## ✅ Success Checklist

- [ ] MongoDB installed or Atlas account created
- [ ] Connection string configured
- [ ] Environment variable `MONGO_URI` set
- [ ] Connection test passes: `npm run test:mongodb`
- [ ] Server logs show "✅ MongoDB connected successfully"
- [ ] Health endpoint shows MongoDB as connected
- [ ] Phase 3 routes work (don't return 503)

---

**That's it! Your MongoDB is now properly configured and ready to use! 🎉**

