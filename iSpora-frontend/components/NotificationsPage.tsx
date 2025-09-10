import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Bell, 
  Check, 
  X, 
  Users, 
  BookOpen, 
  MessageCircle,
  Settings,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Eye,
  ArrowRight,
  Calendar,
  Target,
  Briefcase,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  FolderOpen,
  UserPlus,
  FileText,
  TrendingUp,
  CheckSquare,
  BarChart3
} from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { useNavigation } from "./NavigationContext";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'project' | 'mentorship' | 'message' | 'system' | 'opportunity';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  avatar?: string;
  category: string;
  // Enhanced fields for better details
  relatedId?: string; // ID of related project, opportunity, etc.
  relatedType?: string; // Type for navigation
  metadata?: {
    participants?: number;
    deadline?: string;
    location?: string;
    company?: string;
    priority?: 'low' | 'medium' | 'high';
    progress?: number; // Project completion percentage
    tasksCompleted?: number;
    totalTasks?: number;
    status?: string;
  };
  actions?: {
    primary?: {
      label: string;
      action: string;
      params?: any;
    };
    secondary?: {
      label: string;
      action: string;
      params?: any;
    };
  };
}

// Enhanced Notification Detail Modal
function NotificationDetailModal({ 
  notification, 
  isOpen, 
  onClose,
  onAction
}: { 
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string, params?: any) => void;
}) {
  if (!notification) return null;

  const getDetailIcon = () => {
    switch (notification.type) {
      case 'project':
        return <Briefcase className="h-8 w-8 text-blue-600" />;
      case 'mentorship':
        return <Users className="h-8 w-8 text-green-600" />;
      case 'message':
        return <MessageCircle className="h-8 w-8 text-purple-600" />;
      case 'opportunity':
        return <Target className="h-8 w-8 text-orange-600" />;
      case 'system':
        return <Bell className="h-8 w-8 text-gray-600" />;
      default:
        return <Bell className="h-8 w-8 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {getDetailIcon()}
            <div>
              <div className="text-xl font-semibold">{notification.title}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {notification.category} • {notification.timestamp}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            {notification.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Priority and Status */}
            <div className="flex items-center gap-3">
              {notification.metadata?.priority && (
                <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(notification.metadata.priority)}`}>
                  {notification.metadata.priority.charAt(0).toUpperCase() + notification.metadata.priority.slice(1)} Priority
                </div>
              )}
              {notification.actionRequired && (
                <div className="px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 text-sm font-medium">
                  <AlertCircle className="h-3 w-3 mr-1 inline" />
                  Action Required
                </div>
              )}
              {notification.metadata?.status && (
                <div className="px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium">
                  {notification.metadata.status}
                </div>
              )}
            </div>

            {/* Metadata Information */}
            {notification.metadata && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notification.metadata.progress !== undefined && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">
                        {notification.metadata.progress}%
                      </div>
                      <div className="text-sm text-green-700">Progress</div>
                    </div>
                  </div>
                )}

                {notification.metadata.participants && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-blue-900">
                        {notification.metadata.participants} members
                      </div>
                      <div className="text-sm text-blue-700">Team Size</div>
                    </div>
                  </div>
                )}

                {notification.metadata.tasksCompleted !== undefined && notification.metadata.totalTasks && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-indigo-900">
                        {notification.metadata.tasksCompleted}/{notification.metadata.totalTasks}
                      </div>
                      <div className="text-sm text-indigo-700">Tasks Complete</div>
                    </div>
                  </div>
                )}

                {notification.metadata.deadline && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-semibold text-orange-900">
                        {new Date(notification.metadata.deadline).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-orange-700">Deadline</div>
                    </div>
                  </div>
                )}

                {notification.metadata.location && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-semibold text-purple-900">
                        {notification.metadata.location}
                      </div>
                      <div className="text-sm text-purple-700">Location</div>
                    </div>
                  </div>
                )}

                {notification.metadata.company && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Briefcase className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {notification.metadata.company}
                      </div>
                      <div className="text-sm text-gray-700">Organization</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Information Based on Type */}
            <div className="space-y-4">
              {notification.type === 'project' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Project Details</h4>
                  <p className="text-sm text-blue-800">
                    View project progress, collaborate with team members, and manage project activities. 
                    You can review tasks, communicate with participants, and track project milestones.
                  </p>
                </div>
              )}

              {notification.type === 'mentorship' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Mentorship Request</h4>
                  <p className="text-sm text-green-800">
                    Review the mentee's profile, experience, and goals. You can accept, schedule an initial 
                    meeting, or request more information before making your decision.
                  </p>
                </div>
              )}

              {notification.type === 'opportunity' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Opportunity Details</h4>
                  <p className="text-sm text-orange-800">
                    View full opportunity details including requirements, benefits, application process, 
                    and deadlines. You can save for later or start your application immediately.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {notification.actions?.primary && (
                <Button
                  onClick={() => {
                    onAction(notification.actions!.primary!.action, notification.actions!.primary!.params);
                    onClose();
                  }}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  {notification.actions.primary.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {notification.actions?.secondary && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onAction(notification.actions!.secondary!.action, notification.actions!.secondary!.params);
                    onClose();
                  }}
                >
                  {notification.actions.secondary.label}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsPage() {
  const { 
    navigate, 
    navigateToWorkroom, 
    navigateToSpecificProject,
    navigateToSpecificOpportunity 
  } = useNavigation();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "project",
      title: "Engineering Mentorship Project",
      description: "3 new team members joined your project. Review their profiles and assign them to appropriate tasks.",
      timestamp: "2 hours ago",
      read: false,
      actionRequired: true,
      category: "Project Updates",
      relatedId: "proj_eng_001",
      relatedType: "project",
      metadata: {
        participants: 8,
        progress: 65,
        tasksCompleted: 12,
        totalTasks: 18,
        priority: "high",
        status: "Active"
      },
      actions: {
        primary: {
          label: "Review Members",
          action: "navigate_project",
          params: { projectId: "proj_eng_001", tab: "members" }
        },
        secondary: {
          label: "View Project",
          action: "navigate_project",
          params: { projectId: "proj_eng_001" }
        }
      }
    },
    {
      id: "2",
      type: "mentorship",
      title: "Mentorship Request",
      description: "Sarah Johnson from University of Lagos requested mentorship in Software Engineering. She has 2 years of experience and is looking to transition into full-stack development.",
      timestamp: "4 hours ago",
      read: false,
      actionRequired: true,
      category: "Mentorship",
      relatedId: "mentee_002",
      relatedType: "mentorship",
      metadata: {
        location: "Lagos, Nigeria",
        priority: "medium",
        company: "University of Lagos"
      },
      actions: {
        primary: {
          label: "Review Profile",
          action: "navigate_mentorship",
          params: { menteeId: "mentee_002", action: "review" }
        },
        secondary: {
          label: "Schedule Call",
          action: "navigate_mentorship",
          params: { menteeId: "mentee_002", action: "schedule" }
        }
      }
    },
    {
      id: "3",
      type: "project",
      title: "Startup Innovation Lab",
      description: "Your project reached 74% completion! 18 out of 24 tasks completed by the team members.",
      timestamp: "6 hours ago",
      read: true,
      category: "Project Updates",
      relatedId: "proj_startup_002",
      relatedType: "project",
      metadata: {
        participants: 12,
        progress: 74,
        tasksCompleted: 18,
        totalTasks: 24,
        priority: "low",
        status: "On Track"
      },
      actions: {
        primary: {
          label: "View Progress",
          action: "navigate_project",
          params: { projectId: "proj_startup_002", tab: "progress" }
        },
        secondary: {
          label: "Open Workspace",
          action: "navigate_workroom",
          params: { projectId: "proj_startup_002" }
        }
      }
    },
    {
      id: "4",
      type: "message",
      title: "New Message",
      description: "Dr. Amina Hassan sent you a message about the Medical Research Collaboration project. She wants to discuss the next phase.",
      timestamp: "1 day ago",
      read: true,
      category: "Messages",
      relatedId: "msg_001",
      relatedType: "message",
      metadata: {
        company: "Medical Research Institute",
        priority: "medium"
      },
      actions: {
        primary: {
          label: "Read Message",
          action: "navigate_messages",
          params: { messageId: "msg_001" }
        },
        secondary: {
          label: "Reply",
          action: "compose_reply",
          params: { messageId: "msg_001", recipient: "Dr. Amina Hassan" }
        }
      }
    },
    {
      id: "5",
      type: "opportunity",
      title: "Google Software Engineer Position",
      description: "New opportunity matching your profile: Senior Software Engineer at Google. Remote position with competitive benefits package and growth opportunities.",
      timestamp: "2 days ago",
      read: false,
      category: "Opportunities",
      relatedId: "opp_google_001",
      relatedType: "opportunity",
      metadata: {
        company: "Google",
        location: "Remote",
        deadline: "2024-03-15",
        priority: "high"
      },
      actions: {
        primary: {
          label: "View Opportunity",
          action: "navigate_opportunity",
          params: { opportunityId: "opp_google_001" }
        },
        secondary: {
          label: "Apply Now",
          action: "apply_opportunity",
          params: { opportunityId: "opp_google_001" }
        }
      }
    },
    {
      id: "6",
      type: "project",
      title: "AI Research Collaboration",
      description: "Project milestone completed! The team has finished the data collection phase ahead of schedule.",
      timestamp: "3 days ago",
      read: true,
      category: "Project Updates",
      relatedId: "proj_ai_001",
      relatedType: "project",
      metadata: {
        participants: 5,
        progress: 45,
        tasksCompleted: 9,
        totalTasks: 20,
        location: "Remote",
        priority: "medium",
        status: "Milestone Completed"
      },
      actions: {
        primary: {
          label: "View Project",
          action: "navigate_project",
          params: { projectId: "proj_ai_001" }
        },
        secondary: {
          label: "Join Workspace",
          action: "navigate_workroom",
          params: { projectId: "proj_ai_001" }
        }
      }
    },
    {
      id: "7",
      type: "project",
      title: "Community Development Initiative",
      description: "New project invitation: Join the Community Development Initiative focused on improving educational resources in rural areas.",
      timestamp: "4 days ago",
      read: false,
      actionRequired: true,
      category: "Project Invitations",
      relatedId: "proj_community_003",
      relatedType: "project",
      metadata: {
        participants: 15,
        progress: 30,
        tasksCompleted: 6,
        totalTasks: 20,
        location: "Multiple Locations",
        priority: "medium",
        status: "Recruiting"
      },
      actions: {
        primary: {
          label: "Accept Invitation",
          action: "accept_project_invitation",
          params: { projectId: "proj_community_003" }
        },
        secondary: {
          label: "View Details",
          action: "navigate_project",
          params: { projectId: "proj_community_003" }
        }
      }
    },
    {
      id: "8",
      type: "system",
      title: "Profile Verification Complete",
      description: "Your University of Lagos alumni status has been verified successfully. You now have access to all platform features.",
      timestamp: "5 days ago",
      read: true,
      category: "System",
      metadata: {
        priority: "low",
        status: "Completed"
      },
      actions: {
        primary: {
          label: "View Profile",
          action: "navigate_profile",
          params: {}
        }
      }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'action-required') return notification.actionRequired;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success("Notification deleted");
  };

  const handleViewDetails = (notification: Notification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  const handleTakeAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actions?.primary) {
      handleAction(notification.actions.primary.action, notification.actions.primary.params);
    }
  };

  const handleAction = (action: string, params?: any) => {
    switch (action) {
      case 'navigate_project':
        if (params?.projectId) {
          navigateToSpecificProject(params.projectId, {
            source: 'notification',
            activeTab: params.tab
          });
        }
        break;
      
      case 'navigate_mentorship':
        navigate('Mentorship', params);
        break;
      
      case 'navigate_opportunity':
        if (params?.opportunityId) {
          navigateToSpecificOpportunity(params.opportunityId, {
            source: 'notification',
            showDetails: true
          });
        }
        break;
      
      case 'navigate_workroom':
        if (params?.projectId) {
          navigateToWorkroom(params.projectId);
        }
        break;
      
      case 'navigate_messages':
        navigate('Messages', params);
        break;
      
      case 'navigate_profile':
        navigate('Profile', params);
        break;
      
      case 'apply_opportunity':
        if (params?.opportunityId) {
          navigateToSpecificOpportunity(params.opportunityId, {
            source: 'notification',
            focusApplication: true
          });
        }
        break;
      
      case 'accept_project_invitation':
        toast.success("Project invitation accepted! Redirecting to project...");
        if (params?.projectId) {
          setTimeout(() => {
            navigateToSpecificProject(params.projectId, {
              source: 'notification',
              newMember: true
            });
          }, 1000);
        }
        break;
      
      case 'compose_reply':
        toast.success("Message composer opened");
        break;
      
      default:
        toast.info(`Action: ${action}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case 'mentorship':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-600" />;
      case 'opportunity':
        return <Target className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  return (
    <div className="h-full">
      <DashboardHeader 
        userName="John" 
        userTitle="Stay updated with your notifications"
      />
      
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Stay up to date with project updates, messages, and system notifications
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <span>All</span>
              <Badge variant="secondary" className="text-xs">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center space-x-2">
              <span>Unread</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action-required" className="flex items-center space-x-2">
              <span>Action Required</span>
              {actionRequiredCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {actionRequiredCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">
                    {filter === 'unread' && "You're all caught up! No unread notifications."}
                    {filter === 'action-required' && "No actions required at this time."}
                    {filter === 'all' && "You don't have any notifications yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                                {notification.actionRequired && (
                                  <Badge variant="destructive" className="text-xs">
                                    Action Required
                                  </Badge>
                                )}
                                {notification.metadata?.priority === 'high' && (
                                  <Badge className="bg-red-600 text-white text-xs">
                                    High Priority
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notification.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{notification.timestamp}</span>
                                <span>•</span>
                                <span>{notification.category}</span>
                                {notification.metadata?.company && (
                                  <>
                                    <span>•</span>
                                    <span>{notification.metadata.company}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Action Buttons for notifications */}
                          <div className="mt-3 flex space-x-2">
                            {notification.actionRequired && notification.actions?.primary && (
                              <Button 
                                size="sm" 
                                className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTakeAction(notification);
                                }}
                              >
                                {notification.actions.primary.label}
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(notification);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            {notification.actions?.secondary && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction(notification.actions!.secondary!.action, notification.actions!.secondary!.params);
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {notification.actions.secondary.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Notification Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <CardDescription>
              Manage your notification preferences by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Project Updates</p>
                    <p className="text-xs text-gray-500">Progress, milestones, and team updates</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Mentorship</p>
                    <p className="text-xs text-gray-500">Requests and session updates</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Opportunities</p>
                    <p className="text-xs text-gray-500">New opportunities matching your profile</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Messages</p>
                    <p className="text-xs text-gray-500">Direct messages and replies</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserPlus className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-sm">Project Invitations</p>
                    <p className="text-xs text-gray-500">Invitations to join projects</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">System</p>
                    <p className="text-xs text-gray-500">Account and security updates</p>
                  </div>
                </div>
                <Badge variant="secondary">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        onAction={handleAction}
      />
    </div>
  );
}
