// Coming Soon middleware
// If COMING_SOON=true, block public access except for:
// - Requests with valid dev key in header X-Dev-Key matching process.env.DEV_ACCESS_KEY
// - Authenticated admins (req.user.user_type === 'admin') when protect has run

module.exports = function comingSoon(options = {}) {
  const {
    enabled = process.env.COMING_SOON === 'true',
    devHeader = 'x-dev-key',
    devKey = process.env.DEV_ACCESS_KEY || 'dev123',
    allowPaths = ['/api/health', '/api/auth/login', '/api/auth/register']
  } = options;

  return function (req, res, next) {
    if (!enabled) return next();

    // Always allow health and explicit allow list paths
    if (allowPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    // Allow if dev key header is present and valid
    const headerKey = req.headers[devHeader];
    if (headerKey && headerKey === devKey) {
      return next();
    }

    // Allow if authenticated admin (protect should have set req.user)
    if (req.user && req.user.user_type === 'admin') {
      return next();
    }

    // Otherwise block with coming soon
    return res.status(503).json({
      success: false,
      message: 'Coming soon. The platform is currently in preparation. For development access, provide a valid dev key.'
    });
  };
};


