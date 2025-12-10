import React, { useState } from 'react';
import { Globe, GraduationCap, RefreshCw, ArrowRight, Users, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useOnboarding, UserType } from './OnboardingContext';

interface AccountSwitcherProps {
  trigger?: React.ReactNode;
  showInHeader?: boolean;
}

export function AccountSwitcher({ trigger, showInHeader = false }: AccountSwitcherProps) {
  const { state, switchUserType, showOnboardingFlow } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchUserType = (newType: UserType) => {
    switchUserType(newType);
    setIsOpen(false);
  };

  const handleShowOnboarding = () => {
    showOnboardingFlow();
    setIsOpen(false);
  };

  const currentUserTypeBadge = state.userType === 'diaspora' ? (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
      <Globe className="w-3 h-3 mr-1" />
      Diaspora Member
    </Badge>
  ) : state.userType === 'local' ? (
    <Badge className="bg-green-100 text-green-800 border-green-200">
      <GraduationCap className="w-3 h-3 mr-1" />
      Student/Youth
    </Badge>
  ) : null;

  const defaultTrigger = showInHeader ? (
    <Tooltip>
      <TooltipTrigger asChild>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2 hover:shadow-md transition-all"
      >
        <RefreshCw className="w-3 h-3" />
        {currentUserTypeBadge}
      </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span className="text-xs">Switch between diaspora and local user experience</span>
      </TooltipContent>
    </Tooltip>
  ) : (
    <Button variant="outline" className="flex items-center gap-2">
      <RefreshCw className="w-4 h-4" />
      Switch Account Type
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {showInHeader ? (
        <Tooltip>
          <DialogTrigger asChild>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 hover:shadow-md transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                {currentUserTypeBadge}
              </Button>
            </TooltipTrigger>
          </DialogTrigger>
          <TooltipContent side="bottom">
            <span className="text-xs">Switch between diaspora and local user experience</span>
          </TooltipContent>
        </Tooltip>
      ) : (
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Switch Account Type</DialogTitle>
          <DialogDescription>
            Experience Aspora from different perspectives - you can switch anytime! Your preferences and data remain the same across both views.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">

          {/* Current Status */}
          {state.userType && (
            <Card className="border-2 border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      state.userType === 'diaspora' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {state.userType === 'diaspora' ? <Globe className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">Currently viewing as:</p>
                      <p className="text-sm text-gray-600">
                        {state.userType === 'diaspora' ? 'Diaspora Member' : 'Student/Youth'}
                      </p>
                    </div>
                  </div>
                  {currentUserTypeBadge}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Switch Options */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className={`cursor-pointer transition-all hover:shadow-md ${
              state.userType === 'diaspora' ? 'opacity-50' : 'hover:border-blue-200'
            }`}>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Globe className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Diaspora View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Experience the platform as a mentor and project leader
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span>Mentor management tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>Project creation & leadership</span>
                  </div>
                </div>
                
                {state.userType !== 'diaspora' ? (
                  <Button 
                    onClick={() => handleSwitchUserType('diaspora')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
                    size="sm"
                  >
                    Switch to Diaspora
                  </Button>
                ) : (
                  <Badge className="w-full justify-center bg-blue-50 text-blue-700 border-blue-200">
                    Current View
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-all hover:shadow-md ${
              state.userType === 'local' ? 'opacity-50' : 'hover:border-green-200'
            }`}>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">Student/Youth View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Experience the platform as a mentee and opportunity seeker
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Users className="w-3 h-3 text-green-500" />
                    <span>Mentor discovery & connection</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <BookOpen className="w-3 h-3 text-green-500" />
                    <span>Project participation & learning</span>
                  </div>
                </div>
                
                {state.userType !== 'local' ? (
                  <Button 
                    onClick={() => handleSwitchUserType('local')}
                    className="w-full bg-green-600 hover:bg-green-700 text-xs"
                    size="sm"
                  >
                    Switch to Student/Youth
                  </Button>
                ) : (
                  <Badge className="w-full justify-center bg-green-50 text-green-700 border-green-200">
                    Current View
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleShowOnboarding}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Take the Tour Again
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your preferences and data remain the same across both views
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}