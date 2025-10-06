import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, Target, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface GuidedTourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  title?: string;
}

export function GuidedTour({
  steps,
  isActive,
  onComplete,
  onSkip,
  title = 'Feature Tour',
}: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightBox, setHighlightBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updateHighlight = () => {
      const targetElement = document.querySelector(currentStep.target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      setHighlightBox({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep?.action) {
      currentStep.action.onClick();
    }

    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightBox || !cardRef.current)
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const cardRect = cardRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = '50%';
    let left = '50%';
    let transform = 'translate(-50%, -50%)';

    switch (currentStep.position) {
      case 'top':
        top = `${highlightBox.top - 20}px`;
        left = `${highlightBox.left + highlightBox.width / 2}px`;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = `${highlightBox.top + highlightBox.height + 20}px`;
        left = `${highlightBox.left + highlightBox.width / 2}px`;
        transform = 'translate(-50%, 0%)';
        break;
      case 'left':
        top = `${highlightBox.top + highlightBox.height / 2}px`;
        left = `${highlightBox.left - 20}px`;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = `${highlightBox.top + highlightBox.height / 2}px`;
        left = `${highlightBox.left + highlightBox.width + 20}px`;
        transform = 'translate(0%, -50%)';
        break;
      default:
        // center - keep defaults
        break;
    }

    return { top, left, transform };
  };

  if (!isActive) return null;

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Highlight Box */}
        {highlightBox && (
          <>
            {/* Cutout effect - four boxes around the highlighted element */}
            <div
              className="absolute bg-transparent border-2 border-white rounded-lg shadow-lg animate-pulse"
              style={{
                top: highlightBox.top - 4,
                left: highlightBox.left - 4,
                width: highlightBox.width + 8,
                height: highlightBox.height + 8,
              }}
            />

            {/* Spotlight effect */}
            <div
              className="absolute bg-white bg-opacity-10 rounded-lg"
              style={{
                top: highlightBox.top - 8,
                left: highlightBox.left - 8,
                width: highlightBox.width + 16,
                height: highlightBox.height + 16,
              }}
            />
          </>
        )}

        {/* Tour Card */}
        <Card
          ref={cardRef}
          className="absolute max-w-sm shadow-2xl border-0 z-10"
          style={tooltipStyle}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {currentStepIndex + 1} of {steps.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{currentStep.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{currentStep.description}</p>

              {/* Action button if available */}
              {currentStep.action && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 mb-2">Try it now:</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-blue-200 hover:bg-blue-100"
                    onClick={currentStep.action.onClick}
                  >
                    {currentStep.action.label}
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-500">
                  Skip Tour
                </Button>
                <Button onClick={handleNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Predefined tour configurations
export const dashboardTour: TourStep[] = [
  {
    id: 'dashboard-header',
    title: 'Your Impact Dashboard',
    description:
      'This is your personalized dashboard showing your activity, connections, and impact metrics.',
    target: '[data-tour="dashboard-header"]',
    position: 'bottom',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description:
      'Use these buttons to quickly start mentoring sessions, create projects, or connect with others.',
    target: '[data-tour="quick-actions"]',
    position: 'top',
  },
  {
    id: 'navigation',
    title: 'Main Navigation',
    description: 'Navigate between different sections of the platform using the sidebar menu.',
    target: '[data-tour="sidebar"]',
    position: 'right',
  },
];

export const projectTour: TourStep[] = [
  {
    id: 'project-workspace',
    title: 'Project Workspace',
    description:
      'This is your collaborative workspace where you can manage all aspects of your project.',
    target: '[data-tour="project-workspace"]',
    position: 'center',
  },
  {
    id: 'workspace-tabs',
    title: 'Workspace Tools',
    description:
      'Switch between different tools like session board, task manager, and learning resources.',
    target: '[data-tour="workspace-tabs"]',
    position: 'right',
  },
];
