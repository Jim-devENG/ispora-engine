# Authentication Setup Guide

## Overview
The iSpora application now includes a complete authentication system with login/logout functionality.

## Features
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Protected routes
- ✅ User profile management
- ✅ Secure logout
- ✅ Session persistence
- ✅ Beautiful login/register UI

## Setup Instructions

### 1. Backend Setup
Make sure your backend server is running on `http://localhost:3001`

### 2. Create Demo User
Run the demo user creation script:
```bash
cd iSpora-backend
node src/scripts/create-demo-user.js
```

This creates a demo user with:
- Email: `demo@ispora.com`
- Password: `demo123`

### 3. Frontend Environment
Create a `.env` file in the root directory (same level as package.json):
```env
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### 4. Start the Application
```bash
# Backend
cd iSpora-backend
npm start

# Frontend
cd iSpora-frontend
npm start
```

## Usage

### Login
1. Navigate to the application
2. You'll see the login page if not authenticated
3. Use the demo credentials or create a new account
4. Click "Sign In" to authenticate

### Register
1. Click the "Sign Up" tab on the login page
2. Fill in your details:
   - First Name & Last Name
   - Email address
   - Username (optional)
   - User Type (Student, Professional, or Mentor)
   - Password & Confirm Password
3. Click "Create Account"

### Logout
1. Click on your profile dropdown in the sidebar
2. Click "Log out"
3. Confirm the logout action

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatepassword` - Update password

### Protected Routes
All other API endpoints require authentication via JWT token.

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies for token storage
- Automatic token validation
- Secure logout with server-side session cleanup

## User Types
- **Student**: Currently studying or learning
- **Professional**: Working in industry
- **Mentor**: Experienced professional

## Troubleshooting

### Common Issues
1. **"Network error"**: Check if backend server is running
2. **"Invalid credentials"**: Verify email/password or create new account
3. **"Token expired"**: Logout and login again

### Development Tips
- Check browser console for detailed error messages
- Verify API endpoints are accessible
- Ensure CORS is properly configured on backend
- Check network tab for failed requests

## File Structure
```
iSpora-frontend/
├── components/
│   ├── AuthContext.tsx          # Authentication context
│   ├── LoginPage.tsx            # Login/Register UI
│   ├── ProtectedRoute.tsx       # Route protection
│   └── UserProfileDropdown.tsx  # Updated with auth
├── utils/
│   └── api.ts                   # API service utilities
└── App.tsx                      # Updated with auth providers
```

## Next Steps
- Add password reset functionality
- Implement email verification
- Add two-factor authentication
- Create admin user management
- Add social login options
