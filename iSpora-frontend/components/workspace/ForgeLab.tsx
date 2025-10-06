import React, { useState } from 'react';
import {
  Lightbulb,
  Users,
  FolderOpen,
  Wrench,
  Sprout,
  GitBranch,
  Badge as BadgeIcon,
  UserPlus,
  Rocket,
  Plus,
  Search,
  Filter,
  BarChart3,
  Globe,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit,
  Trash2,
  Calendar,
  Video,
  FileText,
  Presentation,
  Zap,
  Star,
  TrendingUp,
  Brain,
  Layers,
  Target,
  Settings,
  Crown,
  Users2,
  GraduationCap,
  Briefcase,
  Upload,
  Download,
  Play,
  Coffee,
  Code,
  Bug,
  Send,
  ExternalLink,
  Copy,
  ChevronRight,
  Archive,
  PlusCircle,
  Shield,
  Link,
  Flag,
  Monitor,
  Database,
  Server,
  Smartphone,
  Laptop,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role: string;
  status: string;
  progress: number;
  isOnline?: boolean;
  email?: string;
  skills?: string[];
}

interface Idea {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'service' | 'process' | 'business-model' | 'technology';
  stage: 'ideation' | 'validation' | 'prototype' | 'testing' | 'implementation';
  author: string;
  authorAvatar?: string;
  authorLocation: string;
  authorType: 'diaspora' | 'student' | 'local';
  createdDate: string;
  votes: number;
  comments: number;
  tags: string[];
  feasibility: number;
  impact: number;
  effort: number;
  isBookmarked: boolean;
  collaborators: Collaborator[];
  resources: string[];
  status: 'open' | 'in-progress' | 'seeking-collaborators' | 'prototype-ready';
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  type: 'diaspora' | 'student' | 'local';
  location: string;
  skills: string[];
  contribution: string;
}

interface CoCreationRoom {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  members: number;
  maxMembers: number;
  createdBy: string;
  createdDate: string;
  lastActivity: string;
  status: 'active' | 'archived';
  tags: string[];
  tools: string[];
  activeIdeas: number;
  recentActivity: { user: string; action: string; time: string }[];
}

interface ProjectWorkspace {
  id: string;
  title: string;
  description: string;
  stage: 'planning' | 'development' | 'testing' | 'launch';
  members: Collaborator[];
  timeline: string;
  progress: number;
  nextMilestone: string;
  isPublic: boolean;
  tags: string[];
  tasks: { id: string; title: string; completed: boolean; assignee: string }[];
  files: { id: string; name: string; type: string; size: string; uploadedBy: string }[];
}

interface BuildTool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'proposal' | 'pitch' | 'roadmap' | 'prototype' | 'analysis';
  isActive: boolean;
  features?: string[];
}

interface InnovationShowcase {
  id: string;
  title: string;
  description: string;
  team: string[];
  status: 'commissioned' | 'funded' | 'showcased' | 'launched';
  fundingAmount?: string;
  launchDate: string;
  impactMetrics: {
    usersReached: number;
    communitiesServed: number;
    sustainabilityScore: number;
  };
  badges: string[];
}

interface Partner {
  id: string;
  name: string;
  avatar?: string;
  type: 'diaspora' | 'student' | 'local';
  location: string;
  expertise: string[];
  matchScore: number;
  interests: string[];
  bio: string;
  availability: 'available' | 'busy' | 'offline';
  timezone: string;
}

interface Version {
  id: string;
  projectId: string;
  version: string;
  description: string;
  createdBy: string;
  createdDate: string;
  changes: string[];
  status: 'draft' | 'published' | 'archived';
  downloads: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: 'badge' | 'certification' | 'patent' | 'publication';
  earnedDate: string;
  issuer: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: string[];
}

interface ForgeLabProps {
  mentee: ProjectMember;
  projectType?: string;
}

export function ForgeLab({ mentee, projectType = 'innovation' }: ForgeLabProps) {
  const [activeTab, setActiveTab] = useState('incubator');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [showAboutDialog, setShowAboutDialog] = useState(false);

  // Mock data for ForgeLab
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'AI-Powered Study Buddy for African Students',
      description:
        'An intelligent tutoring system that adapts to individual learning styles and provides personalized study recommendations for students in developing countries. Features offline capabilities and local language support.',
      category: 'technology',
      stage: 'validation',
      author: 'Alex Chen',
      authorAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      authorLocation: 'Toronto, Canada',
      authorType: 'diaspora',
      createdDate: '2024-01-20',
      votes: 23,
      comments: 8,
      tags: ['AI', 'education', 'personalization', 'offline', 'diaspora-local'],
      feasibility: 75,
      impact: 90,
      effort: 65,
      isBookmarked: true,
      collaborators: [
        {
          id: 'c1',
          name: 'Sarah Williams',
          type: 'student',
          location: 'Lagos, Nigeria',
          skills: ['UI/UX', 'Research'],
          contribution: 'User Experience Design',
        },
        {
          id: 'c2',
          name: 'Jordan Martinez',
          type: 'local',
          location: 'Accra, Ghana',
          skills: ['Education', 'Content'],
          contribution: 'Educational Content Creation',
        },
      ],
      resources: ['Python developers', 'Educational content', 'Cloud infrastructure'],
      status: 'seeking-collaborators',
    },
    {
      id: '2',
      title: 'Sustainable Agriculture IoT Network',
      description:
        'Smart sensor network for smallholder farmers to optimize water usage, monitor soil health, and predict optimal harvest times using low-cost IoT devices accessible via mobile phones.',
      category: 'technology',
      stage: 'prototype',
      author: 'Emma Thompson',
      authorAvatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      authorLocation: 'London, UK',
      authorType: 'diaspora',
      createdDate: '2024-01-18',
      votes: 31,
      comments: 12,
      tags: ['IoT', 'agriculture', 'sustainability', 'sensors', 'climate'],
      feasibility: 80,
      impact: 85,
      effort: 70,
      isBookmarked: false,
      collaborators: [
        {
          id: 'c3',
          name: 'David Park',
          type: 'student',
          location: 'Kampala, Uganda',
          skills: ['Engineering', 'Hardware'],
          contribution: 'IoT Development',
        },
      ],
      resources: ['Hardware engineers', 'Agricultural experts', 'Field testing locations'],
      status: 'prototype-ready',
    },
    {
      id: '3',
      title: 'Community Health Ambassador Program',
      description:
        'Mobile platform connecting diaspora healthcare professionals with local communities to provide telemedicine consultations and health education through community health workers.',
      category: 'service',
      stage: 'ideation',
      author: 'Jordan Martinez',
      authorAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      authorLocation: 'Nairobi, Kenya',
      authorType: 'student',
      createdDate: '2024-01-15',
      votes: 18,
      comments: 5,
      tags: ['healthcare', 'telemedicine', 'community', 'diaspora', 'mobile'],
      feasibility: 70,
      impact: 95,
      effort: 60,
      isBookmarked: true,
      collaborators: [],
      resources: ['Medical professionals', 'Mobile developers', 'Local partnerships'],
      status: 'open',
    },
  ]);

  const [coCreationRooms, setCoCreationRooms] = useState<CoCreationRoom[]>([
    {
      id: 'room1',
      name: 'EdTech Solutions Lab',
      description:
        'Collaborative space for developing educational technology solutions for African students with diaspora mentorship',
      type: 'public',
      members: 12,
      maxMembers: 20,
      createdBy: 'Dr. Amina Hassan',
      createdDate: '2024-01-15',
      lastActivity: '2 hours ago',
      status: 'active',
      tags: ['Education', 'Technology', 'Youth', 'Diaspora'],
      tools: ['Whiteboard', 'Video Calls', 'File Sharing', 'Pitch Deck Builder'],
      activeIdeas: 3,
      recentActivity: [
        { user: 'Sarah Chen', action: 'shared a prototype design', time: '2 hours ago' },
        { user: 'Michael K.', action: 'started a brainstorming session', time: '4 hours ago' },
        { user: 'Dr. Hassan', action: 'uploaded research document', time: '1 day ago' },
      ],
    },
    {
      id: 'room2',
      name: 'Sustainable Agriculture Hub',
      description:
        'Co-creation space for agricultural innovations and sustainability projects connecting farmers with diaspora experts',
      type: 'public',
      members: 8,
      maxMembers: 15,
      createdBy: 'Samuel Okafor',
      createdDate: '2024-01-10',
      lastActivity: '1 day ago',
      status: 'active',
      tags: ['Agriculture', 'Sustainability', 'IoT', 'Climate'],
      tools: ['Whiteboard', 'Research Tools', 'Prototype Builder'],
      activeIdeas: 2,
      recentActivity: [
        { user: 'Emma Thompson', action: 'presented IoT sensor prototype', time: '1 day ago' },
        { user: 'David Park', action: 'joined the room', time: '2 days ago' },
      ],
    },
    {
      id: 'room3',
      name: 'Healthcare Innovation Studio',
      description:
        'Private workspace for developing telemedicine and healthcare solutions for underserved communities',
      type: 'private',
      members: 6,
      maxMembers: 10,
      createdBy: 'Dr. Fatima Al-Rashid',
      createdDate: '2024-01-12',
      lastActivity: '6 hours ago',
      status: 'active',
      tags: ['Healthcare', 'Telemedicine', 'Mobile Health'],
      tools: ['Video Calls', 'Document Collaboration', 'Secure Chat'],
      activeIdeas: 1,
      recentActivity: [
        { user: 'Dr. Al-Rashid', action: 'reviewed prototype feedback', time: '6 hours ago' },
        { user: 'Jordan Martinez', action: 'submitted research findings', time: '12 hours ago' },
      ],
    },
  ]);

  const [projectWorkspaces, setProjectWorkspaces] = useState<ProjectWorkspace[]>([
    {
      id: 'ws1',
      title: 'AI Study Buddy Development',
      description:
        'Building the AI-powered educational platform with diaspora-student collaboration',
      stage: 'development',
      members: [
        {
          id: 'm1',
          name: 'Alex Chen',
          type: 'diaspora',
          location: 'Toronto',
          skills: ['AI', 'Python'],
          contribution: 'AI Development Lead',
        },
        {
          id: 'm2',
          name: 'Sarah Williams',
          type: 'student',
          location: 'Lagos',
          skills: ['UI/UX'],
          contribution: 'Design Lead',
        },
        {
          id: 'm3',
          name: 'Jordan Martinez',
          type: 'local',
          location: 'Accra',
          skills: ['Education'],
          contribution: 'Content Lead',
        },
      ],
      timeline: '6 months',
      progress: 45,
      nextMilestone: 'User Testing Phase',
      isPublic: true,
      tags: ['AI', 'Education', 'Mobile App'],
      tasks: [
        { id: 't1', title: 'Complete AI model training', completed: true, assignee: 'Alex Chen' },
        {
          id: 't2',
          title: 'Design user interface mockups',
          completed: true,
          assignee: 'Sarah Williams',
        },
        {
          id: 't3',
          title: 'Develop educational content framework',
          completed: false,
          assignee: 'Jordan Martinez',
        },
        {
          id: 't4',
          title: 'Implement offline functionality',
          completed: false,
          assignee: 'Alex Chen',
        },
      ],
      files: [
        {
          id: 'f1',
          name: 'AI_Model_v2.py',
          type: 'Python',
          size: '2.3 MB',
          uploadedBy: 'Alex Chen',
        },
        {
          id: 'f2',
          name: 'UI_Mockups.figma',
          type: 'Design',
          size: '15.7 MB',
          uploadedBy: 'Sarah Williams',
        },
        {
          id: 'f3',
          name: 'Content_Strategy.pdf',
          type: 'Document',
          size: '1.2 MB',
          uploadedBy: 'Jordan Martinez',
        },
      ],
    },
    {
      id: 'ws2',
      title: 'IoT Agriculture Network',
      description: 'Developing smart sensor solutions for smallholder farmers',
      stage: 'testing',
      members: [
        {
          id: 'm4',
          name: 'Emma Thompson',
          type: 'diaspora',
          location: 'London',
          skills: ['IoT', 'Hardware'],
          contribution: 'Technical Lead',
        },
        {
          id: 'm5',
          name: 'David Park',
          type: 'student',
          location: 'Kampala',
          skills: ['Engineering'],
          contribution: 'Hardware Developer',
        },
      ],
      timeline: '8 months',
      progress: 70,
      nextMilestone: 'Field Testing',
      isPublic: true,
      tags: ['IoT', 'Agriculture', 'Sustainability'],
      tasks: [
        { id: 't5', title: 'Design sensor circuits', completed: true, assignee: 'David Park' },
        {
          id: 't6',
          title: 'Develop mobile app interface',
          completed: true,
          assignee: 'Emma Thompson',
        },
        { id: 't7', title: 'Conduct field trials', completed: false, assignee: 'David Park' },
        {
          id: 't8',
          title: 'Optimize power consumption',
          completed: false,
          assignee: 'Emma Thompson',
        },
      ],
      files: [
        {
          id: 'f4',
          name: 'Sensor_Specs.pdf',
          type: 'Document',
          size: '3.1 MB',
          uploadedBy: 'David Park',
        },
        {
          id: 'f5',
          name: 'Mobile_App.apk',
          type: 'Application',
          size: '25.6 MB',
          uploadedBy: 'Emma Thompson',
        },
      ],
    },
  ]);

  const [buildTools] = useState<BuildTool[]>([
    {
      id: 'proposal',
      name: 'Proposal Builder',
      description: 'Create compelling project proposals with templates',
      icon: FileText,
      category: 'proposal',
      isActive: true,
      features: ['Template Library', 'Auto-formatting', 'Collaboration', 'Export Options'],
    },
    {
      id: 'pitch',
      name: 'Pitch Deck Creator',
      description: 'Build investor-ready presentations',
      icon: Presentation,
      category: 'pitch',
      isActive: true,
      features: ['Professional Templates', 'Visual Builder', 'Analytics', 'Sharing Tools'],
    },
    {
      id: 'roadmap',
      name: 'Product Roadmap Planner',
      description: 'Plan project timelines and milestones',
      icon: Calendar,
      category: 'roadmap',
      isActive: true,
      features: ['Timeline View', 'Milestone Tracking', 'Team Collaboration', 'Progress Reports'],
    },
    {
      id: 'prototype',
      name: 'Prototype Designer',
      description: 'Create interactive prototypes and mockups',
      icon: Zap,
      category: 'prototype',
      isActive: true,
      features: ['Drag & Drop', 'Interactive Elements', 'Mobile Preview', 'User Testing'],
    },
    {
      id: 'analysis',
      name: 'Impact Analyzer',
      description: 'Measure and track project impact metrics',
      icon: BarChart3,
      category: 'analysis',
      isActive: true,
      features: ['Impact Metrics', 'Data Visualization', 'Report Generation', 'Benchmarking'],
    },
  ]);

  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      projectId: 'ws1',
      version: 'v2.1.0',
      description: 'Added offline functionality and improved AI model accuracy',
      createdBy: 'Alex Chen',
      createdDate: '2024-01-25',
      changes: [
        'Offline mode implementation',
        'AI model optimization',
        'Bug fixes in user interface',
      ],
      status: 'published',
      downloads: 45,
    },
    {
      id: 'v2',
      projectId: 'ws1',
      version: 'v2.0.0',
      description: 'Major release with new UI and enhanced features',
      createdBy: 'Sarah Williams',
      createdDate: '2024-01-20',
      changes: ['Complete UI redesign', 'New personalization features', 'Performance improvements'],
      status: 'published',
      downloads: 123,
    },
    {
      id: 'v3',
      projectId: 'ws2',
      version: 'v1.3.0',
      description: 'Improved sensor accuracy and mobile app updates',
      createdBy: 'Emma Thompson',
      createdDate: '2024-01-22',
      changes: ['Sensor calibration improvements', 'Mobile app UI updates', 'Power optimization'],
      status: 'published',
      downloads: 67,
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'a1',
      title: 'Innovation Pioneer',
      description: 'First to submit an idea that reached prototype stage',
      icon: Crown,
      type: 'badge',
      earnedDate: '2024-01-20',
      issuer: 'ForgeLab Community',
      level: 'gold',
      criteria: ['Submit innovative idea', 'Reach prototype stage', 'Gain community support'],
    },
    {
      id: 'a2',
      title: 'Collaboration Champion',
      description: 'Successfully collaborated with 5+ diaspora professionals',
      icon: Users2,
      type: 'badge',
      earnedDate: '2024-01-18',
      issuer: 'ForgeLab Community',
      level: 'silver',
      criteria: [
        'Work with diaspora professionals',
        'Complete collaborative projects',
        'Maintain high ratings',
      ],
    },
    {
      id: 'a3',
      title: 'Impact Creator',
      description: 'Project reached 1000+ users in home communities',
      icon: Target,
      type: 'certification',
      earnedDate: '2024-01-15',
      issuer: 'Global Innovation Institute',
      level: 'platinum',
      criteria: [
        'Scale project to 1000+ users',
        'Demonstrate measurable impact',
        'Maintain sustainability',
      ],
    },
  ]);

  const [suggestedPartners, setSuggestedPartners] = useState<Partner[]>([
    {
      id: 'p1',
      name: 'Dr. Fatima Al-Rashid',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b9f3c32d?w=150&h=150&fit=crop&crop=face',
      type: 'diaspora',
      location: 'Dubai, UAE',
      expertise: ['Fintech', 'Blockchain', 'Mobile Payments'],
      matchScore: 95,
      interests: ['Financial Inclusion', 'Digital Banking'],
      bio: 'Fintech entrepreneur with 10+ years experience building payment solutions for emerging markets',
      availability: 'available',
      timezone: 'GMT+4',
    },
    {
      id: 'p2',
      name: 'Michael Okonkwo',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      type: 'student',
      location: 'Lagos, Nigeria',
      expertise: ['Mobile Development', 'UI/UX', 'Product Design'],
      matchScore: 88,
      interests: ['EdTech', 'Healthcare Apps'],
      bio: 'Computer Science student passionate about creating mobile solutions for African communities',
      availability: 'busy',
      timezone: 'GMT+1',
    },
    {
      id: 'p3',
      name: 'Dr. James Kim',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      type: 'diaspora',
      location: 'San Francisco, USA',
      expertise: ['AI/ML', 'Data Science', 'Healthcare Technology'],
      matchScore: 92,
      interests: ['AI for Good', 'Healthcare Innovation'],
      bio: 'AI researcher and startup founder focused on healthcare applications in developing regions',
      availability: 'available',
      timezone: 'GMT-8',
    },
  ]);

  // Form states
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: 'product' as Idea['category'],
    tags: '',
    feasibility: 50,
    impact: 50,
    effort: 50,
  });

  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private',
    maxMembers: 20,
    tags: '',
  });

  const [newWorkspace, setNewWorkspace] = useState({
    title: '',
    description: '',
    isPublic: true,
    tags: '',
  });

  // UI Constants
  const categoryIcons = {
    product: Wrench,
    service: Users,
    process: Settings,
    'business-model': Briefcase,
    technology: Brain,
  };

  const stageColors = {
    ideation: 'bg-gray-100 text-gray-700',
    validation: 'bg-blue-100 text-blue-700',
    prototype: 'bg-yellow-100 text-yellow-700',
    testing: 'bg-orange-100 text-orange-700',
    implementation: 'bg-green-100 text-green-700',
  };

  const statusColors = {
    open: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'seeking-collaborators': 'bg-yellow-100 text-yellow-700',
    'prototype-ready': 'bg-purple-100 text-purple-700',
  };

  const authorTypeIcons = {
    diaspora: Globe,
    student: GraduationCap,
    local: Users,
  };

  const availabilityColors = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-gray-100 text-gray-700',
  };

  const levelColors = {
    bronze: 'bg-orange-100 text-orange-700',
    silver: 'bg-gray-100 text-gray-700',
    gold: 'bg-yellow-100 text-yellow-700',
    platinum: 'bg-purple-100 text-purple-700',
  };

  // Event handlers
  const addIdea = () => {
    if (newIdea.title && newIdea.description) {
      const idea: Idea = {
        id: Date.now().toString(),
        title: newIdea.title,
        description: newIdea.description,
        category: newIdea.category,
        stage: 'ideation',
        author: mentee.name,
        authorAvatar: mentee.avatar,
        authorLocation: mentee.university || 'Local Community',
        authorType: 'student',
        createdDate: new Date().toISOString().split('T')[0],
        votes: 0,
        comments: 0,
        tags: newIdea.tags ? newIdea.tags.split(',').map((t) => t.trim()) : [],
        feasibility: newIdea.feasibility,
        impact: newIdea.impact,
        effort: newIdea.effort,
        isBookmarked: false,
        collaborators: [],
        resources: [],
        status: 'open',
      };

      setIdeas((prev) => [idea, ...prev]);
      setNewIdea({
        title: '',
        description: '',
        category: 'product',
        tags: '',
        feasibility: 50,
        impact: 50,
        effort: 50,
      });
      setIsAddingIdea(false);
    }
  };

  const createRoom = () => {
    if (newRoom.name && newRoom.description) {
      const room: CoCreationRoom = {
        id: Date.now().toString(),
        name: newRoom.name,
        description: newRoom.description,
        type: newRoom.type,
        members: 1,
        maxMembers: newRoom.maxMembers,
        createdBy: mentee.name,
        createdDate: new Date().toISOString().split('T')[0],
        lastActivity: 'Just now',
        status: 'active',
        tags: newRoom.tags ? newRoom.tags.split(',').map((t) => t.trim()) : [],
        tools: ['Whiteboard', 'Video Calls', 'File Sharing'],
        activeIdeas: 0,
        recentActivity: [{ user: mentee.name, action: 'created the room', time: 'Just now' }],
      };

      setCoCreationRooms((prev) => [room, ...prev]);
      setNewRoom({
        name: '',
        description: '',
        type: 'public',
        maxMembers: 20,
        tags: '',
      });
      setIsCreatingRoom(false);
    }
  };

  const createWorkspace = () => {
    if (newWorkspace.title && newWorkspace.description) {
      const workspace: ProjectWorkspace = {
        id: Date.now().toString(),
        title: newWorkspace.title,
        description: newWorkspace.description,
        stage: 'planning',
        members: [
          {
            id: mentee.id,
            name: mentee.name,
            type: 'student',
            location: mentee.university,
            skills: mentee.skills || [],
            contribution: 'Project Lead',
          },
        ],
        timeline: '3 months',
        progress: 0,
        nextMilestone: 'Project Planning',
        isPublic: newWorkspace.isPublic,
        tags: newWorkspace.tags ? newWorkspace.tags.split(',').map((t) => t.trim()) : [],
        tasks: [],
        files: [],
      };

      setProjectWorkspaces((prev) => [workspace, ...prev]);
      setNewWorkspace({
        title: '',
        description: '',
        isPublic: true,
        tags: '',
      });
      setIsCreatingWorkspace(false);
    }
  };

  const toggleBookmark = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, isBookmarked: !idea.isBookmarked } : idea,
      ),
    );
  };

  const voteIdea = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea)),
    );
  };

  const joinRoom = (roomId: string) => {
    setCoCreationRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              members: room.members + 1,
              recentActivity: [
                { user: mentee.name, action: 'joined the room', time: 'Just now' },
                ...room.recentActivity,
              ],
            }
          : room,
      ),
    );
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="flex flex-col bg-gray-50 p-6">
      {/* ForgeLab Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl">ForgeLab</span>
                <div className="text-sm font-normal text-muted-foreground">
                  The Innovation & Collaboration Hub
                </div>
              </div>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    <Info className="h-4 w-4 mr-1" />
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-[#021ff6]" />
                      About ForgeLab
                    </DialogTitle>
                    <DialogDescription>
                      Understanding the Innovation & Collaboration Hub
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <h3 className="font-semibold mb-2">🔷 What is ForgeLab?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        ForgeLab is where <strong>diaspora professionals</strong>,{' '}
                        <strong>home-based innovators</strong>, <strong>students</strong>, and{' '}
                        <strong>experts</strong> collaborate in real time or asynchronously to
                        brainstorm ideas, co-develop innovative solutions, build prototypes, design
                        impact-driven projects, and form lasting collaborations and startups.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border">
                      <h3 className="font-semibold mb-2">✨ Our Mission</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        It's where creativity meets execution, and ideas are forged into reality. We
                        bridge the gap between diaspora expertise and local innovation needs,
                        creating sustainable solutions for global challenges.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-yellow-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-1">🚀 Innovation Focus</h4>
                        <p className="text-xs text-muted-foreground">
                          Real-world solutions for developing communities
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-1">🤝 Global Network</h4>
                        <p className="text-xs text-muted-foreground">
                          Connecting talent across continents
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowAboutDialog(false)}
                      className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90"
                    >
                      Start Exploring ForgeLab
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ForgeLab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="incubator" className="flex items-center gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              <span className="hidden lg:inline">Idea Incubator</span>
              <span className="lg:hidden">Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" />
              <span className="hidden lg:inline">Co-Creation</span>
              <span className="lg:hidden">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="flex items-center gap-1 text-xs">
              <FolderOpen className="h-3 w-3" />
              <span className="hidden lg:inline">Workspaces</span>
              <span className="lg:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1 text-xs">
              <Wrench className="h-3 w-3" />
              <span className="hidden lg:inline">Build Tools</span>
              <span className="lg:hidden">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-1 text-xs">
              <Sprout className="h-3 w-3" />
              <span className="hidden lg:inline">Innovation Track</span>
              <span className="lg:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger value="versioning" className="flex items-center gap-1 text-xs">
              <GitBranch className="h-3 w-3" />
              <span className="hidden lg:inline">Versions</span>
              <span className="lg:hidden">Git</span>
            </TabsTrigger>
            <TabsTrigger value="badging" className="flex items-center gap-1 text-xs">
              <BadgeIcon className="h-3 w-3" />
              <span className="hidden lg:inline">Badges & IP</span>
              <span className="lg:hidden">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-1 text-xs">
              <UserPlus className="h-3 w-3" />
              <span className="hidden lg:inline">Partner Discovery</span>
              <span className="lg:hidden">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="launchpad" className="flex items-center gap-1 text-xs">
              <Rocket className="h-3 w-3" />
              <span className="hidden lg:inline">Launchpad</span>
              <span className="lg:hidden">Launch</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            {/* 🧠 Idea Incubator Tab */}
            <TabsContent value="incubator" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Idea Incubator ({filteredIdeas.length} big ideas)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submit, upvote, and refine big ideas or challenges from users across the
                    diaspora and home communities
                  </p>
                </div>
                <Dialog open={isAddingIdea} onOpenChange={setIsAddingIdea}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Big Idea
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[75vh] flex flex-col w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Submit Your Big Idea to ForgeLab
                      </DialogTitle>
                      <DialogDescription>
                        Share your innovative idea with the global ForgeLab community. Connect with
                        diaspora professionals, local experts, and students to turn ideas into
                        reality.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={newIdea.title}
                            onChange={(e) =>
                              setNewIdea((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Enter your big idea title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={newIdea.category}
                            onValueChange={(value: Idea['category']) =>
                              setNewIdea((prev) => ({ ...prev, category: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">Product Innovation</SelectItem>
                              <SelectItem value="service">Service Innovation</SelectItem>
                              <SelectItem value="process">Process Innovation</SelectItem>
                              <SelectItem value="business-model">Business Model</SelectItem>
                              <SelectItem value="technology">Technology Solution</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={newIdea.description}
                          onChange={(e) =>
                            setNewIdea((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Describe your innovation idea and its potential impact..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                          value={newIdea.tags}
                          onChange={(e) =>
                            setNewIdea((prev) => ({ ...prev, tags: e.target.value }))
                          }
                          placeholder="diaspora, innovation, education, technology"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Feasibility ({newIdea.feasibility}%)</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newIdea.feasibility}
                            onChange={(e) =>
                              setNewIdea((prev) => ({
                                ...prev,
                                feasibility: parseInt(e.target.value),
                              }))
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Impact ({newIdea.impact}%)</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newIdea.impact}
                            onChange={(e) =>
                              setNewIdea((prev) => ({ ...prev, impact: parseInt(e.target.value) }))
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Effort ({newIdea.effort}%)</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newIdea.effort}
                            onChange={(e) =>
                              setNewIdea((prev) => ({ ...prev, effort: parseInt(e.target.value) }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={addIdea} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          <Rocket className="h-4 w-4 mr-2" />
                          Submit to Incubator
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingIdea(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-4">
                  {filteredIdeas.map((idea) => {
                    const CategoryIcon = categoryIcons[idea.category];
                    const AuthorTypeIcon = authorTypeIcons[idea.authorType];
                    return (
                      <Card key={idea.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-semibold leading-tight">{idea.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage src={idea.authorAvatar} />
                                        <AvatarFallback className="text-xs">
                                          {idea.author
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-muted-foreground">
                                        {idea.author}
                                      </span>
                                      <AuthorTypeIcon className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {idea.authorLocation}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleBookmark(idea.id)}
                                    className={
                                      idea.isBookmarked
                                        ? 'text-yellow-500'
                                        : 'text-muted-foreground'
                                    }
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {idea.description}
                              </p>

                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={stageColors[idea.stage]}>{idea.stage}</Badge>
                                <Badge className={statusColors[idea.status]}>
                                  {idea.status.replace('-', ' ')}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {idea.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Feasibility
                                  </div>
                                  <Progress value={idea.feasibility} className="h-2" />
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Impact</div>
                                  <Progress value={idea.impact} className="h-2" />
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">Effort</div>
                                  <Progress value={idea.effort} className="h-2" />
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => voteIdea(idea.id)}
                                    className="text-muted-foreground hover:text-primary"
                                  >
                                    <Heart className="h-4 w-4 mr-1" />
                                    {idea.votes}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {idea.comments}
                                  </Button>
                                  <div className="text-xs text-muted-foreground">
                                    {idea.collaborators.length} collaborator
                                    {idea.collaborators.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                                <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 👥 Co-Creation Rooms Tab */}
            <TabsContent value="rooms" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Co-Creation Rooms ({coCreationRooms.length} active)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Join collaborative spaces where diaspora professionals and students work
                    together in real-time
                  </p>
                </div>
                <Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Room
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Co-Creation Room</DialogTitle>
                      <DialogDescription>
                        Set up a collaborative space for your project or innovation idea.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Room Name *</Label>
                        <Input
                          value={newRoom.name}
                          onChange={(e) =>
                            setNewRoom((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g., Healthcare Innovation Lab"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={newRoom.description}
                          onChange={(e) =>
                            setNewRoom((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Describe the purpose and goals of this room..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Visibility</Label>
                          <Select
                            value={newRoom.type}
                            onValueChange={(value: 'public' | 'private') =>
                              setNewRoom((prev) => ({ ...prev, type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Max Members</Label>
                          <Input
                            type="number"
                            value={newRoom.maxMembers}
                            onChange={(e) =>
                              setNewRoom((prev) => ({
                                ...prev,
                                maxMembers: parseInt(e.target.value),
                              }))
                            }
                            min="2"
                            max="50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                          value={newRoom.tags}
                          onChange={(e) =>
                            setNewRoom((prev) => ({ ...prev, tags: e.target.value }))
                          }
                          placeholder="education, technology, healthcare"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button onClick={createRoom} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          Create Room
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreatingRoom(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {coCreationRooms.map((room) => (
                    <Card key={room.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={room.type === 'public' ? 'default' : 'secondary'}>
                                {room.type}
                              </Badge>
                              <Badge variant="outline">
                                {room.members}/{room.maxMembers} members
                              </Badge>
                              <Badge className="bg-green-100 text-green-700">{room.status}</Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{room.lastActivity}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{room.description}</p>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Available Tools
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {room.tools.map((tool, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Tags
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {room.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2">
                              Recent Activity
                            </div>
                            <div className="space-y-1">
                              {room.recentActivity.slice(0, 2).map((activity, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                  <span className="font-medium">{activity.user}</span>{' '}
                                  {activity.action}
                                  <span className="ml-1">• {activity.time}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="text-xs text-muted-foreground">
                              {room.activeIdeas} active idea{room.activeIdeas !== 1 ? 's' : ''}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                                onClick={() => joinRoom(room.id)}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                Join Room
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 📁 Project Workspaces Tab */}
            <TabsContent value="workspaces" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-green-500" />
                    Project Workspaces ({projectWorkspaces.length} active)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated spaces for active projects with file sharing, task management, and
                    collaboration tools
                  </p>
                </div>
                <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Project Workspace</DialogTitle>
                      <DialogDescription>
                        Set up a dedicated workspace for your innovation project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Project Title *</Label>
                        <Input
                          value={newWorkspace.title}
                          onChange={(e) =>
                            setNewWorkspace((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="e.g., Mobile Health Platform"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={newWorkspace.description}
                          onChange={(e) =>
                            setNewWorkspace((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Describe your project goals and objectives..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                          value={newWorkspace.tags}
                          onChange={(e) =>
                            setNewWorkspace((prev) => ({ ...prev, tags: e.target.value }))
                          }
                          placeholder="mobile, healthcare, ai"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="public"
                          checked={newWorkspace.isPublic}
                          onCheckedChange={(checked) =>
                            setNewWorkspace((prev) => ({ ...prev, isPublic: checked as boolean }))
                          }
                        />
                        <label htmlFor="public" className="text-sm">
                          Make this workspace public
                        </label>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={createWorkspace}
                          className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                        >
                          Create Workspace
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreatingWorkspace(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-4">
                  {projectWorkspaces.map((workspace) => (
                    <Card key={workspace.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{workspace.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={`${
                                  workspace.stage === 'planning'
                                    ? 'bg-gray-100 text-gray-700'
                                    : workspace.stage === 'development'
                                      ? 'bg-blue-100 text-blue-700'
                                      : workspace.stage === 'testing'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {workspace.stage}
                              </Badge>
                              <Badge variant="outline">
                                {workspace.members.length} member
                                {workspace.members.length !== 1 ? 's' : ''}
                              </Badge>
                              {workspace.isPublic && <Badge variant="outline">Public</Badge>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{workspace.progress}%</div>
                            <Progress value={workspace.progress} className="w-20 h-2 mt-1" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {workspace.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Team Members
                              </div>
                              <div className="space-y-2">
                                {workspace.members.map((member) => (
                                  <div key={member.id} className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={member.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {member.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium">{member.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {member.contribution}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {member.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Recent Files
                              </div>
                              <div className="space-y-1">
                                {workspace.files.slice(0, 3).map((file) => (
                                  <div key={file.id} className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="flex-1 truncate">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {file.size}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Progress & Milestones
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm">
                                  <span className="font-medium">Next:</span>{' '}
                                  {workspace.nextMilestone}
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">Timeline:</span>{' '}
                                  {workspace.timeline}
                                </div>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">
                                Recent Tasks
                              </div>
                              <div className="space-y-1">
                                {workspace.tasks.slice(0, 3).map((task) => (
                                  <div key={task.id} className="flex items-center gap-2 text-sm">
                                    <CheckCircle
                                      className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-muted-foreground'}`}
                                    />
                                    <span
                                      className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                                    >
                                      {task.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t">
                          <div className="flex flex-wrap gap-1">
                            {workspace.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                            <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                              <FolderOpen className="h-4 w-4 mr-1" />
                              Open Workspace
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 🔧 Build Tools Tab */}
            <TabsContent value="tools" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-500" />
                    Build Tools ({buildTools.filter((t) => t.isActive).length} available)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Professional tools for creating proposals, presentations, prototypes, and
                    analyzing project impact
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buildTools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <Card
                        key={tool.id}
                        className={`hover:shadow-md transition-all cursor-pointer ${selectedTool === tool.id ? 'ring-2 ring-[#021ff6]' : ''}`}
                        onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <Badge
                              className={
                                tool.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {tool.isActive ? 'Active' : 'Coming Soon'}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>

                          {tool.features && (
                            <div className="space-y-3">
                              <div className="text-xs font-medium text-muted-foreground">
                                Key Features
                              </div>
                              <div className="space-y-1">
                                {tool.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-4 mt-4 border-t">
                            <Button variant="outline" size="sm" disabled={!tool.isActive}>
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                              disabled={!tool.isActive}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Launch Tool
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedTool && (
                  <Card className="mt-6 border-[#021ff6]">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="text-lg font-semibold">Tool Demo</div>
                        <div className="text-muted-foreground">
                          This is where the selected tool interface would load. Click on different
                          tools above to see their demos.
                        </div>
                        <div className="flex justify-center gap-2">
                          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                            <Zap className="h-4 w-4 mr-2" />
                            Start Building
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedTool(null)}>
                            Close Demo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </ScrollArea>
            </TabsContent>

            {/* 🌱 Innovation Track Tab */}
            <TabsContent value="track" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-green-500" />
                    Innovation Track & Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track your innovation journey from idea to implementation with milestone
                    tracking and progress analytics
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Innovation Pipeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {ideas.map((idea) => (
                            <div
                              key={idea.id}
                              className="flex items-center gap-4 p-3 border rounded-lg"
                            >
                              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <Lightbulb className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{idea.title}</div>
                                <div className="text-sm text-muted-foreground">{idea.stage}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{idea.impact}%</div>
                                <div className="text-xs text-muted-foreground">Impact Score</div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Progress Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#021ff6]">3</div>
                            <div className="text-sm text-muted-foreground">Active Ideas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">1</div>
                            <div className="text-sm text-muted-foreground">In Prototype</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">5</div>
                            <div className="text-sm text-muted-foreground">Collaborators</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Upcoming Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 border rounded">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Prototype Review</div>
                              <div className="text-xs text-muted-foreground">In 3 days</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 border rounded">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">User Testing</div>
                              <div className="text-xs text-muted-foreground">In 1 week</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 border rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Demo Day</div>
                              <div className="text-xs text-muted-foreground">In 3 weeks</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Impact Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Community Reach</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Sustainability</span>
                              <span>60%</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Innovation Score</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 🌿 Version Control Tab */}
            <TabsContent value="versioning" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-purple-500" />
                    Version Control & History ({versions.length} versions)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track project versions, manage iterations, and maintain development history for
                    your innovations
                  </p>
                </div>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Version
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-4">
                  {versions.map((version) => (
                    <Card key={version.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <GitBranch className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{version.version}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {version.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    version.status === 'published'
                                      ? 'bg-green-100 text-green-700'
                                      : version.status === 'draft'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }
                                >
                                  {version.status}
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {version.downloads} downloads
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {version.createdBy
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">
                                {version.createdBy}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {version.createdDate}
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="text-xs font-medium text-muted-foreground">
                                Changes in this version:
                              </div>
                              <div className="space-y-1">
                                {version.changes.map((change, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                    <span>{change}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Compare
                              </Button>
                              <Button variant="outline" size="sm">
                                <Copy className="h-4 w-4 mr-1" />
                                Clone
                              </Button>
                              {version.status === 'published' && (
                                <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                                  <GitBranch className="h-4 w-4 mr-1" />
                                  Create Branch
                                </Button>
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

            {/* 🏆 Badges & IP Tab */}
            <TabsContent value="badging" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <BadgeIcon className="h-5 w-5 text-yellow-500" />
                    Badges & Intellectual Property ({achievements.length} earned)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Earn recognition for your innovations and manage intellectual property for your
                    projects
                  </p>
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Achievement Gallery
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {achievements.map((achievement) => {
                            const IconComponent = achievement.icon;
                            return (
                              <div
                                key={achievement.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`p-2 rounded-lg ${levelColors[achievement.level]}`}
                                  >
                                    <IconComponent className="h-6 w-6" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold">{achievement.title}</h4>
                                      <Badge className={levelColors[achievement.level]}>
                                        {achievement.level}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {achievement.description}
                                    </p>
                                    <div className="text-xs text-muted-foreground">
                                      Earned {achievement.earnedDate} • {achievement.issuer}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Intellectual Property
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">AI Study Buddy Algorithm</h4>
                              <Badge className="bg-blue-100 text-blue-700">Patent Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Machine learning algorithm for personalized educational content
                              recommendation
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download Certificate
                              </Button>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">IoT Sensor Design</h4>
                              <Badge className="bg-green-100 text-green-700">Registered</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Low-cost agricultural sensor hardware design and implementation
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download Certificate
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Progress to Next Badge
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Collaboration Master</span>
                              <span>3/5</span>
                            </div>
                            <Progress value={60} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                              Work with 5 diaspora professionals
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Innovation Leader</span>
                              <span>2/3</span>
                            </div>
                            <Progress value={67} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                              Lead 3 successful projects
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Community Builder</span>
                              <span>850/1000</span>
                            </div>
                            <Progress value={85} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                              Reach 1000 community members
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Recognition Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#021ff6]">3</div>
                            <div className="text-sm text-muted-foreground">Badges Earned</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">2</div>
                            <div className="text-sm text-muted-foreground">IP Registrations</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">85</div>
                            <div className="text-sm text-muted-foreground">Recognition Score</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 🤝 Partner Discovery Tab */}
            <TabsContent value="discovery" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-500" />
                    Partner Discovery ({suggestedPartners.length} suggested matches)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find and connect with diaspora professionals, students, and experts who match
                    your project needs
                  </p>
                </div>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {suggestedPartners.map((partner) => {
                        const TypeIcon = authorTypeIcons[partner.type];
                        return (
                          <Card key={partner.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={partner.avatar} />
                                  <AvatarFallback>
                                    {partner.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-semibold">{partner.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                          {partner.location}
                                        </span>
                                        <Badge className={availabilityColors[partner.availability]}>
                                          {partner.availability}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-[#021ff6]">
                                        {partner.matchScore}%
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Match Score
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-3">
                                    {partner.bio}
                                  </p>

                                  <div className="space-y-2 mb-4">
                                    <div>
                                      <div className="text-xs font-medium text-muted-foreground mb-1">
                                        Expertise
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {partner.expertise.map((skill, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <div className="text-xs font-medium text-muted-foreground mb-1">
                                        Interests
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {partner.interests.map((interest, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs bg-blue-50 text-blue-700"
                                          >
                                            {interest}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                      Timezone: {partner.timezone}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Profile
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                                      >
                                        <Send className="h-4 w-4 mr-1" />
                                        Connect
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Filter className="h-5 w-5" />
                          Search Filters
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-medium">Partner Type</Label>
                            <RadioGroup defaultValue="all" className="mt-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="all" />
                                <label htmlFor="all" className="text-sm">
                                  All Types
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="diaspora" id="diaspora" />
                                <label htmlFor="diaspora" className="text-sm">
                                  Diaspora
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="student" id="student" />
                                <label htmlFor="student" className="text-sm">
                                  Students
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="local" id="local" />
                                <label htmlFor="local" className="text-sm">
                                  Local Experts
                                </label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Availability</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox id="available" />
                                <label htmlFor="available" className="text-sm">
                                  Available
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox id="busy" />
                                <label htmlFor="busy" className="text-sm">
                                  Busy
                                </label>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Min Match Score</Label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              defaultValue="70"
                              className="w-full mt-2"
                            />
                            <div className="text-xs text-muted-foreground mt-1">70%+</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users2 className="h-5 w-5" />
                          Connection Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#021ff6]">8</div>
                            <div className="text-sm text-muted-foreground">Active Connections</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">12</div>
                            <div className="text-sm text-muted-foreground">Pending Requests</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">5</div>
                            <div className="text-sm text-muted-foreground">Collaborations</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 🚀 Launchpad Tab */}
            <TabsContent value="launchpad" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-red-500" />
                    Innovation Launchpad & Showcase (1 featured project)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Showcase completed innovations, apply for funding, and launch your projects to
                    the global community
                  </p>
                </div>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Submit for Launch
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Featured Innovations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[...new Array(1)].map((_, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-semibold">
                                    EduConnect Mobile Platform
                                  </h4>
                                  <p className="text-muted-foreground">
                                    Mobile learning platform connecting diaspora educators with
                                    African students
                                  </p>
                                </div>
                                <Badge className="bg-green-100 text-green-700">Commissioned</Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-[#021ff6]">2,500</div>
                                  <div className="text-sm text-muted-foreground">Users Reached</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">15</div>
                                  <div className="text-sm text-muted-foreground">
                                    Communities Served
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-yellow-600">8.5</div>
                                  <div className="text-sm text-muted-foreground">
                                    Sustainability Score
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mb-4">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>KA</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>LC</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>MO</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground ml-2">
                                  Team of 3
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className="bg-blue-100 text-blue-700">
                                  Innovation Excellence
                                </Badge>
                                <Badge className="bg-green-100 text-green-700">
                                  Community Impact
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-700">
                                  Diaspora Partnership
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-sm">
                                    <span className="font-medium">Funding:</span> $50,000
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Launch:</span> March 2024
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Case Study
                                  </Button>
                                  <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Visit Platform
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5" />
                          Launch Pipeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                              <Rocket className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">AI Study Buddy Platform</div>
                              <div className="text-sm text-muted-foreground">
                                Ready for review • Demo scheduled
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>
                          </div>

                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                              <Monitor className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">IoT Agriculture Network</div>
                              <div className="text-sm text-muted-foreground">
                                Prototype testing phase
                              </div>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700">In Development</Badge>
                          </div>

                          <div className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Health Ambassador App</div>
                              <div className="text-sm text-muted-foreground">
                                Preparing launch materials
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Launch Prep</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Launch Readiness
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Technical Completion</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Documentation</span>
                              <span>70%</span>
                            </div>
                            <Progress value={70} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>User Testing</span>
                              <span>60%</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Market Validation</span>
                              <span>45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Recognition Program
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-[#021ff6]">Application Open</div>
                            <div className="text-sm text-muted-foreground">
                              Innovation Grant 2024
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">March 15</div>
                            <div className="text-sm text-muted-foreground">Submission Deadline</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">$100K</div>
                            <div className="text-sm text-muted-foreground">Maximum Funding</div>
                          </div>
                        </div>
                        <Button className="w-full mt-4 bg-[#021ff6] hover:bg-[#021ff6]/90">
                          Apply for Grant
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border-l-4 border-[#021ff6] pl-3">
                            <div className="font-medium text-sm">Demo Day</div>
                            <div className="text-xs text-muted-foreground">February 28, 2024</div>
                          </div>
                          <div className="border-l-4 border-green-500 pl-3">
                            <div className="font-medium text-sm">Pitch Competition</div>
                            <div className="text-xs text-muted-foreground">March 10, 2024</div>
                          </div>
                          <div className="border-l-4 border-yellow-500 pl-3">
                            <div className="font-medium text-sm">Investor Showcase</div>
                            <div className="text-xs text-muted-foreground">March 25, 2024</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
