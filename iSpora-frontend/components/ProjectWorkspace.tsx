import React, { useState } from 'react';
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
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

// Import workspace components
import { SessionBoard } from './workspace/SessionBoard';
import { TaskManager } from './workspace/TaskManager';
import { VoiceChat } from './workspace/VoiceChat';
import { LearningVault } from './workspace/LearningVault';
import { DeliverableSubmissions } from './workspace/DeliverableSubmissions';
import { WorkspaceCalendar } from './workspace/WorkspaceCalendar';
import { NotificationsPanel } from './workspace/NotificationsPanel';
import { CertificateManager } from './workspace/CertificateManager';
import { LiveSession } from './workspace/LiveSession';
import { ProjectMemberModal } from './workspace/ProjectMemberModal';
import { ResearchTools } from './workspace/ResearchTools';
import { InnovationHub } from './workspace/InnovationHub';
import { CommunityTools } from './workspace/CommunityTools';
import { useNavigation } from './NavigationContext';

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role:
    | 'mentor'
    | 'mentee'
    | 'participant'
    | 'leader'
    | 'researcher'
    | 'owner'
    | 'admin'
    | 'student'
    | 'collaborator'
    | 'viewer';
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
    id: '1',
    title: 'AI Ethics Research Initiative',
    type: 'research',
    description: 'Collaborative research on ethical AI implementation',
    status: 'active',
    mentorMode: 'group',
    startDate: '2024-01-15',
    progress: 65,
    members: [
      {
        id: '1',
        name: 'Alex Chen',
        email: 'alex.chen@stanford.edu',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        university: 'Stanford University',
        program: 'Computer Science',
        year: 'Junior',
        role: 'researcher',
        status: 'active',
        progress: 75,
        isOnline: true,
        tasksCompleted: 23,
        contributionScore: 87,
        projectsInvolved: 3,
        joinedDate: '2024-01-20',
        lastActive: '1 hour ago',
        skills: ['Computer Science', 'Python', 'Data Analysis'],
      },
      {
        id: '2',
        name: 'Sarah Williams',
        email: 'sarah.williams@mit.edu',
        avatar:
          'https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face',
        university: 'MIT',
        program: 'Electrical Engineering',
        year: 'Sophomore',
        role: 'researcher',
        status: 'active',
        progress: 60,
        isOnline: false,
        tasksCompleted: 31,
        contributionScore: 79,
        projectsInvolved: 2,
        joinedDate: '2024-01-25',
        lastActive: '5 hours ago',
        skills: ['Design', 'UX Research', 'Psychology'],
      },
    ],
  },
  {
    id: '2',
    title: 'Youth Leadership Mentorship',
    type: 'mentorship',
    description: 'One-on-one mentorship for leadership development',
    status: 'active',
    mentorMode: 'individual',
    startDate: '2024-02-01',
    progress: 80,
    members: [
      {
        id: '3',
        name: 'Jordan Martinez',
        email: 'jordan.martinez@berkeley.edu',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        university: 'UC Berkeley',
        program: 'Business Administration',
        year: 'Senior',
        role: 'mentee',
        status: 'active',
        progress: 80,
        isOnline: true,
        tasksCompleted: 45,
        contributionScore: 98,
        projectsInvolved: 8,
        joinedDate: '2024-01-15',
        lastActive: '2 minutes ago',
        skills: ['AI Ethics', 'Machine Learning', 'Research'],
      },
    ],
  },
  {
    id: '3',
    title: 'Climate Innovation Challenge',
    type: 'innovation',
    description: 'Developing sustainable solutions for climate change',
    status: 'active',
    mentorMode: 'group',
    startDate: '2024-01-20',
    progress: 45,
    members: [
      {
        id: '4',
        name: 'Emma Thompson',
        email: 'emma.thompson@oxford.edu',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        university: 'Oxford University',
        program: 'Environmental Science',
        year: 'Graduate',
        role: 'participant',
        status: 'active',
        progress: 45,
        isOnline: true,
        tasksCompleted: 67,
        contributionScore: 95,
        projectsInvolved: 12,
        joinedDate: '2024-02-01',
        lastActive: '30 minutes ago',
        skills: ['Product Management', 'Strategy', 'Mentoring'],
      },
    ],
  },
  {
    id: '4',
    title: 'Rural Health Community Outreach',
    type: 'community',
    description: 'Building healthcare capacity in underserved rural communities',
    status: 'active',
    mentorMode: 'group',
    startDate: '2024-01-10',
    progress: 72,
    members: [
      {
        id: '5',
        name: 'Dr. Amina Hassan',
        email: 'amina.hassan@unilag.edu.ng',
        avatar:
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        university: 'University of Lagos',
        program: 'Public Health',
        year: 'Faculty',
        role: 'leader',
        status: 'active',
        progress: 85,
        isOnline: true,
        tasksCompleted: 34,
        contributionScore: 92,
        projectsInvolved: 5,
        joinedDate: '2024-01-10',
        lastActive: '15 minutes ago',
        skills: ['Public Health', 'Community Medicine', 'Project Management'],
      },
      {
        id: '6',
        name: 'Michael Okafor',
        email: 'michael.okafor@nsu.edu.ng',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        university: 'Niger State University',
        program: 'Community Development',
        year: 'Senior',
        role: 'participant',
        status: 'active',
        progress: 68,
        isOnline: false,
        tasksCompleted: 28,
        contributionScore: 78,
        projectsInvolved: 3,
        joinedDate: '2024-01-15',
        lastActive: '2 hours ago',
        skills: ['Community Engagement', 'Social Work', 'Data Collection'],
      },
    ],
  },
];

const projectTypeIcons = {
  mentorship: Users,
  research: BookOpen,
  innovation: Zap,
  training: GraduationCap,
  challenge: Target,
  community: Globe,
};

const projectTypeColors = {
  mentorship: 'bg-blue-100 text-blue-800',
  research: 'bg-green-100 text-green-800',
  innovation: 'bg-purple-100 text-purple-800',
  training: 'bg-orange-100 text-orange-800',
  challenge: 'bg-red-100 text-red-800',
  community: 'bg-indigo-100 text-indigo-800',
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
    compactView: true, // Default to true for more compact interface
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
      compactView: true, // Reset also defaults to compact view
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
            { key: 'compactView', label: 'Compact view' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <label htmlFor={key} className="text-sm">
                {label}
              </label>
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
  initialProjectId,
}: ProjectWorkspaceProps) {
  const { navigationOptions, setNavigationOptions } = useNavigation();
  const [activeTab, setActiveTab] = useState('session-board');
  const [selectedProject, setSelectedProject] = useState<Project>(
    mockProjects.find((p) => p.id === initialProjectId) || mockProjects[0],
  );
  const [selectedMember, setSelectedMember] = useState<ProjectMember>(selectedProject.members[0]);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<'calendar' | 'notifications'>(
    'calendar',
  );
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
    compactView: true, // Default to true for more compact interface
  });

  // Workspace participants state - always group mode for MVP
  const [workspaceParticipants, setWorkspaceParticipants] = useState<ProjectMember[]>(
    selectedProject.members.filter((m) => m.status === 'active'),
  );

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
      { id: 'session-board', label: 'Session Board', icon: Calendar },
      { id: 'task-manager', label: 'Task Manager', icon: CheckSquare },
      { id: 'voice-chat', label: 'Voice & Chat', icon: MessageCircle },
      { id: 'learning-vault', label: 'Learning Vault', icon: BookOpen },
      { id: 'deliverables', label: 'Deliverables', icon: FileText },
      { id: 'live-session', label: 'Live Session', icon: Play },
    ];

    const projectSpecificTabs = [];

    if (projectType === 'mentorship') {
      projectSpecificTabs.push({ id: 'certificates', label: 'Certificates', icon: Award });
    } else if (projectType === 'research') {
      projectSpecificTabs.push({ id: 'research-tools', label: 'Research Tools', icon: Briefcase });
    } else if (projectType === 'innovation' || projectType === 'challenge') {
      projectSpecificTabs.push({ id: 'innovation-hub', label: 'Innovation Hub', icon: Zap });
    } else if (projectType === 'community') {
      projectSpecificTabs.push({ id: 'community-tools', label: 'Community Tools', icon: Globe });
    }

    return [...baseTabs, ...projectSpecificTabs];
  };

  const tabs = getTabsForProjectType(selectedProject.type);

  const openRightPanel = (content: 'calendar' | 'notifications') => {
    setRightPanelContent(content);
    setIsRightPanelOpen(true);
  };

  const handleSelectMember = (member: ProjectMember) => {
    setSelectedMember(member);
    setMemberModalOpen(false);
  };

  const handleProjectChange = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setSelectedMember(project.members[0]);
      setWorkspaceParticipants(project.members.filter((m) => m.status === 'active'));
      setShowProjectSelector(false);
    }
  };

  const ProjectIcon = projectTypeIcons[selectedProject.type];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'session-board':
        return <SessionBoard mentee={selectedMember} />;
      case 'task-manager':
        return <TaskManager mentee={selectedMember} projectMembers={workspaceParticipants} />;
      case 'voice-chat':
        return <VoiceChat mentee={selectedMember} />;
      case 'learning-vault':
        return <LearningVault mentee={selectedMember} />;
      case 'deliverables':
        return <DeliverableSubmissions mentee={selectedMember} />;
      case 'certificates':
        return <CertificateManager mentee={selectedMember} />;
      case 'live-session':
        return <LiveSession mentee={selectedMember} />;
      case 'research-tools':
        return <ResearchTools mentee={selectedMember} projectType={selectedProject.type} />;
      case 'innovation-hub':
        return <InnovationHub mentee={selectedMember} projectType={selectedProject.type} />;
      case 'community-tools':
        return <CommunityTools mentee={selectedMember} projectType={selectedProject.type} />;
      default:
        return <SessionBoard mentee={selectedMember} />;
    }
  };

  // Apply compact view classes conditionally
  const getCompactClass = (normalClass: string, compactClass: string) => {
    return workspaceSettings.compactView ? compactClass : normalClass;
  };

  return (
    <div className="flex flex-col bg-gray-50 relative">
      {/* Modern Workroom Header */}
      <div className="modern-workroom-header bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
        {/* Header Content */}
        <div className="px-6 py-6">
          {/* Top Section - Project Info & Navigation */}
          <div className="flex items-center justify-between mb-6">
            {/* Left - Project Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToProjects}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Projects</span>
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ProjectIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-semibold text-gray-900">{selectedProject.title}</h1>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {selectedProject.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
              </div>
            </div>

            {/* Right - Project Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Switch Project:</span>
              <Select value={selectedProject.id} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-64 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => {
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
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Team Management */}
            <Button
              onClick={() => setMemberModalOpen(true)}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Members</span>
            </Button>

            {/* Quick Actions */}
            <Button
              onClick={() => setActiveTab('session-board')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs font-medium">Sessions</span>
            </Button>

            <Button
              onClick={() => setActiveTab('task-manager')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <CheckSquare className="h-5 w-5" />
              <span className="text-xs font-medium">Tasks</span>
            </Button>

            <Button
              onClick={() => setActiveTab('voice-chat')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs font-medium">Chat</span>
            </Button>

            {/* Workspace Tools */}
            <Button
              onClick={() => setActiveTab('learning-vault')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-xs font-medium">Resources</span>
            </Button>

            <Button
              onClick={() => setActiveTab('deliverables')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-medium">Files</span>
            </Button>

            {/* Controls */}
            <Button
              onClick={() => openRightPanel('calendar')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-xs font-medium">Calendar</span>
            </Button>

            <Button
              onClick={() => openRightPanel('notifications')}
              className="modern-workroom-btn bg-[#021ff6] hover:bg-[#021ff6]/90 text-white relative"
            >
              <Bell className="h-5 w-5" />
              <span className="text-xs font-medium">Alerts</span>
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Status Bar */}
      <div className="bg-[#021ff6]/5 border-b border-[#021ff6]/10 flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Active Members Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#021ff6]" />
                <span className="font-semibold text-[#021ff6]">Active Members</span>
                <Badge className="bg-[#021ff6] text-white border-[#021ff6] px-2 py-1">
                  {workspaceParticipants.length} member{workspaceParticipants.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Section - Member Avatars & Management */}
          <div className="flex items-center gap-4">
            {/* Member Avatars */}
            {workspaceParticipants.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Online:</span>
                <div className="flex -space-x-2">
                  {workspaceParticipants.slice(0, 4).map((participant) => (
                    <Tooltip key={participant.id}>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Avatar className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                            <AvatarFallback className="text-xs">
                              {participant.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          {participant.isOnline && (
                            <div className="absolute bg-green-500 rounded-full border-2 border-white w-3 h-3 -bottom-1 -right-1"></div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-xs">
                          {participant.name} • {participant.role}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {workspaceParticipants.length > 4 && (
                    <div className="rounded-full bg-gray-100 border-2 border-white h-8 w-8 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{workspaceParticipants.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Management Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ProjectMemberModal
                  projectId={selectedProject.id}
                  open={memberModalOpen}
                  onOpenChange={setMemberModalOpen}
                  onMembersChange={handleMemberChange}
                  initialActiveTab={navigationOptions?.activeTab}
                  trigger={
                    <Button
                      size="sm"
                      className="bg-[#021ff6] hover:bg-[#021ff6]/90 text-white px-4 py-2"
                    >
                      <Users className="h-4 w-4 mr-2" />
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
        <div
          className={`bg-white border-r border-gray-200 flex-shrink-0 ${getCompactClass('w-64', 'w-56')}`}
        >
          <ScrollArea className={`h-full ${getCompactClass('p-4', 'p-3')}`}>
            <div className={`workroom-tabs ${getCompactClass('space-y-2', 'space-y-1')}`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tooltip key={tab.id}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setActiveTab(tab.id)}
                        variant="ghost"
                        className={`workroom-tab-btn w-full flex items-center gap-3 rounded-lg text-left transition-all justify-start h-auto sidebar-item-hover ${getCompactClass('px-4 py-3', 'px-3 py-2')} ${
                          activeTab === tab.id
                            ? 'bg-[#021ff6] text-white shadow-sm hover:bg-[#021ff6]'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon
                          className={`flex-shrink-0 ${getCompactClass('h-4 w-4', 'h-3 w-3')}`}
                        />
                        <span className={`font-medium truncate ${getCompactClass('', 'text-sm')}`}>
                          {tab.label}
                        </span>
                        <ChevronRight
                          className={`ml-auto transition-transform flex-shrink-0 ${getCompactClass('h-4 w-4', 'h-3 w-3')} ${
                            activeTab === tab.id ? 'rotate-90' : ''
                          }`}
                        />
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
            <div className={`bg-gray-50 rounded-lg ${getCompactClass('mt-6 p-4', 'mt-4 p-3')}`}>
              <h3 className={`font-medium mb-3 ${getCompactClass('', 'text-sm')}`}>
                Project Status
              </h3>
              <div className={getCompactClass('space-y-3', 'space-y-2')}>
                <div className="flex justify-between">
                  <span className={`text-gray-600 ${getCompactClass('text-sm', 'text-xs')}`}>
                    Progress
                  </span>
                  <span className={`font-medium ${getCompactClass('text-sm', 'text-xs')}`}>
                    {selectedProject.progress}%
                  </span>
                </div>
                <div
                  className={`w-full bg-gray-200 rounded-full ${getCompactClass('h-2', 'h-1.5')}`}
                >
                  <div
                    className={`bg-[#021ff6] rounded-full transition-all duration-300 ${getCompactClass('h-2', 'h-1.5')}`}
                    style={{ width: `${selectedProject.progress}%` }}
                  ></div>
                </div>
                <Badge
                  variant={selectedProject.status === 'active' ? 'default' : 'secondary'}
                  className={`w-full justify-center ${getCompactClass('py-1', 'py-0.5 text-xs')}`}
                >
                  {selectedProject.status}
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 min-h-0">{renderTabContent()}</div>
        </div>

        {/* Right Panel - Calendar/Notifications */}
        {isRightPanelOpen && (
          <div
            className={`bg-white border-l border-gray-200 flex-shrink-0 ${getCompactClass('w-80', 'w-72')} overflow-hidden`}
          >
            <div className="h-full flex flex-col">
              <div
                className={`border-b border-gray-200 flex items-center justify-between ${getCompactClass('p-4', 'p-3')}`}
              >
                <h3 className={`font-medium ${getCompactClass('', 'text-sm')}`}>
                  {rightPanelContent === 'calendar' ? 'Calendar' : 'Notifications'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsRightPanelOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                {rightPanelContent === 'calendar' ? <WorkspaceCalendar /> : <NotificationsPanel />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
