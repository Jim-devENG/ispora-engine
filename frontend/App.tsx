import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { FeedProvider } from "./components/FeedService";
import { ProfileProvider } from "./components/ProfileContext";
import { OnboardingProvider } from "./components/OnboardingContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserTypeSelector } from "./components/UserTypeSelector";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Loader2 } from "lucide-react";

// Internal app component that requires authentication
function AuthenticatedApp() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={100}>
        <ProfileProvider>
          <FeedProvider>
            <OnboardingProvider>
              {showSignup ? (
                <div>
                  <Signup />
                  <div className="fixed bottom-4 left-4">
                    <button
                      onClick={() => setShowSignup(false)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Layout />
                  <UserTypeSelector />
                  <OnboardingFlow />
                  <div className="fixed bottom-4 left-4">
                    <button
                      onClick={() => setShowSignup(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </div>
              )}
            </OnboardingProvider>
          </FeedProvider>
        </ProfileProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

// Main app wrapper with auth
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const handleShowSignup = () => setShowSignup(true);
    const handleShowLogin = () => setShowSignup(false);
    
    window.addEventListener('showSignup', handleShowSignup);
    window.addEventListener('showLogin', handleShowLogin);
    
    return () => {
      window.removeEventListener('showSignup', handleShowSignup);
      window.removeEventListener('showLogin', handleShowLogin);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        {showSignup ? (
          <div>
            <Signup />
            <div className="fixed bottom-4 left-4">
              <button
                onClick={() => setShowSignup(false)}
                className="text-sm text-blue-600 hover:underline bg-white px-4 py-2 rounded shadow"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Login />
            <div className="fixed bottom-4 left-4">
              <button
                onClick={() => setShowSignup(true)}
                className="text-sm text-blue-600 hover:underline bg-white px-4 py-2 rounded shadow"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}