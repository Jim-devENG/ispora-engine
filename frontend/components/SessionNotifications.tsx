import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Radio, Clock, Bell, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface SessionNotification {
  id: string;
  type: 'starting_soon' | 'live_now' | 'ending_soon' | 'reminder';
  sessionId: string;
  sessionTitle: string;
  message: string;
  timeRemaining?: number; // in minutes
  actionLabel?: string;
  onAction?: () => void;
}

// Mock notifications - in real app this would come from your notification system
const mockNotifications: SessionNotification[] = [
  {
    id: "1",
    type: "starting_soon",
    sessionId: "3",
    sessionTitle: "Research Collaboration Meetup",
    message: "Event starting in 10 mins",
    timeRemaining: 10,
    actionLabel: "Join Now",
    onAction: () => console.log("Joining session")
  }
];

export function SessionNotifications() {
  const [notifications] = useState<SessionNotification[]>(mockNotifications);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for notifications every minute
    const interval = setInterval(() => {
      notifications.forEach(notification => {
        if (!shownNotifications.has(notification.id)) {
          showNotification(notification);
          setShownNotifications(prev => new Set(prev).add(notification.id));
        }
      });
    }, 60000); // Check every minute

    // Also check immediately on mount
    notifications.forEach(notification => {
      if (!shownNotifications.has(notification.id)) {
        showNotification(notification);
        setShownNotifications(prev => new Set(prev).add(notification.id));
      }
    });

    return () => clearInterval(interval);
  }, [notifications, shownNotifications]);

  const showNotification = (notification: SessionNotification) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'starting_soon':
          return <Clock className="h-4 w-4 text-orange-500" />;
        case 'live_now':
          return <Radio className="h-4 w-4 text-red-500" />;
        case 'ending_soon':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        default:
          return <Bell className="h-4 w-4 text-blue-500" />;
      }
    };

    const getToastVariant = (): "default" | "destructive" => {
      switch (notification.type) {
        case 'live_now':
        case 'starting_soon':
          return "default";
        default:
          return "default";
      }
    };

    toast(notification.message, {
      description: `"${notification.sessionTitle}"`,
      icon: getIcon(),
      action: notification.onAction ? {
        label: notification.actionLabel || "View",
        onClick: notification.onAction,
      } : undefined,
      duration: notification.type === 'live_now' ? 10000 : 8000, // Live sessions get longer display
      className: notification.type === 'live_now' ? 'border-red-200 bg-red-50' : undefined,
    });
  };

  // This component doesn't render anything visible - it just handles notifications
  return null;
}

// Hook for managing session notifications throughout the app
export function useSessionNotifications() {
  const showSessionStartingSoon = (sessionTitle: string, timeRemaining: number, onJoin: () => void) => {
    toast(`Session starting in ${timeRemaining} mins`, {
      description: `"${sessionTitle}"`,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
      action: {
        label: "Join Now",
        onClick: onJoin,
      },
      duration: 10000,
      className: 'border-orange-200 bg-orange-50',
    });
  };

  const showSessionLive = (sessionTitle: string, onJoin: () => void) => {
    toast("Session is now live!", {
      description: `"${sessionTitle}"`,
      icon: <div className="flex items-center space-x-1">
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
        <Radio className="h-3 w-3 text-red-500" />
      </div>,
      action: {
        label: "Join Session",
        onClick: onJoin,
      },
      duration: 15000,
      className: 'border-red-200 bg-red-50',
    });
  };

  const showSessionEndingSoon = (sessionTitle: string, timeRemaining: number) => {
    toast(`Session ending in ${timeRemaining} mins`, {
      description: `"${sessionTitle}"`,
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      duration: 8000,
      className: 'border-yellow-200 bg-yellow-50',
    });
  };

  const showReminderSet = (sessionTitle: string) => {
    toast("Reminder set!", {
      description: `You'll be notified before "${sessionTitle}" starts`,
      icon: <Bell className="h-4 w-4 text-green-500" />,
      duration: 4000,
      className: 'border-green-200 bg-green-50',
    });
  };

  return {
    showSessionStartingSoon,
    showSessionLive,
    showSessionEndingSoon,
    showReminderSet,
  };
}