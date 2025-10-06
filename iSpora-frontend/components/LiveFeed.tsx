import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, FolderOpen, Users, Star, Clock } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'project' | 'mentorship' | 'credits' | 'general';
  message: string;
  timestamp: string;
  isUnread: boolean;
}

function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'project':
      return <FolderOpen className="h-4 w-4 text-green-600" />;
    case 'mentorship':
      return <Users className="h-4 w-4 text-blue-600" />;
    case 'credits':
      return <Star className="h-4 w-4 text-yellow-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
        notification.isUnread ? 'bg-blue-50 dark:bg-blue-950/20' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{notification.message}</p>
        <div className="flex items-center mt-1 space-x-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {notification.timestamp}
          </div>
          {notification.isUnread && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              New
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveFeed() {
  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'project',
      message: 'Stanford University posted a new Aspora project',
      timestamp: '2 minutes ago',
      isUnread: true,
    },
    {
      id: '2',
      type: 'mentorship',
      message: 'Samuel requested mentorship in biotech',
      timestamp: '15 minutes ago',
      isUnread: true,
    },
    {
      id: '3',
      type: 'credits',
      message: 'You earned 20 credits for completing a session',
      timestamp: '1 hour ago',
      isUnread: false,
    },
    {
      id: '4',
      type: 'project',
      message: 'Your project "Climate Solutions Lab" received 3 new collaborators',
      timestamp: '2 hours ago',
      isUnread: false,
    },
    {
      id: '5',
      type: 'mentorship',
      message: 'Maria completed her mentorship session with you',
      timestamp: '4 hours ago',
      isUnread: false,
    },
    {
      id: '6',
      type: 'general',
      message: 'New curriculum lab available: "Sustainable Engineering Practices"',
      timestamp: '6 hours ago',
      isUnread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-lg">Live Feed</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
