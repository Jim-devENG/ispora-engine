import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 475) {
        setScreenSize('xs');
        setIsMobile(true);
        setIsTablet(false);
      } else if (width < 640) {
        setScreenSize('sm');
        setIsMobile(true);
        setIsTablet(false);
      } else if (width < 768) {
        setScreenSize('md');
        setIsMobile(false);
        setIsTablet(true);
      } else if (width < 1024) {
        setScreenSize('lg');
        setIsMobile(false);
        setIsTablet(true);
      } else if (width < 1280) {
        setScreenSize('xl');
        setIsMobile(false);
        setIsTablet(false);
      } else {
        setScreenSize('2xl');
        setIsMobile(false);
        setIsTablet(false);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    isMobile,
    isTablet,
    screenSize,
    isDesktop: !isMobile && !isTablet
  };
}

export function useTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
  }, []);

  return isTouch;
}

export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    orientation: 'portrait' as 'portrait' | 'landscape'
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}
