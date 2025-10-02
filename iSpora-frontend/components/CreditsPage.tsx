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
  Users2,
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
  Activity,
  Sunrise,
  Moon,
  Sunset
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

// Icons mapping for badges coming from API
const BADGE_ICON_MAP: Record<string, any> = {
  builder: Rocket,
  innovator: Lightbulb,
  connector: UserCheck,
  mentor: Star,
  contributor: Activity,
  heart: Heart,
  trophy: Trophy,
  target: Target
};

// Live data will be provided by API

// Live stats from API

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

  const safeEntry = entry || {};
  const userInfo = safeEntry.user || {};
  const rank = typeof safeEntry.rank === 'number' ? safeEntry.rank : 0;
  const points = typeof safeEntry.points === 'number' ? safeEntry.points : 0;
  const level = typeof safeEntry.level === 'number' ? safeEntry.level : 0;
  const badgesCount = typeof safeEntry.badges === 'number' ? safeEntry.badges : 0;
  const change = safeEntry.change || 'same';
  const changeValue = typeof safeEntry.changeValue === 'number' ? safeEntry.changeValue : 0;

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
      safeEntry.isCurrentUser ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(rank)}`}>
          {rank}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userInfo.avatar} alt={userInfo.name || 'User'} />
            <AvatarFallback>{(userInfo.name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{userInfo.name || 'User'}</p>
              {safeEntry.isCurrentUser && (
                <Badge className="bg-blue-600 text-white text-xs">You</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{userInfo.location || '—'}</span>
              <span>•</span>
              <GraduationCap className="h-3 w-3" />
              <span>{userInfo.university || '—'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-gray-900">{points.toLocaleString()}</p>
          <p className="text-gray-500">Points</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold text-gray-900">Lv.{level}</p>
          <p className="text-gray-500">Level</p>
        </div>
        
        <div className="text-center">
          <p className="font-bold text-gray-900">{badgesCount}</p>
          <p className="text-gray-500">Badges</p>
        </div>
        
        <div className="flex items-center gap-1">
          {getChangeIcon(change, changeValue)}
          {changeValue > 0 && (
            <span className={`text-xs font-medium ${
              change === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeValue}
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
function RecentActivities({ items }: { items: any[] }) {
  const pickIcon = (type: string) => {
    switch (type) {
      case 'badge_earned': return Lightbulb;
      case 'milestone': return Target;
      case 'mentorship': return Users;
      case 'referral': return UserPlus;
      case 'share': return Share2;
      default: return Activity;
    }
  };

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
            {items.map((activity) => {
              const IconComp = pickIcon(activity.type);
              return (
                <div key={activity.id} className={`flex items-start gap-4 p-3 rounded-lg bg-gray-50`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center`}>
                    <IconComp className={`h-5 w-5 text-blue-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                      {activity.points ? (
                        <Badge className="bg-blue-600 text-white text-xs">+{activity.points}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-8">No recent activities</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main Component
export function CreditsPage() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [user, setUser] = useState<any>(null);
  const [userOverview, setUserOverview] = useState<any>(null);
  const [stats, setStats] = useState<any>({ totalPoints: 0, monthlyPoints: 0, currentStreak: 0, socialShares: 0 });
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareData = {
    title: "🎉 Just reached Level 8 on Ispora!",
    description: "I'm building impactful projects and connecting with amazing diaspora professionals. Join me on this journey!",
    text: "Just reached Level 8 on Ispora! 🚀 Building the future with fellow diaspora innovators.",
    url: "https://ispora.com/profile/amina-kone"
  };

  useEffect(() => {
    const controller = new AbortController();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const devKey = localStorage.getItem('devKey');
    const token = localStorage.getItem('token');
    if (devKey) headers['X-Dev-Key'] = devKey;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [overviewRes, badgesRes, lbRes, actRes] = await Promise.all([
          fetch(`${API_BASE_URL}/credits/overview`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/credits/badges`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/credits/leaderboard?timeframe=${selectedTimeframe}`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/credits/activities`, { headers, signal: controller.signal })
        ]);

        const overview = overviewRes.ok ? await overviewRes.json() : {};
        const badgesJson = badgesRes.ok ? await badgesRes.json() : {};
        const lbJson = lbRes.ok ? await lbRes.json() : {};
        const actJson = actRes.ok ? await actRes.json() : {};

        const ov = overview?.data || overview || {};
        setUser(ov.user || null);
        setStats(ov.stats || {});
        setBadges((badgesJson?.data || []).map((b: any) => ({
          ...b,
          icon: BADGE_ICON_MAP[b.icon] || Trophy,
          bgColor: b.bgColor || 'bg-gray-50',
          borderColor: b.borderColor || 'border-gray-200',
          textColor: b.textColor || 'text-gray-700',
          color: b.color || 'bg-blue-500'
        })));
        setLeaderboard(lbJson?.data || []);
        setActivities(actJson?.data || []);
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message || 'Failed to load credits');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => controller.abort();
  }, [selectedTimeframe]);

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

        {loading && (
          <div className="text-center text-sm text-gray-500">Loading credits...</div>
        )}
        {error && (
          <div className="text-center text-sm text-red-600">{error}</div>
        )}

        {/* User Level & Progress Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Points</p>
                  <p className="text-3xl font-bold mt-1">
                    <AnimatedCounter value={stats.totalPoints || 0} />
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
                    Level <AnimatedCounter value={user?.currentLevel || 0} />
                  </p>
                  <p className="text-blue-600 text-sm mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {user?.levelProgress || 0}% to next level
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
                    <AnimatedCounter value={stats.monthlyPoints || 0} prefix="+" />
                  </p>
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {stats.currentStreak || 0} day streak
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
                    <AnimatedCounter value={(badges || []).filter((b: any) => b.earned).length} />
                    /{(badges || []).length}
                  </p>
                  <p className="text-orange-600 text-sm mt-1 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {badges.length ? Math.round((((badges || []).filter((b: any) => b.earned).length) / badges.length) * 100) : 0}% complete
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
                currentLevel={user?.currentLevel || 0}
                progress={user?.levelProgress || 0}
                nextLevelPoints={user?.nextLevelPoints || 0}
              />

              {/* Recent Activities */}
              <RecentActivities items={activities} />

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
              {badges.map((badge) => (
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
                  {leaderboard.map((entry) => (
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
                        <p className="text-2xl font-bold text-gray-900">{userOverview?.referralsSuccessful || 0}</p>
                        <p className="text-sm text-gray-600">Successful Referrals</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          +{((userOverview?.referralsSuccessful || 0) * 50).toLocaleString()}
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
                        <p className="text-2xl font-bold text-blue-600">{stats.socialShares || 0}</p>
                        <p className="text-sm text-gray-600">Total Shares</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          +{(((stats.socialShares || 0) * POINT_VALUES.SOCIAL_SHARE)).toLocaleString()}
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
