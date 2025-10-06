# Production Setup Guide

This guide covers the production-ready features implemented in iSpora.

## 🚀 Features Implemented

### 1. Error Tracking & Monitoring
- **Sentry Integration**: Real-time error tracking for both frontend and backend
- **Performance Monitoring**: Track API response times and user interactions
- **Release Tracking**: Monitor errors by application version

### 2. Structured Logging
- **Pino Logger**: High-performance JSON logging
- **Request IDs**: Track requests across the entire stack
- **Structured Data**: Consistent log format for easy parsing

### 3. Background Job Processing
- **Redis + BullMQ**: Reliable job queue system
- **Notification System**: Async email and push notifications
- **Analytics Processing**: Background event tracking
- **Retry Logic**: Automatic retry with exponential backoff

### 4. Code Quality & CI/CD
- **Prettier**: Consistent code formatting
- **TypeScript Strict Mode**: Enhanced type safety
- **GitHub Actions**: Automated testing and deployment
- **ESLint**: Code quality enforcement

## 🛠 Setup Instructions

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=sqlite:./data/ispora.db

# Server
PORT=3001
NODE_ENV=production

# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_RELEASE=1.0.0

# Logging
LOG_LEVEL=info

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=https://your-api-domain.com/api

# Sentry
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_SENTRY_RELEASE=1.0.0
```

### Redis Setup

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   
   # Windows
   # Download from https://redis.io/download
   ```

2. **Start Redis**:
   ```bash
   redis-server
   ```

3. **Verify Connection**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Sentry Setup

1. **Create Sentry Project**:
   - Go to [sentry.io](https://sentry.io)
   - Create a new project for Node.js (backend)
   - Create a new project for React (frontend)

2. **Get DSN**:
   - Copy the DSN from your Sentry project settings
   - Add to environment variables

3. **Configure Release Tracking**:
   ```bash
   # Set release version
   export SENTRY_RELEASE=1.0.0
   export VITE_SENTRY_RELEASE=1.0.0
   ```

### Deployment

#### Backend Deployment
```bash
# Install dependencies
npm install

# Set environment variables
cp env.example .env
# Edit .env with your values

# Start the server
npm start
```

#### Frontend Deployment
```bash
# Install dependencies
npm install

# Set environment variables
cp env.example .env
# Edit .env with your values

# Build for production
npm run build

# Serve the built files
npm run preview
```

## 📊 Monitoring & Observability

### Logs
- **Format**: JSON structured logs
- **Levels**: error, warn, info, debug
- **Request Tracking**: Each request has a unique ID
- **Context**: User ID, IP, User-Agent included

### Metrics
- **Response Times**: Tracked automatically
- **Error Rates**: Monitored via Sentry
- **Queue Health**: BullMQ dashboard available
- **Database Performance**: Query timing in logs

### Alerts
- **Error Thresholds**: Set up Sentry alerts
- **Queue Backlog**: Monitor job queue length
- **Memory Usage**: Track application memory
- **Response Times**: Alert on slow endpoints

## 🔧 Development

### Local Development
```bash
# Start Redis
redis-server

# Start Backend
cd iSpora-backend
npm run dev

# Start Frontend
cd iSpora-frontend
npm run dev
```

### Code Quality
```bash
# Format code
npm run format

# Type check
npm run typecheck

# Lint
npm run lint
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**:
   - Check if Redis is running: `redis-cli ping`
   - Verify connection settings in .env

2. **Sentry Not Working**:
   - Verify DSN is correct
   - Check network connectivity
   - Ensure release version is set

3. **Queue Jobs Not Processing**:
   - Check Redis connection
   - Verify worker processes are running
   - Check job queue in Redis: `redis-cli monitor`

4. **Logs Not Appearing**:
   - Check LOG_LEVEL setting
   - Verify log output destination
   - Check file permissions

### Performance Optimization

1. **Redis Optimization**:
   - Configure Redis memory settings
   - Set up Redis persistence
   - Monitor Redis memory usage

2. **Logging Optimization**:
   - Use appropriate log levels
   - Implement log rotation
   - Consider log aggregation services

3. **Queue Optimization**:
   - Tune worker concurrency
   - Set appropriate retry policies
   - Monitor queue metrics

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancer**: Use nginx or similar
- **Multiple Backend Instances**: Scale horizontally
- **Redis Cluster**: For high availability
- **Database Scaling**: Consider read replicas

### Vertical Scaling
- **Memory**: Increase Node.js heap size
- **CPU**: Optimize worker processes
- **Storage**: Use SSD for database
- **Network**: Optimize connection pooling

## 🔒 Security

### Production Security
- **Environment Variables**: Never commit secrets
- **HTTPS**: Use SSL/TLS certificates
- **Rate Limiting**: Configure appropriate limits
- **CORS**: Restrict to production domains
- **Helmet**: Security headers enabled

### Monitoring Security
- **Error Tracking**: Monitor for security issues
- **Access Logs**: Track suspicious activity
- **Failed Logins**: Alert on brute force attempts
- **API Abuse**: Monitor rate limit violations

## 📚 Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Pino Logger](https://getpino.io/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
