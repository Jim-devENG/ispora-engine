const Sentry = require('@sentry/node');

function initSentry() {
  // Only initialize Sentry if a valid DSN is provided
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || dsn.includes('your-dsn') || dsn.includes('project-id')) {
    console.log('Sentry not initialized: No valid DSN provided');
    return;
  }

  // Skip profiling integration for now to avoid deployment issues
  const integrations = [];

  Sentry.init({
    dsn: dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: integrations,
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling disabled to avoid deployment issues
    profilesSampleRate: 0,
    // Release tracking
    release: process.env.SENTRY_RELEASE || 'unknown',
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}

module.exports = { initSentry };
