// Console cleanup utility to suppress non-application errors
export function setupConsoleCleanup() {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to filter out extension errors
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out Chrome extension errors
    if (
      message.includes('chrome-extension://invalid/') ||
      message.includes('web_accessible_resources') ||
      message.includes('contentScript.bundle.js') ||
      message.includes('GET chrome-extension://invalid/')
    ) {
      return; // Suppress these errors
    }
    
    // Allow Sentry warnings (they're expected)
    if (message.includes('Sentry not initialized')) {
      return; // Suppress Sentry warnings
    }
    
    // Allow other errors through
    originalError.apply(console, args);
  };

  // Override console.warn to filter out extension warnings
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out Chrome extension warnings
    if (
      message.includes('chrome-extension://invalid/') ||
      message.includes('web_accessible_resources') ||
      message.includes('contentScript.bundle.js')
    ) {
      return; // Suppress these warnings
    }
    
    // Allow other warnings through
    originalWarn.apply(console, args);
  };
}

// Auto-setup if in browser
if (typeof window !== 'undefined') {
  setupConsoleCleanup();
}
