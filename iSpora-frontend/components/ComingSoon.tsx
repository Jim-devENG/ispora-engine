import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Rocket, 
  Globe, 
  Users, 
  Target, 
  BookOpen, 
  Heart, 
  Star, 
  Zap, 
  Mail, 
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Crown,
  Shield,
  Activity,
  TrendingUp,
  Award,
  Lightbulb,
  MessageSquare,
  Handshake,
  GraduationCap,
  Briefcase,
  Home,
  MapPin,
  Phone,
  Send,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface ComingSoonProps {
  onDevAccess?: () => void;
}

export function ComingSoon({ onDevAccess }: ComingSoonProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown to launch date (example: 30 days from now)
  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30); // 30 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      toast.success('Thank you for subscribing! We\'ll notify you when we launch.');
      setEmail('');
    }
  };

  const handleDevAccess = () => {
    // Check if user is admin for development access
    if (user && user.userType === 'admin') {
      toast.success('Welcome to development mode!');
      onDevAccess?.();
    } else {
      toast.error('Development access is restricted to admin users only.');
    }
  };

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Global Community",
      description: "Connect with diaspora communities worldwide"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Impact Projects",
      description: "Collaborate on meaningful initiatives"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Mentorship",
      description: "Learn from experienced professionals"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Social Impact",
      description: "Make a difference in your community"
    }
  ];

  const stats = [
    { number: "10K+", label: "Expected Users" },
    { number: "50+", label: "Countries" },
    { number: "100+", label: "Projects" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">iSpora</h1>
                <p className="text-sm text-gray-600">Coming Soon</p>
              </div>
            </div>
            
            {/* Development Access Button */}
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Activity className="h-3 w-3 mr-1" />
                Development Mode
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDevAccess}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Dev Access
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connecting the
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Global Diaspora</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A revolutionary platform that brings together diaspora communities worldwide 
              to collaborate, learn, and create meaningful impact through mentorship, 
              projects, and shared opportunities.
            </p>
          </div>

          {/* Countdown Timer */}
          <Card className="max-w-2xl mx-auto mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Launch Countdown</CardTitle>
              <CardDescription>We're putting the finishing touches on something amazing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{timeLeft.days}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-600">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-600">Seconds</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Subscription */}
          <Card className="max-w-md mx-auto mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900">Get Early Access</CardTitle>
              <CardDescription>Be the first to know when we launch</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubscribed ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">You're on the list!</p>
                  <p className="text-sm text-gray-600">We'll notify you when we launch</p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubscribe} className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Development Notice */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Development Mode</h3>
            </div>
            <p className="text-gray-700 mb-6">
              This platform is currently in development. Admin users can access the full platform 
              for testing and development purposes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDevAccess}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Development Platform
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">iSpora</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting diaspora communities worldwide through technology and collaboration.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mentorship Programs</li>
                <li>Project Collaboration</li>
                <li>Opportunity Discovery</li>
                <li>Community Building</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Us</li>
                <li>Status Page</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 iSpora. All rights reserved. Built with ❤️ for the global diaspora community.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
