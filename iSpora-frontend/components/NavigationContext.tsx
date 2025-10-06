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
  navigateToWorkroom: (
    projectId?: string,
    options?: { openWorkspacePanel?: boolean; activeTab?: string },
  ) => void;
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

  const navigateToWorkroom = (
    projectId?: string,
    options?: { openWorkspacePanel?: boolean; activeTab?: string },
  ) => {
    if (projectId) {
      setSelectedProject({ id: projectId });
    }
    setCurrentPage('Workroom');
    setActiveItem('Workroom');

    // Store additional navigation options in context
    setNavigationOptions(options || {});

    console.log(`Navigating to workroom for project: ${projectId || 'default'}`, options);
  };

  const navigateToSpecificProject = (projectId: string, params?: any) => {
    const projectData = {
      id: projectId,
      ...params,
    };
    setSelectedProject(projectData);
    setNavigationParams({
      projectId,
      highlightProject: true,
      ...params,
    });
    setCurrentPage('Project Dashboard');
    setActiveItem('Projects');
    console.log(`Navigating to specific project: ${projectId}`, params);
  };

  const navigateToSpecificOpportunity = (opportunityId: string, params?: any) => {
    const opportunityData = {
      id: opportunityId,
      ...params,
    };
    setSelectedOpportunity(opportunityData);
    setNavigationParams({
      opportunityId,
      highlightOpportunity: true,
      ...params,
    });
    setCurrentPage('Opportunities');
    setActiveItem('Opportunities');
    console.log(`Navigating to specific opportunity: ${opportunityId}`, params);
  };

  return (
    <NavigationContext.Provider
      value={{
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
        navigateToSpecificOpportunity,
      }}
    >
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
