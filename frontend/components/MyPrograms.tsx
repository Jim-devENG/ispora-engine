import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowUp,
  ArrowDown,
  BarChart3,
  FileText,
  MessageSquare,
  Share2,
  Settings,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Activity,
  ChevronRight,
  Sparkles,
  Bookmark,
  Heart,
  ThumbsUp,
  DollarSign,
  Award,
  Globe,
  Zap,
  BookOpen,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  Lightbulb,
  Megaphone
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  category: 'mentorship' | 'campaign' | 'work-earn' | 'community' | 'research' | 'partnership';
  status: 'draft' | 'active' | 'paused' | 'completed';
  participants: number;
  startDate: string;
  endDate?: string;
  progress: number;
  impactScore: number;
  updates: number;
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  university?: string;
}

interface Update {
  id: string;
  programId: string;
  type: 'milestone' | 'announcement' | 'achievement' | 'news';
  title: string;
  content: string;
  date: string;
  author: string;
  likes: number;
  comments: number;
  isPublished: boolean;
}

const mockPrograms: Program[] = [
  {
    id: "1",
    title: "AI Ethics Mentorship Program",
    description: "A comprehensive mentorship program connecting AI professionals with students to promote ethical AI development practices.",
    category: "mentorship",
    status: "active",
    participants: 156,
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    progress: 75,
    impactScore: 8.7,
    updates: 12,
    tags: ["AI", "Ethics", "Mentorship", "Technology"],
    isPublic: true,
    university: "Stanford University"
  },
  {
    id: "2",
    title: "African Healthcare Innovation Campaign",
    description: "University campaign raising funds and awareness for healthcare innovation projects in Africa.",
    category: "campaign",
    status: "active",
    participants: 89,
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    progress: 60,
    impactScore: 9.2,
    updates: 8,
    tags: ["Healthcare", "Africa", "Innovation", "Fundraising"],
    isPublic: true,
    university: "Harvard University"
  },
  {
    id: "3",
    title: "Tech Skills Bootcamp",
    description: "Paid intensive coding bootcamp for diaspora youth to develop market-ready technical skills.",
    category: "work-earn",
    status: "active",
    participants: 45,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    progress: 40,
    impactScore: 8.5,
    updates: 15,
    tags: ["Technology", "Education", "Career", "Youth"],
    isPublic: true
  },
  {
    id: "4",
    title: "Climate Action Research Initiative",
    description: "Research program investigating climate resilience solutions for developing nations.",
    category: "research",
    status: "active",
    participants: 23,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    progress: 55,
    impactScore: 9.0,
    updates: 6,
    tags: ["Climate", "Research", "Environment", "Sustainability"],
    isPublic: true,
    university: "MIT"
  },
  {
    id: "5",
    title: "Digital Literacy Community Outreach",
    description: "Community service program teaching digital skills to underserved rural populations.",
    category: "community",
    status: "completed",
    participants: 234,
    startDate: "2023-09-01",
    endDate: "2024-02-28",
    progress: 100,
    impactScore: 8.9,
    updates: 20,
    tags: ["Digital Literacy", "Community", "Education", "Rural"],
    isPublic: true
  }
];

const mockUpdates: Update[] = [
  {
    id: "1",
    programId: "1",
    type: "milestone",
    title: "Completed Module 3: Bias in AI Systems",
    content: "Successfully completed the third module of our AI Ethics curriculum focusing on identifying and mitigating bias in AI systems. 45 mentor-mentee pairs participated in intensive workshops.",
    date: "2024-06-15",
    author: "Dr. Sarah Chen",
    likes: 23,
    comments: 8,
    isPublished: true
  },
  {
    id: "2",
    programId: "2",
    type: "achievement",
    title: "Reached 75% of Fundraising Goal",
    content: "Excited to announce that our healthcare innovation campaign has reached 75% of our $50,000 fundraising goal! Thank you to all our supporters.",
    date: "2024-06-10",
    author: "Campaign Team",
    likes: 67,
    comments: 15,
    isPublished: true
  },
  {
    id: "3",
    programId: "3",
    type: "announcement",
    title: "New Industry Partnership with TechCorp",
    content: "We're thrilled to announce a new partnership with TechCorp, which will provide guaranteed internships for our top-performing bootcamp graduates.",
    date: "2024-06-08",
    author: "Program Director",
    likes: 34,
    comments: 12,
    isPublished: true
  }
];

const categoryConfig = {
  mentorship: { icon: Users, color: "bg-blue-100 text-blue-700", label: "Mentorship" },
  campaign: { icon: Megaphone, color: "bg-purple-100 text-purple-700", label: "Campaign" },
  "work-earn": { icon: Briefcase, color: "bg-orange-100 text-orange-700", label: "Work & Earn" },
  community: { icon: HeartHandshake, color: "bg-pink-100 text-pink-700", label: "Community Service" },
  research: { icon: Lightbulb, color: "bg-yellow-100 text-yellow-700", label: "Research" },
  partnership: { icon: Users, color: "bg-indigo-100 text-indigo-700", label: "Partnership" }
};

function ProgramCard({ program }: { program: Program }) {
  const config = categoryConfig[program.category];
  const Icon = config.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className={getStatusColor(program.status)}>
                {program.status === 'active' && <PlayCircle className="h-3 w-3 mr-1" />}
                {program.status === 'paused' && <PauseCircle className="h-3 w-3 mr-1" />}
                {program.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {program.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </Badge>
              {program.isPublic && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold mb-2">{program.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {program.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {program.participants} participants
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(program.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {program.impactScore}/10
              </div>
            </div>

            {program.university && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <GraduationCap className="h-3 w-3" />
                {program.university}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Program
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Program
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Program
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Program
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{program.progress}%</span>
          </div>
          <Progress value={program.progress} className="h-2" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {program.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {program.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{program.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'news': return <FileText className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-100 text-blue-700';
      case 'announcement': return 'bg-purple-100 text-purple-700';
      case 'achievement': return 'bg-green-100 text-green-700';
      case 'news': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className={getTypeColor(update.type)}>
                {getTypeIcon(update.type)}
                <span className="ml-1 capitalize">{update.type}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(update.date).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold mb-2">{update.title}</h3>
            <p className="text-sm text-muted-foreground">{update.content}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>By {update.author}</span>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {update.likes}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {update.comments}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Update
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Update
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Update
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyPrograms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  const filteredPrograms = mockPrograms
    .filter(program => {
      const matchesSearch = 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = filterCategory === "all" || program.category === filterCategory;
      const matchesStatus = filterStatus === "all" || program.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case "progress":
          return b.progress - a.progress;
        case "participants":
          return b.participants - a.participants;
        case "impact":
          return b.impactScore - a.impactScore;
        default:
          return 0;
      }
    });

  const stats = {
    totalPrograms: mockPrograms.length,
    activePrograms: mockPrograms.filter(p => p.status === 'active').length,
    totalParticipants: mockPrograms.reduce((sum, p) => sum + p.participants, 0),
    avgImpactScore: Math.round((mockPrograms.reduce((sum, p) => sum + p.impactScore, 0) / mockPrograms.length) * 10) / 10
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#021ff6]" />
              My Programs
            </h1>
            <p className="text-sm text-muted-foreground">Manage and track your created programs and initiatives</p>
          </div>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{stats.totalPrograms}</div>
              <div className="text-xs text-muted-foreground">Total Programs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-green-600">{stats.activePrograms}</div>
              <div className="text-xs text-muted-foreground">Active Programs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">{stats.totalParticipants}</div>
              <div className="text-xs text-muted-foreground">Total Participants</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-purple-600">{stats.avgImpactScore}</div>
              <div className="text-xs text-muted-foreground">Avg Impact Score</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="programs" className="h-full flex flex-col">
          <div className="px-6 py-2 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="programs" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              {/* Filters */}
              <div className="flex gap-4 items-center mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search programs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="work-earn">Work & Earn</SelectItem>
                    <SelectItem value="community">Community Service</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                    <SelectItem value="impact">Impact Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Programs Grid */}
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
                
                {filteredPrograms.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No programs found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your search criteria or create a new program
                    </p>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Program
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Program Updates</h2>
                <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Update
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {mockUpdates.map((update) => (
                    <UpdateCard key={update.id} update={update} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold mb-6">Program Analytics</h2>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{stats.totalParticipants}</div>
                    <p className="text-xs text-muted-foreground">
                      Participants across all programs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{stats.avgImpactScore}/10</div>
                    <p className="text-xs text-muted-foreground">
                      Average impact across programs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">85%</div>
                    <p className="text-xs text-muted-foreground">
                      Programs completed successfully
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Detailed analytics coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}