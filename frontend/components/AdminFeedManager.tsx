import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Plus, 
  Pin, 
  PinOff, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Megaphone,
  Clock,
  CheckCircle,
  X,
  BarChart3,
  Activity,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { AdminHighlight, FeedItem, useFeedService, UserAction } from "./FeedService";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AdminFeedManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminFeedManager({ isOpen, onOpenChange }: AdminFeedManagerProps) {
  const { feedItems, refreshFeed, createAdminHighlight, recordUserAction, getFeedStats } = useFeedService();
  const [activeTab, setActiveTab] = useState("highlights");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSimulateDialog, setShowSimulateDialog] = useState(false);

  // Form state for creating highlights
  const [formData, setFormData] = useState({
    type: 'announcement' as AdminHighlight['type'],
    title: '',
    description: '',
    image: '',
    ctaText: '',
    ctaLink: '',
    isPinned: false,
    expiresAt: '',
    visibility: 'public' as 'public' | 'authenticated',
  });

  // Form state for simulating user actions
  const [actionData, setActionData] = useState({
    userName: 'Demo User',
    userLocation: 'Global',
    actionType: 'project_created' as UserAction['actionType'],
    entityTitle: '',
    entityCategory: 'Technology',
    description: '',
  });

  const resetForm = () => {
    setFormData({
      type: 'announcement',
      title: '',
      description: '',
      image: '',
      ctaText: '',
      ctaLink: '',
      isPinned: false,
      expiresAt: '',
      visibility: 'public',
    });
  };

  const resetActionForm = () => {
    setActionData({
      userName: 'Demo User',
      userLocation: 'Global',
      actionType: 'project_created',
      entityTitle: '',
      entityCategory: 'Technology',
      description: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) return;

    const highlightData = {
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop&auto=format',
      createdBy: 'admin_user',
      expiresAt: formData.expiresAt || undefined,
    };

    createAdminHighlight(highlightData);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleSimulateAction = () => {
    if (!actionData.entityTitle) return;

    const action = {
      userId: `demo_${Date.now()}`,
      userName: actionData.userName,
      userLocation: actionData.userLocation,
      actionType: actionData.actionType,
      entityId: `entity_${Date.now()}`,
      entityType: getEntityTypeFromAction(actionData.actionType),
      entityTitle: actionData.entityTitle,
      entityCategory: actionData.entityCategory,
      metadata: { description: actionData.description },
      visibility: 'public' as const,
    };

    recordUserAction(action);
    setShowSimulateDialog(false);
    resetActionForm();
  };

  const getEntityTypeFromAction = (actionType: UserAction['actionType']): UserAction['entityType'] => {
    if (actionType.includes('project')) return 'project';
    if (actionType.includes('campaign')) return 'campaign';
    if (actionType.includes('opportunity')) return 'opportunity';
    if (actionType.includes('session')) return 'session';
    if (actionType.includes('certification')) return 'certification';
    if (actionType.includes('workspace')) return 'workspace';
    if (actionType.includes('collaboration')) return 'collaboration';
    return 'achievement';
  };

  const getHighlightTypeIcon = (type: AdminHighlight['type']) => {
    switch (type) {
      case 'top_mentor': return <Award className="h-4 w-4" />;
      case 'spotlighted_opportunity': return <TrendingUp className="h-4 w-4" />;
      case 'impact_stat': return <BarChart3 className="h-4 w-4" />;
      case 'featured_project': return <Pin className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'success_spotlight': return <Award className="h-4 w-4" />;
      case 'community_milestone': return <Users className="h-4 w-4" />;
      default: return <Pin className="h-4 w-4" />;
    }
  };

  const getHighlightTypeColor = (type: AdminHighlight['type']) => {
    switch (type) {
      case 'top_mentor': return 'bg-yellow-100 text-yellow-800';
      case 'spotlighted_opportunity': return 'bg-green-100 text-green-800';
      case 'impact_stat': return 'bg-blue-100 text-blue-800';
      case 'featured_project': return 'bg-purple-100 text-purple-800';
      case 'announcement': return 'bg-orange-100 text-orange-800';
      case 'success_spotlight': return 'bg-emerald-100 text-emerald-800';
      case 'community_milestone': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const adminHighlights = feedItems.filter(item => item.isAdminCurated);
  const userGeneratedItems = feedItems.filter(item => !item.isAdminCurated).slice(0, 10);
  const [stats, setStats] = useState<{
    totalItems: number;
    adminHighlights: number;
    userGenerated: number;
    publicItems: number;
    liveEvents: number;
    recentActivity: number;
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getFeedStats();
      setStats(statsData);
    };
    loadStats();
  }, [getFeedStats]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Feed Management Dashboard
            </DialogTitle>
            <DialogDescription>
              Manage admin highlights, monitor live feed activity, simulate user actions, and view feed analytics.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="highlights">Admin Highlights</TabsTrigger>
              <TabsTrigger value="feed">Live Feed</TabsTrigger>
              <TabsTrigger value="simulate">Simulate Actions</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="highlights" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Admin Highlights</h3>
                  <p className="text-sm text-gray-600">Curated content to spotlight important updates</p>
                </div>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Highlight
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="grid gap-4">
                  {adminHighlights.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.metadata?.image || item.authorAvatar || ''}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getHighlightTypeColor(item.metadata?.highlightType)}>
                                  {getHighlightTypeIcon(item.metadata?.highlightType)}
                                  <span className="ml-1 capitalize">
                                    {item.metadata?.highlightType?.replace('_', ' ')}
                                  </span>
                                </Badge>
                                {item.isPinned && <Pin className="h-4 w-4 text-orange-500" />}
                                {item.visibility === 'authenticated' && <Lock className="h-4 w-4 text-gray-500" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <h4 className="font-medium mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {item.likes} engagements
                              </span>
                              {item.metadata?.expiresAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires {new Date(item.metadata.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="feed" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Live Feed Monitor</h3>
                  <p className="text-sm text-gray-600">Recent auto-generated feed items</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => refreshFeed()}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh Feed
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="grid gap-3">
                  {userGeneratedItems.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-gray-300">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                              {item.authorAvatar ? (
                                <ImageWithFallback
                                  src={item.authorAvatar}
                                  alt={item.authorName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                                  {item.authorName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              <p className="text-xs text-gray-500">
                                {item.category} • {item.authorName} • {item.timestamp}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{item.likes} ♥</span>
                            {item.visibility === 'public' ? (
                              <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="simulate" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Simulate User Actions</h3>
                  <p className="text-sm text-gray-600">Generate feed content by simulating platform activities</p>
                </div>
                <Button 
                  onClick={() => setShowSimulateDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Simulate Action
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        recordUserAction({
                          userId: 'demo_quick',
                          userName: 'Quick Demo User',
                          userLocation: 'Nigeria',
                          actionType: 'project_created',
                          entityId: 'quick_proj',
                          entityType: 'project',
                          entityTitle: 'African Tech Innovation Hub',
                          entityCategory: 'Technology',
                          metadata: { description: 'Building the next generation of African tech leaders' },
                          visibility: 'public',
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        recordUserAction({
                          userId: 'demo_quick',
                          userName: 'Quick Demo User',
                          userLocation: 'Kenya',
                          actionType: 'milestone_achieved',
                          entityId: 'quick_mile',
                          entityType: 'achievement',
                          entityTitle: '100 Students Certified',
                          entityCategory: 'Education',
                          metadata: { students: 100 },
                          visibility: 'public',
                        });
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Achievement
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        recordUserAction({
                          userId: 'demo_quick',
                          userName: 'Quick Demo User',
                          userLocation: 'Ghana',
                          actionType: 'funding_received',
                          entityId: 'quick_fund',
                          entityType: 'project',
                          entityTitle: 'Clean Energy Startup',
                          entityCategory: 'Clean Energy',
                          metadata: { amount: '$50,000' },
                          visibility: 'public',
                        });
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Funding Success
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Simulations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {userGeneratedItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Feed Analytics</h3>
                <p className="text-sm text-gray-600">Insights about feed performance and engagement</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Feed Items</p>
                        <p className="text-2xl font-bold">{stats?.totalItems ?? 0}</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Admin Highlights</p>
                        <p className="text-2xl font-bold">{stats?.adminHighlights ?? 0}</p>
                      </div>
                      <Pin className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">User Generated</p>
                        <p className="text-2xl font-bold">{stats?.userGenerated ?? 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Public Items</p>
                        <p className="text-2xl font-bold">{stats?.publicItems ?? 0}</p>
                      </div>
                      <Globe className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Live Events</p>
                        <p className="text-2xl font-bold">{stats?.liveEvents ?? 0}</p>
                      </div>
                      <Zap className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Activity (24h)</p>
                        <p className="text-2xl font-bold">{stats?.recentActivity ?? 0}</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create Highlight Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Admin Highlight</DialogTitle>
            <DialogDescription>
              Create curated content highlights to feature important announcements, top mentors, opportunities, and community milestones in the feed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Highlight Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as AdminHighlight['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="top_mentor">Top Mentor</SelectItem>
                    <SelectItem value="spotlighted_opportunity">Spotlighted Opportunity</SelectItem>
                    <SelectItem value="impact_stat">Impact Stat</SelectItem>
                    <SelectItem value="featured_project">Featured Project</SelectItem>
                    <SelectItem value="success_spotlight">Success Spotlight</SelectItem>
                    <SelectItem value="community_milestone">Community Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value as 'public' | 'authenticated'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="authenticated">Authenticated Users Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter highlight title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter highlight description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaText">Call to Action Text</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  placeholder="Learn More"
                />
              </div>
              
              <div>
                <Label htmlFor="ctaLink">Call to Action Link</Label>
                <Input
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                  placeholder="/projects/123"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({...formData, isPinned: checked})}
                />
                <Label htmlFor="isPinned">Pin to top of feed</Label>
              </div>
              
              <div>
                <Label htmlFor="expiresAt">Expires At (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleSubmit}
                className="bg-[#021ff6] hover:bg-[#021ff6]/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Highlight
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simulate Action Dialog */}
      <Dialog open={showSimulateDialog} onOpenChange={setShowSimulateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Simulate User Action</DialogTitle>
            <DialogDescription>
              Simulate platform activities like project creation, achievements, and milestones to generate feed content for testing purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={actionData.userName}
                  onChange={(e) => setActionData({...actionData, userName: e.target.value})}
                  placeholder="Enter user name"
                />
              </div>
              
              <div>
                <Label htmlFor="userLocation">Location</Label>
                <Input
                  id="userLocation"
                  value={actionData.userLocation}
                  onChange={(e) => setActionData({...actionData, userLocation: e.target.value})}
                  placeholder="Ghana → USA"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="actionType">Action Type</Label>
              <Select value={actionData.actionType} onValueChange={(value) => setActionData({...actionData, actionType: value as UserAction['actionType']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_created">Project Created</SelectItem>
                  <SelectItem value="project_joined">Project Joined</SelectItem>
                  <SelectItem value="project_completed">Project Completed</SelectItem>
                  <SelectItem value="campaign_launched">Campaign Launched</SelectItem>
                  <SelectItem value="milestone_achieved">Milestone Achieved</SelectItem>
                  <SelectItem value="opportunity_posted">Opportunity Posted</SelectItem>
                  <SelectItem value="funding_received">Funding Received</SelectItem>
                  <SelectItem value="session_started">Session Started</SelectItem>
                  <SelectItem value="certification_earned">Certification Earned</SelectItem>
                  <SelectItem value="achievement_unlocked">Achievement Unlocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entityTitle">Title</Label>
              <Input
                id="entityTitle"
                value={actionData.entityTitle}
                onChange={(e) => setActionData({...actionData, entityTitle: e.target.value})}
                placeholder="Enter project/campaign/opportunity title"
              />
            </div>

            <div>
              <Label htmlFor="entityCategory">Category</Label>
              <Select value={actionData.entityCategory} onValueChange={(value) => setActionData({...actionData, entityCategory: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Clean Energy">Clean Energy</SelectItem>
                  <SelectItem value="Innovation">Innovation</SelectItem>
                  <SelectItem value="Social Impact">Social Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={actionData.description}
                onChange={(e) => setActionData({...actionData, description: e.target.value})}
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleSimulateAction}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Simulate Action
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSimulateDialog(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}