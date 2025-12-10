import React, { useState } from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { LiveSessionsWidget } from "./LiveSessionsWidget";

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

NotificationButton.displayName = "NotificationButton";

export function DashboardHeader({ 
  userName = "Dr. Amina", 
  userTitle = "Ready to make an impact today?" 
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <TooltipProvider>
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Welcome Message */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {userName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {userTitle}
              </p>
            </div>

            {/* Right Section: Live Sessions Widget, Search Bar, Notifications */}
            <div className="flex items-center space-x-4">
              {/* Live Sessions Widget */}
              <LiveSessionsWidget />

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects, mentees, sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#021ff6] transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NotificationButton />
                  </TooltipTrigger>
                  <TooltipContent>
                    You have 3 new notifications
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}