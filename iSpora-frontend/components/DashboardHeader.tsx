import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { LiveSessionsWidget } from './LiveSessionsWidget';
import { ThemeToggle } from './ui/theme-toggle';

interface DashboardHeaderProps {
  userName?: string;
  userTitle?: string;
}

const NotificationButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="relative p-2 text-gray-600 hover:text-[#021ff6] hover:bg-[#021ff6]/10 rounded-lg transition-all duration-200 transform hover:scale-105"
      {...props}
    >
      <Bell className="h-5 w-5" />
      {/* Notification badge */}
      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-[10px] text-white font-bold">3</span>
      </div>
    </button>
  );
});

NotificationButton.displayName = 'NotificationButton';

export function DashboardHeader({
  userName = 'Dr. Amina',
  userTitle = 'Ready to make an impact today?',
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <TooltipProvider>
      <div className="modern-header sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Welcome back, {userName}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-medium">{userTitle}</p>
            </div>

            {/* Right Section: Live Sessions Widget, Search Bar, Notifications */}
            <div className="flex items-center space-x-4">
              {/* Live Sessions Widget */}
              <LiveSessionsWidget />

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search projects, mentees, sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="modern-input pl-12 pr-10 w-96 h-12 bg-background/50 border-border focus:bg-background focus:border-primary focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Theme Toggle and Notifications */}
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NotificationButton />
                  </TooltipTrigger>
                  <TooltipContent>You have 3 new notifications</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
