import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ComingSoon } from './components/ComingSoon';
import AdminConsole from './components/AdminConsole';
import { FeedProvider } from './components/FeedService';
import { ProfileProvider } from './components/ProfileContext';
import { OnboardingProvider } from './components/OnboardingContext';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from './components/ui/tooltip';
import { UserTypeSelector } from './components/UserTypeSelector';
import { OnboardingFlow } from './components/OnboardingFlow';
import { NavigationProvider } from './components/NavigationContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Development mode component
function DevelopmentMode() {
  const { user } = useAuth();
  const [showComingSoon, setShowComingSoon] = useState(false); // ALWAYS FALSE - Coming Soon disabled

  useEffect(() => {
    // ALWAYS skip Coming Soon - enable full functionality everywhere
    // Force clear any cached Coming Soon state
    try {
      localStorage.removeItem('showComingSoon');
      localStorage.setItem('devMode', 'true');
      localStorage.setItem('appVersion', '2.0.0'); // Cache buster
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.userType !== 'admin') {
          u.userType = 'admin';
          localStorage.setItem('user', JSON.stringify(u));
        }
      }
    } catch {}
    setShowComingSoon(false);
    return;

    // All Coming Soon logic removed - full functionality enabled
  }, []);

  // Route: /admin-console
  if (window.location.pathname.startsWith('/admin-console')) {
    return <AdminConsole />;
  }

  if (showComingSoon) {
    return <ComingSoon />;
  }

  return (
    <ProtectedRoute>
      <ProfileProvider>
        <FeedProvider>
          <NavigationProvider>
            <OnboardingProvider>
              <Layout />
              <UserTypeSelector />
              <OnboardingFlow />
            </OnboardingProvider>
          </NavigationProvider>
        </FeedProvider>
      </ProfileProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={100}>
        <AuthProvider>
          <DevelopmentMode />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
