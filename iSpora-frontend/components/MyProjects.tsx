import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useNavigation } from './NavigationContext';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
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
  ArrowLeft,
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
  FolderOpen,
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
  Lightbulb,
  Users2,
  Megaphone,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: 'mentorship' | 'academic' | 'career' | 'community' | 'collaboration';
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
  projectId: string;
  type: 'milestone' | 'announcement' | 'achievement' | 'news';
  title: string;
  content: string;
  date: string;
  author: string;
  likes: number;
  comments: number;
  isPublished: boolean;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

// All mock data removed – using real API data only

const categoryConfig = {
  mentorship: {
    icon: Users,
    color: 'bg-orange-100 text-orange-700',
    label: 'Mentorship & Coaching',
  },
  academic: {
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700',
    label: 'Academic & Research Projects',
  },
  career: {
    icon: Briefcase,
    color: 'bg-amber-100 text-amber-700',
    label: 'Career & Entrepreneurship',
  },
  community: {
    icon: Heart,
    color: 'bg-green-100 text-green-700',
    label: 'Community Impact Projects',
  },
  collaboration: {
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700',
    label: 'Collaboration & Innovation Projects',
  },
};

function ProjectCard({ project }: { project: Project }) {
  const { navigate } = useNavigation();
  const config = categoryConfig[project.category];
  const Icon = config.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewProject = () => {
    navigate('Project Detail');
  };

  const handleEditProject = () => {
    toast.info('Edit project functionality coming soon!');
  };

  const handleProjectAnalytics = () => {
    toast.info('Project analytics functionality coming soon!');
  };

  const handleShareProject = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Project link copied to clipboard!');
  };

  const handleDeleteProject = () => {
    toast.error('Delete project functionality coming soon!');
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
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status === 'active' && <PlayCircle className="h-3 w-3 mr-1" />}
                {project.status === 'paused' && <PauseCircle className="h-3 w-3 mr-1" />}
                {project.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {project.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
              {project.isPublic && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}
            </div>

            <h3 className="font-semibold mb-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.participants} participants
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {project.impactScore}/10
              </div>
            </div>

            {project.university && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <GraduationCap className="h-3 w-3" />
                {project.university}
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
              <DropdownMenuItem onClick={handleViewProject}>
                <Eye className="h-4 w-4 mr-2" />
                View Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditProject}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProjectAnalytics}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareProject}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Project
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
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
            <span className="text-sm text-muted-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
            onClick={handleViewProject}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={handleProjectAnalytics}>
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Analytics</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={handleShareProject}>
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share Project</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(update.likes);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Target className="h-4 w-4" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'news':
        return <FileText className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-700';
      case 'announcement':
        return 'bg-purple-100 text-purple-700';
      case 'achievement':
        return 'bg-green-100 text-green-700';
      case 'news':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLikeUpdate = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleShareUpdate = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Update link copied to clipboard!');
  };

  const handleEditUpdate = () => {
    toast.info('Edit update functionality coming soon!');
  };

  const handleDeleteUpdate = () => {
    toast.error('Delete update functionality coming soon!');
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
              {likes}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {update.comments}
            </div>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500' : ''}`}
                  onClick={handleLikeUpdate}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Like Update</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleShareUpdate}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Update</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditUpdate}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareUpdate}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Update
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={handleDeleteUpdate} className="text-red-600">
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

export function MyProjects() {
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [projects, setProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = () => {
    navigate('Create Project');
  };

  const handleBackToProjects = () => {
    navigate('Projects');
  };

  const handleNewUpdate = () => {
    toast.info('New update functionality coming soon!');
  };

  // Load real projects and updates
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [projRes, updRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects?mine=true`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/projects/updates?mine=true`, {
            headers,
            signal: controller.signal,
          }),
        ]);

        const projJson = await projRes.json();
        const updJson = await updRes.json();

        setProjects(
          Array.isArray(projJson.data) ? projJson.data : Array.isArray(projJson) ? projJson : [],
        );
        setUpdates(
          Array.isArray(updJson.data) ? updJson.data : Array.isArray(updJson) ? updJson : [],
        );
      } catch (e: any) {
        setError('Failed to load projects');
        setProjects([]);
        setUpdates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = filterCategory === 'all' || project.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'participants':
          return b.participants - a.participants;
        case 'impact':
          return b.impactScore - a.impactScore;
        default:
          return 0;
      }
    });

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalParticipants: projects.reduce((sum, p) => sum + (p.participants || 0), 0),
    avgImpactScore: projects.length
      ? Math.round(
          (projects.reduce((sum, p) => sum + (p.impactScore || 0), 0) / projects.length) * 10,
        ) / 10
      : 0,
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        {/* Back Navigation */}
        <div className="mb-4">
          <button
            onClick={handleBackToProjects}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-[#021ff6]" />
              {userName}'s Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track your created projects and initiatives
            </p>
          </div>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90" onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{stats.totalProjects}</div>
              <div className="text-xs text-muted-foreground">Total Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-green-600">{stats.activeProjects}</div>
              <div className="text-xs text-muted-foreground">Active Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">
                {stats.totalParticipants}
              </div>
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
        <Tabs defaultValue="projects" className="h-full flex flex-col">
          <div className="px-6 py-2 border-b border-border">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              {/* Filters */}
              <div className="flex gap-4 items-center mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
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
                    <SelectItem value="mentorship">Mentorship & Coaching</SelectItem>
                    <SelectItem value="academic">Academic & Research Projects</SelectItem>
                    <SelectItem value="career">Career & Entrepreneurship</SelectItem>
                    <SelectItem value="community">Community Impact Projects</SelectItem>
                    <SelectItem value="collaboration">
                      Collaboration & Innovation Projects
                    </SelectItem>
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

              {/* Projects Grid */}
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No projects found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try adjusting your search criteria or create a new project
                    </p>
                    <Button
                      className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                      onClick={handleCreateProject}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="updates" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Project Updates</h2>
                <Button
                  size="sm"
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                  onClick={handleNewUpdate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Update
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {updates.map((update) => (
                    <UpdateCard key={update.id} update={update} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold mb-6">Project Analytics</h2>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{stats.totalParticipants}</div>
                    <p className="text-xs text-muted-foreground">
                      Participants across all projects
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{stats.avgImpactScore}/10</div>
                    <p className="text-xs text-muted-foreground">Average impact across projects</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">85%</div>
                    <p className="text-xs text-muted-foreground">Projects completed successfully</p>
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
