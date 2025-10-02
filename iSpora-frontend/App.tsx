import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { ComingSoon } from "./components/ComingSoon";
import AdminConsole from "./components/AdminConsole";
import { FeedProvider } from "./components/FeedService";
import { ProfileProvider } from "./components/ProfileContext";
import { OnboardingProvider } from "./components/OnboardingContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserTypeSelector } from "./components/UserTypeSelector";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { NavigationProvider } from "./components/NavigationContext";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Development mode component
function DevelopmentMode() {
  const { user } = useAuth();
  const [showComingSoon, setShowComingSoon] = useState(true);
  // no popup; unlock via URL or stored flag

  useEffect(() => {
    // In local development, skip Coming Soon entirely
    if (import.meta.env.MODE === 'development') {
      try {
        localStorage.setItem('devMode', 'true');
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
    }

    // URL unlock: ?unlock=KEY
    const params = new URLSearchParams(window.location.search);
    const unlockKey = params.get('unlock');
    const configuredKey = import.meta.env.VITE_DEV_KEY;

    const setDevModeAndCleanUrl = (key?: string) => {
      localStorage.setItem('devMode', 'true');
      if (key) {
        localStorage.setItem('devKey', key);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('unlock');
      window.history.replaceState({}, '', url.toString());
      setShowComingSoon(false);
      // Auto-promote current user to admin in dev mode
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u && u.userType !== 'admin') {
            u.userType = 'admin';
            localStorage.setItem('user', JSON.stringify(u));
          }
        }
      } catch {}
    };

    const tryBackendVerify = async (key) => {
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api').replace(/\/$/, '') + '/dev/verify', {
          headers: { 'X-Dev-Key': key }
        });
        if (res.ok) {
          setDevModeAndCleanUrl(key);
          return true;
        }
      } catch {}
      return false;
    };

    (async () => {
      if (unlockKey) {
        // Prefer backend verification using header so frontend env key is not required
        const ok = await tryBackendVerify(unlockKey);
        if (ok) return;
      }

      if (unlockKey && configuredKey && unlockKey === configuredKey) {
        setDevModeAndCleanUrl(unlockKey);
      }
    })();

    const isDevMode = localStorage.getItem('devMode') === 'true';
    if (isDevMode) {
      setShowComingSoon(false);
      // Also ensure admin in dev mode on subsequent loads
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u && u.userType !== 'admin') {
            u.userType = 'admin';
            localStorage.setItem('user', JSON.stringify(u));
          }
        }
      } catch {}
    }
  }, []);

  // Route: /admin-console
  if (window.location.pathname.startsWith('/admin-console')) {
    return (
      <AdminConsole />
    );
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
