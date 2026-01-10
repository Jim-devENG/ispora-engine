import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { ProfilePage } from "./ProfilePage";
import { SettingsPage } from "./SettingsPage";
import { NotificationsPage } from "./NotificationsPage";
import { BillingPage } from "./BillingPage";
import { SecurityPage } from "./SecurityPage";
import { HelpSupportPage } from "./HelpSupportPage";
import { CampaignDetail } from "./CampaignDetail";
import { CreateCampaign } from "./CreateCampaign";
import { MentorshipWorkspace } from "./MentorshipWorkspace";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { ProjectDashboard } from "./ProjectDashboard";
import { ProjectDetail } from "./ProjectDetail";
import { CreateProject } from "./CreateProject";
import { MyProjects } from "./MyProjects";
import { OpportunitiesPage } from "./OpportunitiesPage";
import { NavigationProvider, useNavigation } from "./NavigationContext";
import { ThemeProvider } from "./ThemeProvider";
import { SessionNotifications } from "./SessionNotifications";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Toaster } from "./ui/sonner";

function MainContent() {
  const { currentPage, setCurrentPage, selectedProject, navigationParams } = useNavigation();
  
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

  const handleViewProject = async (projectId: string) => {
    if (!projectId || projectId.trim() === '') {
      console.error('No project ID provided to handleViewProject');
      return;
    }
    
    // Store projectId in navigation params first so it's available immediately
    setNavigationParams({ projectId });
    
    // Set page first so ProjectDetail can start loading
    setCurrentPage('Project Detail');
    
    try {
      // Fetch the project data from Supabase
      const { getProject } = await import('../src/utils/supabaseQueries');
      const project = await getProject(projectId);
      if (project) {
        setSelectedProject(project);
      } else {
        console.error('Project not found:', projectId);
        // Fallback to dashboard if project not found
        setCurrentPage('Project Dashboard');
        setNavigationParams({});
      }
    } catch (error) {
      console.error('Error loading project:', error);
      // Fallback to dashboard on error
      setCurrentPage('Project Dashboard');
      setNavigationParams({});
    }
  };

  const handleJoinProject = async (projectId: string, role: string, area: string) => {
    // Join the project using Supabase mutation
    console.log('Joining project:', { projectId, role, area });
    
    try {
      const { joinProject } = await import('../src/utils/supabaseMutations');
      await joinProject(projectId, { role, area });
      console.log(`Successfully joined project as ${role} in ${area} area`);
      
      // Refresh the project data to reflect the join
      const { getProject } = await import('../src/utils/supabaseQueries');
      const updatedProject = await getProject(projectId);
      if (updatedProject) {
        setSelectedProject(updatedProject);
      }
      
      // Stay on the project detail page after joining
      // Don't navigate away - let the ProjectDetail component handle the UI update
    } catch (error) {
      console.error('Error joining project:', error);
      // Show error toast or handle error appropriately
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
        <ProjectDashboard 
          onCreateProject={handleCreateProject}
          onViewProject={handleViewProject}
          onProjectCreated={() => {
            // This will trigger a refresh when a project is created
            // The ProjectDashboard will detect the change and refetch
          }}
        />
      );
    case 'Project Detail':
      const projectDetailId = selectedProject?.id || navigationParams?.projectId;
      if (!projectDetailId) {
        console.error('Project Detail rendered without project ID');
        return <div className="p-6">Error: No project ID available. <Button onClick={() => setCurrentPage('Project Dashboard')}>Go Back</Button></div>;
      }
      return <ProjectDetail 
        projectId={projectDetailId} 
        onBack={() => setCurrentPage('Project Dashboard')}
        onJoinProject={handleJoinProject}
      />;
    case 'Create Project':
      return (
        <CreateProject 
          onBack={() => setCurrentPage('Project Dashboard')}
          onSave={(projectData) => {
            console.log('Project created:', projectData);
            // Force a refresh by navigating away and back
            setCurrentPage('Project Dashboard');
            // Trigger a re-render by updating a key or state
            setTimeout(() => {
              window.dispatchEvent(new Event('projectCreated'));
            }, 100);
          }}
        />
      );
    case 'Opportunities':
      return <OpportunitiesPage />;
    case 'Impact Feed':
    case 'Dashboard':
    default:
      return <Dashboard />;
  }
}

function LayoutContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentPage } = useNavigation();

  // Define workroom pages that should have collapsed sidebar
  const workroomPages = [
    'Workroom',
    'Mentorship',
    'Mentorship Workspace'
  ];

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-collapse sidebar when entering workroom
  useEffect(() => {
    if (!isMobile && workroomPages.includes(currentPage)) {
      setIsSidebarCollapsed(true);
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
    if (isMobile) {
      setIsMobileMenuOpen(false);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="absolute top-4 left-4 z-30 bg-white shadow-md hover:bg-gray-50 h-10 w-10 p-0 rounded-md flex items-center justify-center transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="absolute inset-0 bg-black/50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ease-in-out z-10 ${
          isMobile 
            ? `absolute top-0 left-0 h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative'
        }`}
        style={{ width: isMobile ? '280px' : `${sidebarWidth}px` }}
      >
        <Sidebar 
          isCollapsed={isMobile ? false : isSidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Sidebar Toggle Button - Positioned on the dividing line */}
      {!isMobile && (
        <div 
          className="absolute top-1/2 z-10 transform -translate-y-1/2 transition-all duration-300 ease-in-out"
          style={{ left: `${sidebarWidth - 12}px` }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
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
              {isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              <span className="text-xs text-muted-foreground ml-2">Ctrl+B</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      
      {/* Main Content - Fixed the scrolling issue here */}
      <div className="flex-1 bg-background overflow-y-auto overflow-x-hidden relative">
        <MainContent />
      </div>
    </div>
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