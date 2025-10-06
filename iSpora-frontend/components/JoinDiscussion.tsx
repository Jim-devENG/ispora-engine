import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Pin,
  Heart,
  Reply,
  Search,
  Filter,
  Plus,
  Eye,
  MessageCircle,
  ThumbsUp,
  Hash,
  School,
  Globe,
  Lock,
  Star,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface JoinDiscussionProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscussionTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  university?: string;
  author: {
    name: string;
    avatar?: string;
    title: string;
    isVerified: boolean;
  };
  stats: {
    views: number;
    replies: number;
    likes: number;
    participants: number;
  };
  tags: string[];
  isSticky: boolean;
  isLocked: boolean;
  privacy: 'public' | 'university' | 'private';
  lastActivity: string;
  trending: boolean;
  hasNewReplies: boolean;
  createdAt: string;
}

interface DiscussionForum {
  id: string;
  name: string;
  description: string;
  category: string;
  university?: string;
  memberCount: number;
  topicsCount: number;
  isJoined: boolean;
  privacy: 'public' | 'university' | 'private';
  moderators: string[];
  recentActivity: string;
  icon?: React.ReactNode;
}

const mockDiscussionTopics: DiscussionTopic[] = [
  {
    id: '1',
    title: 'Best Practices for Remote Mentorship in Tech',
    description:
      'Sharing experiences and tips for effective remote mentorship programs, especially for students in Africa.',
    category: 'Mentorship',
    university: 'University of Lagos',
    author: {
      name: 'Dr. Sarah Chen',
      title: 'Senior Software Engineer at Google',
      isVerified: true,
    },
    stats: {
      views: 342,
      replies: 23,
      likes: 45,
      participants: 18,
    },
    tags: ['Remote Work', 'Mentorship', 'Technology', 'Best Practices'],
    isSticky: true,
    isLocked: false,
    privacy: 'public',
    lastActivity: '2 hours ago',
    trending: true,
    hasNewReplies: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Funding Opportunities for African Startups in 2024',
    description:
      'Comprehensive list of grants, accelerators, and investment opportunities specifically for African entrepreneurs.',
    category: 'Funding',
    author: {
      name: 'Amina Hassan',
      title: 'Investment Banking VP at Goldman Sachs',
      isVerified: true,
    },
    stats: {
      views: 567,
      replies: 34,
      likes: 78,
      participants: 29,
    },
    tags: ['Funding', 'Startups', 'Africa', 'Investment', 'Grants'],
    isSticky: false,
    isLocked: false,
    privacy: 'public',
    lastActivity: '4 hours ago',
    trending: true,
    hasNewReplies: false,
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    title: 'Medical Research Collaboration Opportunities',
    description:
      'Connecting medical professionals and researchers across universities for collaborative projects.',
    category: 'Research',
    university: 'Makerere University',
    author: {
      name: 'Prof. James Okafor',
      title: 'Professor of Medicine at Johns Hopkins',
      isVerified: true,
    },
    stats: {
      views: 189,
      replies: 12,
      likes: 28,
      participants: 8,
    },
    tags: ['Medical Research', 'Collaboration', 'Healthcare', 'Academic'],
    isSticky: false,
    isLocked: false,
    privacy: 'university',
    lastActivity: '1 day ago',
    trending: false,
    hasNewReplies: true,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    title: 'Career Transition: From Academia to Industry',
    description:
      'Share your experiences and get advice on transitioning from academic roles to industry positions.',
    category: 'Career',
    author: {
      name: 'David Mwangi',
      title: 'Agricultural Engineer at FAO',
      isVerified: false,
    },
    stats: {
      views: 234,
      replies: 18,
      likes: 32,
      participants: 15,
    },
    tags: ['Career Change', 'Academia', 'Industry', 'Professional Development'],
    isSticky: false,
    isLocked: false,
    privacy: 'public',
    lastActivity: '6 hours ago',
    trending: false,
    hasNewReplies: false,
    createdAt: '2024-01-08',
  },
];

const mockForums: DiscussionForum[] = [
  {
    id: '1',
    name: 'UNILAG Alumni Network',
    description: 'Connect with fellow University of Lagos graduates worldwide',
    category: 'University',
    university: 'University of Lagos',
    memberCount: 1247,
    topicsCount: 89,
    isJoined: true,
    privacy: 'university',
    moderators: ['Dr. Sarah Chen', 'Prof. Adams'],
    recentActivity: '2 hours ago',
    icon: <School className="h-5 w-5" />,
  },
  {
    id: '2',
    name: 'Tech Professionals Hub',
    description: 'For technology professionals sharing knowledge and opportunities',
    category: 'Industry',
    memberCount: 2156,
    topicsCount: 234,
    isJoined: false,
    privacy: 'public',
    moderators: ['Tech Community Team'],
    recentActivity: '30 minutes ago',
    icon: <Globe className="h-5 w-5" />,
  },
  {
    id: '3',
    name: 'Medical Research Network',
    description: 'Healthcare professionals and researchers collaboration space',
    category: 'Industry',
    memberCount: 789,
    topicsCount: 145,
    isJoined: true,
    privacy: 'public',
    moderators: ['Prof. James Okafor', 'Dr. Medical Team'],
    recentActivity: '1 hour ago',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    id: '4',
    name: 'Startup Founders Circle',
    description: 'Exclusive community for startup founders and entrepreneurs',
    category: 'Entrepreneurship',
    memberCount: 456,
    topicsCount: 67,
    isJoined: false,
    privacy: 'private',
    moderators: ['Amina Hassan', 'Startup Team'],
    recentActivity: '3 hours ago',
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const categories = [
  'All Categories',
  'Mentorship',
  'Funding',
  'Research',
  'Career',
  'Networking',
  'Projects',
];

export function JoinDiscussion({ isOpen, onClose }: JoinDiscussionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('recent');

  const filteredTopics = mockDiscussionTopics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All Categories' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinForum = (forumId: string) => {
    const forum = mockForums.find((f) => f.id === forumId);
    if (forum) {
      toast.success(`Joined ${forum.name}!`);
    }
  };

  const handleJoinTopic = (topicId: string) => {
    const topic = mockDiscussionTopics.find((t) => t.id === topicId);
    if (topic) {
      toast.success(`Joined discussion: ${topic.title}`);
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Globe className="h-3 w-3" />;
      case 'university':
        return <School className="h-3 w-3" />;
      case 'private':
        return <Lock className="h-3 w-3" />;
      default:
        return <Globe className="h-3 w-3" />;
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'text-green-600';
      case 'university':
        return 'text-blue-600';
      case 'private':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <span>Join Discussions</span>
          </DialogTitle>
          <DialogDescription>
            Connect with your alumni community through meaningful discussions and knowledge sharing
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="topics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topics">Active Discussions</TabsTrigger>
            <TabsTrigger value="forums">Discussion Forums</TabsTrigger>
            <TabsTrigger value="my-activity">My Activity</TabsTrigger>
          </TabsList>

          {/* Active Discussions Tab */}
          <TabsContent value="topics" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="replies">Most Replies</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{filteredTopics.length} discussions found</span>
                </div>
              </div>
            </div>

            {/* Discussion Topics */}
            <div className="space-y-4">
              {filteredTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            {topic.isSticky && <Pin className="h-4 w-4 text-yellow-600" />}
                            <h3 className="font-semibold hover:text-blue-600 cursor-pointer">
                              {topic.title}
                            </h3>
                            {topic.trending && (
                              <Badge className="bg-red-100 text-red-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {topic.hasNewReplies && (
                              <Badge className="bg-blue-100 text-blue-800">New</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {topic.description}
                          </p>
                        </div>
                        <div
                          className={`flex items-center space-x-1 text-xs ${getPrivacyColor(topic.privacy)}`}
                        >
                          {getPrivacyIcon(topic.privacy)}
                          <span className="capitalize">{topic.privacy}</span>
                        </div>
                      </div>

                      {/* Author */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={topic.author.avatar} />
                          <AvatarFallback>
                            {topic.author.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{topic.author.name}</span>
                            {topic.author.isVerified && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{topic.author.title}</p>
                        </div>
                        {topic.university && (
                          <Badge variant="outline" className="text-xs">
                            <School className="h-3 w-3 mr-1" />
                            {topic.university}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{topic.stats.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{topic.stats.replies}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{topic.stats.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{topic.stats.participants}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            Last activity {topic.lastActivity}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleJoinTopic(topic.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Join Discussion
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussion Forums Tab */}
          <TabsContent value="forums" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Available Forums</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Forum
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {mockForums.map((forum) => (
                <Card key={forum.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">{forum.icon}</div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">{forum.name}</h4>
                            <p className="text-sm text-muted-foreground">{forum.description}</p>
                            {forum.university && (
                              <Badge variant="outline" className="text-xs">
                                {forum.university}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div
                          className={`flex items-center space-x-1 text-xs ${getPrivacyColor(forum.privacy)}`}
                        >
                          {getPrivacyIcon(forum.privacy)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Members</p>
                          <p className="font-semibold">{forum.memberCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Topics</p>
                          <p className="font-semibold">{forum.topicsCount}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Active {forum.recentActivity}
                        </span>
                        {forum.isJoined ? (
                          <Badge className="bg-green-100 text-green-800">Joined</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJoinForum(forum.id)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Join Forum
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Activity Tab */}
          <TabsContent value="my-activity" className="space-y-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Discussion Activity</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your discussion history, replies, and forum memberships
              </p>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-muted-foreground">Forums Joined</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <div className="text-sm text-muted-foreground">Discussions Joined</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">28</div>
                      <div className="text-sm text-muted-foreground">Replies Posted</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
