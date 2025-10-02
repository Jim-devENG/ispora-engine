import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Textarea } from "../ui/textarea";
import {
  Users,
  Search,
  Plus,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User,
  Eye,
  EyeOff,
  MoreHorizontal,
  X,
  Check,
  UserX,
  Settings,
  Filter,
  SortAsc,
  UserCheck,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Heart,
  BookOpen,
  Briefcase,
  GraduationCap,

  Trash2,
  MessageSquare,
  Archive,
  Star,
  GitBranch,
  Video,
  FileText,
  Calendar,
  Zap,
  Info,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner";

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "mentor" | "student" | "collaborator" | "viewer";
  status: "active" | "pending" | "inactive";
  joinedDate: string;
  lastActive: string;
  skills?: string[];
  university?: string;
  isOnline?: boolean;
  tasksCompleted?: number;
  contributionScore?: number;
  projectsInvolved?: number;
}

interface InvitePending {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedDate: string;
}

interface IncomingRequest {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  type: "mentorship" | "project_invite" | "collaboration";
  message: string;
  requestedRole?: string;
  university?: string;
  skills?: string[];
  experience?: string;
  requestDate: string;
  priority: "high" | "medium" | "low";
  projectName?: string;
  invitedBy?: string;
}

const mockMembers: ProjectMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@stanford.edu",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    role: "owner",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2 minutes ago",
    skills: ["AI Ethics", "Machine Learning", "Research"],
    university: "Stanford University",
    isOnline: true,
    tasksCompleted: 45,
    contributionScore: 98,
    projectsInvolved: 8
  },
  {
    id: "2",
    name: "Alex Johnson",
    email: "alex.johnson@student.stanford.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "student",
    status: "active",
    joinedDate: "2024-01-20",
    lastActive: "1 hour ago",
    skills: ["Computer Science", "Python", "Data Analysis"],
    university: "Stanford University",
    isOnline: false,
    tasksCompleted: 23,
    contributionScore: 87,
    projectsInvolved: 3
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    email: "maria.r@techcorp.com",
    role: "mentor",
    status: "active",
    joinedDate: "2024-02-01",
    lastActive: "30 minutes ago",
    skills: ["Product Management", "Strategy", "Mentoring"],
    university: "Industry Professional",
    isOnline: true,
    tasksCompleted: 67,
    contributionScore: 95,
    projectsInvolved: 12
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@student.mit.edu",
    role: "collaborator",
    status: "pending",
    joinedDate: "2024-02-10",
    lastActive: "Not yet joined",
    skills: ["Engineering", "Research", "Innovation"],
    university: "MIT",
    isOnline: false,
    tasksCompleted: 0,
    contributionScore: 0,
    projectsInvolved: 1
  },
  {
    id: "5",
    name: "Emma Wilson",
    email: "emma.w@berkeley.edu",
    role: "student",
    status: "active",
    joinedDate: "2024-01-25",
    lastActive: "5 hours ago",
    skills: ["Design", "UX Research", "Psychology"],
    university: "UC Berkeley",
    isOnline: false,
    tasksCompleted: 31,
    contributionScore: 79,
    projectsInvolved: 2
  }
];

const mockPendingInvites: InvitePending[] = [
  {
    id: "1",
    email: "john.doe@university.edu",
    role: "student",
    invitedBy: "Dr. Sarah Chen",
    invitedDate: "2024-02-15"
  },
  {
    id: "2",
    email: "lisa.wang@tech.com",
    role: "mentor",
    invitedBy: "Dr. Sarah Chen",
    invitedDate: "2024-02-14"
  }
];

const mockIncomingRequests: IncomingRequest[] = [
  {
    id: "1",
    name: "Emily Zhang",
    email: "emily.zhang@student.harvard.edu",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    type: "mentorship",
    message: "Hi! I'm a computer science student at Harvard interested in AI ethics research. I've followed your work and would love to learn from your expertise in this field.",
    university: "Harvard University",
    skills: ["Python", "Machine Learning", "Ethics"],
    experience: "2 years programming, 1 year ML research",
    requestDate: "2024-02-20",
    priority: "high"
  },
  {
    id: "2",
    name: "Michael Foster",
    email: "m.foster@innovation-lab.org",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    type: "project_invite",
    message: "We'd love to invite you to join our Climate Innovation Challenge as a mentor. Your expertise would be invaluable to our participants.",
    projectName: "Climate Innovation Challenge 2024",
    invitedBy: "Innovation Lab Team",
    requestedRole: "mentor",
    requestDate: "2024-02-19",
    priority: "medium"
  }
];

const roleConfig = {
  owner: { label: "Owner", icon: Crown, color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  admin: { label: "Admin", icon: Shield, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  mentor: { label: "Mentor", icon: UserCheck, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  student: { label: "Student", icon: User, color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  collaborator: { label: "Collaborator", icon: Users, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" }
};

const requestTypeConfig = {
  mentorship: { 
    label: "Mentorship Request", 
    icon: Heart, 
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    description: "Seeking guidance and support"
  },
  project_invite: { 
    label: "Project Invitation", 
    icon: Briefcase, 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    description: "Invitation to join project"
  },
  collaboration: { 
    label: "Collaboration Request", 
    icon: Users, 
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    description: "Partnership opportunity"
  }
};

const priorityConfig = {
  high: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "High" },
  medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Medium" },
  low: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Low" }
};

interface ProjectMemberModalProps {
  projectId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMembersChange?: (members: ProjectMember[]) => void;
  initialActiveTab?: string;
}

export function ProjectMemberModal({ 
  projectId = "1", 
  trigger,
  open,
  onOpenChange,
  onMembersChange,
  initialActiveTab
}: ProjectMemberModalProps) {
  const [activeTab, setActiveTab] = useState<"members" | "requests" | "invites">(
    (initialActiveTab as "members" | "requests" | "invites") || "members"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [members, setMembers] = useState<ProjectMember[]>(mockMembers);
  const [pendingInvites, setPendingInvites] = useState<InvitePending[]>(mockPendingInvites);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>(mockIncomingRequests);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("student");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [requestFilter, setRequestFilter] = useState("all");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Message composer state
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<ProjectMember | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === "all" || member.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
      const matchesOnlineFilter = !showOnlineOnly || member.isOnline === true;
      return matchesSearch && matchesRole && matchesStatus && matchesOnlineFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "role":
          return a.role.localeCompare(b.role);
        case "joined":
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        case "contribution":
          return (b.contributionScore || 0) - (a.contributionScore || 0);
        default:
          return 0;
      }
    });

  // Filter requests
  const filteredRequests = incomingRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = requestFilter === "all" || request.type === requestFilter;
    return matchesSearch && matchesType;
  });

  // Notify parent about member changes
  const notifyMembersChange = (updatedMembers: ProjectMember[]) => {
    if (onMembersChange) {
      const activeMembers = updatedMembers.filter(m => m.status === "active");
      onMembersChange(activeMembers);
    }
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim()) {
      const newInvite: InvitePending = {
        id: Date.now().toString(),
        email: inviteEmail.trim(),
        role: inviteRole,
        invitedBy: "Current User",
        invitedDate: new Date().toISOString().split('T')[0]
      };
      setPendingInvites([...pendingInvites, newInvite]);
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    const updatedMembers = members.map(member => 
      member.id === memberId ? { ...member, role: newRole as ProjectMember['role'] } : member
    );
    setMembers(updatedMembers);
    notifyMembersChange(updatedMembers);
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = members.filter(member => member.id !== memberId);
    setMembers(updatedMembers);
    notifyMembersChange(updatedMembers);
  };

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = incomingRequests.find(r => r.id === requestId);
    if (request) {
      if (request.type === "mentorship" || request.type === "collaboration") {
        const newMember: ProjectMember = {
          id: Date.now().toString(),
          name: request.name,
          email: request.email,
          avatar: request.avatar,
          role: "student",
          status: "active",
          joinedDate: new Date().toISOString().split('T')[0],
          lastActive: "Just joined",
          skills: request.skills || [],
          university: request.university || "",
          isOnline: true,
          tasksCompleted: 0,
          contributionScore: 0,
          projectsInvolved: 1
        };
        const updatedMembers = [...members, newMember];
        setMembers(updatedMembers);
        notifyMembersChange(updatedMembers);
      }
      setIncomingRequests(incomingRequests.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setIncomingRequests(incomingRequests.filter(r => r.id !== requestId));
  };

  // Handle opening message composer
  const handleOpenMessageComposer = (member: ProjectMember) => {
    setMessageRecipient(member);
    setMessageSubject(`Message from Workspace Project`);
    setMessageContent(`Hi ${member.name.split(' ')[0]},\n\n`);
    setShowMessageComposer(true);
  };

  // Handle closing message composer
  const handleCloseMessageComposer = () => {
    setShowMessageComposer(false);
    setMessageRecipient(null);
    setMessageSubject("");
    setMessageContent("");
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageRecipient || !messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSendingMessage(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would send the message to your backend
      console.log("Sending message:", {
        to: messageRecipient,
        subject: messageSubject,
        content: messageContent
      });

      toast.success(`Message sent to ${messageRecipient.name}!`);
      handleCloseMessageComposer();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle online filter toggle
  const handleOnlineFilterToggle = () => {
    setShowOnlineOnly(!showOnlineOnly);
  };

  // Update active tab when initialActiveTab changes
  React.useEffect(() => {
    if (initialActiveTab && (initialActiveTab === "members" || initialActiveTab === "requests" || initialActiveTab === "invites")) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  // Notify parent about initial members on mount
  React.useEffect(() => {
    notifyMembersChange(members);
  }, []);

  const activeMembers = members.filter(m => m.status === "active");
  const onlineMembers = members.filter(m => m.isOnline === true);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="focus-ring-brand">
      <Users className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">Manage Members</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[85vw] h-[70vh] flex flex-col popout-shadow p-0 overflow-hidden">
        {!showMessageComposer ? (
          <>
            {/* Clean Header with Proper Alignment */}
            <DialogHeader className="flex-shrink-0 p-4 pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <DialogTitle className="text-sm font-medium">Manage Members</DialogTitle>
                </div>
              </div>
              
              {/* Accessible Description for Screen Readers */}
              <DialogDescription className="sr-only">
                Manage project members, handle membership requests, and invite new collaborators to join your workspace.
              </DialogDescription>
            </DialogHeader>
            
            {/* Compact Tab Navigation */}
            <div className="flex-shrink-0 px-4 bg-background">
              <div className="flex space-x-1 py-0.5">
                <Button
                  variant={activeTab === "members" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("members")}
                  className="flex items-center gap-1 text-xs h-6 px-2"
                >
                  <Users className="h-3 w-3" />
                  Members ({activeMembers.length})
                </Button>
                <Button
                  variant={activeTab === "requests" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("requests")}
                  className="flex items-center gap-1 text-xs h-6 px-2"
                >
                  <AlertCircle className="h-3 w-3" />
                  Requests ({incomingRequests.length})
                </Button>
                <Button
                  variant={activeTab === "invites" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("invites")}
                  className="flex items-center gap-1 text-xs h-6 px-2"
                >
                  <Mail className="h-3 w-3" />
                  Pending ({pendingInvites.length})
                </Button>
                <Button
                  variant={showOnlineOnly ? "default" : "ghost"}
                  size="sm"
                  onClick={handleOnlineFilterToggle}
                  className={`flex items-center gap-1 text-xs h-6 px-2 ${
                    showOnlineOnly 
                      ? "bg-[#021ff6] text-white hover:bg-[#021ff6]/90" 
                      : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                  }`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {showOnlineOnly ? `${onlineMembers.length} online` : `${onlineMembers.length} online`}
                  {showOnlineOnly && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {/* Members Tab */}
              {activeTab === "members" && (
                <div className="h-full flex flex-col">
                  {/* Search and Controls */}
                  <div className="flex-shrink-0 p-4 space-y-3 border-b">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search members..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9"
                        />
                      </div>
                      
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {Object.entries(roleConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInviteForm(true)}
                        className="h-9 px-3"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>

                    {/* Online Filter Info */}
                    {showOnlineOnly && (
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div className="text-sm flex-1">
                            <p className="font-medium text-green-900 dark:text-green-100">
                              Showing Online Members Only ({onlineMembers.length})
                            </p>
                            <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                              Only members who are currently online are displayed. Click the online filter button again to show all members.
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleOnlineFilterToggle}
                            className="h-6 w-6 p-0 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Active Members Info */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''} in workspace
                        </span>
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Team workspace
                        </Badge>
                      </div>
                    </div>

                    {/* Invite Form */}
                    {showInviteForm && (
                      <div className="border rounded-lg p-3 bg-muted/50">
                        <div className="flex items-center gap-2 mb-3">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm font-medium">Invite New Member</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1 h-8"
                          />
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(roleConfig).filter(([key]) => key !== 'owner').map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button onClick={handleInviteMember} size="sm" className="h-8 px-3">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" onClick={() => setShowInviteForm(false)} size="sm" className="h-8 px-2">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Members List */}
                  <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        {filteredMembers.map((member) => {
                          const roleInfo = roleConfig[member.role];
                          const RoleIcon = roleInfo.icon;
                          const isActive = member.status === "active";
                          
                          return (
                            <div
                              key={member.id}
                              className="relative border rounded-lg p-3 bg-card transition-all"
                            >
                              {/* Member Status Indicator */}
                              <div className="absolute top-2 right-2">
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-6 h-6 rounded-full bg-[#021ff6]/10 flex items-center justify-center">
                                      <Users className="h-3 w-3 text-[#021ff6]" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">
                                      {isActive ? "Active workspace member" : "Inactive member"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                  <Avatar className="h-10 w-10">
                                    {member.avatar ? (
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                    ) : (
                                      <AvatarFallback>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  {member.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium truncate">{member.name}</h4>
                                    <Badge variant="secondary" className={`${roleInfo.color} text-xs`}>
                                      <RoleIcon className="h-3 w-3 mr-1" />
                                      {roleInfo.label}
                                    </Badge>
                                    {member.status === "pending" && (
                                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                                        Pending
                                      </Badge>
                                    )}
                                    {isActive && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* University */}
                                  {member.university && (
                                    <p className="text-sm text-muted-foreground mb-2 truncate">
                                      <GraduationCap className="h-3 w-3 inline mr-1" />
                                      {member.university}
                                    </p>
                                  )}

                                  {/* Skills */}
                                  {member.skills && member.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {member.skills.slice(0, 3).map((skill, index) => (
                                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                          {skill}
                                        </Badge>
                                      ))}
                                      {member.skills.length > 3 && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          +{member.skills.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 inline mr-1" />
                                      {member.lastActive}
                                    </span>
                                    
                                    {member.role !== "owner" && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <User className="h-4 w-4 mr-2" />
                                            View Profile
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenMessageComposer(member);
                                            }}
                                          >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Send Message
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRemoveMember(member.id);
                                            }}
                                          >
                                            <UserX className="h-4 w-4 mr-2" />
                                            Remove
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {filteredMembers.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No members found</h3>
                            <p className="mb-4">
                              {showOnlineOnly
                                ? `No members are currently online`
                                : searchQuery
                                  ? `No members match "${searchQuery}"`
                                  : `No members in the selected category yet.`
                              }
                            </p>
                            {showOnlineOnly ? (
                              <Button 
                                onClick={handleOnlineFilterToggle}
                                variant="outline"
                                className="mr-2"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Clear Online Filter
                              </Button>
                            ) : (
                              <Button onClick={() => setShowInviteForm(true)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                                <Plus className="h-4 w-4 mr-2" />
                                Invite Your First Member
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === "requests" && (
                <div className="h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {filteredRequests.map((request) => {
                        const typeInfo = requestTypeConfig[request.type];
                        const TypeIcon = typeInfo.icon;
                        
                        return (
                          <div key={request.id} className="border rounded-lg p-4 bg-card">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                {request.avatar ? (
                                  <AvatarImage src={request.avatar} alt={request.name} />
                                ) : (
                                  <AvatarFallback>
                                    {request.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{request.name}</h4>
                                  <Badge variant="secondary" className={`${typeInfo.color} text-xs`}>
                                    <TypeIcon className="h-3 w-3 mr-1" />
                                    {typeInfo.label}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
                                
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptRequest(request.id)}
                                    className="bg-green-600 hover:bg-green-700 h-8"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeclineRequest(request.id)}
                                    className="h-8"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Invites Tab */}
              {activeTab === "invites" && (
                <div className="h-full">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {roleConfig[invite.role as keyof typeof roleConfig]?.label} • {invite.invitedDate}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
                            className="h-8 px-3"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Message Composer Interface */
          <div className="h-full flex flex-col">
            {/* Message Composer Header */}
            <div className="flex-shrink-0 p-4 pb-3 border-b bg-background">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseMessageComposer}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <MessageSquare className="h-4 w-4" />
                <DialogTitle className="text-sm font-medium">Send Message</DialogTitle>
              </div>
            </div>

            {/* Message Composer Content */}
            <div className="flex-1 min-h-0 p-4">
              <div className="space-y-4 h-full flex flex-col">
                {/* Recipient Info */}
                {messageRecipient && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      {messageRecipient.avatar ? (
                        <AvatarImage src={messageRecipient.avatar} alt={messageRecipient.name} />
                      ) : (
                        <AvatarFallback>
                          {messageRecipient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{messageRecipient.name}</p>
                      <p className="text-xs text-muted-foreground">{messageRecipient.email}</p>
                    </div>
                    {messageRecipient.isOnline && (
                      <div className="ml-auto">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subject Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="h-9"
                  />
                </div>

                {/* Message Content */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 min-h-[200px] resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isSendingMessage || !messageContent.trim()}
                    className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                  >
                    {isSendingMessage ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCloseMessageComposer}
                    disabled={isSendingMessage}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
