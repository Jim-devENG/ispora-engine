# MongoDB Atlas - New Account Setup (Simple Guide)

**Step-by-step guide to create a new MongoDB Atlas account and get the free tier**

---

## 🎯 Step 1: Create New Account

1. **Go to MongoDB Atlas:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Or: https://cloud.mongodb.com/ (then click "Sign Up")

2. **Sign Up with New Email:**
   - Use a different email address (or create a new one)
   - Fill in your details
   - Click "Sign Up" or "Create Account"

3. **Verify Email:**
   - Check your email inbox
   - Click the verification link
   - You'll be redirected to MongoDB Atlas

---

## 🎯 Step 2: Create Free Cluster (M0)

1. **You'll See "Deploy a Cloud Database":**
   - After signing up, you'll see options to create a cluster
   - Look for "Free" or "M0" option

2. **If You Don't See Free Tier:**
   - Click "Build a Database" or "Create" button
   - Scroll down past the paid tiers (M30, M10, Flex)
   - **M0 Free tier is usually at the bottom**

3. **Select M0 Free Tier:**
   - Look for "M0" or "Free" option
   - Should show:
     - **Storage:** 512 MB
     - **RAM:** Shared
     - **Price:** FREE
   - Click on it

4. **Configure Cluster:**
   - **Provider:** AWS (recommended)
   - **Region:** Choose closest to your location (or Render region)
     - Good options: `us-east-1` (N. Virginia) or `us-west-2` (Oregon)
   - **Cluster Name:** `Cluster0` (default is fine, or name it `ispora-cluster`)

5. **Click "Create Cluster":**
   - This takes 3-5 minutes
   - Wait for it to finish building

---

## 🎯 Step 3: Create Database User

1. **You'll See "Create Database User" Screen:**
   - After cluster is created, you'll be prompted to create a user
   - If not, go to: Left sidebar → "Database Access"

2. **Fill in User Details:**
   - **Username:** `ispora-user` (or your choice)
   - **Password:** 
     - Click "Autogenerate Secure Password" (recommended)
     - **⚠️ IMPORTANT:** Copy this password immediately! Save it somewhere safe!
     - Or create your own strong password

3. **Set User Privileges:**
   - Select "Atlas admin" or "Read and write to any database"
   - This gives the user access to create databases

4. **Click "Create Database User"**

---

## 🎯 Step 4: Whitelist IP Address

1. **You'll See "Network Access" Screen:**
   - After creating user, you'll be prompted to whitelist IPs
   - If not, go to: Left sidebar → "Network Access"

2. **Add IP Address:**
   - Click "Add IP Address"
   - For development/testing: Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (allows all IPs)
   - **Note:** This is fine for development. For production, restrict later.

3. **Click "Confirm"**

---

## 🎯 Step 5: Get Connection String

1. **You'll See "Where would you like to connect from?" Screen:**
   - After whitelisting IP, you'll see connection options
   - If not, go to: Database → Click your cluster → "Connect"

2. **Choose "Connect your application":**
   - Click this option

3. **Copy Connection String:**
   - You'll see a connection string like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Replace `<username>`** with your username (e.g., `ispora-user`)
   - **Replace `<password>`** with your password (the one you saved!)

4. **Add Database Name:**
   - Add `/ispora` before the `?`
   - Final connection string:
     ```
     mongodb+srv://ispora-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ispora?retryWrites=true&w=majority
     ```

5. **Copy the Full Connection String**
   - This is what you'll use in Render

---

## 🎯 Step 6: Add to Render

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Sign in

2. **Select Your Service:**
   - Click on `ispora-backend` (your backend service)

3. **Go to Environment:**
   - Click "Environment" tab (left sidebar)

4. **Add Environment Variable:**
   - Click "Add Environment Variable"
   - **Key:** `MONGO_URI`
   - **Value:** Paste your connection string (from Step 5)
   - Example:
     ```
     mongodb+srv://ispora-user:MyPassword123@cluster0.abc123.mongodb.net/ispora?retryWrites=true&w=majority
     ```
   - Click "Save Changes"

5. **Redeploy:**
   - Render will automatically redeploy
   - Or click "Manual Deploy" → "Deploy latest commit"

---

## ✅ Step 7: Verify It's Working

1. **Check Render Logs:**
   - Go to Render → Your Service → "Logs"
   - Look for: `✅ MongoDB connected successfully`
   - Should show: `Database: ispora`

2. **Check Health Endpoint:**
   - Visit: `https://ispora-backend.onrender.com/api/v1/health`
   - Should show MongoDB as connected

3. **Test Phase 3 Routes:**
   - Try accessing Phase 3 routes (they shouldn't return 503 anymore)

---

## 📋 Quick Checklist

- [ ] Created new MongoDB Atlas account with new email
- [ ] Created M0 free cluster (wait 3-5 minutes)
- [ ] Created database user (`ispora-user` with password saved)
- [ ] Whitelisted IP address (`0.0.0.0/0` for development)
- [ ] Got connection string and added `/ispora` database name
- [ ] Added `MONGO_URI` to Render environment variables
- [ ] Verified connection in Render logs

---

## 💡 Tips

1. **Save Your Password:**
   - MongoDB passwords are hashed - you can't see them again
   - Save it in a password manager or secure notes

2. **Free Tier Limits:**
   - 512 MB storage (enough for development/testing)
   - Shared RAM (can be slower under load)
   - FREE forever ✅

3. **Test Locally First (Optional):**
   - Create `.env` file with:
     ```
     MONGO_URI=mongodb+srv://ispora-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ispora?retryWrites=true&w=majority
     ```
   - Run: `npm run test:mongodb`
   - If it works locally, it'll work on Render

---

## 🆘 Troubleshooting

### Can't Find Free Tier:
- Scroll down past paid tiers
- Try different region (`us-east-1` recommended)
- Make sure you're creating a NEW cluster (not upgrading)

### Connection Fails:
- Check password is correct (no extra spaces)
- Verify IP whitelist includes `0.0.0.0/0`
- Check cluster is not paused (free tier pauses after inactivity)

### Render Shows "MongoDB not configured":
- Verify `MONGO_URI` is set in Render environment variables
- Check variable name is exactly `MONGO_URI` (case-sensitive)
- Redeploy after adding environment variable

---

**That's it! Creating a new account is actually the simplest way to get started. You'll have everything set up in about 10 minutes! 🎉**

