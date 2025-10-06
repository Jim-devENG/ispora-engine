import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ProfilePage } from './ProfilePage';
import { SettingsPage } from './SettingsPage';
import { NotificationsPage } from './NotificationsPage';
import { BillingPage } from './BillingPage';
import { SecurityPage } from './SecurityPage';
import { HelpSupportPage } from './HelpSupportPage';
import { CampaignDetail } from './CampaignDetail';
import { CreateCampaign } from './CreateCampaign';
import { MentorshipWorkspace } from './MentorshipWorkspace';
import { ProjectWorkspace } from './ProjectWorkspace';
import { ProjectDashboard } from './ProjectDashboard';
import { ProjectDetail } from './ProjectDetail';
import { CreateProject } from './CreateProject';
import { MyProjects } from './MyProjects';
import { OpportunitiesPage } from './OpportunitiesPage';
import { AdminDashboard } from './AdminDashboard';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { ThemeProvider } from './ThemeProvider';
import { SessionNotifications } from './SessionNotifications';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Toaster } from './ui/sonner';
import { MobileNavigation } from '../src/components/MobileNavigation';
import { MobileBottomNav } from '../src/components/MobileBottomNav';
import { MobileViewport } from '../src/components/MobileViewport';
import { useMobile } from '../src/hooks/useMobile';

function MainContent() {
  const { currentPage, setCurrentPage, selectedProject } = useNavigation();

  // Handle campaign navigation from mentorship workspace
  const handleNavigateToCampaign = (campaignId: string) => {
    // You could store the campaignId in context or pass it differently
    // For now, just navigate to campaign detail
    setCurrentPage('Campaign Detail');
  };

  const handleCreateCampaign = () => {
    setCurrentPage('Create Campaign');
  };

  const handleCreateProject = () => {
    setCurrentPage('Create Project');
  };

  const handleViewProject = (projectId: string) => {
    // Store projectId in context or URL params
    setCurrentPage('Project Detail');
  };

  const handleJoinProject = (projectId: string, role: string, area: string) => {
    // Navigate to appropriate area based on role and project type
    console.log('Joining project:', { projectId, role, area });

    switch (area) {
      case 'mentorship':
      case 'workroom':
        setCurrentPage('Workroom');
        break;
      case 'work-opportunities':
        setCurrentPage('Impact Feed'); // Navigate to Impact Feed for work opportunities
        break;
      case 'research':
        setCurrentPage('Project Dashboard'); // Navigate to Project Dashboard for research
        break;
      case 'community':
        setCurrentPage('Impact Feed'); // Navigate to Impact Feed for community
        break;
      case 'partnerships':
        setCurrentPage('Impact Feed'); // Navigate to Impact Feed for partnerships
        break;
      case 'campaigns':
        setCurrentPage('Impact Feed'); // Navigate to Impact Feed for campaigns
        break;
      default:
        setCurrentPage('Project Dashboard');
    }
  };

  switch (currentPage) {
    case 'Profile':
      return <ProfilePage />;
    case 'Settings':
      return <SettingsPage />;
    case 'Notifications':
      return <NotificationsPage />;
    case 'Billing':
      return <BillingPage />;
    case 'Security':
      return <SecurityPage />;
    case 'Help & Support':
      return <HelpSupportPage />;
    case 'Campaign Detail':
      return <CampaignDetail />;
    case 'Create Campaign':
      return <CreateCampaign />;
    case 'My Projects':
      return <MyProjects />;
    case 'Workroom':
      return (
        <ProjectWorkspace
          onNavigateToCampaign={handleNavigateToCampaign}
          onCreateCampaign={handleCreateCampaign}
          onBackToProjects={() => setCurrentPage('Project Dashboard')}
          initialProjectId={selectedProject?.id}
        />
      );
    case 'Mentorship':
    case 'Mentorship Workspace':
      return (
        <MentorshipWorkspace
          onNavigateToCampaign={handleNavigateToCampaign}
          onCreateCampaign={handleCreateCampaign}
        />
      );
    case 'Projects':
    case 'Project Dashboard':
      return (
        <ProjectDashboard onCreateProject={handleCreateProject} onViewProject={handleViewProject} />
      );
    case 'Project Detail':
      return (
        <ProjectDetail
          projectId="1"
          onBack={() => setCurrentPage('Project Dashboard')}
          onJoinProject={handleJoinProject}
        />
      );
    case 'Create Project':
      return (
        <CreateProject
          onBack={() => setCurrentPage('Project Dashboard')}
          onSave={async (projectData) => {
            // Map frontend fields to backend expectations
            const payload = {
              id: undefined, // backend generates
              title: projectData.title,
              description: projectData.description,
              type: projectData.projectType || projectData.category || 'collaboration',
              tags: (projectData.tags || []).join(','),
              status: projectData.status || 'active',
              is_public: projectData.isPublic === undefined ? true : !!projectData.isPublic,
              mentorship_connection: !!projectData.mentorshipConnection,
              start_date: projectData.startDate || null,
              end_date: projectData.endDate || null,
              priority: projectData.priority || 'medium',
              university: projectData.university || null,
              objectives: JSON.stringify(projectData.objectives || []),
              team_members: JSON.stringify(projectData.teamMembers || []),
              diaspora_positions: JSON.stringify(projectData.diasporaPositions || []),
              created_at: undefined, // backend sets
              updated_at: undefined, // backend sets
            };

            try {
              const headers: Record<string, string> = { 'Content-Type': 'application/json' };
              const devKey = localStorage.getItem('devKey');
              const token = localStorage.getItem('token');
              if (devKey) headers['X-Dev-Key'] = devKey;
              if (token) headers['Authorization'] = `Bearer ${token}`;

              const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
              const response = await fetch(`${apiBase}/projects`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
              });

              if (response.ok) {
                // success toast
                try { (await import('./ui/sonner')).toast.success('Project created successfully'); } catch {}
                setCurrentPage('Project Dashboard');
              } else {
                const text = await response.text();
                console.error('Failed to save project:', text);
                try { (await import('./ui/sonner')).toast.error('Failed to create project'); } catch {}
              }
            } catch (error) {
              console.error('Error saving project:', error);
              try { (await import('./ui/sonner')).toast.error('Network error creating project'); } catch {}
            }
          }}
        />
      );
    case 'Opportunities':
      return <OpportunitiesPage />;
    case 'Admin Dashboard':
      return <AdminDashboard />;
    case 'Impact Feed':
    case 'Dashboard':
    default:
      return <Dashboard />;
  }
}

function LayoutContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isMobile } = useMobile();
  const { currentPage, setCurrentPage } = useNavigation();

  // Define workroom pages that should have collapsed sidebar
  const workroomPages = ['Workroom', 'Mentorship', 'Mentorship Workspace'];

  // Keep sidebar open in Workroom on desktop
  useEffect(() => {
    if (!isMobile && workroomPages.includes(currentPage)) {
      setIsSidebarCollapsed(false);
    }
  }, [currentPage, isMobile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + B to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        if (!isMobile) {
          setIsSidebarCollapsed(!isSidebarCollapsed);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed, isMobile]);

  const sidebarWidth = isSidebarCollapsed ? 60 : 220;

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <MobileViewport>
      <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden relative">
        {/* Modern Background Pattern */}
        <div className="absolute inset-0 bg-pattern opacity-20"></div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className="flex-shrink-0 transition-all duration-300 ease-in-out z-10 relative"
          style={{ width: `${sidebarWidth}px` }}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleToggleSidebar}
          />
        </div>
      )}

      {/* Sidebar Toggle Button - Positioned on the dividing line */}
      {!isMobile && (
        <div
          className="absolute top-1/2 z-10 transform -translate-y-1/2 transition-all duration-300 ease-in-out"
          style={{ left: `${sidebarWidth - 12}px` }}
        >
          <Tooltip>
            <TooltipTrigger>
              <button
                onClick={handleToggleSidebar}
                className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md text-gray-600 hover:text-[#021ff6] h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                ) : (
                  <ChevronLeft className="h-3 w-3 transition-transform duration-200" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              <span className="text-xs text-muted-foreground ml-2">Ctrl+B</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Main Content - Fixed the scrolling issue here */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative modern-scrollbar scrollbar-beautiful">
        <div className="animate-fade-in bg-white/80 backdrop-blur-sm min-h-full">
          <MainContent />
        </div>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav 
            currentPage={currentPage} 
            onNavigate={setCurrentPage} 
          />
        )}
      </div>
      </div>
    </MobileViewport>
  );
}

export function Layout() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <LayoutContent />

        {/* Session Notifications Handler */}
        <SessionNotifications />

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </NavigationProvider>
    </ThemeProvider>
  );
}
