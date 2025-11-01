import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  // Only initialize Sentry if a valid DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || dsn.includes('your-dsn') || dsn.includes('project-id') || dsn.trim() === '') {
    console.log('🧩 Sentry skipped: No valid DSN provided');
    return;
  }

  try {
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
    console.log('✅ Sentry initialized successfully');
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error);
  }
}

// Set user context
export function setUserContext(user: { id: string; email: string; username?: string }) {
  try {
    if (typeof Sentry !== 'undefined' && Sentry.setUser) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }
  } catch (error) {
    console.warn('Failed to set Sentry user context:', error);
  }
}

// Clear user context
export function clearUserContext() {
  try {
    if (typeof Sentry !== 'undefined' && Sentry.setUser) {
      Sentry.setUser(null);
    }
  } catch (error) {
    console.warn('Failed to clear Sentry user context:', error);
  }
}

// Capture exceptions
export function captureException(error: Error, context?: Record<string, any>) {
  try {
    if (typeof Sentry !== 'undefined' && Sentry.captureException) {
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach(key => {
            scope.setContext(key, context[key]);
          });
        }
        Sentry.captureException(error);
      });
    }
  } catch (sentryError) {
    console.warn('Failed to capture exception in Sentry:', sentryError);
  }
}

// Capture messages
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    if (typeof Sentry !== 'undefined' && Sentry.captureMessage) {
      Sentry.captureMessage(message, level);
    }
  } catch (error) {
    console.warn('Failed to capture message in Sentry:', error);
  }
}
