import React from 'react';
import { Globe, GraduationCap, ArrowRight, Users, BookOpen, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription } from './ui/dialog';
import { useOnboarding, UserType } from './OnboardingContext';

export function UserTypeSelector() {
  const { state, setUserType } = useOnboarding();

  if (state.userType !== null || !state.isFirstTime) return null;

  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
  };

  return (
    <Dialog open={state.userType === null && state.isFirstTime} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <DialogDescription className="sr-only">
          Choose your role to get a personalized experience on Aspora
        </DialogDescription>
        {/* Header */}
        <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-green-50">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Aspora
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Connecting diaspora communities with ambitious youth back home
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Bridge distances</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Create impact</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Build futures</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              How would you like to get started?
            </h2>
            <p className="text-gray-600">
              Choose your role to get a personalized experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Diaspora Option */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-blue-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-blue-900">I'm a Diaspora Member</CardTitle>
                <p className="text-gray-600 text-sm">
                  Living abroad and want to mentor youth back home
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Mentor students & young professionals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Create impactful projects & initiatives</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Share opportunities & scholarships</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Build lasting mentorship relationships</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => handleSelectUserType('diaspora')}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 group/btn"
                  >
                    Start as Diaspora Member
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Mentor
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Project Leader
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Opportunity Sharer
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Local User Option */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-green-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-green-900">I'm a Student/Youth</CardTitle>
                <p className="text-gray-600 text-sm">
                  Looking for mentorship and opportunities to grow
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Connect with diaspora mentors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Join collaborative projects & research</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Access scholarships & opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Develop skills & build network</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => handleSelectUserType('local')}
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 group/btn"
                  >
                    Start as Student/Youth
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Mentee
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Project Participant
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Opportunity Seeker
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Don't worry, you can always switch between roles later
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>✓ Free to use</span>
              <span>✓ Switch anytime</span>
              <span>✓ Global community</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}