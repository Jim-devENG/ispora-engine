/**
 * Health Check Caching Middleware
 * Reduces redundant processing for Render health checks
 */

const cache = {
  data: null,
  timestamp: null,
  ttl: 5000 // 5 seconds cache
};

const healthCache = (req, res, next) => {
  // Only cache GET requests to /api/health
  if (req.method === 'GET' && req.path === '/api/health') {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cache.data && cache.timestamp && (now - cache.timestamp) < cache.ttl) {
      console.log('📦 Serving cached health check');
      return res.json(cache.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.data = data;
      cache.timestamp = now;
      
      // Call original json method
      return originalJson.call(this, data);
    };
  }
  
  next();
};

module.exports = healthCache;

