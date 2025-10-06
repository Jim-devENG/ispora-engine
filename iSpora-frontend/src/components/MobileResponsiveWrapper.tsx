import React from 'react';
import { useMobile } from '../hooks/useMobile';

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  mobileClassName?: string;
  desktopClassName?: string;
  fallback?: React.ReactNode;
}

export function MobileResponsiveWrapper({
  children,
  mobileClassName = '',
  desktopClassName = '',
  fallback
}: MobileResponsiveWrapperProps) {
  const { isMobile } = useMobile();

  if (isMobile && fallback) {
    return <div className={mobileClassName}>{fallback}</div>;
  }

  return (
    <div className={isMobile ? mobileClassName : desktopClassName}>
      {children}
    </div>
  );
}

// Higher-order component for mobile responsiveness
export function withMobileResponsive<P extends object>(
  Component: React.ComponentType<P>,
  mobileProps?: Partial<P>,
  desktopProps?: Partial<P>
) {
  return function MobileResponsiveComponent(props: P) {
    const { isMobile } = useMobile();
    
    const enhancedProps = {
      ...props,
      ...(isMobile ? mobileProps : desktopProps)
    };

    return <Component {...enhancedProps} />;
  };
}

// Hook for conditional mobile rendering
export function useMobileRender() {
  const { isMobile } = useMobile();

  return {
    isMobile,
    renderMobile: (mobileComponent: React.ReactNode, desktopComponent: React.ReactNode) => 
      isMobile ? mobileComponent : desktopComponent,
    showOnMobile: (component: React.ReactNode) => isMobile ? component : null,
    showOnDesktop: (component: React.ReactNode) => !isMobile ? component : null,
  };
}
