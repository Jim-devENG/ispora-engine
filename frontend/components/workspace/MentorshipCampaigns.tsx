import React, { useState } from "react";
import {
  Users,
  Heart,
  Target,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  Filter,
  Search,
  BookOpen,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ArrowRight,
  Star,
  MessageCircle,
  Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'mentorship' | 'project' | 'scholarship' | 'research';
  status: 'active' | 'completed' | 'upcoming' | 'draft';
  almaMater: string;
  organizer: {
    name: string;
    avatar?: string;
    role: string;
  };
  participants: number;
  goal: number;
  raised: number;
  endDate: string;
  category: string;
  tags: string[];
  mentorshipFocus?: string;
  skillsRequired?: string[];
  timeCommitment?: string;
  location?: string;
  isRemote?: boolean;
}

// Mock mentorship campaigns data
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "CS Mentorship Program - Stanford Alumni",
    description: "Connecting Stanford CS graduates with current students for career guidance, technical mentorship, and project collaboration.",
    type: "mentorship",
    status: "active",
    almaMater: "Stanford University",
    organizer: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
      role: "Alumni Relations Director"
    },
    participants: 245,
    goal: 500,
    raised: 380,
    endDate: "2024-12-31",
    category: "Career Development",
    tags: ["Computer Science", "Career Guidance", "Technical Skills"],
    mentorshipFocus: "Technical Career Development",
    skillsRequired: ["Programming", "System Design", "Career Planning"],
    timeCommitment: "2-3 hours/week",
    isRemote: true
  },
  {
    id: "2",
    title: "Entrepreneurship Mentorship Initiative",
    description: "Supporting MIT alumni and students in launching tech startups through structured mentorship and funding opportunities.",
    type: "project",
    status: "active",
    almaMater: "MIT",
    organizer: {
      name: "Michael Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Startup Accelerator Director"
    },
    participants: 89,
    goal: 200,
    raised: 156,
    endDate: "2024-11-15",
    category: "Entrepreneurship",
    tags: ["Startup", "Business Development", "Funding"],
    mentorshipFocus: "Business Strategy & Operations",
    skillsRequired: ["Business Planning", "Pitch Development", "Market Analysis"],
    timeCommitment: "5-8 hours/week",
    location: "Boston, MA",
    isRemote: false
  },
  {
    id: "3",
    title: "Research Collaboration Network",
    description: "Harvard alumni mentoring current PhD students and postdocs in research methodology, publication strategies, and academic career paths.",
    type: "research",
    status: "upcoming",
    almaMater: "Harvard University",
    organizer: {
      name: "Prof. Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "Research Director"
    },
    participants: 34,
    goal: 100,
    raised: 67,
    endDate: "2024-10-01",
    category: "Academic Research",
    tags: ["Research", "Publications", "Academic Career"],
    mentorshipFocus: "Academic & Research Excellence",
    skillsRequired: ["Research Methods", "Writing", "Grant Applications"],
    timeCommitment: "3-4 hours/week",
    isRemote: true
  },
  {
    id: "4",
    title: "Women in STEM Mentorship",
    description: "Creating a supportive network for women in STEM fields through peer mentorship, career advancement workshops, and leadership development.",
    type: "mentorship",
    status: "active",
    almaMater: "UC Berkeley",
    organizer: {
      name: "Dr. Lisa Park",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      role: "STEM Diversity Coordinator"
    },
    participants: 178,
    goal: 300,
    raised: 234,
    endDate: "2024-12-20",
    category: "Diversity & Inclusion",
    tags: ["Women in STEM", "Leadership", "Career Advancement"],
    mentorshipFocus: "Leadership & Career Growth",
    skillsRequired: ["Leadership", "Communication", "Technical Skills"],
    timeCommitment: "2-4 hours/week",
    isRemote: true
  }
];

interface MentorshipCampaignsProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onCreateCampaign?: () => void;
}

function CampaignCard({ campaign, onNavigate }: { campaign: Campaign; onNavigate?: (id: string) => void }) {
  const progressPercentage = (campaign.raised / campaign.goal) * 100;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mentorship': return <Users className="h-4 w-4" />;
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'scholarship': return <GraduationCap className="h-4 w-4" />;
      case 'research': return <BookOpen className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className="workspace-card-hover cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#021ff6]/10 rounded-lg">
              {getTypeIcon(campaign.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1 group-hover:text-[#021ff6] transition-colors">
                {campaign.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{campaign.almaMater}</p>
            </div>
          </div>
          <Badge variant="secondary" className={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Organizer Info */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={campaign.organizer.avatar} />
            <AvatarFallback>{campaign.organizer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{campaign.organizer.name}</span>
          <span className="text-xs text-gray-500">• {campaign.organizer.role}</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Participants</span>
            <span className="font-medium">{campaign.participants}/{campaign.goal}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Mentorship Details */}
        {campaign.mentorshipFocus && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-blue-900">Mentorship Focus</h4>
            <p className="text-sm text-blue-800 mb-2">{campaign.mentorshipFocus}</p>
            {campaign.timeCommitment && (
              <div className="flex items-center gap-1 text-xs text-blue-700">
                <Clock className="h-3 w-3" />
                {campaign.timeCommitment}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {campaign.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {campaign.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{campaign.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {new Date(campaign.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle quick actions
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-[#021ff6] hover:bg-[#021ff6]/90"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate?.(campaign.id);
              }}
            >
              Join <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorshipCampaigns({ onNavigateToCampaign, onCreateCampaign }: MentorshipCampaignsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.almaMater.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || campaign.type === filterType;
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active');
  const upcomingCampaigns = filteredCampaigns.filter(c => c.status === 'upcoming');
  const myCampaigns = filteredCampaigns.slice(0, 2); // Mock: user's campaigns

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Mentorship Campaigns</h2>
          <p className="text-gray-600">Connect campaigns with your mentorship activities</p>
        </div>
        <Button onClick={onCreateCampaign} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns by title, school, or focus area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mentorship">Mentorship</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="scholarship">Scholarship</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Tabs */}
      <Tabs defaultValue="discover" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-6 flex-shrink-0">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="discover" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {/* Active Campaigns */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active Campaigns ({activeCampaigns.length})
                  </h3>
                  <div className="grid gap-4">
                    {activeCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onNavigate={onNavigateToCampaign}
                      />
                    ))}
                  </div>
                </div>

                {/* Upcoming Campaigns */}
                {upcomingCampaigns.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Upcoming Campaigns ({upcomingCampaigns.length})
                    </h3>
                    <div className="grid gap-4">
                      {upcomingCampaigns.map((campaign) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          onNavigate={onNavigateToCampaign}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="my-campaigns" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">No campaigns created yet</h3>
                  <p className="text-sm mb-4">Start creating mentorship campaigns for your alma mater</p>
                  <Button onClick={onCreateCampaign} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="joined" className="h-full">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {myCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="workspace-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Star className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{campaign.title}</h3>
                            <p className="text-sm text-gray-600">{campaign.almaMater}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Participating</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Role: Mentor • {campaign.timeCommitment}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigateToCampaign?.(campaign.id)}
                        >
                          View Details <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}