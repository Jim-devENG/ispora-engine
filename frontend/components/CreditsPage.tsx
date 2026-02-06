import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import { 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  History, 
  Gift, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Search,
  Download,
  Sparkles,
  Zap,
  Crown,
  Award,
  Target,
  BarChart3,
  PieChart,
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Settings,
  HelpCircle,
  ExternalLink,
  Coins,
  Banknote,
  Gem,
  Shield,
  Lock,
  Unlock,
  Bell,
  Eye,
  EyeOff,
  Trophy,
  Users,
  MessageCircle,
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Mail,
  Globe,
  Rocket,
  Lightbulb,
  Heart,
  BookOpen,
  GraduationCap,
  UserPlus,
  UserCheck,
  Flame,
  Megaphone,
  Camera,
  Video,
  Mic,
  Send,
  Link,
  Home,
  Building,
  Briefcase,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  TrendingUp as TrendingUpIcon,
  Users2,
  Activity,
  Sunrise,
  Moon,
  Sunset
} from "lucide-react";

// Mock data for current user
const CURRENT_USER = {
  id: 'user_001',
  name: 'Dr. Amina Kone',
  email: 'amina@ispora.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  membershipTier: 'Premium',
  joinDate: '2024-01-15',
  location: 'Paris, France',
  university: 'Sorbonne University',
  currentLevel: 8,
  levelProgress: 75,
  socialHandles: {
    linkedin: 'https://linkedin.com/in/aminakone',
    twitter: 'https://twitter.com/aminakone',
    instagram: 'https://instagram.com/aminakone',
    youtube: 'https://youtube.com/@aminakone'
  }
};

// Points System Configuration
const POINT_VALUES = {
  PROJECT_LAUNCH: 500,
  PROJECT_MILESTONE: 150,
  MENTORSHIP_DELIVER: 200,
  OPPORTUNITY_SHARE: 75,
  DISCUSSION_JOIN: 25,
  IDEA_POST: 100,
  PLATFORM_INVITE: 300,
  SOCIAL_SHARE: 50,
  COMMUNITY_UPVOTE: 10,
  WORKSHOP_COMPLETE: 250,
  CHALLENGE_WIN: 1000
};

// Badge System
const BADGE_SYSTEM = [
  {
    id: 'builder',
    name: 'Builder Badge',
    description: 'Launch or co-create a project',
    icon: Rocket,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    requirement: 'Launch 1 project',
    points: 500,
    rarity: 'common',
    earned: true,
    earnedDate: '2024-12-15'
  },
  {
    id: 'innovator',
    name: 'Innovator Badge',
    description: 'Share impactful ideas',
    icon: Lightbulb,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    requirement: 'Share 10 ideas with 50+ upvotes',
    points: 750,
    rarity: 'uncommon',
    earned: true,
    earnedDate: '2025-01-05'
  },
  {
    id: 'connector',
    name: 'Connector Badge',
    description: 'Invite and link people together',
    icon: UserCheck,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    requirement: 'Successfully invite 5 users',
    points: 400,
    rarity: 'common',
    earned: true,
    earnedDate: '2024-11-28'
  },
  {
    id: 'mentor-star',
    name: 'Mentor Star',
    description: 'Deliver mentorship sessions',
    icon: Star,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    requirement: 'Complete 10 mentorship sessions',
    points: 1000,
    rarity: 'rare',
    earned: false,
    progress: 70
  },
  {
    id: 'top-contributor',
    name: 'Top Contributor',
    description: 'Consistent weekly engagement',
    icon: Activity,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    requirement: 'Active for 8 consecutive weeks',
    points: 800,
    rarity: 'uncommon',
    earned: true,
    earnedDate: '2025-01-02'
  },
  {
    id: 'nehemiah-spirit',
    name: 'Nehemiah Spirit',
    description: 'Purpose-led, mission-consistent contributor',
    icon: Heart,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    requirement: 'Demonstrate consistent mission alignment',
    points: 1500,
    rarity: 'legendary',
    earned: false,
    progress: 45
  },
  {
    id: 'challenge-winner',
    name: 'Challenge Winner',
    description: 'Complete a featured Ispora challenge',
    icon: Trophy,
    color: 'bg-gold-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    requirement: 'Win a monthly challenge',
    points: 2000,
    rarity: 'legendary',
    earned: false,
    progress: 0
  },
  {
    id: 'opportunity-scout',
    name: 'Opportunity Scout',
    description: 'Share high-value scholarships/jobs/etc.',
    icon: Target,
    color: 'bg-teal-500',
    textColor: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    requirement: 'Share 20 opportunities with 100+ applications',
    points: 600,
    rarity: 'uncommon',
    earned: false,
    progress: 35
  }
];

// Leaderboard Data
const LEADERBOARD_DATA = [
  {
    rank: 1,
    user: {
      name: 'Dr. Kwame Asante',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      location: 'London, UK',
      university: 'Stanford University'
    },
    points: 15420,
    level: 12,
    badges: 8,
    change: 'up',
    changeValue: 2
  },
  {
    rank: 2,
    user: {
      name: 'Amara Okafor',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      location: 'San Francisco, CA',
      university: 'MIT'
    },
    points: 12890,
    level: 11,
    badges: 7,
    change: 'same',
    changeValue: 0
  },
  {
    rank: 3,
    user: {
      name: 'Dr. Amina Kone',
      avatar: CURRENT_USER.avatar,
      location: CURRENT_USER.location,
      university: CURRENT_USER.university
    },
    points: 11250,
    level: 8,
    badges: 4,
    change: 'up',
    changeValue: 1,
    isCurrentUser: true
  },
  {
    rank: 4,
    user: {
      name: 'David Mensah',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'Oxford, UK',
      university: 'University of Oxford'
    },
    points: 9875,
    level: 7,
    badges: 5,
    change: 'down',
    changeValue: 2
  },
  {
    rank: 5,
    user: {
      name: 'Dr. Fatima Al-Rashid',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      location: 'Cairo, Egypt',
      university: 'Harvard Medical School'
    },
    points: 8940,
    level: 6,
    badges: 6,
    change: 'up',
    changeValue: 3
  }
];

// Current user stats
const USER_STATS = {
  totalPoints: 11250,
  monthlyPoints: 890,
  weeklyPoints: 245,
  currentStreak: 12,
  longestStreak: 28,
  referralsSuccessful: 8,
  projectsLaunched: 3,
  mentorshipsSessions: 7,
  opportunitiesShared: 15,
  socialShares: 42,
  challengesWon: 0,
  totalContributions: 127
};

// Animated Counter Component
function AnimatedCounter({ 
  value, 
  duration = 2000, 
  prefix = "", 
  suffix = "" 
}: { 
  value: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string; 
}) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * value);
      
      setCurrentValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  );
}

// Badge Card Component
function BadgeCard({ badge }: { badge: any }) {
  const IconComponent = badge.icon;
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      badge.earned ? 'ring-2 ring-green-200' : 'opacity-75'
    }`}>
      {badge.earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${badge.bgColor} ${badge.borderColor} border-2`}>
            <IconComponent className={`h-8 w-8 ${badge.textColor}`} />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
            
            <div className="space-y-2">
              <Badge 
                className={`${badge.color} text-white text-xs`}
                variant="default"
              >
                {badge.rarity.toUpperCase()}
              </Badge>
              
              <div className="text-xs text-gray-500">
                {badge.points.toLocaleString()} points
              </div>
            </div>
          </div>
          
          {badge.earned ? (
            <div className="text-xs text-green-600 font-medium">
              Earned {new Date(badge.earnedDate).toLocaleDateString()}
            </div>
          ) : badge.progress !== undefined ? (
            <div className="space-y-2">
              <Progress value={badge.progress} className="h-2" />
              <div className="text-xs text-gray-500">
                {badge.progress}% complete
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              {badge.requirement}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ entry }: { entry: any }) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeIcon = (change: string, value: number) => {
    if (change === 'up') return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change === 'down') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      entry.isCurrentUser ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(entry.rank)}`}>
          {entry.rank}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
            <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{entry.user.name}</p>
              {entry.isCurrentUser && (
                <Badge className="bg-blue-600 text-white text-xs">You</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{entry.user.location}</span>
              <span>•</span>
              <GraduationCap className="h-3 w-3" />
              <span>{entry.user.university}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-gray-900">{entry.points.toLocaleString()}</p>
          <p className="text-gray-500">Points</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold text-gray-900">Lv.{entry.level}</p>
          <p className="text-gray-500">Level</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold text-gray-900">{entry.badges}</p>
          <p className="text-gray-500">Badges</p>
        </div>
        
        <div className="flex items-center gap-1">
          {getChangeIcon(entry.change, entry.changeValue)}
          {entry.changeValue > 0 && (
            <span className={`text-xs font-medium ${
              entry.change === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {entry.changeValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Social Share Dialog Component
function SocialShareDialog({ 
  isOpen, 
  onOpenChange, 
  shareData 
}: { 
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: any;
}) {
  const socialPlatforms = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}&hashtags=BuiltOnIspora,DiasporaInnovation`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-800',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-600',
      action: () => {
        navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
        onOpenChange(false);
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Let your network know about your progress on Ispora!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{shareData.title}</h4>
            <p className="text-sm text-gray-600">{shareData.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                variant="outline"
                onClick={platform.action}
                className="flex items-center gap-2 justify-center"
              >
                <platform.icon className={`h-4 w-4 ${platform.color}`} />
                <span>{platform.name}</span>
              </Button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Earn +{POINT_VALUES.SOCIAL_SHARE} points for each share!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Level Progress Component
function LevelProgress({ currentLevel, progress, nextLevelPoints }: {
  currentLevel: number;
  progress: number;
  nextLevelPoints: number;
}) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
            <p className="text-sm text-gray-600">Current Level: {currentLevel}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">Lv.{currentLevel}</div>
            <div className="text-xs text-gray-500">{progress}% to next level</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Level {currentLevel}</span>
            <span>{nextLevelPoints.toLocaleString()} points to Level {currentLevel + 1}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white/60 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Next Level Rewards:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• +500 bonus points</li>
            <li>• New badge eligibility</li>
            <li>• Enhanced profile visibility</li>
            <li>• Exclusive opportunities access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activities Component
function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: 'badge_earned',
      title: 'Earned Innovator Badge!',
      description: 'Your innovative ideas are making an impact',
      points: 750,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'milestone_reached',
      title: 'Project Milestone Completed',
      description: 'African Innovation Hub reached 70% completion',
      points: 150,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'mentorship_delivered',
      title: 'Mentorship Session Delivered',
      description: 'Guided 3 students on career development',
      points: 200,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      timestamp: '2 days ago'
    },
    {
      id: 4,
      type: 'referral_success',
      title: 'Successful Referral',
      description: 'Sarah Okafor joined through your invitation',
      points: 300,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      timestamp: '3 days ago'
    },
    {
      id: 5,
      type: 'opportunity_shared',
      title: 'Opportunity Shared',
      description: 'Tech Leadership Fellowship - 25 applications received',
      points: 75,
      icon: Share2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      timestamp: '4 days ago'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className={`flex items-start gap-4 p-3 rounded-lg ${activity.bgColor}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center`}>
                  <activity.icon className={`h-5 w-5 ${activity.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                    <Badge className="bg-blue-600 text-white text-xs">
                      +{activity.points}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main Component
import { useProfile } from "./ProfileContext";

export function CreditsPage() {
  const { profile } = useProfile();
  const currentUserId = profile.id;
  
  // Use profile data for current user state
  const currentUser = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    membershipTier: 'Premium', // Default for now
    joinDate: new Date(profile.createdAt || Date.now()).toISOString().split('T')[0],
    location: profile.location || 'Global',
    university: profile.university || 'N/A',
    currentLevel: 8, // Derived or mocked for now
    levelProgress: 75,
    socialHandles: {
      linkedin: profile.socialLinks?.linkedin || '',
      twitter: profile.socialLinks?.twitter || '',
      instagram: '',
      youtube: ''
    }
  };

  const userStats = {
    totalPoints: 11250,
    monthlyPoints: 890,
    weeklyPoints: 245,
    currentStreak: 12,
    longestStreak: 28,
    referralsSuccessful: 8,
    projectsLaunched: 3,
    mentorshipsSessions: 7,
    opportunitiesShared: 15,
    socialShares: 42,
    challengesWon: 0,
    totalContributions: 127
  };

  const [credits, setCredits] = useState(1250);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  const shareData = {
    title: "🎉 Just reached Level 8 on Ispora!",
    description: "I'm building impactful projects and connecting with amazing diaspora professionals. Join me on this journey!",
    text: "Just reached Level 8 on Ispora! 🚀 Building the future with fellow diaspora innovators.",
    url: "https://ispora.com/profile/amina-kone"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Rewards & Recognition
            </h1>
            <p className="text-gray-600 mt-2">
              Track your impact, earn rewards, and celebrate achievements in the diaspora community
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShareDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Progress
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* User Level & Progress Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Points</p>
                  <p className="text-3xl font-bold mt-1">
                    <AnimatedCounter value={userStats.totalPoints} />
                  </p>
                  <p className="text-blue-100 text-sm mt-1">Ispora Points</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Current Level</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    Level <AnimatedCounter value={currentUser.currentLevel} />
                  </p>
                  <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {currentUser.levelProgress}% to next level
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Monthly Points</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    <AnimatedCounter value={userStats.monthlyPoints} prefix="+" />
                  </p>
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {userStats.currentStreak} day streak
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Badges Earned</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    <AnimatedCounter value={BADGE_SYSTEM.filter(b => b.earned).length} />
                    /{BADGE_SYSTEM.length}
                  </p>
                  <p className="text-orange-600 text-sm mt-1 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {Math.round((BADGE_SYSTEM.filter(b => b.earned).length / BADGE_SYSTEM.length) * 100)}% complete
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Level Progress */}
              <LevelProgress 
                currentLevel={currentUser.currentLevel}
                progress={currentUser.levelProgress}
                nextLevelPoints={1250}
              />

              {/* Recent Activities */}
              <RecentActivities />

              {/* Points Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Points Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Projects', value: 3500, max: 5000, color: 'bg-blue-500' },
                      { label: 'Mentorship', value: 2800, max: 4000, color: 'bg-purple-500' },
                      { label: 'Community', value: 2200, max: 3000, color: 'bg-green-500' },
                      { label: 'Referrals', value: 1800, max: 2500, color: 'bg-orange-500' },
                      { label: 'Social Sharing', value: 950, max: 1500, color: 'bg-pink-500' }
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-gray-500">{item.value.toLocaleString()}</span>
                        </div>
                        <Progress 
                          value={(item.value / item.max) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Point Earning Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Earning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      action: 'Launch a Project',
                      points: POINT_VALUES.PROJECT_LAUNCH,
                      icon: Rocket,
                      color: 'text-blue-600',
                      bgColor: 'bg-blue-50'
                    },
                    {
                      action: 'Complete Mentorship',
                      points: POINT_VALUES.MENTORSHIP_DELIVER,
                      icon: Users,
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-50'
                    },
                    {
                      action: 'Invite New Member',
                      points: POINT_VALUES.PLATFORM_INVITE,
                      icon: UserPlus,
                      color: 'text-green-600',
                      bgColor: 'bg-green-50'
                    },
                    {
                      action: 'Win Challenge',
                      points: POINT_VALUES.CHALLENGE_WIN,
                      icon: Trophy,
                      color: 'text-yellow-600',
                      bgColor: 'bg-yellow-50'
                    }
                  ].map((opportunity) => (
                    <div 
                      key={opportunity.action}
                      className={`p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors ${opportunity.bgColor}`}
                    >
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center">
                          <opportunity.icon className={`h-6 w-6 ${opportunity.color}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{opportunity.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            +{opportunity.points.toLocaleString()} points
                          </p>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          Earn Now
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Badge Collection</h2>
                <p className="text-gray-600">
                  Unlock badges by achieving milestones and contributing to the community
                </p>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Badges</SelectItem>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {BADGE_SYSTEM.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Community Leaderboard</h2>
                <p className="text-gray-600">
                  See how you rank among diaspora innovators worldwide
                </p>
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {LEADERBOARD_DATA.map((entry) => (
                    <LeaderboardRow key={entry.rank} entry={entry} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Invite Your Network</h3>
                    <p className="text-gray-600">
                      Earn {POINT_VALUES.PLATFORM_INVITE} points for each successful referral. 
                      Help grow the diaspora innovation community!
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Coins className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Earn Points</p>
                          <p className="text-sm text-blue-700">Get 300 points per successful invite</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Trophy className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-purple-900">Unlock Badges</p>
                          <p className="text-sm text-purple-700">Progress towards Connector badge</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <Heart className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Build Community</p>
                          <p className="text-sm text-green-700">Help fellow diasporans find opportunities</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Your Referral Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value="https://ispora.com/invite/amina-kone-2024"
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText("https://ispora.com/invite/amina-kone-2024");
                            toast.success("Referral link copied!");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Your Referral Stats</h3>
                    
                    <div className="grid gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{USER_STATS.referralsSuccessful}</p>
                        <p className="text-sm text-gray-600">Successful Referrals</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          +{(USER_STATS.referralsSuccessful * POINT_VALUES.PLATFORM_INVITE).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Points Earned</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Recent Referrals</h4>
                      <div className="space-y-2">
                        {[
                          { name: 'Sarah Okafor', date: '2 days ago', status: 'Active' },
                          { name: 'Michael Chen', date: '1 week ago', status: 'Active' },
                          { name: 'Kwame Asante', date: '2 weeks ago', status: 'Active' }
                        ].map((referral, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <p className="font-medium text-sm">{referral.name}</p>
                              <p className="text-xs text-gray-500">{referral.date}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              {referral.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-600" />
                  Social Media Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Connected Accounts</h3>
                    <p className="text-gray-600">
                      Link your social accounts to easily share achievements and earn points
                    </p>
                    
                    <div className="space-y-3">
                      {[
                        { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', connected: true, handle: 'aminakone' },
                        { name: 'Twitter', icon: Twitter, color: 'text-blue-400', connected: true, handle: '@aminakone' },
                        { name: 'Instagram', icon: Instagram, color: 'text-pink-600', connected: false, handle: null },
                        { name: 'YouTube', icon: Youtube, color: 'text-red-600', connected: false, handle: null }
                      ].map((platform) => (
                        <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <platform.icon className={`h-5 w-5 ${platform.color}`} />
                            <div>
                              <p className="font-medium">{platform.name}</p>
                              {platform.connected && platform.handle && (
                                <p className="text-sm text-gray-500">{platform.handle}</p>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant={platform.connected ? "outline" : "default"}
                            size="sm"
                          >
                            {platform.connected ? "Connected" : "Connect"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Social Sharing Stats</h3>
                    
                    <div className="grid gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{USER_STATS.socialShares}</p>
                        <p className="text-sm text-gray-600">Total Shares</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          +{(USER_STATS.socialShares * POINT_VALUES.SOCIAL_SHARE).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Points Earned</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Quick Share Templates</h4>
                      <div className="space-y-2">
                        {[
                          "🎉 Just reached Level 8 on @Ispora! Building the future with diaspora innovators.",
                          "💡 Shared my latest project on Ispora - connecting communities through innovation! #BuiltOnIspora",
                          "🏆 Earned my Innovator badge today! Grateful for this amazing diaspora community. #DiasporaInnovation"
                        ].map((template, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 mb-2">{template}</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShareDialogOpen(true)}
                            >
                              <Share2 className="h-3 w-3 mr-1" />
                              Share (+{POINT_VALUES.SOCIAL_SHARE} pts)
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Hashtag Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5 text-blue-600" />
                  Hashtag Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Use these branded hashtags to amplify your Ispora journey:
                </p>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    '#BuiltOnIspora',
                    '#DiasporaInnovation',
                    '#IsporaProjectName',
                    '#AfricanInnovators',
                    '#DiasporaLeaders',
                    '#GlobalImpact',
                    '#IsporaCommunity',
                    '#FutureBuilders',
                    '#InnovationHub'
                  ].map((hashtag) => (
                    <div key={hashtag} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-mono text-blue-600">{hashtag}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(hashtag);
                          toast.success("Hashtag copied!");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Social Share Dialog */}
        <SocialShareDialog 
          isOpen={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shareData={shareData}
        />
      </div>
    </div>
  );
}