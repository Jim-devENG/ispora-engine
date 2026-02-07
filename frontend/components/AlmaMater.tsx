import React, { useState } from "react";
import { 
  School, 
  Plus, 
  Users, 
  Target, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Heart,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Bell,
  MessageSquare,
  Star,
  Globe,
  Clock,
  CheckCircle,
  ArrowUpRight,
  BookOpen,
  Lightbulb,
  Briefcase,
  MessageCircle,
  BriefcaseIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { AlmaMaterConnection } from "./AlmaMaterConnection";
import { CreateCampaign } from "./CreateCampaign";
import { FindAlumni } from "./FindAlumni";
import { JoinDiscussion } from "./JoinDiscussion";
import { BrowseOpportunities } from "./BrowseOpportunities";
import { DashboardHeader } from "./DashboardHeader";
import { useNavigation } from "./NavigationContext";

// Mock data for connected universities (without funding data)
const mockConnectedUniversities: any[] = [];

// Mock campaigns data (without funding campaigns)
const mockCampaigns: any[] = [];

// Recent activity items (without funding activities)
const mockRecentActivity: any[] = [];

// Impact statistics (without funding metrics)
const mockImpactStats = {
  totalUniversities: 2,
  activeCampaigns: 5,
  completedCampaigns: 1,
  totalStudentsReached: 390,
  mentorshipHours: 245,
  researchProjects: 2,
  impactScore: 8.2,
  globalRanking: 127
};

const campaignTypeIcons = {
  mentorship: <Users className="h-4 w-4" />,
  research: <BookOpen className="h-4 w-4" />,
  education: <Lightbulb className="h-4 w-4" />,
  community: <Heart className="h-4 w-4" />
};

const campaignTypeColors = {
  mentorship: "bg-blue-100 text-blue-800",
  research: "bg-purple-100 text-purple-800",
  education: "bg-orange-100 text-orange-800",
  community: "bg-pink-100 text-pink-800"
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  upcoming: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800"
};

// Quick Actions data (updated without funding references)
const quickActions = [
  {
    id: "create-campaign",
    title: "Create Campaign",
    description: "Launch mentorship, research, or educational initiatives",
    icon: <Target className="h-5 w-5" />,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600",
    stats: "5 active campaigns",
    action: "Start Now"
  },
  {
    id: "find-alumni",
    title: "Find Alumni",
    description: "Connect with graduates from your alma mater",
    icon: <Search className="h-5 w-5" />,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600",
    stats: "156+ alumni available",
    action: "Search Now"
  },
  {
    id: "join-discussion",
    title: "Join Discussion",
    description: "Participate in alumni forums and communities",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    iconColor: "text-purple-600",
    stats: "12 active discussions",
    action: "Join Now"
  },
  {
    id: "browse-opportunities",
    title: "Browse Opportunities",
    description: "Discover jobs, internships & volunteer positions",
    icon: <BriefcaseIcon className="h-5 w-5" />,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    iconColor: "text-orange-600",
    stats: "23 new opportunities",
    action: "Explore"
  }
];

export function AlmaMater() {
  const { navigateToCampaign } = useNavigation();
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showFindAlumni, setShowFindAlumni] = useState(false);
  const [showJoinDiscussion, setShowJoinDiscussion] = useState(false);
  const [showBrowseOpportunities, setShowBrowseOpportunities] = useState(false);
  const [activeTab, setActiveTab] = useState("universities");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || campaign.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "create-campaign":
        setShowCreateCampaign(true);
        break;
      case "find-alumni":
        setShowFindAlumni(true);
        break;
      case "join-discussion":
        setShowJoinDiscussion(true);
        break;
      case "browse-opportunities":
        setShowBrowseOpportunities(true);
        break;
      default:
        break;
    }
  };

  const handleCampaignClick = (campaign: any) => {
    navigateToCampaign(campaign);
  };

  const handleActivityClick = (activity: any) => {
    // Find the related campaign based on activity title
    const relatedCampaign = mockCampaigns.find(campaign => 
      campaign.title === activity.title
    );
    
    if (relatedCampaign) {
      navigateToCampaign(relatedCampaign);
    } else {
      // If no related campaign, just switch to campaigns tab
      setActiveTab("campaigns");
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <DashboardHeader 
        userTitle="Connecting with your alma mater community"
      />
      
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Page Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Alma Mater</h1>
            <p className="text-muted-foreground">
              Connect with your universities, create educational campaigns, and mentor the next generation
            </p>
          </div>
          <Button onClick={() => setShowConnectionDialog(true)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Plus className="h-4 w-4 mr-2" />
            Connect University
          </Button>
        </div>

        {/* Impact Statistics Overview (without funding stats) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <School className="h-5 w-5 text-purple-600" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Universities Connected</p>
                  <p className="text-2xl">{mockImpactStats.totalUniversities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl">{mockImpactStats.activeCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Students Reached</p>
                  <p className="text-2xl">{mockImpactStats.totalStudentsReached.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-orange-600" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Impact Score</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl">{mockImpactStats.impactScore}</p>
                    <Badge variant="secondary" className="text-xs">#{mockImpactStats.globalRanking}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content Tabs */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="universities">Universities</TabsTrigger>
                <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
              </TabsList>

              {/* Universities Tab */}
              <TabsContent value="universities" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg">Connected Universities</h3>
                    <p className="text-sm text-muted-foreground">Manage your university connections and view detailed information</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowConnectionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add University
                  </Button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {mockConnectedUniversities.map((university) => (
                    <Card key={university.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <School className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3>{university.name}</h3>
                                <p className="text-sm text-muted-foreground">{university.location}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Est. {university.established}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Students</p>
                              <p>{university.studentsCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Alumni on Platform</p>
                              <p>{university.alumniOnPlatform}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Active Campaigns</p>
                              <p>{university.activeCampaigns}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Students Reached</p>
                              <p>{university.studentsReached}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Connection Status</span>
                              <Badge variant="secondary" className="text-xs">
                                {university.userRole}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-muted-foreground">Last Activity</span>
                              <span className="text-xs">{university.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Recent Activity Tab */}
              <TabsContent value="recent-activity" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                        <CardDescription className="text-sm">
                          Latest updates from your alma mater network
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className={`flex-shrink-0 mt-1 ${activity.color}`}>
                          {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{activity.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              <School className="h-3 w-3 mr-1" />
                              {activity.university}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Campaigns Tab (without funding filter) */}
              <TabsContent value="campaigns" className="space-y-6">
                {/* Search and Filter */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="research">Research</option>
                    <option value="education">Education</option>
                    <option value="community">Community</option>
                  </select>
                </div>

                {/* Campaigns Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCampaignClick(campaign)}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={campaignTypeColors[campaign.type as keyof typeof campaignTypeColors] || "bg-gray-100 text-gray-800"}>
                                  {campaignTypeIcons[campaign.type as keyof typeof campaignTypeIcons]}
                                  <span className="ml-1 capitalize">{campaign.type}</span>
                                </Badge>
                                <Badge variant="outline" className={statusColors[campaign.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                                  {campaign.status === "active" && <Bell className="h-3 w-3 mr-1" />}
                                  {campaign.status === "upcoming" && <Clock className="h-3 w-3 mr-1" />}
                                  {campaign.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {campaign.status}
                                </Badge>
                              </div>
                              <h3>{campaign.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {campaign.description}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Participants</p>
                              <p>
                                {campaign.participantsCount}
                                {campaign.targetParticipants && ` / ${campaign.targetParticipants}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="capitalize">{campaign.type}</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-foreground">
                                {campaign.university} • Admin: {campaign.admin}
                              </div>
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleCampaignClick(campaign); }}>
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Impact Tab (without funding metrics) */}
              <TabsContent value="impact" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Impact Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Summary</CardTitle>
                      <CardDescription>Your alma mater engagement impact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl text-blue-600">
                            {mockImpactStats.totalStudentsReached}
                          </div>
                          <div className="text-sm text-blue-800">Students Reached</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl text-green-600">
                            {mockImpactStats.mentorshipHours}
                          </div>
                          <div className="text-sm text-green-800">Mentorship Hours</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl text-purple-600">
                            {mockImpactStats.researchProjects}
                          </div>
                          <div className="text-sm text-purple-800">Research Projects</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl text-orange-600">
                            {mockImpactStats.activeCampaigns}
                          </div>
                          <div className="text-sm text-orange-800">Active Campaigns</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Overall Impact Score</span>
                            <span className="font-medium">{mockImpactStats.impactScore}/10</span>
                          </div>
                          <Progress value={mockImpactStats.impactScore * 10} className="h-3" />
                        </div>
                        <div className="text-center">
                          <Badge variant="secondary" className="text-sm">
                            Global Ranking: #{mockImpactStats.globalRanking}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Campaign Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Distribution</CardTitle>
                      <CardDescription>Types of initiatives you're involved in</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">Mentorship Programs</span>
                          </div>
                          <span className="text-sm font-medium">3</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            <span className="text-sm">Research Projects</span>
                          </div>
                          <span className="text-sm font-medium">2</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Lightbulb className="h-4 w-4 text-orange-600" />
                            <span className="text-sm">Educational Initiatives</span>
                          </div>
                          <span className="text-sm font-medium">1</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Next Milestones</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div>• Complete Engineering Mentorship enrollment</div>
                          <div>• Launch Medical Research Phase 1</div>
                          <div>• Host Women in STEM networking event</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-sm">
                  Get started with common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${action.color}`}
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${action.iconColor}`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {action.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{action.stats}</span>
                          <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
                            {action.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* University Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Universities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockConnectedUniversities.map((university) => (
                  <div key={university.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <School className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{university.shortName}</h4>
                      <p className="text-xs text-muted-foreground">{university.activeCampaigns} campaigns</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {university.userRole.split(' ')[0]}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showConnectionDialog && <AlmaMaterConnection isOpen={showConnectionDialog} onClose={() => setShowConnectionDialog(false)} />}
      {showCreateCampaign && <CreateCampaign onClose={() => setShowCreateCampaign(false)} />}
      {showFindAlumni && <FindAlumni isOpen={showFindAlumni} onClose={() => setShowFindAlumni(false)} />}
      {showJoinDiscussion && <JoinDiscussion isOpen={showJoinDiscussion} onClose={() => setShowJoinDiscussion(false)} />}
      {showBrowseOpportunities && <BrowseOpportunities isOpen={showBrowseOpportunities} onClose={() => setShowBrowseOpportunities(false)} />}
    </div>
  );
}