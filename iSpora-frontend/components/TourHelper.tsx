import React from 'react';

interface TourElementProps {
  tourId: string;
  children: React.ReactNode;
  className?: string;
}

export function TourElement({ tourId, children, className }: TourElementProps) {
  return (
    <div data-tour={tourId} className={className}>
      {children}
    </div>
  );
}

// Hook to manage tour state
export function useTour() {
  const [activeTour, setActiveTour] = React.useState<string | null>(null);
  
  const startTour = (tourId: string) => {
    setActiveTour(tourId);
  };
  
  const endTour = () => {
    setActiveTour(null);
  };
  
  return {
    activeTour,
    startTour,
    endTour
  };
}
