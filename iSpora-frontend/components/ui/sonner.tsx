'use client';

import { Toaster as Sonner, ToasterProps } from 'sonner';
import { useTheme } from '../ThemeProvider';

const Toaster = ({ ...props }: ToasterProps) => {
  const { actualTheme } = useTheme();

  return (
    <Sonner
      theme={actualTheme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
