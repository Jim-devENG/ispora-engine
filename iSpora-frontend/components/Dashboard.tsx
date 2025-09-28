import React, { useState, useEffect, useRef } from "react";
import { ImpactOverviewCards } from "./ImpactOverviewCards";
import { QuickActions } from "./QuickActions";
import { LiveFeed } from "./LiveFeed";
import { DashboardHeader } from "./DashboardHeader";
import { LiveSessionsWidget } from "./LiveSessionsWidget";
import { CreditsPage } from "./CreditsPage";
import { MyNetwork } from "./MyNetwork";
import { useNavigation } from "./NavigationContext";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useFeedService } from "./FeedService";
import { AdminFeedManager } from "./AdminFeedManager";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Users, 
  Award, 
  TrendingUp,
  Search,
  Plus,
  Megaphone,
  GraduationCap,
  Globe,
  Heart,
  Share2,
  Eye,
  Target,
  BookOpen,
  UserCheck,
  Briefcase,
  Trophy,
  BarChart3,
  Rocket,
  Camera,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pin,
  Settings,
  Zap,
  Activity,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Users2,
  ThumbsUp,
  Lightbulb,
  Star,
  CheckCircle2,
  Timer,
  MessageCircle,
  ArrowUpRight,
  Flame,
  TrendingUp as TrendingUpIcon,
  Loader,
  RefreshCw,
  Send,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link,
  X
} from "lucide-react";

// Mock current user for demo
const CURRENT_USER_ID = 'user_001';

// Mock global impact stats
const mockGlobalStats = {
  totalProjects: 1247,
  menteesTrained: 8932,
  countriesReached: 54,
  activeMentors: 2156,
  opportunitiesPosted: 456,
  successStories: 189
};

// Social Interactions Context
interface SocialInteraction {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'like' | 'comment' | 'share';
  content?: string;
  timestamp: string;
}

// Comments Dialog Component
function CommentsDialog({ 
  postId, 
  postTitle, 
  initialComments = 0,
  onCommentAdded 
}: { 
  postId: string;
  postTitle: string;
  initialComments?: number;
  onCommentAdded?: (count: number) => void;
}) {
  const { user } = useAuth();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User' : 'User';
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<SocialInteraction[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock comments data
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      // Simulate loading comments
      setIsLoading(true);
      setTimeout(() => {
        const mockComments: SocialInteraction[] = [
          {
            postId,
            userId: 'user_002',
            userName: 'Sarah Okafor',
            userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
            type: 'comment',
            content: 'This is such an inspiring initiative! I\'d love to contribute my expertise in digital marketing to help amplify the reach.',
            timestamp: '2 hours ago'
          },
          {
            postId,
            userId: 'user_003',
            userName: 'Dr. Michael Kwame',
            userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            type: 'comment',
            content: 'Fantastic work! I\'ve seen similar projects succeed in Ghana. Happy to share some best practices and lessons learned.',
            timestamp: '4 hours ago'
          },
          {
            postId,
            userId: 'user_004',
            userName: 'Fatima Al-Rashid',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            type: 'comment',
            content: 'Count me in! I can help with the technical implementation and training materials.',
            timestamp: '6 hours ago'
          }
        ];
        setComments(mockComments);
        setIsLoading(false);
      }, 800);
    }
  }, [isOpen, postId]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: SocialInteraction = {
      postId,
      userId: CURRENT_USER_ID,
      userName: userName,
      type: 'comment',
      content: newComment.trim(),
      timestamp: 'just now'
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    onCommentAdded?.(comments.length + 1);
    
    toast.success('Comment added successfully!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-sm btn-hover-lift">
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent className="tooltip-enhanced">
          <span className="text-xs">Share your thoughts and engage with the community</span>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-xl max-h-[75vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Comments on "{postTitle.substring(0, 50)}..."
          </DialogTitle>
          <DialogDescription>
            Join the conversation and share your thoughts on this community story.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Add Comment Section */}
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add a thoughtful comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim()}
                        className="bg-[#021ff6] hover:bg-[#021ff6]/90 btn-hover-lift"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Post Comment
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="tooltip-enhanced">
                      <span className="text-xs">Share your thoughts with the community</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          <ScrollArea className="flex-1 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-500">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Share Dialog Component
function ShareDialog({ 
  postId, 
  postTitle, 
  postUrl 
}: { 
  postId: string;
  postTitle: string;
  postUrl: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const shareText = `Check out this impactful initiative: "${postTitle}" on Ispora`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(postUrl);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-600',
      action: () => {
        navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
        setIsOpen(false);
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-600',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
        setIsOpen(false);
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
        setIsOpen(false);
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-800',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        setIsOpen(false);
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-green-600',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodedText}%20${encodedUrl}`, '_blank');
        setIsOpen(false);
      }
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-sm btn-hover-lift">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent className="tooltip-enhanced">
          <span className="text-xs">Help amplify impact by sharing with your network</span>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share this story
          </DialogTitle>
          <DialogDescription>
            Share this impactful story with your network to help amplify its reach.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{postTitle}</p>
            <p className="text-xs text-gray-500 mt-1">{postUrl}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {shareOptions.map((option) => (
              <Tooltip key={option.name}>
                <TooltipTrigger asChild>
                  <button
                    onClick={option.action}
                    className="flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors btn-hover-lift w-full"
                  >
                    <option.icon className={`h-5 w-5 ${option.color}`} />
                    <span className="font-medium">{option.name}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="tooltip-enhanced">
                  <span className="text-xs">Open {option.name} to share this story</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Pull to Refresh Component
function PullToRefresh({ 
  onRefresh, 
  isRefreshing, 
  children 
}: { 
  onRefresh: () => void;
  isRefreshing: boolean;
  children: React.ReactNode;
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      // Only allow pull to refresh when at the top of the scroll area
      const isAtTop = scrollContainer.scrollTop === 0;
      if (isAtTop) {
        setCanPull(true);
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || !startY) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        setIsPulling(true);
        
        // Calculate pull distance with diminishing returns
        const distance = Math.min(deltaY * 0.5, MAX_PULL_DISTANCE);
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > PULL_THRESHOLD) {
        onRefresh();
      }
      
      // Reset state
      setIsPulling(false);
      setPullDistance(0);
      setStartY(0);
      setCanPull(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, startY, isPulling, pullDistance, onRefresh]);

  const getRefreshIconRotation = () => {
    if (isRefreshing) return 'animate-spin';
    if (pullDistance > PULL_THRESHOLD) return 'rotate-180';
    return `rotate-${Math.min(pullDistance * 2, 180)}`;
  };

  const getRefreshText = () => {
    if (isRefreshing) return 'Refreshing...';
    if (pullDistance > PULL_THRESHOLD) return 'Release to refresh';
    if (isPulling) return 'Pull to refresh';
    return '';
  };

  return (
    <div ref={containerRef} className="relative h-full">
      {/* Pull to Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-transparent transition-all duration-200"
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(${isPulling ? 0 : isRefreshing ? 0 : -60}px)`,
          }}
        >
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <RefreshCw 
              className={`h-5 w-5 transition-transform duration-200 ${getRefreshIconRotation()}`}
            />
            <span className="text-sm">{getRefreshText()}</span>
          </div>
          {pullDistance > PULL_THRESHOLD && !isRefreshing && (
            <div className="mt-1 text-xs text-blue-500">
              Ready to refresh feed
            </div>
          )}
        </div>
      )}

      {/* Content with pull offset */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)`,
        }}
      >
        <div ref={scrollRef} className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Collapsible Description Component for Feed Cards
function CollapsibleFeedDescription({ 
  narrative, 
  description, 
  maxLength = 120,
  postId 
}: { 
  narrative: string;
  description?: string;
  maxLength?: number;
  postId: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Combine narrative and description for collapsing
  const fullText = description ? `${narrative} ${description}` : narrative;
  const shouldCollapse = fullText.length > maxLength;
  const truncatedText = shouldCollapse ? fullText.slice(0, maxLength) + "..." : fullText;

  if (!shouldCollapse) {
    return (
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {fullText}
      </p>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="space-y-2">
        <p className="text-gray-700 text-sm leading-relaxed">
          {isExpanded ? fullText : truncatedText}
        </p>
        
        <Tooltip>
          <CollapsibleTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-[#021ff6] hover:text-[#021ff6]/80 hover:bg-transparent font-medium btn-hover-lift"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when expanding
                }}
              >
                <span className="flex items-center gap-1">
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Read more</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </span>
              </Button>
            </TooltipTrigger>
          </CollapsibleTrigger>
          <TooltipContent className="tooltip-enhanced">
            <span className="text-xs">{isExpanded ? 'Collapse' : 'Expand'} this story</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </Collapsible>
  );
}

// Dynamic Interest Counter Component
function DynamicInterestCounter({ 
  count, 
  animate = false,
  showIcon = true,
  size = "default" 
}: { 
  count: number; 
  animate?: boolean;
  showIcon?: boolean;
  size?: "small" | "default" | "large";
}) {
  const [currentCount, setCurrentCount] = useState(animate ? 0 : count);
  
  // Determine heat level and styling
  const getHeatLevel = (count: number) => {
    if (count >= 1000) {
      return {
        level: "hot",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: "🔴",
        label: "Hot"
      };
    } else if (count >= 500) {
      return {
        level: "medium",
        color: "text-yellow-600", 
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: "🟡",
        label: "Popular"
      };
    } else {
      return {
        level: "new",
        color: "text-green-600",
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        icon: "🟢",
        label: "New"
      };
    }
  };

  const heat = getHeatLevel(count);
  
  const sizeClasses = {
    small: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5", 
    large: "text-base px-4 py-2"
  };

  // Animate counter if requested
  useEffect(() => {
    if (animate && count > 0) {
      const duration = 1500;
      const startTime = Date.now();
      
      const animateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * count);
        
        setCurrentCount(current);
        
        if (progress < 1) {
          requestAnimationFrame(animateCounter);
        }
      };
      
      requestAnimationFrame(animateCounter);
    }
  }, [count, animate]);

  const displayCount = animate ? currentCount : count;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 hover:scale-105 cursor-help ${heat.bgColor} ${heat.borderColor} ${sizeClasses[size]}`}>
          {showIcon && (
            <span className="flex-shrink-0">
              {heat.icon}
            </span>
          )}
          <Users2 className={`h-3 w-3 ${heat.color}`} />
          <span className={`font-semibold ${heat.color}`}>
            {displayCount.toLocaleString()}
          </span>
          <span className={`font-medium ${heat.color} hidden sm:inline`}>
            {displayCount === 1 ? 'person' : 'people'} interested
          </span>
          {heat.level === "hot" && (
            <Flame className={`h-3 w-3 ${heat.color} animate-pulse`} />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="tooltip-enhanced">
        <span className="text-xs">{displayCount.toLocaleString()} people interested • Status: {heat.label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// Enhanced Interest Tracker for real-time updates
function InterestTracker({ 
  opportunityId, 
  initialCount = 0,
  showTrend = false 
}: { 
  opportunityId: string; 
  initialCount?: number;
  showTrend?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [recentIncrease, setRecentIncrease] = useState(0);
  const [isRealTime, setIsRealTime] = useState(false);

  // Simulate real-time interest updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increase interest (simulate real activity)
      if (Math.random() < 0.3) { // 30% chance every 5 seconds
        const increase = Math.floor(Math.random() * 3) + 1; // 1-3 new interests
        setCount(prev => prev + increase);
        setRecentIncrease(increase);
        setIsRealTime(true);
        
        // Reset real-time indicator after 3 seconds
        setTimeout(() => {
          setIsRealTime(false);
          setRecentIncrease(0);
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <DynamicInterestCounter count={count} animate={recentIncrease > 0} />
      {showTrend && recentIncrease > 0 && (
        <div className="flex items-center gap-1 text-green-600 text-xs animate-pulse">
          <TrendingUpIcon className="h-3 w-3" />
          <span>+{recentIncrease}</span>
        </div>
      )}
      {isRealTime && (
        <Badge className="bg-green-600 text-white text-xs animate-pulse">
          <div className="h-1.5 w-1.5 bg-white rounded-full mr-1"></div>
          LIVE
        </Badge>
      )}
    </div>
  );
}

// Animated counter component
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
      
      // Use easing function for smooth animation
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

// Individual stat card component
function StatCard({ 
  title, 
  value, 
  color, 
  delay = 0 
}: { 
  title: string; 
  value: number; 
  color: string; 
  delay?: number; 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Tooltip>
      <TooltipTrigger>
        <Card className={`card-gradient card-hover-lift cursor-help ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } w-full`}>
          <CardContent className="p-3 text-center">
            <div className={`text-xl font-bold ${color} mb-2`}>
              {isVisible ? (
                <AnimatedCounter value={value} duration={2000 + delay} />
              ) : (
                "0"
              )}
            </div>
            <div className="text-xs text-gray-600 font-semibold">{title}</div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent className="tooltip-enhanced">
        <span className="text-xs">Total {value.toLocaleString()} across the platform</span>
      </TooltipContent>
    </Tooltip>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User' : 'User';
  const [searchQuery, setSearchQuery] = useState("");
  const [userType] = useState("participant"); // Could be "diasporan" or "participant"
  const [displayedPosts, setDisplayedPosts] = useState(6); // Show 6 posts initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAdminManager, setShowAdminManager] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Social interactions state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [postComments, setPostComments] = useState<Record<string, number>>({});
  
  // Use the navigation context to handle navigation
  const { 
    navigate, 
    setCurrentPage, 
    setSelectedProject, 
    navigateToWorkroom, 
    navigateToCampaign,
    navigateToSpecificProject,
    navigateToSpecificOpportunity
  } = useNavigation();
  
  // Use the feed service for dynamic feed management
  const { feedItems, loading, refreshFeed, recordUserAction } = useFeedService();
  
  const getPostIcon = (type: string) => {
    switch (type) {
      case 'project': return <Rocket className="h-5 w-5 text-blue-500" />;
      case 'campaign': return <Megaphone className="h-5 w-5 text-purple-500" />;
      case 'opportunity': return <Target className="h-5 w-5 text-green-500" />;
      case 'milestone': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'story': return <Camera className="h-5 w-5 text-pink-500" />;
      case 'success_story': return <Trophy className="h-5 w-5 text-green-500" />;
      case 'funding_success': return <Award className="h-5 w-5 text-green-600" />;
      case 'live_event': return <Globe className="h-5 w-5 text-red-500" />;
      case 'workroom_live': return <Users className="h-5 w-5 text-orange-500" />;
      case 'project_closing': return <Clock className="h-5 w-5 text-red-600" />;
      case 'admin_highlight': return <Megaphone className="h-5 w-5 text-orange-600" />;
      case 'achievement': return <Award className="h-5 w-5 text-purple-600" />;
      case 'certification': return <Trophy className="h-5 w-5 text-blue-600" />;
      case 'collaboration': return <Users className="h-5 w-5 text-teal-500" />;
      default: return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get story narrative based on post type (shortened versions)
  const getStoryNarrative = (post: any) => {
    const isOwnContent = post.authorId === CURRENT_USER_ID;
    
    switch (post.type) {
      case 'project':
        return {
          narrative: isOwnContent 
            ? `You've launched an exciting new initiative that's now connecting communities across ${post.location}. This project is making a real difference and building bridges between diaspora professionals and local communities.` 
            : `${post.authorName} is building something impactful in ${post.category.toLowerCase()}, creating opportunities for diaspora professionals to make a difference. This initiative represents the kind of collaboration that strengthens our global network.`,
          ctaText: isOwnContent ? "Manage Your Project" : "Join This Mission",
          impact: `Seeking ${post.metadata?.seekingSupport?.length || 0} types of support`,
          visual: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        };
      
      case 'opportunity':
        return {
          narrative: `${post.authorName} has shared a ${post.metadata?.type || 'opportunity'} that could transform careers. This ${post.category.toLowerCase()} opportunity is exactly the kind that can accelerate professional growth and create lasting impact.`,
          ctaText: post.urgent ? "Apply Before Deadline" : "Learn More",
          impact: post.deadline ? `Deadline: ${post.deadline}` : "Open application",
          visual: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
        };
      
      case 'success_story':
        return {
          narrative: `${post.authorName} has achieved a significant milestone! This success story represents the collective effort of our diaspora community working together to create lasting impact. These achievements inspire us all and show what's possible when we collaborate.`,
          ctaText: "Celebrate Success",
          impact: "Community milestone reached",
          visual: "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200"
        };
      
      case 'admin_highlight':
        return {
          narrative: `Our team is highlighting exceptional work happening in the community. This spotlights the kind of impact we're creating together across the diaspora network. These featured projects represent the best of what our community can achieve.`,
          ctaText: "See Highlights",
          impact: "Admin featured",
          visual: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
        };
      
      default:
        return {
          narrative: `${post.authorName} is making moves in the ${post.category.toLowerCase()} space, contributing to our growing ecosystem of diaspora-driven impact. Every contribution matters in building our collective strength and reach.`,
          ctaText: "Get Involved",
          impact: "Community activity",
          visual: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
        };
    }
  };

  // Social interaction handlers
  const handleLike = (postId: string, currentLikes: number) => {
    const isLiked = likedPosts.has(postId);
    
    if (isLiked) {
      // Unlike
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setPostLikes(prev => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || currentLikes) - 1)
      }));
      toast.success('Like removed');
    } else {
      // Like
      setLikedPosts(prev => new Set(prev).add(postId));
      setPostLikes(prev => ({
        ...prev,
        [postId]: (prev[postId] || currentLikes) + 1
      }));
      toast.success('Thanks for your like! 👍');
    }
  };

  const handleCommentAdded = (postId: string, newCount: number) => {
    setPostComments(prev => ({
      ...prev,
      [postId]: newCount
    }));
  };

  // Enhanced refresh handler with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFeed();
      // Reset displayed posts to show fresh content
      setDisplayedPosts(6);
      toast.success('Feed refreshed!');
    } finally {
      // Add minimum delay for UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  // Enhanced navigation logic for feed cards with specific targeting
  const handleFeedCardClick = (post: any) => {
    const isOwnContent = post.authorId === CURRENT_USER_ID;
    
    console.log('Feed card clicked:', { 
      type: post.type, 
      isOwnContent, 
      projectId: post.projectId,
      opportunityId: post.opportunityId,
      campaignId: post.campaignId,
      post 
    });
    
    switch (post.type) {
      case 'project':
        if (post.projectId) {
          if (isOwnContent) {
            // Navigate to My Projects and highlight this specific project
            setCurrentPage('My Projects');
            // Pass project ID for highlighting
            navigate('My Projects', { 
              highlightProjectId: post.projectId,
              projectTitle: post.title,
              projectCategory: post.category
            });
          } else {
            // Navigate to specific project in Project Dashboard
            navigateToSpecificProject(post.projectId, {
              title: post.title,
              category: post.category,
              description: post.description,
              authorName: post.authorName,
              location: post.location
            });
          }
        } else {
          // Fallback to general project navigation
          setCurrentPage(isOwnContent ? 'My Projects' : 'Project Dashboard');
        }
        break;
        
      case 'campaign':
        if (post.campaignId) {
          // Use the existing navigateToCampaign function with enhanced data
          const campaignData = {
            id: post.campaignId,
            title: post.title,
            description: post.description,
            category: post.category,
            authorName: post.authorName,
            location: post.location,
            isLive: post.isLive,
            deadline: post.deadline
          };
          navigateToCampaign(campaignData);
        } else {
          setCurrentPage('Campaign Detail');
        }
        break;
        
      case 'opportunity':
        if (post.opportunityId) {
          // Navigate to specific opportunity
          navigateToSpecificOpportunity(post.opportunityId, {
            title: post.title,
            category: post.category,
            description: post.description,
            authorName: post.authorName,
            location: post.location,
            deadline: post.deadline,
            isUrgent: post.urgent
          });
        } else {
          // Fallback to general opportunities page
          setCurrentPage('Opportunities');
        }
        break;
        
      case 'live_event':
      case 'workroom_live':
        if (post.isLive && post.projectId) {
          // Navigate to workroom for live sessions
          navigateToWorkroom(post.projectId, {
            openWorkspacePanel: true,
            activeTab: 'live-session'
          });
        } else if (post.projectId) {
          // Navigate to specific project for completed sessions
          if (isOwnContent) {
            navigate('My Projects', { 
              highlightProjectId: post.projectId,
              projectTitle: post.title 
            });
          } else {
            navigateToSpecificProject(post.projectId, {
              title: post.title,
              category: post.category,
              focusSection: 'sessions'
            });
          }
        } else {
          setCurrentPage('Project Dashboard');
        }
        break;
        
      case 'milestone':
      case 'success_story':
      case 'achievement':
      case 'certification':
        if (post.projectId) {
          // Navigate to project if it's project-related
          if (isOwnContent) {
            navigate('My Projects', { 
              highlightProjectId: post.projectId,
              focusSection: 'achievements'
            });
          } else {
            navigateToSpecificProject(post.projectId, {
              title: post.title,
              category: post.category,
              focusSection: 'milestones'
            });
          }
        } else if (isOwnContent) {
          // Navigate to user's profile achievements
          navigate('Profile', { section: 'achievements' });
        } else {
          // Navigate to projects dashboard
          setCurrentPage('Project Dashboard');
        }
        break;
        
      case 'funding_success':
        if (post.projectId) {
          if (isOwnContent) {
            navigate('My Projects', { 
              highlightProjectId: post.projectId,
              focusSection: 'funding'
            });
          } else {
            navigateToSpecificProject(post.projectId, {
              title: post.title,
              category: post.category,
              focusSection: 'funding'
            });
          }
        } else {
          // Navigate to opportunities for funding info
          setCurrentPage('Opportunities');
        }
        break;
        
      case 'collaboration':
        if (post.projectId) {
          navigateToSpecificProject(post.projectId, {
            title: post.title,
            category: post.category,
            focusSection: 'collaboration'
          });
        } else {
          setCurrentPage('Project Dashboard');
        }
        break;
        
      case 'admin_highlight':
        // Handle admin highlights with specific navigation based on metadata
        if (post.metadata?.highlightType === 'top_mentor') {
          setCurrentPage('Mentorship');
        } else if (post.metadata?.highlightType === 'featured_project' && post.projectId) {
          navigateToSpecificProject(post.projectId, {
            title: post.title,
            category: post.category,
            isAdminFeatured: true
          });
        } else if (post.metadata?.highlightType === 'spotlighted_opportunity' && post.opportunityId) {
          navigateToSpecificOpportunity(post.opportunityId, {
            title: post.title,
            category: post.category,
            isAdminSpotlighted: true
          });
        } else {
          // Default for admin highlights
          setCurrentPage('Project Dashboard');
        }
        break;
        
      default:
        // Default navigation for unknown types
        if (post.projectId) {
          if (isOwnContent) {
            navigate('My Projects', { highlightProjectId: post.projectId });
          } else {
            navigateToSpecificProject(post.projectId, {
              title: post.title,
              category: post.category
            });
          }
        } else if (post.opportunityId) {
          navigateToSpecificOpportunity(post.opportunityId, {
            title: post.title,
            category: post.category
          });
        } else {
          setCurrentPage('Project Dashboard');
        }
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedPosts(prev => Math.min(prev + 6, feedItems.length));
      setIsLoadingMore(false);
    }, 1000);
  };

  // Simulate user actions for demo purposes - now with proper IDs
  const simulateUserAction = (actionType: string) => {
    const actionMap: Record<string, any> = {
      'project_created': {
        actionType: 'project_created',
        entityTitle: 'African Innovation Hub',
        entityCategory: 'Technology',
        description: 'Building the next generation of African tech leaders',
        entityId: `proj_${Date.now()}`, // Generate unique project ID
        projectId: `proj_${Date.now()}`,
      },
      'campaign_launched': {
        actionType: 'campaign_launched',
        entityTitle: 'Skills Development Initiative',
        entityCategory: 'Education',
        description: 'Empowering youth with digital skills',
        entityId: `camp_${Date.now()}`, // Generate unique campaign ID
        campaignId: `camp_${Date.now()}`,
      },
      'milestone_achieved': {
        actionType: 'milestone_achieved',
        entityTitle: '500 Students Trained',
        entityCategory: 'Education',
        description: 'Reached major training milestone',
        entityId: `mile_${Date.now()}`,
        projectId: `proj_${Date.now() - 1000}`, // Link to existing project
      },
      'opportunity_posted': {
        actionType: 'opportunity_posted',
        entityTitle: 'Tech Leadership Fellowship',
        entityCategory: 'Technology',
        description: 'Open applications for leadership development',
        entityId: `opp_${Date.now()}`,
        opportunityId: `opp_${Date.now()}`,
      },
    };

    const actionData = actionMap[actionType];
    if (actionData) {
      recordUserAction({
        userId: CURRENT_USER_ID,
        userName: userName,
        userLocation: 'Global',
        actionType: actionData.actionType,
        entityId: actionData.entityId,
        entityType: actionData.actionType.includes('project') ? 'project' : 
                   actionData.actionType.includes('campaign') ? 'campaign' :
                   actionData.actionType.includes('opportunity') ? 'opportunity' : 'project',
        entityTitle: actionData.entityTitle,
        entityCategory: actionData.entityCategory,
        metadata: { 
          description: actionData.description,
          projectId: actionData.projectId,
          campaignId: actionData.campaignId,
          opportunityId: actionData.opportunityId
        },
        visibility: 'public',
      });
    }
  };

  // Navigation handlers for main CTA buttons
  const handleExploreProjects = () => {
    setCurrentPage('Project Dashboard');
  };

  const handleViewOpportunities = () => {
    setCurrentPage('Opportunities');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Top Section: Welcome & Personalization - Fixed */}
      <div className="glass-effect border-b border-white/20 flex-shrink-0">
        <div className="p-4">
          {/* Welcome Message with Live Sessions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gradient mb-1">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 text-sm">
                Here's what's happening in your diaspora community today
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LiveSessionsWidget />
              <Badge className="glass-effect border-white/30 text-blue-700 px-2 py-1 text-xs">
                <Users className="h-3 w-3 mr-1" />
                Global Community
              </Badge>
            </div>
          </div>

          {/* Search and CTA Section */}
          <div className="flex items-center gap-3 mb-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stories, projects, opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 input-beautiful text-sm"
              />
            </div>
            
            {/* CTA Buttons based on user type */}
            <div className="flex gap-2">
              {userType === "diasporan" ? (
                <>
                  <Button 
                    className="btn-primary-gradient h-9 px-4 text-sm"
                    onClick={() => simulateUserAction('project_created')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Project
                  </Button>
                  <Button 
                    className="btn-secondary-blue h-9 px-4 text-sm"
                    onClick={() => simulateUserAction('campaign_launched')}
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Launch Campaign
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="btn-primary-gradient h-9 px-4 text-sm"
                    onClick={handleExploreProjects}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Explore Projects
                  </Button>
                  <Button 
                    className="btn-secondary-blue h-9 px-4 text-sm"
                    onClick={handleViewOpportunities}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    View Opportunities
                  </Button>
                </>
              )}
              
              {/* Admin button for demo */}
              <Button 
                className="btn-secondary-blue h-9 px-3 text-sm"
                onClick={() => setShowAdminManager(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Full Height Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Column: Live Feed (extends to bottom like navigation) */}
        <div className="flex-1 flex flex-col glass-effect border-r border-white/20">
          {/* Feed Header */}
          <div className="p-4 border-b border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gradient mb-1 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Live Feed
                </h2>
                <p className="text-gray-600 text-sm">
                  Real stories of impact from our diaspora community • Pull down to refresh
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="glass-effect border-white/30 text-green-700 px-2 py-1 text-xs">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Stories
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Feed Content - Full Height Scrollable with proper overflow */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
              <div className="h-full w-full overflow-y-auto scrollbar-thin">
                <div className="space-y-6 p-6">
                  {feedItems.slice(0, displayedPosts).map((post) => {
                    const story = getStoryNarrative(post);
                    const isOwnContent = post.authorId === CURRENT_USER_ID;
                    const isLiked = likedPosts.has(post.id);
                    const currentLikes = postLikes[post.id] || post.likes;
                    const currentComments = postComments[post.id] || post.metadata?.comments || Math.floor(post.likes / 4);
                    
                    return (
                      <Card 
                        key={post.id} 
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${story.visual} ${
                          post.urgent ? 'ring-2 ring-red-300 shadow-red-100' : ''
                        } ${
                          post.isAdminCurated ? 'border-l-4 border-l-purple-500' : ''
                        } relative`}
                        onClick={() => handleFeedCardClick(post)}
                      >
                        {/* Pin Icon - Clean design without underlay */}
                        {post.isPinned && (
                          <div className="absolute top-3 right-3 z-10">
                            <Pin className="h-4 w-4 text-red-500 fill-current" />
                          </div>
                        )}

                        <CardContent className="p-6">
                          {/* Header with Avatar and Metadata */}
                          <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                              <AvatarImage src={post.authorAvatar} alt={post.authorName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {post.authorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0 pr-8">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {post.authorName}
                                  {isOwnContent && (
                                    <span className="text-blue-600 text-sm ml-2 font-normal">(You)</span>
                                  )}
                                </h3>
                                {post.isAdminCurated && (
                                  <Badge className="bg-purple-600 text-white text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    FEATURED
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span>{post.location}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{post.timestamp}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {post.category}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {post.urgent && (
                                  <Badge variant="destructive" className="bg-red-500 text-white text-xs animate-pulse">
                                    <Timer className="h-3 w-3 mr-1" />
                                    {post.deadline}
                                  </Badge>
                                )}
                                {post.isLive && (
                                  <Badge className="bg-red-500 text-white animate-pulse text-xs">
                                    <div className="h-2 w-2 bg-white rounded-full mr-1"></div>
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Story Content */}
                          <div className="mb-4">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-shrink-0 p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                                {getPostIcon(post.type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
                                  {post.title.replace(/^(New Project: |New Opportunity: |New Campaign: )/, '')}
                                </h4>
                                
                                {/* Collapsible Description - Key Feature */}
                                <CollapsibleFeedDescription 
                                  narrative={story.narrative}
                                  description={post.description}
                                  maxLength={120}
                                  postId={post.id}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Interest Counter */}
                          {(post.type === 'opportunity' || post.type === 'project') && (
                            <div className="mb-4">
                              <InterestTracker 
                                opportunityId={post.opportunityId || post.projectId || post.id}
                                initialCount={post.metadata?.applicants || post.likes || Math.floor(Math.random() * 2000) + 100}
                                showTrend={true}
                              />
                            </div>
                          )}

                          {/* Impact Metrics */}
                          <div className="mb-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Heart className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : 'text-red-500'}`} />
                                  <span className="font-medium">{currentLikes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">{currentComments}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users2 className="h-4 w-4 text-green-500" />
                                  <span className="font-medium">
                                    {post.metadata?.applicants || post.metadata?.team?.length || 'Active'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500 font-medium">
                                {story.impact}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button 
                                className={`flex items-center gap-1 transition-colors text-sm ${
                                  isLiked 
                                    ? 'text-blue-500' 
                                    : 'text-gray-500 hover:text-blue-500'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(post.id, post.likes);
                                }}
                              >
                                <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{isLiked ? 'Liked' : 'Like'}</span>
                              </button>
                              
                              <div onClick={(e) => e.stopPropagation()}>
                                <CommentsDialog
                                  postId={post.id}
                                  postTitle={post.title}
                                  initialComments={currentComments}
                                  onCommentAdded={(count) => handleCommentAdded(post.id, count)}
                                />
                              </div>
                              
                              <div onClick={(e) => e.stopPropagation()}>
                                <ShareDialog
                                  postId={post.id}
                                  postTitle={post.title}
                                  postUrl={`https://ispora.com/story/${post.id}`}
                                />
                              </div>
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedCardClick(post);
                              }}
                            >
                              <span>{story.ctaText}</span>
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Load more indicator */}
                  {displayedPosts < feedItems.length && (
                    <div className="flex justify-center py-8">
                      <Button 
                        variant="outline" 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore || loading}
                      >
                        {isLoadingMore || loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Loading more stories...
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Discover More Stories ({feedItems.length - displayedPosts} remaining)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* End of feed indicator */}
                  {displayedPosts >= feedItems.length && (
                    <div className="flex justify-center py-8">
                      <div className="text-center text-gray-500">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-500" />
                        <p className="text-sm font-medium">You're all caught up!</p>
                        <p className="text-xs">New stories will appear as our community creates impact</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PullToRefresh>
          </div>
        </div>

        {/* Right Column: Quick Actions & Stats (Fixed Width, Full Height) */}
        <div className="w-72 glass-effect flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-beautiful">
            <div className="p-4 space-y-4">
              {/* Ready to Create Your Story Section */}
              <div className="card-gradient p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gradient mb-2">
                    Ready to Create Your Story?
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Join thousands of diaspora professionals making an impact
                  </p>
                </div>

                <div className="space-y-3">
                  <Card 
                    className="card-hover-lift cursor-pointer group"
                    onClick={handleExploreProjects}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <Search className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Explore Projects</h3>
                      <p className="text-xs text-gray-600">Find impactful initiatives to join</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="card-hover-lift cursor-pointer group"
                    onClick={() => setCurrentPage('Mentorship')}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <UserCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Connect with Mentors</h3>
                      <p className="text-xs text-gray-600">Learn from experienced professionals</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="card-hover-lift cursor-pointer group"
                    onClick={handleViewOpportunities}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Discover Opportunities</h3>
                      <p className="text-xs text-gray-600">Scholarships, jobs, and more</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="card-hover-lift cursor-pointer group"
                    onClick={() => setCurrentPage('Create Project')}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Start Your Initiative</h3>
                      <p className="text-xs text-gray-600">Launch your own impact project</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="card-hover-lift cursor-pointer group"
                    onClick={() => setCurrentPage('Project Dashboard')}
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-5 w-5 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Track Impact</h3>
                      <p className="text-xs text-gray-600">See community progress</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Global Impact Statistics */}
              <div className="card-gradient p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gradient">
                    Our Collective Impact
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    title="Active Projects"
                    value={mockGlobalStats.totalProjects}
                    color="text-blue-600"
                    delay={0}
                  />
                  <StatCard
                    title="Lives Impacted"
                    value={mockGlobalStats.menteesTrained}
                    color="text-green-600"
                    delay={200}
                  />
                  <StatCard
                    title="Countries"
                    value={mockGlobalStats.countriesReached}
                    color="text-purple-600"
                    delay={400}
                  />
                  <StatCard
                    title="Mentors"
                    value={mockGlobalStats.activeMentors}
                    color="text-orange-600"
                    delay={600}
                  />
                  <StatCard
                    title="Opportunities"
                    value={mockGlobalStats.opportunitiesPosted}
                    color="text-red-600"
                    delay={800}
                  />
                  <StatCard
                    title="Success Stories"
                    value={mockGlobalStats.successStories}
                    color="text-pink-600"
                    delay={1000}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Feed Manager */}
      <AdminFeedManager 
        isOpen={showAdminManager}
        onOpenChange={setShowAdminManager}
      />
    </div>
  );
}

function MentorshipContent() {
  const { user } = useAuth();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User' : 'User';
  
  return (
    <div className="min-h-full">
      {/* Header for Mentorship */}
      <DashboardHeader 
        userName={userName} 
        userTitle="Mentoring the next generation of innovators"
      />
      
      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Mentorship Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your mentorship activities, review requests, and track your impact on students worldwide.
          </p>
        </div>
        
        {/* Mentorship Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-semibold">3</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Mentees</p>
                <p className="text-2xl font-semibold">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mentored</p>
                <p className="text-2xl font-semibold">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-semibold">4.8/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Mentorship */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="p-4 text-left border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Review Requests</h4>
                  <p className="text-sm text-muted-foreground">3 pending requests</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Message Mentees</h4>
                  <p className="text-sm text-muted-foreground">Check in with active mentees</p>
                </div>
              </div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-muted-foreground">Track your mentorship impact</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Mentorship Activity */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New mentorship request from Amara Okafor</p>
                <p className="text-xs text-muted-foreground">AI/ML Career Guidance • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Session completed with David Mensah</p>
                <p className="text-xs text-muted-foreground">Graduate School Guidance • 1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Received 5-star rating from Fatima Al-Rashid</p>
                <p className="text-xs text-muted-foreground">Data Science Project • 3 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Started new mentorship with Zara Mohamed</p>
                <p className="text-xs text-muted-foreground">Entrepreneurship Guidance • 5 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-gray-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Completed 6-month mentorship program</p>
                <p className="text-xs text-muted-foreground">Software Development Track • 1 week ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mentorship Statistics */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Your Impact This Month</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hours Mentored</span>
                <span className="font-semibold">32 hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Student Goals Achieved</span>
                <span className="font-semibold">12 / 15</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding for better scrolling */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  const { user } = useAuth();
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User' : 'User';
  
  return (
    <div className="min-h-full">
      {/* Header for other sections */}
      <DashboardHeader 
        userName={userName} 
        userTitle={`Explore ${title.toLowerCase()} features`}
      />
      
      {/* Main Content */}
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            This section is coming soon. Stay tuned for updates!
          </p>
        </div>
        
        <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div className="text-center space-y-4">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Under Construction</h3>
            <p className="text-muted-foreground max-w-md">
              We're working hard to bring you the {title.toLowerCase()} section. 
              Check back soon for exciting new features!
            </p>
          </div>
        </div>

        {/* Bottom padding for better scrolling */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { activeItem } = useNavigation();

  const renderContent = () => {
    switch (activeItem) {
      case 'Impact Feed':
        return <DashboardContent />;
      case 'Projects':
        return <PlaceholderContent title="Projects" />;
      case 'Opportunities':
        return <PlaceholderContent title="Opportunities" />;
      case 'My Network':
        return <MyNetwork />;
      case 'Credits':
        return <CreditsPage />;
      case 'Notifications':
        return <PlaceholderContent title="Notifications" />;
      case 'Settings':
        return <PlaceholderContent title="Settings" />;
      default:
        return <DashboardContent />;
    }
  };

  return renderContent();
}
