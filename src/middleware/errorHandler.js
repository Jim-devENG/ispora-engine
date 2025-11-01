const logger = require('../utils/logger');
const { ValidationError } = require('../utils/validation');

/**
 * 🧠 ERROR HANDLING LAW - Enhanced global error handler
 * Provides structured JSON errors with comprehensive logging
 * Never exposes stack traces to clients in production
 */

const errorHandler = (error, req, res, next) => {
  // Log comprehensive error details
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }, '❌ Unhandled error occurred');

  // Log to Sentry if available
  if (typeof Sentry !== 'undefined' && Sentry.captureException) {
    try {
      Sentry.captureException(error);
    } catch (sentryError) {
      logger.warn('Failed to capture exception in Sentry:', sentryError);
    }
  }

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details = null;

  // Handle specific error types with detailed responses
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    code = 'VALIDATION_ERROR';
    details = error.details;
    
    logger.warn({
      validationError: {
        message: error.message,
        details: error.details,
        schema: error.details?.schema
      },
      request: {
        url: req.url,
        method: req.method,
        body: req.body
      }
    }, '❌ Validation error');
    
  } else if (error.name === 'UnauthorizedError' || error.message?.includes('jwt')) {
    statusCode = 401;
    message = 'Unauthorized - invalid or expired token';
    code = 'UNAUTHORIZED';
    
    logger.warn({
      authError: error.message,
      request: { url: req.url, method: req.method }
    }, '❌ Authentication error');
    
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden - insufficient permissions';
    code = 'FORBIDDEN';
    
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
    
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = error.message;
    code = 'CONFLICT';
    
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Service temporarily unavailable - database connection failed';
    code = 'SERVICE_UNAVAILABLE';
    
    logger.error({
      databaseError: error.message,
      code: error.code
    }, '❌ Database connection error');
    
  } else if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505' || error.code === '23503' || error.code === '23502') {
    statusCode = 400;
    code = 'CONSTRAINT_ERROR';
    
    // Specific constraint error messages
    if (error.code === '23503') {
      message = 'Foreign key constraint failed. User may not exist. Please log in again.';
      code = 'USER_NOT_FOUND';
    } else if (error.code === '23505') {
      message = 'Duplicate entry. This item already exists.';
      code = 'DUPLICATE_ENTRY';
    } else if (error.code === '23502') {
      message = 'Required field is missing. Please check your data.';
      code = 'MISSING_REQUIRED_FIELD';
    } else if (error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('email')) {
        message = 'Email already exists. Please use a different email.';
        code = 'EMAIL_EXISTS';
      } else if (error.message.includes('username')) {
        message = 'Username already exists. Please choose a different username.';
        code = 'USERNAME_EXISTS';
      } else if (error.message.includes('slug')) {
        message = 'Project slug already exists. Please try another name.';
        code = 'SLUG_EXISTS';
      } else {
        message = 'Duplicate entry. This item already exists.';
      }
    } else {
      message = 'Database constraint error. Please check your data.';
    }
    
    details = {
      constraint: error.constraint,
      code: error.code,
      message: error.message
    };
    
  } else if (error.code === 'EADDRINUSE') {
    statusCode = 503;
    message = 'Service temporarily unavailable - port already in use';
    code = 'SERVICE_UNAVAILABLE';
    
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'CUSTOM_ERROR';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  // Prepare response
  const response = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Add details only in development or for specific error types
  if (process.env.NODE_ENV === 'development' || (details && statusCode !== 500)) {
    response.details = details;
  }

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // 🛡️ DevOps Guardian: Always add CORS headers to error responses
  const origin = req.headers.origin;
  if (origin && (
    origin.includes('ispora.app') || 
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }

  // Log successful error response
  logger.info({
    statusCode,
    code,
    message,
    url: req.url,
    method: req.method
  }, '✅ Error response sent');

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
