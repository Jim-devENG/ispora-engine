import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Video,
  FileText,
  Award,
  ChevronRight,
  Settings,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface Notification {
  id: string;
  type: 'session' | 'task' | 'message' | 'submission' | 'certificate' | 'reminder';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  relatedMentee?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'session' | 'task_due' | 'submission_due' | 'review';
  date: Date;
  duration?: number;
  mentee: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
}

interface NotificationsPanelProps {
  mentee?: Mentee; // Made optional with default fallback
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'session',
    title: 'Session starting in 30 minutes',
    description: 'AI/ML Career Discussion with Amara Okafor',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    priority: 'high',
    relatedMentee: 'Amara Okafor',
  },
  {
    id: '2',
    type: 'submission',
    title: 'New submission received',
    description: 'Portfolio website submitted by David Mensah',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    relatedMentee: 'David Mensah',
  },
  {
    id: '3',
    type: 'task',
    title: 'Task completed',
    description: 'Machine Learning Project marked as done',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    relatedMentee: 'Fatima Al-Rashid',
  },
  {
    id: '4',
    type: 'message',
    title: 'New message received',
    description: 'Voice note about feature engineering approach',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    relatedMentee: 'Amara Okafor',
  },
  {
    id: '5',
    type: 'certificate',
    title: 'Certificate ready for review',
    description: 'Machine Learning Fundamentals certificate is ready to issue',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: true,
    priority: 'medium',
    relatedMentee: 'Fatima Al-Rashid',
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Weekly check-in due',
    description: 'Time for your weekly progress review with Emma Thompson',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    relatedMentee: 'Emma Thompson',
  },
  {
    id: '7',
    type: 'session',
    title: 'Session completed successfully',
    description: 'Data Science Fundamentals session with John Smith',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    relatedMentee: 'John Smith',
  },
];

const notificationIcons = {
  session: Video,
  task: CheckCircle,
  message: MessageSquare,
  submission: FileText,
  certificate: Award,
  reminder: Clock,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

function NotificationCard({
  notification,
  onMarkRead,
  onAction,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onAction: (notification: Notification) => void;
}) {
  const Icon = notificationIcons[notification.type];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card
      className={`transition-all hover:shadow-md cursor-pointer ${
        !notification.isRead ? 'border-l-4 border-l-[#021ff6] bg-blue-50/30' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}
          >
            <Icon
              className={`h-4 w-4 ${notification.isRead ? 'text-gray-600' : 'text-blue-600'}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4
                  className={`text-sm ${notification.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}
                >
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                {notification.relatedMentee && (
                  <p className="text-xs text-blue-600 mt-1">• {notification.relatedMentee}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-2">
                <Badge className={`${priorityColors[notification.priority]} text-xs`}>
                  {notification.priority}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => onAction(notification)}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkRead(notification.id)}
                  className="text-xs"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationsPanel({ mentee }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  // Provide default fallback for mentee
  const defaultMentee: Mentee = {
    id: 'default',
    name: 'Project Workspace',
    avatar: undefined,
  };

  const currentMentee = mentee || defaultMentee;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationAction = (notification: Notification) => {
    console.log('Handle notification action:', notification);
    // Navigate to relevant section based on notification type
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Notifications</h3>
            <p className="text-gray-600 text-sm">Stay updated with {currentMentee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount} new</Badge>}
          </div>
        </div>

        {/* Filter Controls - Also fixed */}
        <div className="flex items-center justify-between">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="h-8">
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {filter === 'unread' ? 'All caught up!' : 'Check back later for updates'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onAction={handleNotificationAction}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
