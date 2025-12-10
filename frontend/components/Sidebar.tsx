import React, { useEffect, useState } from "react";
import { 
  Home, 
  Users, 
  FolderOpen, 
  Star, 
  Settings, 
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Target,
  UserCheck
} from "lucide-react";
import { useNavigation } from "./NavigationContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { AccountSwitcher } from "./AccountSwitcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { IsporaLogo } from "./AsporaLogo";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, description, isActive = false, isCollapsed = false, onClick }: SidebarItemProps) {
  const buttonContent = (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-2 py-2 text-left rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 sidebar-item-hover btn-hover-lift ${
        isActive 
          ? 'bg-[#021ff6] text-white shadow-lg shadow-[#021ff6]/20' 
          : 'text-gray-700 hover:bg-[#007AFF]/20 hover:text-[#021ff6] hover:shadow-sm'
      } ${isCollapsed ? 'justify-center px-1' : ''}`}
    >
      <div className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="text-sm ml-2 truncate font-medium transition-all duration-200">{label}</span>
      )}
    </button>
  );

  if (isCollapsed || description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="tooltip-enhanced">
          {description ? (
            <span className="text-xs">{description}</span>
          ) : (
            <span className="text-xs">{label}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { activeItem, navigate } = useNavigation();

  const mainNavItems = [
    { 
      icon: <Home className="h-4 w-4" />, 
      label: "Impact Feed",
      description: "View latest activities, updates, and feed from your network"
    },
    { 
      icon: <FolderOpen className="h-4 w-4" />, 
      label: "Projects",
      description: "Manage your projects, create new ones, and track progress"
    },
    { 
      icon: <Users className="h-4 w-4" />, 
      label: "Workroom",
      description: "Collaborative workspace for active project sessions"
    },
    { 
      icon: <Target className="h-4 w-4" />, 
      label: "Opportunities",
      description: "Discover new opportunities and programs to join"
    },
    { 
      icon: <UserCheck className="h-4 w-4" />, 
      label: "My Network",
      description: "Connect with diaspora professionals and expand your network"
    },
    { 
      icon: <Star className="h-4 w-4" />, 
      label: "Credits",
      description: "View your achievements, points, and recognition"
    },
    { 
      icon: <Bell className="h-4 w-4" />, 
      label: "Notifications",
      description: "Stay updated with important alerts and messages"
    },
  ];

  const bottomNavItems = [
    { 
      icon: <Settings className="h-4 w-4" />, 
      label: "Settings",
      description: "Customize your preferences and account settings"
    },
  ];

  return (
    <div className="h-full flex flex-col transition-all duration-300 ease-in-out backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
      {/* Header with Logo and Platform Name */}
      <div className={`border-b border-gray-200/50 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed ? (
          /* Expanded Header Layout */
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 cursor-pointer bg-transparent border-none p-0 m-0 w-full text-left">
                <IsporaLogo size="default" className="transition-all duration-200 hover:scale-110" />
                <span className="font-bold text-gray-800 text-lg tracking-tight">iSpora</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="tooltip-enhanced">
              <span className="text-xs">Connecting diaspora professionals with youth back home</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          /* Collapsed Header Layout - Centered like user profile */
          <div className="flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="transition-all duration-300 transform hover:scale-105 bg-transparent border-none p-0 m-0">
                  <IsporaLogo size="default" className="transition-all duration-200 hover:scale-110" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="tooltip-enhanced">
                <span className="text-xs">Connecting diaspora professionals with youth back home</span>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        <UserProfileDropdown isCollapsed={isCollapsed} />
      </div>

      {/* Account Switcher */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <AccountSwitcher showInHeader={true} />
        </div>
      )}

      {/* Separator between User Profile and Navigation */}
      <div className="px-3">
        <div className="h-px bg-gray-300/60 w-full"></div>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 py-3 transition-all duration-300 ${isCollapsed ? 'px-1' : 'px-2'}`}>
        <div className="space-y-1">
          {mainNavItems.map((item, index) => (
            <div
              key={index}
              className="transition-all duration-200"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <SidebarItem
                icon={item.icon}
                label={item.label}
                description={item.description}
                isActive={activeItem === item.label}
                isCollapsed={isCollapsed}
                onClick={() => navigate(item.label)}
              />
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className={`border-t border-gray-200/50 transition-all duration-300 ${isCollapsed ? 'p-1' : 'p-2'}`}>
        <div className="space-y-1">
          {bottomNavItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              description={item.description}
              isActive={activeItem === item.label}
              isCollapsed={isCollapsed}
              onClick={() => navigate(item.label)}
            />
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="mt-2 pt-2 border-t border-gray-200/50">
          <SidebarItem
            icon={<LogOut className="h-4 w-4" />}
            label="Sign Out"
            description="Sign out of your account safely"
            isCollapsed={isCollapsed}
            onClick={() => console.log('Signing out...')}
          />
        </div>
      </div>

      {/* Keyboard Shortcut Indicator */}
      {!isCollapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200/50 cursor-help bg-transparent border-none w-full">
              <div className="flex items-center justify-center space-x-1">
                <kbd className="kbd-style">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="kbd-style">
                  B
                </kbd>
                <span className="ml-1">to toggle</span>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent className="tooltip-enhanced">
            <span className="text-xs">Use Ctrl+B to quickly toggle the sidebar</span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}