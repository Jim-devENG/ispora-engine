import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Share2,
  Settings,
  Eye,
  PlayCircle,
  XCircle,
  DoorOpen,
  Folder,
  BookOpen,
  Zap,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Heart,
  Briefcase,
  Sprout,
  Stethoscope,
  Factory,
  Palette,
  Shield,
  TreePine,
  Zap as Energy,
  Calendar
} from "lucide-react";
import { useNavigation } from "./NavigationContext";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
// Removed projectAPI import - now using Supabase queries directly
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'closed' | 'still-open';
  startDate: string;
  deadline: string;
  closedDate?: string;
  category: string;
  aspiraCategory: string;
  tags: string[];
  team: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  university?: string;
  mentorshipConnection?: boolean;
  campaignConnection?: boolean;
  joinableRoles: string[];
  isPublic: boolean;
  seekingSupport: string[];
  canStudentsJoin: boolean;
}

interface ProjectDashboardProps {
  onCreateProject?: () => void;
  onViewProject?: (projectId: string) => void;
  onProjectCreated?: () => void; // Callback to refresh projects
}

const traditionalCategories = [
  { id: "education", label: "Education", icon: BookOpen },
  { id: "healthcare", label: "Healthcare", icon: Stethoscope },
  { id: "agriculture", label: "Agriculture", icon: Sprout },
  { id: "technology", label: "Technology", icon: Zap },
  { id: "environment", label: "Environment", icon: TreePine },
  { id: "energy", label: "Energy", icon: Energy },
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "arts-culture", label: "Arts & Culture", icon: Palette },
  { id: "social-services", label: "Social Services", icon: Heart },
  { id: "security", label: "Security & Defense", icon: Shield },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: Lightbulb },
  { id: "research", label: "Research & Development", icon: FileText }
];

const aspiraCategories = [
  {
    id: "all",
    label: "All Projects",
    icon: Folder,
    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    darkColor: "dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
  },
  {
    id: "mentorship",
    label: "Mentorship & Coaching",
    icon: Users,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    darkColor: "dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
  },
  {
    id: "academic",
    label: "Academic & Research Projects",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    darkColor: "dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
  },
  {
    id: "career",
    label: "Career & Entrepreneurship",
    icon: Briefcase,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    darkColor: "dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
  },
  {
    id: "community",
    label: "Community Impact Projects",
    icon: HeartHandshake,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    darkColor: "dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
  },
  {
    id: "collaboration",
    label: "Collaboration & Innovation Projects",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    darkColor: "dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
  }
];

// Helper function to get a date within the last 7 days
const getRecentDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const mockProjects: Project[] = [];

function ProjectCard({ project, onView, onEdit }: { 
  project: Project; 
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'still-open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'still-open': return <DoorOpen className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'still-open': return 'Still Open';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = traditionalCategories.find(c => c.id === category);
    if (categoryConfig) {
      const Icon = categoryConfig.icon;
      return <Icon className="h-3 w-3" />;
    }
    return <BookOpen className="h-3 w-3" />;
  };

  const formatDateInfo = (project: Project) => {
    const now = new Date();
    
    if (project.status === 'still-open') {
      // Show "started X days ago"
      const startDate = new Date(project.startDate);
      const diffTime = now.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "Started today";
      } else if (diffDays === 1) {
        return "Started yesterday";
      } else {
        return `Started ${diffDays} days ago`;
      }
    } else if (project.status === 'active') {
      // Show deadline in DD/MM/YYYY format
      const deadline = new Date(project.deadline);
      const day = deadline.getDate().toString().padStart(2, '0');
      const month = (deadline.getMonth() + 1).toString().padStart(2, '0');
      const year = deadline.getFullYear();
      
      return `Deadline: ${day}/${month}/${year}`;
    } else if (project.status === 'closed' && project.closedDate) {
      // Show "closed X days ago"
      const closedDate = new Date(project.closedDate);
      const diffTime = now.getTime() - closedDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "Closed today";
      } else if (diffDays === 1) {
        return "Closed yesterday";
      } else {
        return `Closed ${diffDays} days ago`;
      }
    }
    
    return "";
  };

  const getDateColor = (project: Project) => {
    if (project.status === 'still-open') {
      return "text-blue-600";
    } else if (project.status === 'active') {
      const deadline = new Date(project.deadline);
      const now = new Date();
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return "text-red-600";
      } else if (diffDays <= 3) {
        return "text-red-600";
      } else if (diffDays <= 7) {
        return "text-orange-600";
      } else {
        return "text-green-600";
      }
    } else if (project.status === 'closed') {
      return "text-red-600";
    }
    
    return "text-muted-foreground";
  };

  return (
    <Card className="workspace-card-hover group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {getStatusIcon(project.status)}
                <span className="ml-1">{getStatusLabel(project.status)}</span>
              </Badge>
              
              <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {getCategoryIcon(project.category)}
                <span className="ml-1">{traditionalCategories.find(c => c.id === project.category)?.label}</span>
              </Badge>

              {project.mentorshipConnection && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      Mentorship
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Connected to Mentorship Platform</TooltipContent>
                </Tooltip>
              )}
              {project.campaignConnection && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                      <Target className="h-3 w-3 mr-1" />
                      Campaign
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Connected to Campaign System</TooltipContent>
                </Tooltip>
              )}
            </div>
            <h3 className="font-semibold mb-2 group-hover:text-[#021ff6] transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {project.description}
            </p>
            
            {project.seekingSupport.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Seeking:</p>
                <div className="flex flex-wrap gap-1">
                  {project.seekingSupport.slice(0, 3).map((support) => (
                    <Badge key={support} variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                      {support.replace('-', ' ')}
                    </Badge>
                  ))}
                  {project.seekingSupport.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.seekingSupport.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {project.university && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    {project.university}
                  </div>
                )}
              </div>
              
              <div className={`flex items-center gap-1 ${getDateColor(project)}`}>
                <Calendar className="h-3 w-3" />
                <span className="font-medium">{formatDateInfo(project)}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(project.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project.id)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
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

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
            onClick={() => onView?.(project.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Project
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDashboard({ onCreateProject, onViewProject, onProjectCreated }: ProjectDashboardProps) {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterField, setFilterField] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects from Supabase
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      // Check if Supabase is configured first
      const { isSupabaseConfigured } = await import('../src/utils/supabaseClient');
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, skipping project fetch');
        setProjects([]);
        return;
      }

      // Try Supabase with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Project fetch timeout')), 5000)
        );

        const { getProjects } = await import('../src/utils/supabaseQueries');
        const projectsPromise = getProjects();
        const fetchedProjects = await Promise.race([projectsPromise, timeoutPromise]) as any[];
        
        // Transform Supabase projects to match component interface
        const transformedProjects: Project[] = fetchedProjects.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status === 'active' ? 'active' : p.status === 'closed' ? 'closed' : 'still-open',
          startDate: p.startDate || p.createdAt,
          deadline: p.deadline,
          closedDate: p.closedDate,
          category: p.category || p.projectType,
          aspiraCategory: p.aspiraCategory || (p.projectType === 'mentorship' ? 'mentorships' : 
                                              p.projectType === 'academic' ? 'research' :
                                              p.projectType === 'community' ? 'community-service' : 'university-campaigns'),
          tags: p.tags || [],
          team: p.team || [],
          university: p.university,
          mentorshipConnection: p.mentorshipConnection,
          campaignConnection: p.campaignConnection,
          joinableRoles: p.joinableRoles || [],
          isPublic: p.isPublic !== false,
          seekingSupport: p.seekingSupport || [],
          canStudentsJoin: p.canStudentsJoin !== false,
        }));
        setProjects(transformedProjects);
      } catch (supabaseError) {
        // Don't fallback to legacy API - just show empty array
        console.warn('Failed to fetch projects from Supabase:', supabaseError);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Don't use mock data - show empty array if API fails
      setProjects([]);
      toast.error('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || project.aspiraCategory === selectedCategory;
      const matchesStatus = filterStatus === "all" || project.status === filterStatus;
      const matchesField = filterField === "all" || project.category === filterField;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesField;
    });

  const categoryStats = aspiraCategories.map(category => ({
    ...category,
    count: category.id === "all" 
      ? projects.length 
      : projects.filter(p => p.aspiraCategory === category.id).length
  }));

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Project Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your projects and initiatives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-[#021ff6] text-[#021ff6] hover:bg-[#021ff6]/10"
              onClick={() => navigate('My Projects')}
            >
              <Folder className="h-4 w-4 mr-2" />
              My Projects
            </Button>
            <Button onClick={onCreateProject} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 ${
                  isActive 
                    ? 'bg-[#021ff6] hover:bg-[#021ff6]/90' 
                    : `${cat.color} ${cat.darkColor} border-transparent`
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {cat.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cat.count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full px-6 py-6">
          <div className="flex gap-4 items-center mb-4">
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
            
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {traditionalCategories.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="still-open">Still Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021ff6] mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={onViewProject}
                onEdit={(id) => console.log('Edit project:', id)}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or create a new project to get started.
              </p>
              <Button onClick={onCreateProject} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}