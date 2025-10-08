import React, { useEffect } from 'react';
import { useViewport } from '../hooks/useMobile';

interface MobileViewportProps {
  children: React.ReactNode;
}

export function MobileViewport({ children }: MobileViewportProps) {
  const { width, height, orientation } = useViewport();

  useEffect(() => {
    // Set viewport meta tag for proper mobile rendering
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Prevent zoom on input focus (iOS)
    const preventZoom = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          );
        }
      }
    };

    document.addEventListener('focusin', preventZoom);
    document.addEventListener('focusout', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    });

    return () => {
      document.removeEventListener('focusin', preventZoom);
    };
  }, []);

  // Add orientation change handling
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force a re-render when orientation changes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  return (
    <div 
      className="mobile-viewport"
      style={{
        minHeight: '100dvh', // Dynamic viewport height for mobile
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {children}
    </div>
  );
}
