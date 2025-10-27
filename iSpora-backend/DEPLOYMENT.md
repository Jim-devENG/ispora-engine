# iSpora Backend Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the iSpora backend to Render.com and running it locally.

## Environment Variables

### Required Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT token signing
- `DATABASE_URL`: PostgreSQL connection string (production) or SQLite path (development)

### Optional Variables

- `SENTRY_DSN`: Sentry error tracking DSN
- `CLIENT_URL`: Frontend URL for CORS (default: https://ispora.app)
- `LOG_LEVEL`: Logging level (default: info)

## Local Development

### Prerequisites

- Node.js 22.16.0 or higher
- npm 8.0.0 or higher

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run migrate`: Run database migrations
- `npm run migrate:rollback`: Rollback last migration
- `npm run seed`: Run database seeds
- `npm test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## Render.com Deployment

### Automatic Deployment

The backend is configured for automatic deployment from the main branch using the `render.yaml` configuration file.

### Manual Setup

1. **Create a new Web Service on Render.com:**
   - Connect your GitHub repository
   - Set the root directory to `iSpora-backend`
   - Choose Node.js as the environment

2. **Configure build and start commands:**
   - Build Command: `npm install && npm run migrate --if-present && npm run seed --if-present`
   - Start Command: `npm start`

3. **Set environment variables:**
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `JWT_SECRET`: Generate a secure random string
   - `DATABASE_URL`: PostgreSQL connection string (see database setup below)

4. **Set up PostgreSQL database:**
   - Create a new PostgreSQL database on Render.com
   - Copy the connection string to `DATABASE_URL`
   - The database will be automatically migrated on deployment

### Health Check

The service includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

## Database Management

### Migrations

Migrations are automatically run during deployment. To run manually:

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Seeds

Seeds are run during initial deployment. To run manually:

```bash
npm run seed
```

### Database Schema

The database includes the following tables:
- `users`: User accounts and authentication
- `projects`: User-created projects
- `feed_entries`: Activity feed entries
- `sessions`: User sessions (for future use)

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user (protected)

### Projects
- `POST /api/projects`: Create new project (protected)
- `GET /api/projects`: List all projects
- `GET /api/projects/:id`: Get specific project

### Feed
- `GET /api/feed`: Get activity feed
- `POST /api/feed/activity`: Track activity
- `GET /api/feed/sessions`: Get active sessions
- `GET /api/feed/stream`: Server-sent events stream

### Health
- `GET /api/health`: Health check endpoint

## Monitoring and Logging

### Logging

The application uses Pino for structured logging:
- Development: Pretty-printed logs with colors
- Production: JSON logs for easy parsing

### Error Tracking

Sentry integration is available (optional):
- Set `SENTRY_DSN` environment variable
- Errors are automatically tracked and reported

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify `DATABASE_URL` is correctly set
   - Ensure database is accessible from Render.com
   - Check if migrations have been run

2. **Authentication Errors:**
   - Verify `JWT_SECRET` is set and consistent
   - Check token expiration settings
   - Ensure proper CORS configuration

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript/ESLint errors

### Rollback Instructions

If deployment fails:

1. **Revert to previous commit:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Manual rollback on Render.com:**
   - Go to your service dashboard
   - Click on "Manual Deploy"
   - Select the previous successful commit

3. **Database rollback:**
   ```bash
   npm run migrate:rollback
   ```

## Security Considerations

- JWT secrets should be strong and unique
- Database credentials should be kept secure
- CORS is configured for specific origins
- Rate limiting is enabled for API endpoints
- Helmet.js provides security headers

## Performance

- Database queries are optimized with proper indexing
- Connection pooling is configured for PostgreSQL
- Rate limiting prevents abuse
- Caching headers are set for static content

## Support

For issues or questions:
1. Check the logs in Render.com dashboard
2. Review the health check endpoint
3. Check GitHub Actions for CI/CD status
4. Review this documentation for common solutions
