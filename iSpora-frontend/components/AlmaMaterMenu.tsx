import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  School,
  Users,
  Target,
  Plus,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { AlmaMaterConnection } from './AlmaMaterConnection';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface AlmaMaterMenuProps {
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

// Mock data for connected universities and activities
const mockConnectedUniversities = [
  {
    id: '1',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    country: 'Nigeria',
    status: 'connected',
    activeCampaigns: 3,
    unreadUpdates: 2,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Makerere University',
    shortName: 'MAK',
    country: 'Uganda',
    status: 'campaign-creator',
    activeCampaigns: 1,
    unreadUpdates: 0,
    lastActivity: '1 day ago',
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'campaign',
    title: 'Engineering Mentorship Program',
    university: 'University of Lagos',
    action: 'New participant joined',
    timestamp: '1 hour ago',
    icon: <Users className="h-3 w-3" />,
  },
  {
    id: '2',
    type: 'funding',
    title: 'Startup Innovation Lab',
    university: 'Makerere University',
    action: 'Goal 74% reached',
    timestamp: '3 hours ago',
    icon: <TrendingUp className="h-3 w-3" />,
  },
];

const mockQuickStats = {
  totalUniversities: 2,
  activeCampaigns: 4,
  totalParticipants: 47,
  impactScore: 8.2,
};

export function AlmaMaterMenu({ isCollapsed, isActive, onClick }: AlmaMaterMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  const handleMainClick = () => {
    onClick();
    if (!isCollapsed) {
      setIsExpanded(!isExpanded);
    }
  };

  const mainButton = (
    <button
      onClick={handleMainClick}
      className={`flex items-center w-full px-2 py-2 text-left rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
        isActive
          ? 'bg-[#021ff6] text-white shadow-lg shadow-[#021ff6]/20'
          : 'text-gray-700 hover:bg-[#007AFF]/20 hover:text-[#021ff6] hover:shadow-sm'
      } ${isCollapsed ? 'justify-center px-1' : ''}`}
    >
      <div
        className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
      >
        <GraduationCap className="h-4 w-4" />
      </div>
      {!isCollapsed && (
        <>
          <span className="text-sm ml-2 truncate font-medium transition-all duration-200 flex-1">
            Alma Mater
          </span>
          <div className="flex items-center space-x-1">
            {mockConnectedUniversities.length > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {mockConnectedUniversities.length}
              </Badge>
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </>
      )}
    </button>
  );

  if (isCollapsed) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>{mainButton}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Alma Mater</span>
              </div>
              {mockConnectedUniversities.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <div>{mockConnectedUniversities.length} universities connected</div>
                  <div>{mockQuickStats.activeCampaigns} active campaigns</div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        <AlmaMaterConnection
          isOpen={showConnectionDialog}
          onClose={() => setShowConnectionDialog(false)}
        />
      </>
    );
  }

  return (
    <div>
      {mainButton}

      {/* Expanded Menu Content */}
      {isExpanded && !isCollapsed && (
        <div className="mt-2 ml-2 space-y-2 border-l-2 border-gray-200 pl-3">
          {/* Quick Stats */}
          <div className="bg-purple-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-800">Your Impact</span>
              <div className="flex items-center space-x-1">
                <Award className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700">
                  {mockQuickStats.impactScore}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-purple-700">
                  {mockQuickStats.totalUniversities}
                </div>
                <div className="text-purple-600">Universities</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-700">
                  {mockQuickStats.activeCampaigns}
                </div>
                <div className="text-purple-600">Campaigns</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-700">
                  {mockQuickStats.totalParticipants}
                </div>
                <div className="text-purple-600">Reached</div>
              </div>
            </div>
          </div>

          {/* Connected Universities */}
          {mockConnectedUniversities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Connected Universities</span>
                <button
                  onClick={() => setShowConnectionDialog(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>

              {mockConnectedUniversities.map((university) => (
                <div
                  key={university.id}
                  className="flex items-center justify-between p-2 bg-white rounded-md border hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <School className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {university.shortName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{university.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {university.unreadUpdates > 0 && (
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-4">
                        {university.unreadUpdates}
                      </Badge>
                    )}
                    <Badge
                      variant={university.status === 'campaign-creator' ? 'default' : 'secondary'}
                      className="text-xs px-1.5 py-0.5 h-4"
                    >
                      {university.activeCampaigns}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-2" />

          {/* Recent Activity */}
          {mockRecentActivities.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-600">Recent Activity</span>
              {mockRecentActivities.slice(0, 2).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-2 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-0.5">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {activity.title}
                    </div>
                    <div className="text-xs text-gray-600 truncate">{activity.action}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {activity.university} • {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator className="my-2" />

          {/* Quick Actions */}
          <div className="space-y-1">
            <button
              onClick={() => setShowConnectionDialog(true)}
              className="flex items-center w-full px-2 py-1.5 text-left rounded-md text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-3 w-3 mr-2" />
              Connect New University
            </button>

            <button className="flex items-center w-full px-2 py-1.5 text-left rounded-md text-xs hover:bg-green-50 hover:text-green-700 transition-colors">
              <Target className="h-3 w-3 mr-2" />
              Create Campaign
            </button>

            <button className="flex items-center w-full px-2 py-1.5 text-left rounded-md text-xs hover:bg-purple-50 hover:text-purple-700 transition-colors">
              <Users className="h-3 w-3 mr-2" />
              Find Alumni
            </button>
          </div>

          {/* Empty State */}
          {mockConnectedUniversities.length === 0 && (
            <div className="text-center py-4 space-y-2">
              <School className="h-8 w-8 text-gray-300 mx-auto" />
              <div className="text-xs text-gray-500">No universities connected yet</div>
              <button
                onClick={() => setShowConnectionDialog(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Connect to your alma mater
              </button>
            </div>
          )}
        </div>
      )}

      <AlmaMaterConnection
        isOpen={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
      />
    </div>
  );
}
