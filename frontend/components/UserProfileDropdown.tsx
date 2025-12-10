import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell,
  CreditCard,
  Shield,
  ChevronDown
} from "lucide-react";
import { useNavigation } from "./NavigationContext";
import { useAuth } from "./AuthContext";

interface UserProfileDropdownProps {
  isCollapsed?: boolean;
}

export function UserProfileDropdown({ isCollapsed = false }: UserProfileDropdownProps) {
  const { navigate } = useNavigation();
  const { logout, user } = useAuth();

  const handleMenuAction = async (action: string) => {
    switch (action) {
      case 'profile':
        navigate('Profile');
        break;
      case 'settings':
        navigate('Settings');
        break;
      case 'notifications':
        navigate('Notifications');
        break;
      case 'billing':
        navigate('Billing');
        break;
      case 'security':
        navigate('Security');
        break;
      case 'help':
        navigate('Help & Support');
        break;
      case 'logout':
        if (confirm('Are you sure you want to log out?')) {
          await logout();
          // AuthContext will handle the redirect
        }
        break;
      default:
        console.log(`Unknown action: ${action}`);
        break;
    }
  };

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <div className="flex justify-center">
                <button className="relative h-8 w-8 p-0 hover:bg-[#021ff6]/10 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95">
                  <Avatar className="h-7 w-7 transition-all duration-200 ring-2 ring-transparent hover:ring-[#021ff6]/20">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback className="bg-[#021ff6] text-white text-xs font-medium transition-all duration-200">JD</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-gray-600 bg-white rounded-full p-0.5 border border-gray-200 shadow-sm" />
                </button>
              </div>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <span className="text-xs">John Doe • john.doe@aspora.co</span>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent 
          className="w-72 animate-in slide-in-from-left-2 shadow-2xl border-0 bg-white backdrop-blur-sm rounded-xl overflow-hidden" 
          align="start" 
          side="right"
          sideOffset={12}
        >
          {/* User Info Header */}
          <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-[#021ff6]/10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback className="bg-[#021ff6] text-white font-semibold">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 text-sm">John Doe</p>
                <p className="text-xs text-gray-500">john.doe@aspora.co</p>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="p-2">
            <DropdownMenuItem 
              onClick={() => handleMenuAction('profile')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
            >
              <User className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('settings')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('notifications')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
            >
              <Bell className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Notifications</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('billing')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
            >
              <CreditCard className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Billing</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('security')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-3"
            >
              <Shield className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Security</span>
            </DropdownMenuItem>
            
            {/* Separator */}
            <div className="h-px bg-gray-200 my-2"></div>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('help')} 
              className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-3"
            >
              <HelpCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Help & Support</span>
            </DropdownMenuItem>
            
            {/* Separator */}
            <div className="h-px bg-gray-200 my-2"></div>
            
            <DropdownMenuItem 
              onClick={() => handleMenuAction('logout')} 
              className="cursor-pointer transition-all duration-200 hover:bg-red-50 rounded-lg p-3 focus:bg-red-50 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
              <span className="text-sm font-medium text-red-600 group-hover:text-red-700">Log out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-3 p-3 w-full hover:bg-[#021ff6]/10 rounded-xl transition-all duration-200 group transform hover:scale-[1.01] active:scale-[0.99] border border-transparent hover:border-[#021ff6]/10">
          <Avatar className="h-9 w-9 transition-all duration-200 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-[#021ff6]/20">
            <AvatarImage src="/api/placeholder/40/40" />
            <AvatarFallback className="bg-[#021ff6] text-white text-sm font-semibold transition-all duration-200">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#021ff6] truncate transition-all duration-200">John Doe</p>
            <p className="text-xs text-gray-500 truncate transition-all duration-200">john.doe@aspora.co</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#021ff6] transition-all duration-200 transform group-hover:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 animate-in slide-in-from-left-2 shadow-2xl border-0 bg-white backdrop-blur-sm rounded-xl overflow-hidden" 
        align="start" 
        side="right"
        sideOffset={12}
      >
        {/* User Info Header */}
        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-[#021ff6]/10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback className="bg-[#021ff6] text-white font-semibold">JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 text-sm">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@aspora.co</p>
            </div>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="p-2">
          <DropdownMenuItem 
            onClick={() => handleMenuAction('profile')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
          >
            <User className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('settings')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('notifications')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
          >
            <Bell className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Notifications</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('billing')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-1"
          >
            <CreditCard className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Billing</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('security')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-3"
          >
            <Shield className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Security</span>
          </DropdownMenuItem>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 my-2"></div>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('help')} 
            className="cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-3 focus:bg-gray-50 group mb-3"
          >
            <HelpCircle className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#021ff6] transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Help & Support</span>
          </DropdownMenuItem>
          
          {/* Separator */}
          <div className="h-px bg-gray-200 my-2"></div>
          
          <DropdownMenuItem 
            onClick={() => handleMenuAction('logout')} 
            className="cursor-pointer transition-all duration-200 hover:bg-red-50 rounded-lg p-3 focus:bg-red-50 group"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
            <span className="text-sm font-medium text-red-600 group-hover:text-red-700">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}