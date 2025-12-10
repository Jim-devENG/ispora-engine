# How to Disable Email Confirmation in Supabase

## Quick Fix for "Email Not Confirmed" Error

If you're seeing "Email not confirmed" errors when trying to log in, you need to disable email confirmation in your Supabase project settings.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open Authentication Settings**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Providers"** (or go to Settings → Auth)

3. **Find Email Provider**
   - Scroll down to find the **"Email"** provider section
   - Click on it to expand

4. **Disable Email Confirmation**
   - Find the **"Confirm email"** toggle/checkbox
   - **Turn it OFF** (uncheck it)
   - This allows users to sign up and log in immediately without email verification

5. **Save Changes**
   - Click **"Save"** or the changes will auto-save

### Important Notes:

- ⚠️ **For Development Only**: Disabling email confirmation is fine for development/testing
- 🔒 **For Production**: You should enable email confirmation for security
- 📧 **Existing Users**: Users who already signed up will need to confirm their email OR you can manually confirm them in the Supabase dashboard

### Manual Email Confirmation (Alternative):

If you want to keep email confirmation enabled but manually confirm a user:

1. Go to **Authentication** → **Users**
2. Find the user by email
3. Click on the user
4. Click **"Confirm email"** button

---

**After disabling email confirmation, try logging in again. The error should be gone!**

