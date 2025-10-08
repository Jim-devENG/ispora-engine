import React, { useState, useEffect } from 'react';
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
  Heart,
  Lightbulb,
  Users2,
  Briefcase,
  Sprout,
  Stethoscope,
  Factory,
  Palette,
  Shield,
  TreePine,
  Zap as Energy,
  Calendar,
} from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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
}

// Project field categories (domain-specific fields)
const traditionalCategories = [
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'healthcare', label: 'Healthcare', icon: Stethoscope },
  { id: 'agriculture', label: 'Agriculture', icon: Sprout },
  { id: 'technology', label: 'Technology', icon: Zap },
  { id: 'environment', label: 'Environment', icon: TreePine },
  { id: 'energy', label: 'Energy', icon: Energy },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory },
  { id: 'arts-culture', label: 'Arts & Culture', icon: Palette },
  { id: 'social-services', label: 'Social Services', icon: Heart },
  { id: 'security', label: 'Security & Defense', icon: Shield },
  { id: 'entrepreneurship', label: 'Entrepreneurship', icon: Lightbulb },
  { id: 'research', label: 'Research & Development', icon: FileText },
];

// High-level categories for tabs/chips
const aspiraCategories = [
  {
    id: 'all',
    label: 'All Projects',
    icon: Folder,
    color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    darkColor: 'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
  },
  {
    id: 'mentorship',
    label: 'Mentorship & Coaching',
    icon: Users,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    darkColor: 'dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800',
  },
  {
    id: 'academic',
    label: 'Academic & Research Projects',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
  },
  {
    id: 'career',
    label: 'Career & Entrepreneurship',
    icon: Briefcase,
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    darkColor: 'dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800',
  },
  {
    id: 'community',
    label: 'Community Impact Projects',
    icon: Heart,
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    darkColor: 'dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
  },
  {
    id: 'collaboration',
    label: 'Collaboration & Innovation Projects',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    darkColor: 'dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800',
  },
];

// Helper function to get a date within the last 7 days
// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

// All demo projects removed – projects will be loaded from API

function ProjectCard({
  project,
  onView,
  onEdit,
}: {
  project: Project;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'still-open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4" />;
      case 'still-open':
        return <DoorOpen className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'still-open':
        return 'Still Open';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryConfig = traditionalCategories.find((c) => c.id === category);
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
        return 'Started today';
      } else if (diffDays === 1) {
        return 'Started yesterday';
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
        return 'Closed today';
      } else if (diffDays === 1) {
        return 'Closed yesterday';
      } else {
        return `Closed ${diffDays} days ago`;
      }
    }

    return '';
  };

  const getDateColor = (project: Project) => {
    if (project.status === 'still-open') {
      return 'text-blue-600';
    } else if (project.status === 'active') {
      const deadline = new Date(project.deadline);
      const now = new Date();
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'text-red-600';
      } else if (diffDays <= 3) {
        return 'text-red-600';
      } else if (diffDays <= 7) {
        return 'text-orange-600';
      } else {
        return 'text-green-600';
      }
    } else if (project.status === 'closed') {
      return 'text-red-600';
    }

    return 'text-muted-foreground';
  };

  return (
    <Card className="card-gradient card-hover-lift group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <Badge className={`${getStatusColor(project.status)} text-xs px-2 py-1 rounded-lg`}>
                {getStatusIcon(project.status)}
                <span className="ml-1">{getStatusLabel(project.status)}</span>
              </Badge>

              <Badge className="glass-effect border-white/30 text-slate-700 text-xs px-2 py-1 rounded-lg">
                {getCategoryIcon(project.category)}
                <span className="ml-1">
                  {traditionalCategories.find((c) => c.id === project.category)?.label}
                </span>
              </Badge>

              {project.mentorshipConnection && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="glass-effect border-white/30 text-blue-700 text-xs px-2 py-1 rounded-lg">
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
                    <Badge className="glass-effect border-white/30 text-purple-700 text-xs px-2 py-1 rounded-lg">
                      <Target className="h-3 w-3 mr-1" />
                      Campaign
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Connected to Campaign System</TooltipContent>
                </Tooltip>
              )}
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors text-sm line-clamp-1">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.description}</p>

            {project.seekingSupport.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1">
                  {project.seekingSupport.slice(0, 2).map((support) => (
                    <Badge
                      key={support}
                      className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg"
                    >
                      {support.replace('-', ' ')}
                    </Badge>
                  ))}
                  {project.seekingSupport.length > 2 && (
                    <Badge className="text-xs px-2 py-0.5 rounded-lg glass-effect border-white/30">
                      +{project.seekingSupport.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {project.university && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    <span className="truncate font-medium">{project.university}</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-1 ${getDateColor(project)}`}>
                <Calendar className="h-3 w-3" />
                <span className="font-medium truncate">{formatDateInfo(project)}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="btn-secondary-blue h-6 w-6 p-0 rounded-lg">
                <MoreHorizontal className="h-3 w-3" />
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

export function ProjectDashboard({ onCreateProject, onViewProject }: ProjectDashboardProps) {
  const { navigate } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterField, setFilterField] = useState('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.set('status', filterStatus);
        // Server supports 'type' and 'search'; also map selectedCategory to 'type'
        if (selectedCategory !== 'all') params.set('type', selectedCategory);
        if (filterField !== 'all') params.set('type', filterField);
        if (searchQuery) params.set('search', searchQuery);

        const url = `${API_BASE_URL}/projects${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url, { headers, signal: controller.signal });
        const json = await res.json();
        setProjects(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [filterStatus, filterField, selectedCategory, searchQuery]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const projectType =
      (project as any).aspiraCategory || (project as any).type || project.category;
    const matchesCategory = selectedCategory === 'all' || projectType === selectedCategory;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesField =
      filterField === 'all' || project.category === filterField || project.type === filterField;

    return matchesSearch && matchesCategory && matchesStatus && matchesField;
  });

  const categoryStats = aspiraCategories.map((category) => ({
    ...category,
    count:
      category.id === 'all'
        ? projects.length
        : projects.filter((p) => {
            const t = (p as any).aspiraCategory || (p as any).type || p.category;
            return t === category.id;
          }).length,
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

        <div className="project-categories flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {categoryStats.map((cat) => {
            const Icon = cat.icon as any;
            const isActive = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`project-category-btn flex-shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#021ff6] hover:bg-[#021ff6]/90'
                    : `${cat.color} ${cat.darkColor} border-transparent`
                }`}
              >
                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate max-w-[200px]">{cat.label}</span>
                <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
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
                {/* Dynamic options could be added here if backend provides categories */}
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

          {!loading && filteredProjects.length === 0 && (
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
          {loading && (
            <div className="text-center py-12 text-muted-foreground">Loading projects…</div>
          )}
        </div>
      </div>
    </div>
  );
}
