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
  Menu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// Import workspace components
import { SessionBoard } from "./workspace/SessionBoard";
import { TaskManager } from "./workspace/TaskManager";
import { VoiceChat } from "./workspace/VoiceChat";
import { VideoRecorder } from "./workspace/VideoRecorder";
import { LearningVault } from "./workspace/LearningVault";
import { DeliverableSubmissions } from "./workspace/DeliverableSubmissions";
import { WorkspaceCalendar } from "./workspace/WorkspaceCalendar";
import { NotificationsPanel } from "./workspace/NotificationsPanel";
import { CertificateManager } from "./workspace/CertificateManager";
import { LiveSession } from "./workspace/LiveSession";
import { MentorshipCampaigns } from "./workspace/MentorshipCampaigns";
import { MenteeManagement } from "./workspace/MenteeManagement";

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  isOnline?: boolean;
}

// Mock mentee data
const mockMentees: Mentee[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    university: "Stanford University",
    program: "Computer Science",
    year: "Junior",
    status: "active",
    progress: 75,
    isOnline: true
  },
  {
    id: "2",
    name: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    university: "MIT",
    program: "Electrical Engineering",
    year: "Sophomore",
    status: "active",
    progress: 60,
    isOnline: false
  },
  {
    id: "3",
    name: "Jordan Martinez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    university: "UC Berkeley",
    program: "Business Administration",
    year: "Senior",
    status: "completed",
    progress: 100,
    isOnline: true
  }
];

interface MentorshipWorkspaceProps {
  onNavigateToCampaign?: (campaignId: string) => void;
  onCreateCampaign?: () => void;
}

// Settings component for the popover
function WorkspaceSettings() {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    syncCalendar: true,
    darkMode: false,
    compactView: false
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 w-64">
      <div>
        <h4 className="font-medium text-sm mb-3">Workspace Settings</h4>
        <div className="space-y-3">
          {[
            { key: 'autoSave', label: 'Auto-save changes' },
            { key: 'notifications', label: 'Desktop notifications' },
            { key: 'syncCalendar', label: 'Sync with calendar' },
            { key: 'darkMode', label: 'Dark mode' },
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
        <Button variant="outline" size="sm" className="w-full">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

export function MentorshipWorkspace({ onNavigateToCampaign, onCreateCampaign }: MentorshipWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("session-board");
  const [selectedMentee, setSelectedMentee] = useState<Mentee>(mockMentees[0]);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<"calendar" | "notifications">("calendar");
  const [showMenteeManagement, setShowMenteeManagement] = useState(false);

  // Enhanced Tab Configuration with Campaigns
  const tabs = [
    { id: "session-board", label: "Session Board", icon: Calendar },
    { id: "task-manager", label: "Task Manager", icon: CheckSquare },
    { id: "voice-chat", label: "Voice & Chat", icon: MessageCircle },
    { id: "video-recorder", label: "Video Recording", icon: Video },
    { id: "learning-vault", label: "Learning Vault", icon: BookOpen },
    { id: "deliverables", label: "Deliverables", icon: FileText },
    { id: "campaigns", label: "Campaigns", icon: Target }, // New Campaign Tab
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "live-session", label: "Live Session", icon: Play }
  ];

  const openRightPanel = (content: "calendar" | "notifications") => {
    setRightPanelContent(content);
    setIsRightPanelOpen(true);
  };

  const handleSelectMentee = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    setShowMenteeManagement(false);
  };

  if (showMenteeManagement) {
    return (
      <MenteeManagement
        onSelectMentee={handleSelectMentee}
        onClose={() => setShowMenteeManagement(false)}
        selectedMenteeId={selectedMentee.id}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "session-board":
        return <SessionBoard mentee={selectedMentee} />;
      case "task-manager":
        return <TaskManager mentee={selectedMentee} />;
      case "voice-chat":
        return <VoiceChat mentee={selectedMentee} />;
      case "video-recorder":
        return <VideoRecorder mentee={selectedMentee} />;
      case "learning-vault":
        return <LearningVault mentee={selectedMentee} />;
      case "deliverables":
        return <DeliverableSubmissions mentee={selectedMentee} />;
      case "campaigns":
        return (
          <MentorshipCampaigns 
            onNavigateToCampaign={onNavigateToCampaign}
            onCreateCampaign={onCreateCampaign}
          />
        );
      case "certificates":
        return <CertificateManager mentee={selectedMentee} />;
      case "live-session":
        return <LiveSession mentee={selectedMentee} />;
      default:
        return <SessionBoard mentee={selectedMentee} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Your Workroom Environment</h1>
            <p className="text-gray-600">Your central hub for collaboration and productivity</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mentee Selector - Now Clickable */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowMenteeManagement(true)}
                  className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 transition-colors group"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedMentee.avatar} />
                    <AvatarFallback>{selectedMentee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-left">
                    <p className="font-medium">{selectedMentee.name}</p>
                    <p className="text-gray-600">{selectedMentee.university}</p>
                  </div>
                  {selectedMentee.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 ml-auto" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to view all mentees and manage relationships</p>
              </TooltipContent>
            </Tooltip>

            {/* Quick Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMenteeManagement(true)}
              className="flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              All Mentees ({mockMentees.length})
            </Button>
            
            {/* Calendar and Settings Icons Side by Side */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openRightPanel("calendar")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 focus-ring-brand"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-4" align="end">
                  <WorkspaceSettings />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => openRightPanel("notifications")}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
              <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">3</Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Tab Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#021ff6] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.id === 'campaigns' && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        New
                      </Badge>
                    )}
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${
                      activeTab === tab.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Mentee Status Panel */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Current Mentee Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{selectedMentee.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#021ff6] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedMentee.progress}%` }}
                  ></div>
                </div>
                <Badge 
                  variant={selectedMentee.status === 'active' ? 'default' : 'secondary'}
                  className="w-full justify-center"
                >
                  {selectedMentee.status}
                </Badge>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>

        {/* Right Panel Overlay */}
        {isRightPanelOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20 z-40 backdrop-enter"
              onClick={() => setIsRightPanelOpen(false)}
            />
            
            {/* Panel */}
            <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 panel-enter panel-shadow">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold capitalize">
                  {rightPanelContent === 'calendar' ? 'Calendar & Tasks' : 'Notifications'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRightPanelOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Scrollable content area */}
              <div className="h-[calc(100%-5rem)] overflow-hidden">
                {rightPanelContent === 'calendar' ? (
                  <WorkspaceCalendar selectedMentee={selectedMentee ? {
                    ...selectedMentee,
                    totalSessions: (selectedMentee as any).totalSessions || 0,
                    completedSessions: (selectedMentee as any).completedSessions || 0,
                    completedTasks: (selectedMentee as any).completedTasks || 0,
                    totalTasks: (selectedMentee as any).totalTasks || 0,
                    totalDeliverables: (selectedMentee as any).totalDeliverables || 0,
                    submittedDeliverables: (selectedMentee as any).submittedDeliverables || 0,
                    certificatesEarned: (selectedMentee as any).certificatesEarned || 0
                  } : null} />
                ) : (
                  <NotificationsPanel mentee={selectedMentee} />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Toggle Button for Panel - Changed icon to Menu */}
      <Button
        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#021ff6] hover:bg-[#021ff6]/90 shadow-lg z-30 workspace-toggle-btn"
      >
        {isRightPanelOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}