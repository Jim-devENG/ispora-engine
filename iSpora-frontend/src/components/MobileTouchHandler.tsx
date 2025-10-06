import React, { useState, useRef, useEffect } from 'react';

interface TouchHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  className?: string;
}

export function MobileTouchHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  className = ''
}: TouchHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startTime = Date.now();
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: startTime
    });

    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPress(true);
        onLongPress();
      }, longPressDelay);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if user moves finger
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Determine if it's a swipe or tap
    const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;
    const isQuickTap = deltaTime < 300 && !isSwipe;

    if (isSwipe) {
      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (isQuickTap && onTap && !isLongPress) {
      onTap();
    }

    setTouchStart(null);
    setIsLongPress(false);
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setTouchStart(null);
    setIsLongPress(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <div
      className={`touch-swipe ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {children}
    </div>
  );
}

// Hook for touch gestures
export function useTouchGestures() {
  const [gesture, setGesture] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
    } else {
      setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
    }

    setTouchStart(null);
  };

  const resetGesture = () => setGesture(null);

  return {
    gesture,
    resetGesture,
    handleTouchStart,
    handleTouchEnd
  };
}

// Mobile-optimized button with touch feedback
export function MobileTouchButton({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  [key: string]: any;
}) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'mobile-btn touch-target transition-all duration-150 active:scale-95';
  const variantClasses = {
    default: 'mobile-btn-secondary',
    primary: 'mobile-btn-primary',
    secondary: 'mobile-btn-secondary'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        isPressed ? 'scale-95' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-optimized card with touch interactions
export function MobileTouchCard({
  children,
  onClick,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  [key: string]: any;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`mobile-card touch-target transition-all duration-150 ${
        isPressed ? 'scale-98 shadow-md' : 'hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </div>
  );
}
