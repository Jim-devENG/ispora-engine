# How to Get Your MongoDB Credentials - Step by Step

**Simple guide to find your MongoDB username, cluster, and password**

---

## 🎯 What You Need

To set up MongoDB for iSpora, you need 3 things:
1. **Username** - Your MongoDB user name
2. **Cluster** - Your MongoDB server address
3. **Password** - Your MongoDB user password

---

## 📍 Step 1: Get Your Username

### Where to Find It:

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com/
   - Sign in to your account

2. **Open Database Access:**
   - Look at the left sidebar menu
   - Click **"Database Access"** (or "Security" → "Database Access")

3. **Find Your Username:**
   - You'll see a list of users
   - Each user has a **username** (the name you see)
   - Common usernames: `admin`, `myuser`, `website_user`, etc.
   - **Write down or remember this username**

4. **Example:**
   ```
   Username: admin
   ```

---

## 📍 Step 2: Get Your Cluster Address

### Where to Find It:

1. **Go to Database Section:**
   - In MongoDB Atlas, click **"Database"** in the left sidebar
   - You'll see your clusters listed

2. **Click on Your Cluster:**
   - Click on the cluster you want to use (usually named "Cluster0" or similar)

3. **Click "Connect" Button:**
   - You'll see a "Connect" button - click it

4. **Choose "Connect your application":**
   - A popup will appear with connection options
   - Click **"Connect your application"**

5. **Copy the Connection String:**
   - You'll see a connection string that looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
     ```
   - The part **after @** and **before .mongodb.net/** is your cluster address
   - Example: `cluster0.abc123` or `cluster0.xyz789`

6. **Write Down Your Cluster Address:**
   - It's the part between `@` and `.mongodb.net/`
   - Example: `cluster0.abc123`

---

## 📍 Step 3: Get Your Password

### Option A: You Know Your Password

If you remember your password:
- ✅ **You're all set!** Use that password

### Option B: You Don't Remember Your Password

**Reset/Get Your Password:**

1. **Go to Database Access:**
   - Left sidebar → "Database Access"

2. **Find Your User:**
   - Click on the user you want to use (or the one you found in Step 1)

3. **Edit Password:**
   - Click the **"Edit"** button (or pencil icon)
   - Scroll down to "Password" section
   - Click **"Edit Password"**

4. **Choose Password Option:**
   - **Option 1:** Click **"Autogenerate Secure Password"** (recommended)
     - A secure password will be generated
     - **⚠️ IMPORTANT:** Copy this password immediately! You won't see it again!
   - **Option 2:** Enter your own password
     - Make it strong (12+ characters, mix of letters, numbers, symbols)

5. **Save Password:**
   - Click **"Update User"** or "Save"
   - **⚠️ Save the password somewhere safe!** (password manager, notes app, etc.)

---

## 🆕 Option C: Create New User for iSpora (Recommended)

**Better Security - Create a separate user just for iSpora:**

1. **Go to Database Access:**
   - Left sidebar → "Database Access"

2. **Click "Add New Database User"** button

3. **Fill in User Details:**
   - **Username:** `ispora-user` (or your choice)
   - **Password:** Click **"Autogenerate Secure Password"**
     - **⚠️ Copy the password immediately!** You won't see it again!
   - **Database User Privileges:**
     - Select **"Read and write to any database"** (or "Atlas admin")
     - This lets the user access the `ispora` database

4. **Click "Add User"**

5. **Save Your New Credentials:**
   - Username: `ispora-user` (or whatever you chose)
   - Password: The one you just generated (save it!)

---

## 🔗 Step 4: Build Your Connection String

### Put It All Together:

Your connection string format:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/ispora?retryWrites=true&w=majority
```

### Example:

If your details are:
- **Username:** `ispora-user`
- **Password:** `MySecurePass123!`
- **Cluster:** `cluster0.abc123`

Your connection string would be:
```
mongodb+srv://ispora-user:MySecurePass123!@cluster0.abc123.mongodb.net/ispora?retryWrites=true&w=majority
```

**Important:** Notice the `/ispora` before the `?` - this creates a separate database for iSpora!

---

## 📋 Quick Checklist

Before you go to Render, make sure you have:

- [ ] **Username** - Found in Database Access
  - Example: `ispora-user`

- [ ] **Password** - Either remembered or generated new
  - Example: `MySecurePass123!`

- [ ] **Cluster Address** - Found in Database → Connect
  - Example: `cluster0.abc123`

- [ ] **Full Connection String** - Combined everything
  - Example: `mongodb+srv://ispora-user:MySecurePass123!@cluster0.abc123.mongodb.net/ispora?retryWrites=true&w=majority`

---

## 🚀 Step 5: Add to Render

1. **Go to Render Dashboard:**
   - https://dashboard.render.com
   - Sign in

2. **Select Your Service:**
   - Click on `ispora-backend` (your backend service)

3. **Go to Environment Tab:**
   - Click "Environment" in the left sidebar

4. **Add Environment Variable:**
   - Click "Add Environment Variable"
   - **Key:** `MONGO_URI`
   - **Value:** Paste your full connection string (from Step 4)
   - Click "Save Changes"

5. **Wait for Redeploy:**
   - Render will automatically redeploy
   - Or click "Manual Deploy" → "Deploy latest commit"

---

## ✅ Verify It's Working

After Render redeploys:

1. **Check Render Logs:**
   - Go to Render → Your Service → "Logs"
   - Look for: `✅ MongoDB connected successfully`
   - Should show: `Database: ispora`

2. **Check Health Endpoint:**
   - Visit: `https://ispora-backend.onrender.com/api/v1/health`
   - Should show MongoDB as connected

---

## 🆘 Troubleshooting

### "Bad auth" Error:
- **Problem:** Wrong username or password
- **Solution:** Double-check username and password in connection string
- **Tip:** Special characters in password might need URL encoding

### "Connection timeout" Error:
- **Problem:** Network access not allowed
- **Solution:** Go to Atlas → "Network Access" → Add IP `0.0.0.0/0` (Allow from anywhere)

### "Database not found" Error:
- **Problem:** Database name might be wrong
- **Solution:** Make sure `/ispora` is in your connection string

---

## 💡 Tips

1. **Save Your Password:**
   - MongoDB passwords are hashed - you can't see them again
   - Save it in a password manager or secure notes

2. **Use Separate User:**
   - Creating a separate user for iSpora is more secure
   - Can revoke access independently

3. **Test Connection Locally First:**
   - Add connection string to `.env` file
   - Run: `npm run test:mongodb`
   - If it works locally, it'll work on Render

---

**That's it! You now have everything you need to set up MongoDB for iSpora! 🎉**

