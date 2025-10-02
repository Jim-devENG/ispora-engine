import React, { useState, useEffect } from "react";
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
  BarChart3,
  Loader,
  RefreshCw
} from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { useNavigation } from "./NavigationContext";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    actionRequired: 0
  });

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/notifications?filter=${filter}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setStats(data.data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount and when filter changes
  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const filteredNotifications = (notifications || []).filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'action-required') return notification.actionRequired;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setStats(prev => ({ ...prev, unread: 0 }));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        setStats(prev => ({ 
          ...prev, 
          total: prev.total - 1,
          unread: prev.unread - (notifications.find(n => n.id === id && !n.read) ? 1 : 0)
        }));
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
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

  const unreadCount = stats.unread;
  const actionRequiredCount = stats.actionRequired;

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
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Loader className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading notifications...</h3>
                  <p className="text-gray-500">Please wait while we fetch your notifications</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load notifications</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <Button onClick={fetchNotifications} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
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
