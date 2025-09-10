import { Layout } from "./components/Layout";
import { FeedProvider } from "./components/FeedService";
import { ProfileProvider } from "./components/ProfileContext";
import { OnboardingProvider } from "./components/OnboardingContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserTypeSelector } from "./components/UserTypeSelector";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { NavigationProvider } from "./components/NavigationContext";
import { AuthProvider } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={100}>
        <AuthProvider>
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
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
