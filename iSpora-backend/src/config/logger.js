const pino = require('pino');
const { v4: uuidv4 } = require('uuid');

// Create base logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Request logger middleware
function createRequestLogger() {
  return (req, res, next) => {
    const requestId = req.headers['x-request-id'] || uuidv4();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const start = Date.now();
    
    // Log request
    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    }, 'Incoming request');

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - start;
      
      logger.info({
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      }, 'Request completed');

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// Child logger factory
function createChildLogger(context = {}) {
  return logger.child(context);
}

// Error logger
function logError(error, context = {}) {
  logger.error({
    ...context,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }, 'Error occurred');
}

module.exports = {
  logger,
  createRequestLogger,
  createChildLogger,
  logError,
};
