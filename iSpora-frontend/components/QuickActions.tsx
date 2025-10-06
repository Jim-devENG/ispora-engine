import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, MessageSquare, School, DollarSign, ArrowRight, Folder } from 'lucide-react';
import { AlmaMaterConnection } from './AlmaMaterConnection';
import { MentorshipRequests } from './MentorshipRequests';
import { useNavigation } from './NavigationContext';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  onAction: () => void;
  badgeCount?: number;
}

function ActionCard({
  title,
  description,
  icon,
  iconColor,
  onAction,
  badgeCount,
}: ActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer relative" onClick={onAction}>
      {badgeCount && badgeCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 p-0 text-xs flex items-center justify-center rounded-full"
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </Badge>
      )}
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div
            className={`h-8 w-8 rounded-full bg-opacity-10 flex items-center justify-center ${iconColor}`}
          >
            {icon}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          {badgeCount && badgeCount > 0 ? `Review ${badgeCount} requests` : 'Get Started'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function QuickActions() {
  const [isAlmaMaterOpen, setIsAlmaMaterOpen] = useState(false);
  const [isMentorshipOpen, setIsMentorshipOpen] = useState(false);
  const { navigate, navigateToWorkroom } = useNavigation();

  // Mock data for pending mentorship requests count
  const pendingMentorshipRequests = 3;

  const actions = [
    {
      title: 'Create or Join a New Project',
      description: 'Explore opportunities by field/region',
      icon: <Plus className="h-4 w-4" />,
      iconColor: 'text-green-600 bg-green-100',
      onAction: () => navigate('Projects'),
    },
    {
      title: 'My Projects',
      description: 'View and manage your created projects',
      icon: <Folder className="h-4 w-4" />,
      iconColor: 'text-indigo-600 bg-indigo-100',
      onAction: () => navigate('My Projects'),
    },
    {
      title: 'Respond to Mentorship Requests',
      description: 'Review open student/innovator requests',
      icon: <MessageSquare className="h-4 w-4" />,
      iconColor: 'text-blue-600 bg-blue-100',
      badgeCount: pendingMentorshipRequests,
      onAction: () =>
        navigateToWorkroom(undefined, {
          openWorkspacePanel: true,
          activeTab: 'requests',
        }),
    },
    {
      title: 'Connect to My Alma Mater',
      description: 'Link to your university & create campaigns',
      icon: <School className="h-4 w-4" />,
      iconColor: 'text-purple-600 bg-purple-100',
      onAction: () => setIsAlmaMaterOpen(true),
    },
    {
      title: 'Sponsor or Fund Initiatives',
      description: 'Micro-invest or create a Circle Grant',
      icon: <DollarSign className="h-4 w-4" />,
      iconColor: 'text-orange-600 bg-orange-100',
      onAction: () => navigate('Sponsor Initiatives'),
    },
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action, index) => (
          <ActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            iconColor={action.iconColor}
            onAction={action.onAction}
            badgeCount={action.badgeCount}
          />
        ))}
      </div>

      <AlmaMaterConnection isOpen={isAlmaMaterOpen} onClose={() => setIsAlmaMaterOpen(false)} />

      <MentorshipRequests isOpen={isMentorshipOpen} onClose={() => setIsMentorshipOpen(false)} />
    </>
  );
}
