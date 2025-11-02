# iSpora Backend Authentication Flow

## Overview

The iSpora backend uses JWT (JSON Web Tokens) for authentication. All protected routes require a valid JWT token in the `Authorization` header.

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "student" // optional, defaults to "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

**Notes:**
- Email is normalized to lowercase before storage
- Password is hashed with bcrypt (12 salt rounds)
- JWT token is signed with `process.env.JWT_SECRET` (required, no fallbacks)
- Token expires in 7 days (configurable via `JWT_EXPIRES_IN`)

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    ...
  }
}
```

**Notes:**
- Email is normalized to lowercase before lookup
- Password is verified using `bcrypt.compare()`
- JWT token is signed with `process.env.JWT_SECRET`
- Token includes `id` (user ID) and `email` in payload

### 3. Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Notes:**
- Requires valid authentication token
- Verifies user still exists in database
- Issues new token with same user info
- Extends session without requiring re-login

### 4. Protected Routes

All protected routes require the `Authorization` header:

```
Authorization: Bearer <token>
```

**Protected Routes:**
- `POST /api/projects` - Create project
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Public Routes:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/projects` - List projects (public)
- `GET /api/feed` - Get feed (public)

## Authentication Middleware

The `authenticateToken` middleware (aliased as `verifyToken`) is used to protect routes:

```javascript
const { authenticateToken } = require('../middleware/auth');

router.post('/projects', authenticateToken, createProject);
```

### Middleware Behavior

1. **Extracts token** from `Authorization: Bearer <token>` header
2. **Verifies JWT** using `process.env.JWT_SECRET`
3. **Validates token payload** contains `id` (user ID)
4. **Verifies user exists** in database
5. **Attaches user info** to `req.user`:
   ```javascript
   req.user = {
     id: user.id,
     email: user.email,
     firstName: user.first_name,
     lastName: user.last_name
   }
   ```

## Error Responses

### 401 Unauthorized

All authentication errors return `401 Unauthorized` with specific error codes:

#### NO_TOKEN
```json
{
  "success": false,
  "error": "Access token required",
  "code": "NO_TOKEN",
  "message": "Please log in again."
}
```

#### TOKEN_EXPIRED
```json
{
  "success": false,
  "error": "Session expired",
  "code": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please log in again."
}
```

#### INVALID_TOKEN
```json
{
  "success": false,
  "error": "Invalid token",
  "code": "INVALID_TOKEN",
  "message": "Please log in again."
}
```

#### USER_NOT_FOUND / SESSION_EXPIRED
```json
{
  "success": false,
  "error": "Session expired",
  "code": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please log in again."
}
```

**Note:** The middleware returns "Session expired" instead of "User not found" to prevent confusion. If a valid token contains a user ID that doesn't exist in the database, it's treated as an expired session.

### 500 Server Error

#### SERVER_ERROR
```json
{
  "success": false,
  "error": "Server configuration error",
  "code": "SERVER_ERROR",
  "message": "Server configuration error. Please contact support."
}
```

Occurs when `JWT_SECRET` is not configured.

## Frontend Integration

### Token Storage

Store token in `localStorage`:
```javascript
localStorage.setItem('token', token);
```

### Request Headers

Include token in all authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Error Handling

The frontend API client (`apiClient-v2.ts`) automatically handles 401 errors:

1. **Clears token** from `localStorage`
2. **Shows toast notification** with error message
3. **Redirects to login** page after 2 seconds

**Error Code Handling:**
- `TOKEN_EXPIRED` → "Session expired. Please log in again."
- `INVALID_TOKEN` → "Invalid session. Please log in again."
- `NO_TOKEN` → "Please log in to continue."
- `USER_NOT_FOUND` / `SESSION_EXPIRED` → "Session expired. Please log in again."

## Security Best Practices

1. **JWT_SECRET is required** - No fallbacks, must be set in environment
2. **Email normalization** - All emails are lowercase and trimmed
3. **Password hashing** - bcrypt with 12 salt rounds
4. **Token expiration** - Default 7 days (configurable)
5. **Database verification** - User must exist in database for token to be valid
6. **Clear error messages** - "Session expired" instead of "User not found" to prevent confusion

## Environment Variables

```bash
JWT_SECRET=your-secret-key-here # REQUIRED - no fallbacks
JWT_EXPIRES_IN=7d               # Optional - defaults to 7d
```

## Testing

Run pre-deployment tests:
```bash
npm run test:pre-deploy
```

Tests verify:
- Database connection
- User registration
- User login
- Token generation
- Protected route access

