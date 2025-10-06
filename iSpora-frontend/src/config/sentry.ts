import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  // Only initialize Sentry if a valid DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || dsn.includes('your-dsn') || dsn.includes('project-id')) {
    console.log('Sentry not initialized: No valid DSN provided');
    return;
  }

  Sentry.init({
    dsn: dsn,
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/ispora\.app/,
          /^https:\/\/.*\.onrender\.com/,
        ],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: import.meta.env.VITE_SENTRY_RELEASE || 'unknown',
    // Error filtering
    beforeSend(event, hint) {
      // Filter out development errors
      if (import.meta.env.MODE === 'development') {
        return null;
      }
      return event;
    },
    // User context
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      return breadcrumb;
    },
  });
}

// Set user context
export function setUserContext(user: { id: string; email: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Clear user context
export function clearUserContext() {
  Sentry.setUser(null);
}

// Capture exceptions
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

// Capture messages
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
