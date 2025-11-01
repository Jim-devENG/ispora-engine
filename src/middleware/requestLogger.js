const logger = require('../utils/logger');

/**
 * 🧍‍♂️ OBSERVABILITY LAW - Enhanced request logging middleware
 * Logs all incoming requests with detailed context
 * Tracks payloads, responses, and performance metrics
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  
  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString()
  }, `📩 ${req.method} ${req.url}`);
  
  // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = sanitizeRequestBody(req.body, req.url);
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      body: sanitizedBody,
      bodySize: JSON.stringify(req.body).length
    }, `📩 ${req.method} ${req.url} - payload`);
    
    // Additional debugging for specific routes
    if (req.url.includes('/auth/')) {
      console.log('🔍 Auth request debugging:', {
        url: req.url,
        hasEmail: !!req.body.email,
        hasPassword: !!req.body.password,
        hasFirstName: !!req.body.firstName,
        hasLastName: !!req.body.lastName
      });
    }
    
    if (req.url.includes('/projects')) {
      console.log('🔍 Project request debugging:', {
        url: req.url,
        hasTitle: !!req.body.title,
        hasDescription: !!req.body.description,
        hasCategory: !!req.body.category,
        hasType: !!req.body.type,
        hasPriority: !!req.body.priority,
        userId: req.user?.id
      });
    }
  }
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length,
      success: body?.success !== false
    }, `✅ ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    
    // Log error responses with more detail
    if (res.statusCode >= 400) {
      logger.warn({
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        error: body?.error,
        code: body?.code,
        duration: `${duration}ms`
      }, `❌ ${req.method} ${req.url} - ${res.statusCode} error`);
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body, url) {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'jwt'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // For auth routes, only log essential fields
  if (url.includes('/auth/')) {
    return {
      email: sanitized.email,
      firstName: sanitized.firstName,
      lastName: sanitized.lastName,
      hasPassword: !!sanitized.password
    };
  }
  
  return sanitized;
}

module.exports = requestLogger;
