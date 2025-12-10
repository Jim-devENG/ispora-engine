import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeItem: string;
  setActiveItem: (item: string) => void;
  navigate: (item: string, params?: any) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedCampaign: any;
  setSelectedCampaign: (campaign: any) => void;
  navigateToCampaign: (campaign: any) => void;
  selectedProject: any;
  setSelectedProject: (project: any) => void;
  navigateToWorkroom: (projectId?: string, options?: { openWorkspacePanel?: boolean; activeTab?: string }) => void;
  navigationOptions: any;
  setNavigationOptions: (options: any) => void;
  // New properties for specific navigation
  selectedOpportunity: any;
  setSelectedOpportunity: (opportunity: any) => void;
  navigationParams: any;
  setNavigationParams: (params: any) => void;
  navigateToSpecificProject: (projectId: string, params?: any) => void;
  navigateToSpecificOpportunity: (opportunityId: string, params?: any) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeItem, setActiveItem] = useState('Impact Feed');
  const [currentPage, setCurrentPage] = useState('Impact Feed');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [navigationOptions, setNavigationOptions] = useState({});
  const [navigationParams, setNavigationParams] = useState({});

  const navigate = (item: string, params?: any) => {
    setActiveItem(item);
    setCurrentPage(item);
    if (params) {
      setNavigationParams(params);
    }
    console.log(`Navigating to ${item}`, params);
  };

  const navigateToCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setCurrentPage('Campaign Detail');
    setActiveItem('Impact Feed'); // Keep Impact Feed as active sidebar item since Alma Mater is removed
    console.log(`Navigating to campaign: ${campaign.title}`);
  };

  const navigateToWorkroom = async (projectId?: string, options?: { openWorkspacePanel?: boolean; activeTab?: string }) => {
    // Require a valid projectId - never allow undefined
    if (!projectId) {
      // If no projectId provided, try to use existing selectedProject
      if (selectedProject?.id) {
        projectId = selectedProject.id;
      } else {
        // If no selected project, try to fetch first available project from Supabase
        try {
          const { getProjects } = await import('../src/utils/supabaseQueries');
          const projects = await getProjects();
          if (projects && projects.length > 0) {
            projectId = projects[0].id;
            setSelectedProject(projects[0] as any);
          } else {
            console.warn('No projects available. Redirecting to Project Dashboard.');
            setCurrentPage('Project Dashboard');
            setActiveItem('Projects');
            return;
          }
        } catch (error) {
          console.error('Failed to load projects for Workroom:', error);
          // Redirect to Project Dashboard if we can't load projects
          setCurrentPage('Project Dashboard');
          setActiveItem('Projects');
          return;
        }
      }
    }

    // Validate projectId is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      console.error(`Invalid project ID format: ${projectId}. Expected UUID.`);
      setCurrentPage('Project Dashboard');
      setActiveItem('Projects');
      return;
    }

    // Load full project data if we only have an ID
    if (!selectedProject || selectedProject.id !== projectId) {
      try {
        const { getProject } = await import('../src/utils/supabaseQueries');
        const project = await getProject(projectId);
        if (project) {
          setSelectedProject(project as any);
        } else {
          console.error(`Project ${projectId} not found. Redirecting to Project Dashboard.`);
          setCurrentPage('Project Dashboard');
          setActiveItem('Projects');
          return;
        }
      } catch (error) {
        console.error(`Failed to load project ${projectId}:`, error);
        setCurrentPage('Project Dashboard');
        setActiveItem('Projects');
        return;
      }
    }

    setCurrentPage('Workroom');
    setActiveItem('Workroom');
    
    // Store additional navigation options in context
    setNavigationOptions(options || {});
    
    if (import.meta.env.DEV) {
      console.log(`Navigating to workroom for project: ${projectId}`, options);
    }
  };

  const navigateToSpecificProject = (projectId: string, params?: any) => {
    const projectData = {
      id: projectId,
      ...params
    };
    setSelectedProject(projectData);
    setNavigationParams({
      projectId,
      highlightProject: true,
      ...params
    });
    setCurrentPage('Project Dashboard');
    setActiveItem('Projects');
    console.log(`Navigating to specific project: ${projectId}`, params);
  };

  const navigateToSpecificOpportunity = (opportunityId: string, params?: any) => {
    const opportunityData = {
      id: opportunityId,
      ...params
    };
    setSelectedOpportunity(opportunityData);
    setNavigationParams({
      opportunityId,
      highlightOpportunity: true,
      ...params
    });
    setCurrentPage('Opportunities');
    setActiveItem('Opportunities');
    console.log(`Navigating to specific opportunity: ${opportunityId}`, params);
  };

  return (
    <NavigationContext.Provider value={{ 
      activeItem, 
      setActiveItem, 
      navigate, 
      currentPage, 
      setCurrentPage,
      selectedCampaign,
      setSelectedCampaign,
      navigateToCampaign,
      selectedProject,
      setSelectedProject,
      navigateToWorkroom,
      navigationOptions,
      setNavigationOptions,
      selectedOpportunity,
      setSelectedOpportunity,
      navigationParams,
      setNavigationParams,
      navigateToSpecificProject,
      navigateToSpecificOpportunity
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}