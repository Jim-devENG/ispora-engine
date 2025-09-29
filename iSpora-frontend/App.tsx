import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { ComingSoon } from "./components/ComingSoon";
import { DevAccess } from "./components/DevAccess";
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
  const [showDevAccess, setShowDevAccess] = useState(false);

  useEffect(() => {
    // Check if user is admin and has dev access
    const isDevMode = localStorage.getItem('devMode') === 'true';
    const isAdmin = user && user.userType === 'admin';
    
    if (isDevMode && isAdmin) {
      setShowComingSoon(false);
    }
  }, [user]);

  const handleDevAccess = () => {
    setShowDevAccess(true);
  };

  const handleAccessGranted = () => {
    setShowDevAccess(false);
    setShowComingSoon(false);
  };

  if (showDevAccess) {
    return <DevAccess onAccessGranted={handleAccessGranted} />;
  }

  if (showComingSoon) {
    return <ComingSoon onDevAccess={handleDevAccess} />;
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
