import React from 'react';
import { Globe, GraduationCap, ArrowRight, Users, BookOpen, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { useOnboarding, UserType } from './OnboardingContext';

export function UserTypeSelector() {
  const { state, setUserType } = useOnboarding();

  if (state.userType !== null || !state.isFirstTime) return null;

  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
  };

  return (
    <Dialog open={state.userType === null && state.isFirstTime} onOpenChange={() => {}}>
      <DialogContent className="max-w-xl p-0 gap-0">
        {/* Header */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome to Aspora</h1>
          <p className="text-sm text-gray-600">How would you like to get started?</p>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Diaspora Option */}
            <Card
              className="group cursor-pointer transition-all duration-200 hover:shadow-md border-2 hover:border-blue-200"
              onClick={() => handleSelectUserType('diaspora')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-blue-900 mb-1">Diaspora Member</h3>
                <p className="text-xs text-gray-600 mb-3">Mentor youth back home</p>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Local User Option */}
            <Card
              className="group cursor-pointer transition-all duration-200 hover:shadow-md border-2 hover:border-green-200"
              onClick={() => handleSelectUserType('local')}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-green-900 mb-1">Student/Youth</h3>
                <p className="text-xs text-gray-600 mb-3">Find mentors & opportunities</p>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">You can switch roles anytime</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
