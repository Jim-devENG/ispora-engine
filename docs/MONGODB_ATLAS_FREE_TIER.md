# How to Find MongoDB Atlas Free Tier (M0)

**If you don't see the free tier option, here's how to find it:**

---

## 🎯 Finding the Free Tier

### Option 1: Look for "M0" or "Free"

When creating a cluster, scroll down past the paid tiers (M30, M10, Flex). The **M0 Free** tier is usually at the **bottom** of the list:

1. **Scroll down** past the paid options (M30, M10, Flex)
2. Look for **"M0"** or **"Free"** tier option
3. It should show:
   - **Storage:** 512 MB
   - **RAM:** Shared
   - **Price:** FREE

### Option 2: Use Direct Link

Sometimes the free tier is only visible when you:
1. Click "Create" without selecting a paid tier
2. Or go directly to: https://www.mongodb.com/cloud/atlas/register

### Option 3: Check Account Type

If you still don't see it:
1. Make sure you're creating a **new cluster** (not upgrading)
2. Free tier is only available for **new accounts** or accounts that haven't used free tier before
3. If you already have an M0 cluster, you can't create another one (one free cluster per account)

---

## 🔍 What to Look For

The free tier (M0) should look like this:

```
M0
FREE
Dedicated cluster for learning and development.

STORAGE
512 MB
RAM
Shared
vCPU
Shared

✅ Free forever
✅ No credit card required
```

---

## 🆘 If Free Tier Isn't Available

### Reason 1: Account Already Has M0 Cluster
- **Solution:** You can only have ONE free M0 cluster per account
- **Check:** Go to your MongoDB Atlas dashboard → See if you already have a cluster

### Reason 2: Looking at Wrong Section
- **Solution:** Make sure you're in "Database" → "Deploy a Cloud Database"
- **Not in:** "Serverless" or "Shared" (those are different)

### Reason 3: Free Tier Not Available in Your Region
- **Solution:** Try a different region (some regions don't offer M0)
- **Recommended regions for M0:**
  - `us-east-1` (N. Virginia)
  - `us-west-2` (Oregon)
  - `eu-west-1` (Ireland)
  - `ap-southeast-1` (Singapore)

### Reason 4: Account Restrictions
- **Solution:** Create a new account with a different email
- Or contact MongoDB Atlas support

---

## 🎯 Alternative: Use "Flex" (Pay-as-you-go)

If free tier isn't available, you can use **Flex** tier which is very cheap:

- **Starting at:** $0.011/hour (~$0.26/day or ~$8/month)
- **5 GB storage**
- **Pay only when you use it**
- Can terminate anytime
- No upfront cost

**For development/testing, Flex tier costs:**
- If cluster is running 24/7: ~$8/month
- If you stop it when not using: Much cheaper
- You can pause clusters on some tiers

---

## ✅ Step-by-Step: Create M0 Free Cluster

1. **Go to MongoDB Atlas:**
   - https://www.mongodb.com/cloud/atlas
   - Sign in (or create account)

2. **Click "Create" or "Build a Database":**
   - Look for button to create new cluster

3. **Scroll down to find M0:**
   - Past M30, M10, Flex options
   - Should see "M0" or "Free" option at bottom

4. **Select M0:**
   - Click on M0/Free option
   - You should see "FREE" prominently displayed

5. **Configure:**
   - Provider: AWS (recommended)
   - Region: Choose closest to your Render region
   - Cluster Name: `ispora-cluster` (or your choice)

6. **Click "Create Cluster"**

---

## 💡 Tips

1. **M0 is sometimes hidden** - scroll all the way down
2. **Only available for new clusters** - not upgrades
3. **One per account** - can't have multiple M0 clusters
4. **512 MB limit** - enough for development/testing
5. **Can upgrade later** - if you outgrow free tier

---

## 🆘 Still Can't Find It?

If you absolutely cannot find the free tier:

1. **Try Flex tier** ($0.011/hour - very cheap for testing)
2. **Use local MongoDB** for development
3. **Contact MongoDB Atlas support** - they can help
4. **Create new account** - free tier should be available for new accounts

---

**Bottom line:** The M0 free tier exists and is available. Scroll down past the paid tiers, or check if you already have an M0 cluster on your account.

