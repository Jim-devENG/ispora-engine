# 🌐 iSpora Frontend Environment Setup

## Quick Setup

Create a `.env` file in the `iSpora-frontend` directory with the following content:

```bash
# Backend API URL
VITE_API_URL=https://ispora-backend.onrender.com/api

# Frontend URL (for CORS and redirects)
VITE_CLIENT_URL=https://ispora.app

# Development settings
VITE_DEV_MODE=false
VITE_DEBUG_API=false
```

## Environment Variables Explained

### `VITE_API_URL`
- **Production**: `https://ispora-backend.onrender.com/api`
- **Development**: `http://localhost:5000/api`
- **Purpose**: Base URL for all API calls to the backend

### `VITE_CLIENT_URL`
- **Production**: `https://ispora.app`
- **Development**: `http://localhost:3000`
- **Purpose**: Used for CORS configuration and redirects

### `VITE_DEV_MODE`
- **Production**: `false`
- **Development**: `true`
- **Purpose**: Enables development-specific features and logging

### `VITE_DEBUG_API`
- **Production**: `false`
- **Development**: `true`
- **Purpose**: Enables detailed API request/response logging

## Frontend API Configuration

The frontend uses multiple API client configurations:

1. **`src/utils/axiosConfig.ts`** - Main axios instance
2. **`src/services/apiClient.ts`** - Service layer API client
3. **`src/services/apiClient-v2.ts`** - Auth v2 API client
4. **`utils/api.ts`** - Utility API service

All clients automatically use `VITE_API_URL` as the base URL.

## Fixed Issues

✅ **Placeholder Images**: Now use correct backend URL (`/api/placeholder/40/40`)
✅ **Feed Activity**: Proper payload structure and error handling
✅ **CORS Headers**: Properly configured for production
✅ **Error Logging**: Enhanced debugging and error reporting

## Testing

To verify the configuration:

1. Start the backend: `npm start`
2. Start the frontend: `cd iSpora-frontend && npm run dev`
3. Create a project and check browser console for feed activity logs
4. Verify placeholder images load correctly

## Production Deployment

For production deployment on Vercel/Netlify:

1. Set environment variables in your deployment platform
2. Ensure `VITE_API_URL` points to `https://ispora-backend.onrender.com/api`
3. Verify CORS is properly configured on the backend
