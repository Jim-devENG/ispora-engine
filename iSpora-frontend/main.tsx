import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import { initSentry } from './src/config/sentry';
import { MobileErrorBoundary } from './src/components/MobileErrorBoundary';
import './src/utils/console-cleanup';

// Initialize Sentry
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MobileErrorBoundary>
      <App />
    </MobileErrorBoundary>
  </React.StrictMode>,
);
