import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Globe,
  GraduationCap,
  Users,
  BookOpen,
  Target,
  MessageCircle,
  Award,
  Zap,
  Heart,
  MapPin,
  Briefcase,
  Video,
  CheckCircle,
  Star,
  UserPlus,
  Calendar,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent } from './ui/dialog';
import { useOnboarding } from './OnboardingContext';

const diasporaSteps = [
  {
    id: 'diaspora-welcome',
    title: 'Welcome to Aspora!',
    subtitle: 'Empower youth back home through mentorship and collaboration',
    content: {
      icon: Globe,
      description:
        'As a diaspora member, you can make a real impact by sharing your knowledge, experience, and opportunities with ambitious young people in your home country.',
      features: [
        'Mentor students and young professionals',
        'Create and lead impactful projects',
        'Share job opportunities and scholarships',
        'Build lasting connections across borders',
      ],
    },
  },
  {
    id: 'diaspora-profile',
    title: 'Set Up Your Impact Profile',
    subtitle: 'Let others know how you can help',
    content: {
      icon: UserPlus,
      description:
        "Your profile helps match you with the right mentees and projects. Showcase your expertise and what you're passionate about contributing.",
      features: [
        'Professional background and expertise',
        'Areas where you want to make impact',
        'Availability for mentoring sessions',
        'Current location and time zone',
      ],
    },
  },
  {
    id: 'diaspora-mentor',
    title: 'Start Mentoring',
    subtitle: 'Guide the next generation of leaders',
    content: {
      icon: Users,
      description:
        'Connect one-on-one with motivated students and young professionals. Use our workspace tools to conduct sessions, assign tasks, and track progress.',
      features: [
        'Browse and connect with mentees',
        'Schedule mentorship sessions',
        'Use collaborative workspace tools',
        'Track mentee progress and growth',
      ],
    },
  },
  {
    id: 'diaspora-projects',
    title: 'Create Impact Projects',
    subtitle: 'Lead initiatives that create lasting change',
    content: {
      icon: Target,
      description:
        'Start projects that address real challenges back home. From research initiatives to community programs, your leadership can drive meaningful change.',
      features: [
        'Launch mentorship programs',
        'Lead research initiatives',
        'Create innovation challenges',
        'Build community networks',
      ],
    },
  },
  {
    id: 'diaspora-opportunities',
    title: 'Share Opportunities',
    subtitle: 'Open doors for others',
    content: {
      icon: Award,
      description:
        'Share scholarships, job openings, internships, and other opportunities that can transform lives and careers.',
      features: [
        'Post scholarship opportunities',
        'Share job openings in your network',
        'Announce internship programs',
        'Create learning opportunities',
      ],
    },
  },
  {
    id: 'diaspora-complete',
    title: 'Ready to Make an Impact!',
    subtitle: 'Your journey as a mentor and leader begins now',
    content: {
      icon: CheckCircle,
      description:
        "You're all set to start making a difference. Welcome to a community of diaspora members committed to empowering the next generation.",
      features: [
        'Explore the Impact Feed to get started',
        'Browse mentee profiles to make connections',
        'Check out project ideas in your area of expertise',
        'Join community discussions and events',
      ],
    },
  },
];

const localSteps = [
  {
    id: 'local-welcome',
    title: 'Welcome to Aspora!',
    subtitle: 'Connect with diaspora mentors and unlock your potential',
    content: {
      icon: GraduationCap,
      description:
        'As a student or young professional, you can access mentorship, opportunities, and resources from successful diaspora community members worldwide.',
      features: [
        'Get mentored by industry professionals',
        'Access exclusive opportunities and scholarships',
        'Join collaborative projects and research',
        'Build your professional network globally',
      ],
    },
  },
  {
    id: 'local-profile',
    title: 'Build Your Learning Profile',
    subtitle: 'Show mentors your goals and aspirations',
    content: {
      icon: Star,
      description:
        "Create a compelling profile that highlights your ambitions, skills, and what you're looking to achieve. This helps mentors find and connect with you.",
      features: [
        'Academic background and achievements',
        'Career goals and interests',
        'Skills you want to develop',
        'Areas where you need guidance',
      ],
    },
  },
  {
    id: 'local-mentors',
    title: 'Find Your Mentors',
    subtitle: 'Connect with diaspora professionals',
    content: {
      icon: Heart,
      description:
        'Browse profiles of diaspora mentors who match your interests and goals. Send connection requests to start meaningful mentorship relationships.',
      features: [
        'Browse mentor profiles by expertise',
        'Send personalized connection requests',
        'Schedule mentorship sessions',
        'Join group mentoring programs',
      ],
    },
  },
  {
    id: 'local-projects',
    title: 'Join Impact Projects',
    subtitle: 'Collaborate on meaningful initiatives',
    content: {
      icon: Briefcase,
      description:
        'Participate in projects led by diaspora mentors. Gain real-world experience while contributing to initiatives that matter.',
      features: [
        'Browse available projects',
        'Apply to join research initiatives',
        'Participate in innovation challenges',
        'Contribute to community programs',
      ],
    },
  },
  {
    id: 'local-opportunities',
    title: 'Discover Opportunities',
    subtitle: 'Access scholarships, jobs, and more',
    content: {
      icon: Zap,
      description:
        'Stay updated on scholarships, internships, job opportunities, and other programs shared by our diaspora community.',
      features: [
        'Scholarship and grant opportunities',
        'Internship and job postings',
        'Study abroad programs',
        'Professional development workshops',
      ],
    },
  },
  {
    id: 'local-complete',
    title: 'Ready to Grow!',
    subtitle: 'Your journey toward success starts here',
    content: {
      icon: CheckCircle,
      description:
        "You're ready to begin your journey with mentors, projects, and opportunities. Welcome to a community that's invested in your success.",
      features: [
        'Explore your personalized dashboard',
        'Send your first mentor connection request',
        'Browse available projects to join',
        'Check out the latest opportunities',
      ],
    },
  },
];

interface OnboardingStepProps {
  step: (typeof diasporaSteps)[0];
  isActive: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalSteps: number;
  userType: 'diaspora' | 'local';
}

function OnboardingStep({
  step,
  isActive,
  onNext,
  onPrevious,
  onSkip,
  currentIndex,
  totalSteps,
  userType,
}: OnboardingStepProps) {
  const { content } = step;
  const IconComponent = content.icon;
  const progress = ((currentIndex + 1) / totalSteps) * 100;
  const isLastStep = currentIndex === totalSteps - 1;
  const isFirstStep = currentIndex === 0;

  if (!isActive) return null;

  return (
    <div className="max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentIndex + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              userType === 'diaspora' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}
          >
            <IconComponent className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl mb-2">{step.title}</CardTitle>
          <p className="text-gray-600 text-lg">{step.subtitle}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-gray-700 leading-relaxed text-center">{content.description}</p>

          <div className="grid md:grid-cols-2 gap-3">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={onPrevious} className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button variant="ghost" onClick={onSkip} className="text-gray-500">
                  Skip Tour
                </Button>
              )}

              <Button
                onClick={onNext}
                className={`flex items-center gap-2 ${
                  userType === 'diaspora'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OnboardingFlow() {
  const { state, setCurrentStep, completeStep, skipOnboarding, switchUserType } = useOnboarding();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!state.showOnboarding || !state.userType) return null;

  const steps = state.userType === 'diaspora' ? diasporaSteps : localSteps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    completeStep(currentStep.id);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentStep(steps[currentStepIndex + 1].id);
    } else {
      skipOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const handleSwitchUserType = () => {
    const newType = state.userType === 'diaspora' ? 'local' : 'diaspora';
    switchUserType(newType);
    setCurrentStepIndex(0);
  };

  return (
    <Dialog open={state.showOnboarding} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                state.userType === 'diaspora'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {state.userType === 'diaspora' ? (
                <Globe className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-semibold">
                {state.userType === 'diaspora' ? 'Diaspora Member' : 'Student/Professional'}{' '}
                Onboarding
              </h2>
              <p className="text-sm text-gray-600">Get started with Aspora</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchUserType}
              className="flex items-center gap-2 text-xs hover:shadow-md transition-all duration-200 border-2 hover:border-blue-300"
            >
              {state.userType === 'diaspora' ? (
                <>
                  <GraduationCap className="w-3 h-3" />
                  Switch to Student/Youth
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  Switch to Diaspora
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <OnboardingStep
            step={currentStep}
            isActive={true}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            currentIndex={currentStepIndex}
            totalSteps={steps.length}
            userType={state.userType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
