import { Layout } from "./components/Layout";
import { FeedProvider } from "./components/FeedService";
import { ProfileProvider } from "./components/ProfileContext";
import { OnboardingProvider } from "./components/OnboardingContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { TooltipProvider } from "./components/ui/tooltip";
import { UserTypeSelector } from "./components/UserTypeSelector";
import { OnboardingFlow } from "./components/OnboardingFlow";

export default function App() {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={100}>
        <ProfileProvider>
          <FeedProvider>
            <OnboardingProvider>
              <Layout />
              <UserTypeSelector />
              <OnboardingFlow />
            </OnboardingProvider>
          </FeedProvider>
        </ProfileProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}