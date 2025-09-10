import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserType = 'diaspora' | 'local' | null;

interface OnboardingState {
  isFirstTime: boolean;
  userType: UserType;
  completedSteps: string[];
  currentStep: string | null;
  showOnboarding: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  setUserType: (type: UserType) => void;
  completeStep: (stepId: string) => void;
  setCurrentStep: (stepId: string | null) => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  switchUserType: (newType: UserType) => void;
  showOnboardingFlow: () => void;
}

const defaultState: OnboardingState = {
  isFirstTime: true,
  userType: null,
  completedSteps: [],
  currentStep: null,
  showOnboarding: false
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const stored = localStorage.getItem('aspora-onboarding');
    if (stored) {
      try {
        return { ...defaultState, ...JSON.parse(stored) };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('aspora-onboarding', JSON.stringify(state));
  }, [state]);

  const setUserType = (type: UserType) => {
    setState(prev => ({ 
      ...prev, 
      userType: type, 
      showOnboarding: type !== null,
      currentStep: type ? `${type}-welcome` : null 
    }));
  };

  const completeStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, stepId]
    }));
  };

  const setCurrentStep = (stepId: string | null) => {
    setState(prev => ({ ...prev, currentStep: stepId }));
  };

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      isFirstTime: false,
      showOnboarding: false,
      currentStep: null
    }));
  };

  const restartOnboarding = () => {
    setState(prev => ({
      ...prev,
      isFirstTime: true,
      completedSteps: [],
      currentStep: prev.userType ? `${prev.userType}-welcome` : null,
      showOnboarding: true
    }));
  };

  const switchUserType = (newType: UserType) => {
    setState(prev => ({
      ...prev,
      userType: newType,
      currentStep: newType ? `${newType}-welcome` : null,
      completedSteps: [], // Reset progress for new user type
      showOnboarding: newType !== null
    }));
  };

  const showOnboardingFlow = () => {
    setState(prev => ({
      ...prev,
      showOnboarding: true,
      currentStep: prev.userType ? `${prev.userType}-welcome` : null
    }));
  };

  return (
    <OnboardingContext.Provider 
      value={{
        state,
        setUserType,
        completeStep,
        setCurrentStep,
        skipOnboarding,
        restartOnboarding,
        switchUserType,
        showOnboardingFlow
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
