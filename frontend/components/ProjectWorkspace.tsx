import React, { useState } from "react";
import {
  Calendar,
  CheckSquare,
  MessageCircle,
  Video,
  BookOpen,
  FileText,
  Bell,
  Award,
  Users,
  Target,
  ChevronRight,
  ChevronDown,
  X,
  Settings,
  Play,
  Pause,
  UserCheck,
  FolderOpen,
  ArrowLeft,
  Globe,
  UserPlus,
  Zap,
  GraduationCap,
  Briefcase,
  User,
  Info,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";

// Import workspace components
import { SessionBoard } from "./workspace/SessionBoard";
import { TaskManager } from "./workspace/TaskManager";
import { VoiceChat } from "./workspace/VoiceChat";
import { LearningVault } from "./workspace/LearningVault";
import { DeliverableSubmissions } from "./workspace/DeliverableSubmissions";
import { WorkspaceCalendar } from "./workspace/WorkspaceCalendar";
import { NotificationsPanel } from "./workspace/NotificationsPanel";
import { CertificateManager } from "./workspace/CertificateManager";
import { LiveSession } from "./workspace/LiveSession";
import { ProjectMemberModal } from "./workspace/ProjectMemberModal";
import { ResearchTools } from "./workspace/ResearchTools";
import { InnovationHub } from "./workspace/InnovationHub";
import { CommunityTools } from "./workspace/CommunityTools";
import { useNavigation } from "./NavigationContext";

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role: 'mentor' | 'mentee' | 'participant' | 'leader' | 'researcher' | 'owner' | 'admin' | 'student' | 'collaborator' | 'viewer';
  status: 'active' | 'paused' | 'completed' | 'pending' | 'inactive';
  progress: number;
  isOnline?: boolean;
  email?: string;
  skills?: string[];
  tasksCompleted?: number;
  contributionScore?: number;
  projectsInvolved?: number;
  joinedDate?: string;
  lastActive?: string;
}

interface Project {
  id: string;
  title: string;
  type: 'mentorship' | 'research' | 'innovation' | 'training' | 'challenge' | 'community';
  description: string;
  status: 'active' | 'planning' | 'completed';
  members: ProjectMember[];
  mentorMode: 'individual' | 'group';
  startDate: string;
  endDate?: string;
  progress: number;
}

// Mock project data
const mockProjects: Project[] = [
  {
    id: "1",
    title: "AI Ethics Research Initiative",
    type: "research",
    description: "Collaborative research on ethical AI implementation",
    status: "active",
    mentorMode: "group",
    startDate: "2024-01-15",
    progress: 65,
    members: [
      {
        id: "1",
        name: "Alex Chen",
        email: "alex.chen@stanford.edu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        university: "Stanford University",
        program: "Computer Science",
        year: "Junior",
        role: "researcher",
        status: "active",
        progress: 75,
        isOnline: true,
        tasksCompleted: 23,
        contributionScore: 87,
        projectsInvolved: 3,
        joinedDate: "2024-01-20",
        lastActive: "1 hour ago",
        skills: ["Computer Science", "Python", "Data Analysis"]
      },
      {
        id: "2",
        name: "Sarah Williams",
        email: "sarah.williams@mit.edu",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
        university: "MIT",
        program: "Electrical Engineering",
        year: "Sophomore",
        role: "researcher",
        status: "active",
        progress: 60,
        isOnline: false,
        tasksCompleted: 31,
        contributionScore: 79,
        projectsInvolved: 2,
        joinedDate: "2024-01-25",
        lastActive: "5 hours ago",
        skills: ["Design", "UX Research", "Psychology"]
      }
    ]
  },
  {
    id: "2",
    title: "Youth Leadership Mentorship",
    type: "mentorship",
    description: "One-on-one mentorship for leadership development",
    status: "active",
    mentorMode: "individual",
    startDate: "2024-02-01",
    progress: 80,
    members: [
      {
        id: "3",
        name: "Jordan Martinez",
        email: "jordan.martinez@berkeley.edu",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        university: "UC Berkeley",
        program: "Business Administration",
        year: "Senior",
        role: "mentee",
        status: "active",
        progress: 80,
        isOnline: true,
        tasksCompleted: 45,
        contributionScore: 98,
        projectsInvolved: 8,
        joinedDate: "2024-01-15",
        lastActive: "2 minutes ago",
        skills: ["AI Ethics", "Machine Learning", "Research"]
      }
    ]
  },
  {
    id: "3",
    title: "Climate Innovation Challenge",
    type: "innovation",
    description: "Developing sustainable solutions for climate change",
    status: "active",
    mentorMode: "group",
    startDate: "2024-01-20",
    progress: 45,
    members: [
      {
        id: "4",
        name: "Emma Thompson",
        email: "emma.thompson@oxford.edu",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        university: "Oxford University",
        program: "Environmental Science",
        year: "Graduate",
        role: "participant",
        status: "active",
        progress: 45,
        isOnline: true,
        tasksCompleted: 67,
        contributionScore: 95,
        projectsInvolved: 12,
        joinedDate: "2024-02-01",
        lastActive: "30 minutes ago",
        skills: ["Product Management", "Strategy", "Mentoring"]
      }
    ]
  },
  {
    id: "4",
    title: "Rural Health Community Outreach",
    type: "community",
    description: "Building healthcare capacity in underserved rural communities",
    status: "active",
    mentorMode: "group",
    startDate: "2024-01-10",
    progress: 72,
    members: [
      {
        id: "5",
        name: "Dr. Amina Hassan",
        email: "amina.hassan@unilag.edu.ng",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        university: "University of Lagos",
        program: "Public Health",
        year: "Faculty",
        role: "leader",
        status: "active",
        progress: 85,
        isOnline: true,
        tasksCompleted: 34,
        contributionScore: 92,
        projectsInvolved: 5,
        joinedDate: "2024-01-10",
        lastActive: "15 minutes ago",
        skills: ["Public Health", "Community Medicine", "Project Management"]
      },
      {
        id: "6",
        name: "Michael Okafor",
        email: "michael.okafor@nsu.edu.ng",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        university: "Niger State University",
        program: "Community Development",
        year: "Senior",
        role: "participant",
        status: "active",
        progress: 68,
        isOnline: false,
        tasksCompleted: 28,
        contributionScore: 78,
        projectsInvolved: 3,
        joinedDate: "2024-01-15",
        lastActive: "2 hours ago",
        skills: ["Community Engagement", "Social Work", "Data Collection"]
      }
    ]
  }
];

const projectTypeIcons = {
  mentorship: Users,
  research: BookOpen,
  innovation: Zap,
  training: GraduationCap,
  challenge: Target,
  community: Globe
};

const projectTypeColors = {
  mentorship: "bg-blue-100 text-blue-800",
  research: "bg-green-100 text-green-800",
  innovation: "bg-purple-100 text-purple-800",
  training: "bg-orange-100 text-orange-800",
  challenge: "bg-red-100 text-red-800",
  community: "bg-indigo-100 text-indigo-800"
};



interface ProjectWorkspaceProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onCreateCampaign?: () => void;
  onBackToProjects?: () => void;
  initialProjectId?: string;
}

// Settings component for the popover - Default compact view enabled
function WorkspaceSettings({ onSettingsChange }: { onSettingsChange: (settings: any) => void }) {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    emailNotifications: true,
    syncCalendar: true,
    compactView: true // Default to true for more compact interface
  });

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleReset = () => {
    const defaultSettings = {
      autoSave: true,
      notifications: true,
      emailNotifications: true,
      syncCalendar: true,
      compactView: true // Reset also defaults to compact view
    };
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
  };

  return (
    <div className="space-y-4 w-64">
      <div>
        <h4 className="font-medium text-sm mb-3">Workspace Settings</h4>
        <div className="space-y-3">
          {[
            { key: 'autoSave', label: 'Auto-save changes' },
            { key: 'notifications', label: 'Desktop notifications' },
            { key: 'emailNotifications', label: 'Email notifications' },
            { key: 'syncCalendar', label: 'Sync with calendar' },
            { key: 'compactView', label: 'Compact view' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <label htmlFor={key} className="text-sm">{label}</label>
              <input
                type="checkbox"
                id={key}
                checked={settings[key as keyof typeof settings]}
                onChange={(e) => handleSettingChange(key, e.target.checked)}
                className="w-4 h-4 text-[#021ff6] border-gray-300 rounded focus:ring-[#021ff6]"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-3 border-t">
        <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

export function ProjectWorkspace({ 
  onNavigateToCampaign, 
  onCreateCampaign, 
  onBackToProjects,
  initialProjectId
}: ProjectWorkspaceProps) {
  const { navigationOptions, setNavigationOptions, selectedProject: contextSelectedProject } = useNavigation();
  const [activeTab, setActiveTab] = useState("session-board");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<"calendar" | "notifications">("calendar");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  
  // Check if we should auto-open the workspace panel with specific tab
  React.useEffect(() => {
    if (navigationOptions?.openWorkspacePanel) {
      setMemberModalOpen(true);
      // Clear the navigation options after handling them
      setNavigationOptions({});
    }
  }, [navigationOptions, setNavigationOptions]);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  
  // Workspace settings state - Default compact view enabled
  const [workspaceSettings, setWorkspaceSettings] = useState({
    autoSave: true,
    notifications: true,
    emailNotifications: true,
    syncCalendar: true,
    compactView: true // Default to true for more compact interface
  });
  
  // Workspace participants state - always group mode for MVP
  const [workspaceParticipants, setWorkspaceParticipants] = useState<ProjectMember[]>([]);

  // Handle member changes from ProjectMemberModal
  const handleMemberChange = (members: ProjectMember[]) => {
    setWorkspaceParticipants(members);
    if (members.length > 0) {
      setSelectedMember(members[0]);
    }
  };

  // Handle settings changes
  const handleSettingsChange = (newSettings: any) => {
    setWorkspaceSettings(newSettings);
  };

  // Dynamic tab configuration based on project type - Campaigns removed
  const getTabsForProjectType = (projectType: string) => {
    const baseTabs = [
      { id: "session-board", label: "Session Board", icon: Calendar },
      { id: "task-manager", label: "Task Manager", icon: CheckSquare },
      { id: "voice-chat", label: "Voice & Chat", icon: MessageCircle },
      { id: "learning-vault", label: "Learning Vault", icon: BookOpen },
      { id: "deliverables", label: "Deliverables", icon: FileText },
      { id: "live-session", label: "Live Session", icon: Play }
    ];

    const projectSpecificTabs = [];
    
    if (projectType === 'mentorship') {
      projectSpecificTabs.push(
        { id: "certificates", label: "Certificates", icon: Award }
      );
    } else if (projectType === 'research') {
      projectSpecificTabs.push(
        { id: "research-tools", label: "Research Tools", icon: Briefcase }
      );
    } else if (projectType === 'innovation' || projectType === 'challenge') {
      projectSpecificTabs.push(
        { id: "innovation-hub", label: "Innovation Hub", icon: Zap }
      );
    } else if (projectType === 'community') {
      projectSpecificTabs.push(
        { id: "community-tools", label: "Community Tools", icon: Globe }
      );
    }

    return [...baseTabs, ...projectSpecificTabs];
  };

  const tabs = selectedProject ? getTabsForProjectType(selectedProject.type) : [];

  const openRightPanel = (content: "calendar" | "notifications") => {
    setRightPanelContent(content);
    setIsRightPanelOpen(true);
  };

  const handleSelectMember = (member: ProjectMember) => {
    setSelectedMember(member);
    setMemberModalOpen(false);
  };

  const handleProjectChange = async (projectId: string) => {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      console.error(`Invalid project ID format: ${projectId}. Expected UUID.`);
      return;
    }

    try {
      const { getProject } = await import('../src/utils/supabaseQueries');
      const project = await getProject(projectId);
      
      if (!project) {
        console.error(`Project ${projectId} not found`);
        return;
      }

      // Transform Supabase project to ProjectWorkspace format
      const transformedProject: Project = {
        id: project.id,
        title: project.title,
        type: (project.projectType || 'research') as Project['type'],
        description: project.description,
        status: project.status === 'active' ? 'active' : project.status === 'closed' ? 'completed' : 'planning',
        members: (project.teamMembers || []).map((m: any) => ({
          id: m.id || '',
          name: m.name || '',
          avatar: m.avatar,
          university: m.university || '',
          program: m.program || '',
          year: m.year || '',
          role: (m.role || 'participant') as ProjectMember['role'],
          status: (m.status || 'active') as ProjectMember['status'],
          progress: m.progress || 0,
          isOnline: m.isOnline,
          email: m.email,
          skills: m.skills,
          tasksCompleted: m.tasksCompleted,
          contributionScore: m.contributionScore,
          projectsInvolved: m.projectsInvolved,
          joinedDate: m.joinedDate,
          lastActive: m.lastActive,
        })),
        mentorMode: 'group',
        startDate: project.startDate || project.createdAt,
        endDate: project.deadline,
        progress: project.progress || 0,
      };

      setSelectedProject(transformedProject);
      if (transformedProject.members.length > 0) {
        setSelectedMember(transformedProject.members[0]);
        setWorkspaceParticipants(transformedProject.members.filter(m => m.status === "active"));
      }
      setShowProjectSelector(false);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  // Load project from Supabase on mount
  React.useEffect(() => {
    const loadProject = async () => {
      setIsLoadingProject(true);
      try {
        const projectId = initialProjectId || contextSelectedProject?.id;
        
        if (!projectId) {
          console.error('No project ID provided to ProjectWorkspace');
          setIsLoadingProject(false);
          return;
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(projectId)) {
          console.error(`Invalid project ID format: ${projectId}. Expected UUID.`);
          setIsLoadingProject(false);
          return;
        }

        // Load project from Supabase
        const { getProject } = await import('../src/utils/supabaseQueries');
        const project = await getProject(projectId);
        
        if (!project) {
          console.error(`Project ${projectId} not found`);
          setIsLoadingProject(false);
          return;
        }

        // Transform Supabase project to ProjectWorkspace format
        const transformedProject: Project = {
          id: project.id,
          title: project.title,
          type: (project.projectType || 'research') as Project['type'],
          description: project.description,
          status: project.status === 'active' ? 'active' : project.status === 'closed' ? 'completed' : 'planning',
          members: (project.teamMembers || []).map((m: any) => ({
            id: m.id || '',
            name: m.name || '',
            avatar: m.avatar,
            university: m.university || '',
            program: m.program || '',
            year: m.year || '',
            role: (m.role || 'participant') as ProjectMember['role'],
            status: (m.status || 'active') as ProjectMember['status'],
            progress: m.progress || 0,
            isOnline: m.isOnline,
            email: m.email,
            skills: m.skills,
            tasksCompleted: m.tasksCompleted,
            contributionScore: m.contributionScore,
            projectsInvolved: m.projectsInvolved,
            joinedDate: m.joinedDate,
            lastActive: m.lastActive,
          })),
          mentorMode: 'group',
          startDate: project.startDate || project.createdAt,
          endDate: project.deadline,
          progress: project.progress || 0,
        };

        setSelectedProject(transformedProject);
        if (transformedProject.members.length > 0) {
          setSelectedMember(transformedProject.members[0]);
          setWorkspaceParticipants(transformedProject.members.filter(m => m.status === "active"));
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [initialProjectId, contextSelectedProject?.id]);

  // Load available projects for selector
  React.useEffect(() => {
    const loadAvailableProjects = async () => {
      try {
        const { getProjects } = await import('../src/utils/supabaseQueries');
        const projects = await getProjects();
        
        // Transform to ProjectWorkspace format
        const transformedProjects: Project[] = projects.map((p: any) => ({
          id: p.id,
          title: p.title,
          type: (p.projectType || 'research') as Project['type'],
          description: p.description,
          status: p.status === 'active' ? 'active' : p.status === 'closed' ? 'completed' : 'planning',
          members: (p.teamMembers || []).map((m: any) => ({
            id: m.id || '',
            name: m.name || '',
            avatar: m.avatar,
            university: m.university || '',
            program: m.program || '',
            year: m.year || '',
            role: (m.role || 'participant') as ProjectMember['role'],
            status: (m.status || 'active') as ProjectMember['status'],
            progress: m.progress || 0,
            isOnline: m.isOnline,
            email: m.email,
            skills: m.skills,
            tasksCompleted: m.tasksCompleted,
            contributionScore: m.contributionScore,
            projectsInvolved: m.projectsInvolved,
            joinedDate: m.joinedDate,
            lastActive: m.lastActive,
          })),
          mentorMode: 'group',
          startDate: p.startDate || p.createdAt,
          endDate: p.deadline,
          progress: p.progress || 0,
        }));
        
        setAvailableProjects(transformedProjects);
      } catch (error) {
        console.error('Failed to load available projects:', error);
      }
    };

    loadAvailableProjects();
  }, []);

  // Show loading or empty state if no project
  if (isLoadingProject) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 mb-4">Please select a project to open the Workroom.</p>
          <Button onClick={onBackToProjects} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedMember) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Members Available</h2>
          <p className="text-gray-600 mb-4">This project has no members yet.</p>
          <Button onClick={onBackToProjects} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const ProjectIcon = projectTypeIcons[selectedProject.type];

  const renderTabContent = () => {
    switch (activeTab) {
      case "session-board":
        return <SessionBoard mentee={selectedMember} projectId={selectedProject.id} />;
      case "task-manager":
        return <TaskManager mentee={{
          id: selectedMember.id,
          name: selectedMember.name,
          avatar: selectedMember.avatar,
          university: selectedMember.university,
          program: selectedMember.program || '',
          year: selectedMember.year || ''
        }} projectMembers={workspaceParticipants.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email || '',
          role: m.role as "owner" | "admin" | "mentor" | "student" | "collaborator" | "viewer",
          avatar: m.avatar,
          status: (m.status === 'active' || m.status === 'pending' || m.status === 'inactive') ? m.status : 'active' as "active" | "pending" | "inactive",
          joinedDate: m.joinedDate || new Date().toISOString(),
          lastActive: m.lastActive || new Date().toISOString(),
          skills: m.skills,
          university: m.university,
          isOnline: m.isOnline
        }))} projectId={selectedProject.id} />;
      case "voice-chat":
        return <VoiceChat mentee={selectedMember} projectId={selectedProject.id} />;
      case "learning-vault":
        return <LearningVault mentee={selectedMember} projectId={selectedProject.id} />;
      case "deliverables":
        return <DeliverableSubmissions mentee={selectedMember} projectId={selectedProject.id} />;
      case "certificates":
        return <CertificateManager mentee={selectedMember} projectId={selectedProject.id} />;
      case "live-session":
        return <LiveSession 
          mentee={{
            id: selectedMember.id,
            name: selectedMember.name,
            avatar: selectedMember.avatar,
            university: selectedMember.university,
            program: selectedMember.program || '',
            year: selectedMember.year || '',
            status: selectedMember.status === 'active' ? 'active' : selectedMember.status === 'completed' ? 'completed' : 'paused',
            progress: selectedMember.progress,
            isOnline: selectedMember.isOnline
          }}
          projectId={selectedProject.id}
        />;
      case "research-tools":
        return <ResearchTools mentee={selectedMember} projectType={selectedProject.type} projectId={selectedProject.id} />;
      case "innovation-hub":
        return <InnovationHub mentee={selectedMember} projectType={selectedProject.type} projectId={selectedProject.id} />;
      case "community-tools":
        return <CommunityTools mentee={selectedMember} projectType={selectedProject.type} projectId={selectedProject.id} />;
      default:
        return <SessionBoard mentee={selectedMember} />;
    }
  };

  // Apply compact view classes conditionally
  const getCompactClass = (normalClass: string, compactClass: string) => {
    return workspaceSettings.compactView ? compactClass : normalClass;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Enhanced Header with Workspace Mode Display */}
      <div className={`bg-white border-b border-gray-200 flex-shrink-0 ${getCompactClass("px-6 py-4", "px-4 py-3")}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Navigation & Project Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Back Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToProjects}
                  className={`flex items-center gap-2 px-3 btn-hover-lift ${getCompactClass("py-2 h-9", "py-1 h-8")}`}
                >
                  <ArrowLeft className={getCompactClass("h-4 w-4", "h-3 w-3")} />
                  <span>Projects</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-enhanced">
                <span className="text-xs">View all your projects</span>
              </TooltipContent>
            </Tooltip>

            {/* Separator */}
            <div className={getCompactClass("h-5 w-px bg-gray-300", "h-4 w-px bg-gray-300")} />

            {/* Project Type Badge & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <ProjectIcon className={getCompactClass("h-5 w-5 flex-shrink-0", "h-4 w-4 flex-shrink-0")} />
                <Badge variant="outline" className={`${projectTypeColors[selectedProject.type]} ${getCompactClass("px-2 py-1", "px-1.5 py-0.5 text-xs")}`}>
                  {selectedProject.type}
                </Badge>
              </div>
              <div className="min-w-0">
                <h1 className={`font-semibold text-gray-900 truncate ${getCompactClass("text-lg", "text-base")}`}>{selectedProject.title}</h1>
                <p className={`text-gray-600 truncate ${getCompactClass("text-sm", "text-xs")}`}>{selectedProject.description}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-3">
            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`text-gray-600 font-medium ${getCompactClass("text-sm", "text-xs")} whitespace-nowrap cursor-help`}>
                    Choose your project:
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="tooltip-enhanced">
                  <span className="text-xs">Each project has different workspace tools</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="form-field-enhanced">
                    <Select value={selectedProject.id} onValueChange={handleProjectChange}>
                      <SelectTrigger className={getCompactClass("w-56 h-9", "w-48 h-8 text-sm")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjects.map((project) => {
                          const Icon = projectTypeIcons[project.type];
                          return (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="truncate">{project.title}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="tooltip-enhanced">
                  <span className="text-xs">Type: {selectedProject.type} • Progress: {selectedProject.progress}%</span>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRightPanel("calendar")}
                    className={`btn-hover-lift ${getCompactClass("h-9 px-3", "h-8 px-2")}`}
                  >
                    <Calendar className={getCompactClass("h-4 w-4", "h-3 w-3")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="tooltip-enhanced">
                  <span className="text-xs">View sessions & deadlines</span>
                </TooltipContent>
              </Tooltip>

              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`focus-ring-brand btn-hover-lift ${getCompactClass("h-9 w-9 p-0", "h-8 w-8 p-0")}`}
                      >
                        <Settings className={getCompactClass("h-4 w-4", "h-3 w-3")} />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent side="bottom" className="tooltip-enhanced">
                    <span className="text-xs">Customize your workspace preferences</span>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="p-4" align="end">
                  <WorkspaceSettings onSettingsChange={handleSettingsChange} />
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRightPanel("notifications")}
                    className={`relative btn-hover-lift ${getCompactClass("h-9 px-3", "h-8 px-2")}`}
                  >
                    <Bell className={getCompactClass("h-4 w-4", "h-3 w-3")} />
                    <Badge variant="destructive" className={`absolute -top-1 -right-1 p-0 text-xs flex items-center justify-center notification-pulse ${getCompactClass("h-5 w-5", "h-4 w-4 text-xs")}`}>3</Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="tooltip-enhanced">
                  <span className="text-xs">View recent activity & updates (3 new)</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Mode Status Bar */}
      <div className={`bg-[#021ff6]/5 border-b border-[#021ff6]/10 flex-shrink-0 ${getCompactClass("px-6 py-3", "px-4 py-2")}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Current Participants Display */}
            <div className="flex items-center gap-2">
              <Users className={`text-[#021ff6] ${getCompactClass("h-4 w-4", "h-3 w-3")}`} />
              <span className={`font-medium text-[#021ff6] ${getCompactClass("", "text-sm")}`}>
                Active Members
              </span>
              <Badge variant="outline" className={`bg-[#021ff6] text-white border-[#021ff6] ${getCompactClass("", "text-xs px-1.5 py-0.5")}`}>
                {workspaceParticipants.length} member{workspaceParticipants.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Workspace Participants & Member Management */}
          <div className="flex items-center gap-3">
            {/* Participants Avatars */}
            {workspaceParticipants.length > 0 && (
              <div className="flex -space-x-2">
                {workspaceParticipants.slice(0, 4).map((participant) => (
                  <Tooltip key={participant.id}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Avatar className={`border-2 border-white ${getCompactClass("h-8 w-8", "h-6 w-6")}`}>
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback className={getCompactClass("text-xs", "text-xs")}>
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {participant.isOnline && (
                          <div className={`absolute bg-green-500 rounded-full border-2 border-white ${getCompactClass("w-3 h-3 -bottom-1 -right-1", "w-2 h-2 -bottom-0.5 -right-0.5")}`}></div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">{participant.name} • {participant.role}</span>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {workspaceParticipants.length > 4 && (
                  <div className={`rounded-full bg-muted border-2 border-white flex items-center justify-center ${getCompactClass("h-8 w-8", "h-6 w-6")}`}>
                    <span className={getCompactClass("text-xs font-medium", "text-xs font-medium")}>+{workspaceParticipants.length - 4}</span>
                  </div>
                )}
              </div>
            )}

            {/* Member Management Button */}
            <Tooltip>
              <TooltipTrigger>
                <ProjectMemberModal
                  projectId={selectedProject.id}
                  open={memberModalOpen}
                  onOpenChange={setMemberModalOpen}
                  onMembersChange={(members) => {
                    const convertedMembers = members.map(m => ({
                      id: m.id,
                      name: m.name,
                      email: m.email || '',
                      role: m.role,
                      avatar: m.avatar,
                      status: m.status,
                      joinedDate: m.joinedDate,
                      lastActive: m.lastActive,
                      skills: m.skills,
                      university: m.university,
                      isOnline: m.isOnline,
                      tasksCompleted: m.tasksCompleted,
                      contributionScore: m.contributionScore,
                      projectsInvolved: m.projectsInvolved
                    }));
                    handleMemberChange(convertedMembers as any);
                  }}
                  initialActiveTab={navigationOptions?.activeTab}
                  trigger={
                    <Button 
                      variant="outline"
                      size="sm"
                      className={`border-[#021ff6] text-[#021ff6] hover:bg-[#021ff6] hover:text-white btn-hover-lift ${getCompactClass("h-9 px-3", "h-8 px-2 text-sm")}`}
                    >
                      <Users className={`mr-2 ${getCompactClass("h-4 w-4", "h-3 w-3")}`} />
                      Manage Members
                    </Button>
                  }
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="tooltip-enhanced">
                <span className="text-xs">Switch modes • Add members • View profiles</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Tab Navigation */}
        <div className={`bg-white border-r border-gray-200 flex-shrink-0 ${getCompactClass("w-64", "w-56")}`}>
          <ScrollArea className={`h-full ${getCompactClass("p-4", "p-3")}`}>
            <div className={getCompactClass("space-y-2", "space-y-1")}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setActiveTab(tab.id)}
                        variant="ghost"
                        className={`w-full flex items-center gap-3 rounded-lg text-left transition-all justify-start h-auto sidebar-item-hover ${getCompactClass("px-4 py-3", "px-3 py-2")} ${
                          activeTab === tab.id
                            ? 'bg-[#021ff6] text-white shadow-sm hover:bg-[#021ff6]'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`flex-shrink-0 ${getCompactClass("h-4 w-4", "h-3 w-3")}`} />
                        <span className={`font-medium truncate ${getCompactClass("", "text-sm")}`}>{tab.label}</span>
                        <ChevronRight className={`ml-auto transition-transform flex-shrink-0 ${getCompactClass("h-4 w-4", "h-3 w-3")} ${
                          activeTab === tab.id ? 'rotate-90' : ''
                        }`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="tooltip-enhanced">
                      <span className="text-xs">
                        {tab.id === 'session-board' && 'Manage sessions & schedule meetings'}
                        {tab.id === 'task-manager' && 'Track tasks & project milestones'}
                        {tab.id === 'voice-chat' && 'Voice calls & team messaging'}
                        {tab.id === 'learning-vault' && 'Resources & knowledge library'}
                        {tab.id === 'deliverables' && 'Submit & review project deliverables'}
                        {tab.id === 'live-session' && 'Start live video sessions'}
                        {tab.id === 'certificates' && 'View & manage certificates'}
                        {tab.id === 'research-tools' && 'Research tools & literature search'}
                        {tab.id === 'innovation-hub' && 'Innovation & collaboration tools'}
                        {tab.id === 'community-tools' && 'Community engagement & outreach'}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Enhanced Project Status Panel */}
            <div className={`bg-gray-50 rounded-lg ${getCompactClass("mt-6 p-4", "mt-4 p-3")}`}>
              <h3 className={`font-medium mb-3 ${getCompactClass("", "text-sm")}`}>Project Status</h3>
              <div className={getCompactClass("space-y-3", "space-y-2")}>
                <div className="flex justify-between">
                  <span className={`text-gray-600 ${getCompactClass("text-sm", "text-xs")}`}>Progress</span>
                  <span className={`font-medium ${getCompactClass("text-sm", "text-xs")}`}>{selectedProject.progress}%</span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full ${getCompactClass("h-2", "h-1.5")}`}>
                  <div 
                    className={`bg-[#021ff6] rounded-full transition-all duration-300 ${getCompactClass("h-2", "h-1.5")}`}
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
                <Badge 
                  variant={selectedProject.status === 'active' ? 'default' : 'secondary'}
                  className={`w-full justify-center ${getCompactClass("py-1", "py-0.5 text-xs")}`}
                >
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel - Calendar/Notifications */}
        {isRightPanelOpen && (
          <div className={`bg-white border-l border-gray-200 flex-shrink-0 ${getCompactClass("w-80", "w-72")} overflow-hidden`}>
            <div className="h-full flex flex-col">
              <div className={`border-b border-gray-200 flex items-center justify-between ${getCompactClass("p-4", "p-3")}`}>
                <h3 className={`font-medium ${getCompactClass("", "text-sm")}`}>
                  {rightPanelContent === "calendar" ? "Calendar" : "Notifications"}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsRightPanelOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                {rightPanelContent === "calendar" ? (
                  <WorkspaceCalendar selectedMentee={selectedMember ? {
                    id: selectedMember.id,
                    name: selectedMember.name,
                    avatar: selectedMember.avatar,
                    university: selectedMember.university,
                    program: selectedMember.program || '',
                    year: selectedMember.year || '',
                    status: (selectedMember.status === 'active' || selectedMember.status === 'completed' || selectedMember.status === 'paused') ? selectedMember.status : 'active',
                    progress: selectedMember.progress,
                    isOnline: selectedMember.isOnline,
                    totalSessions: 0,
                    completedSessions: 0,
                    completedTasks: 0,
                    totalTasks: 0,
                    achievements: [],
                    certifications: []
                  } as any : null} />
                ) : (
                  <NotificationsPanel />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}