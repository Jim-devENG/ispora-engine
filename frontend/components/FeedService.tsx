import { useState, useEffect, useContext, createContext, useRef } from 'react';
import { projectAPI, feedAPI } from '../src/utils/api';

// Removed demo data arrays - feed now only uses data from backend API
// const realProjects = [ ... ] - REMOVED
// const realOpportunities = [ ... ] - REMOVED

// Legacy demo data arrays (not used - kept for reference only)
const realProjects = [
  {
    id: "proj_stanford_ai_ethics",
    title: "Stanford AI Ethics Mentorship Program",
    description: "Developing an AI ethics curriculum with Stanford students and industry mentors to promote responsible AI development",
    status: "active",
    startDate: "2026-01-15",
    deadline: "2026-12-15",
    category: "Education",
    aspiraCategory: "mentorships",
    tags: ["AI", "Ethics", "Mentorship", "Stanford"],
    team: [
      { id: "1", name: "Dr. Sarah Chen", role: "Project Lead", avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face" },
      { id: "2", name: "Alex Johnson", role: "Curriculum Designer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
    ],
    university: "Stanford University",
    location: "Stanford, CA",
    authorId: "user_sarah_chen",
    authorName: "Dr. Sarah Chen"
  },
  {
    id: "proj_healthcare_mentorship",
    title: "Healthcare Professional Mentorship Network",
    description: "Connecting experienced diaspora healthcare professionals with medical students and young practitioners in Africa",
    status: "still-open",
    startDate: "2026-02-01",
    deadline: "2027-01-30",
    category: "Healthcare",
    aspiraCategory: "mentorships",
    tags: ["Healthcare", "Medical", "Mentorship", "Africa"],
    team: [
      { id: "3", name: "Dr. Amara Okafor", role: "Medical Director", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face" }
    ],
    university: "University of Cape Town",
    location: "Cape Town, South Africa",
    authorId: "user_amara_okafor",
    authorName: "Dr. Amara Okafor"
  },
  {
    id: "proj_mit_fundraising",
    title: "MIT Alumni Fundraising Campaign",
    description: "Annual campaign to raise funds for underrepresented students in STEM fields and educational programs",
    status: "active",
    startDate: "2026-03-01",
    deadline: "2026-08-30",
    category: "Education",
    aspiraCategory: "university-campaigns",
    tags: ["MIT", "Fundraising", "STEM", "Campaign"],
    team: [
      { id: "6", name: "MIT Alumni Association", role: "Campaign Lead" },
      { id: "7", name: "Student Affairs", role: "Coordination" }
    ],
    university: "MIT",
    location: "Cambridge, MA",
    authorId: "user_mit_alumni",
    authorName: "MIT Alumni Association"
  },
  {
    id: "proj_digital_literacy",
    title: "Digital Literacy for Rural Communities",
    description: "Community service initiative teaching digital skills to underserved rural populations",
    status: "active",
    startDate: "2026-02-15",
    deadline: "2026-10-31",
    category: "Technology",
    aspiraCategory: "community-service",
    tags: ["Digital Literacy", "Rural", "Community", "Education"],
    team: [
      { id: "18", name: "Community Outreach Volunteers", role: "Volunteer Coordinators" },
      { id: "19", name: "Local Schools Partnership", role: "Venue Partners" }
    ],
    university: "Local Community Centers",
    location: "Rural Areas, Global",
    authorId: "user_community_volunteers",
    authorName: "Community Outreach Volunteers"
  },
  {
    id: "proj_sustainable_agriculture",
    title: "Sustainable Agriculture Innovation Hub",
    description: "Research initiative developing climate-resilient farming techniques for East Africa",
    status: "closed",
    startDate: "2026-03-01",
    deadline: "2026-06-30",
    closedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Closed 3 days ago
    category: "Agriculture",
    aspiraCategory: "research",
    tags: ["Agriculture", "Climate", "Research", "Innovation"],
    team: [
      { id: "14", name: "Dr. James Mwangi", role: "Lead Researcher" },
      { id: "15", name: "Climate Research Institute", role: "Research Partner" }
    ],
    university: "Makerere University",
    location: "Kampala, Uganda",
    authorId: "user_james_mwangi",
    authorName: "Dr. James Mwangi"
  },
  {
    id: "proj_tech_partnership",
    title: "Industry Tech Partnership Program",
    description: "Building partnerships between tech companies and universities to enhance student career readiness",
    status: "active",
    startDate: "2026-01-01",
    deadline: "2026-09-15",
    category: "Technology",
    aspiraCategory: "partnerships",
    tags: ["Technology", "Industry", "Partnership", "Career"],
    team: [
      { id: "22", name: "Dr. Kwame Asante", role: "Program Director", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
      { id: "23", name: "Tech Industry Alliance", role: "Partner Organization" }
    ],
    university: "Multiple Universities",
    location: "Global",
    authorId: "user_kwame_asante",
    authorName: "Dr. Kwame Asante"
  },
  {
    id: "proj_women_stem",
    title: "Women in STEM Leadership Initiative",
    description: "Empowering women in STEM fields through leadership development programs and mentorship networks",
    status: "still-open",
    startDate: "2026-03-01",
    deadline: "2027-02-28",
    category: "Education",
    aspiraCategory: "mentorships",
    tags: ["Women", "STEM", "Leadership", "Empowerment"],
    team: [
      { id: "24", name: "Sarah Johnson", role: "Initiative Lead", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
      { id: "25", name: "STEM Women Network", role: "Supporting Organization" }
    ],
    university: "Multiple Institutions",
    location: "Global",
    authorId: "user_sarah_johnson",
    authorName: "Sarah Johnson"
  }
];

const realOpportunities = [
  {
    id: "opp_rhodes_scholarship",
    title: "Rhodes Scholarship for African Students",
    type: "scholarship",
    company: "University of Oxford",
    location: "Oxford, UK",
    remote: false,
    description: "Fully funded postgraduate scholarship at University of Oxford for exceptional young people who will fight the world's fight. The Rhodes Scholarship is the oldest and most celebrated international fellowship award in the world.",
    requirements: [
      "Outstanding academic achievement",
      "Demonstrated leadership potential",
      "Strong commitment to service",
      "Age 18-24 for undergraduate, 19-25 for postgraduate"
    ],
    benefits: [
      "Full tuition fees covered",
      "Living stipend of £17,310 per year",
      "Travel expenses included",
      "Access to Rhodes House community"
    ],
    amount: {
      value: 50000,
      currency: "GBP",
      type: "award"
    },
    duration: "2-3 years",
    commitment: "Full-time study",
    postedBy: {
      name: "Rhodes Trust",
      title: "Scholarship Administrator",
      company: "University of Oxford",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    university: "University of Oxford",
    tags: ["Postgraduate", "Leadership", "International", "Fully Funded"],
    applicants: 2847,
    deadline: "2026-10-01",
    postedDate: "2026-06-01",
    featured: true,
    urgent: false,
    boost: 156,
    saved: false,
    applied: false,
    experienceLevel: "any",
    category: "Education",
    eligibility: ["African citizenship", "Outstanding academic record", "Leadership experience"],
    applicationLink: "https://rhodes-scholarships.org",
    comments: 23,
    contactInfo: {
      email: "info@rhodesscholarships.org",
      website: "https://rhodes-scholarships.org"
    },
    authorId: "user_rhodes_trust",
    authorName: "Rhodes Trust"
  },
  {
    id: "opp_stripe_engineer",
    title: "Senior Software Engineer - Fintech",
    type: "job",
    company: "Stripe",
    location: "San Francisco, USA",
    remote: true,
    description: "Join Stripe's mission to increase the GDP of the internet by building financial infrastructure for the world's most ambitious companies. Work on systems that process billions of dollars in transactions.",
    requirements: [
      "5+ years of software engineering experience",
      "Strong background in distributed systems",
      "Experience with financial technology",
      "Bachelor's degree in Computer Science or equivalent"
    ],
    benefits: [
      "Competitive salary + equity",
      "Health, dental, and vision insurance",
      "Unlimited PTO",
      "Remote work flexibility"
    ],
    amount: {
      value: 180000,
      currency: "USD",
      type: "salary"
    },
    commitment: "Full-time",
    postedBy: {
      name: "Sarah Kim",
      title: "Engineering Manager",
      company: "Stripe",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    tags: ["Fintech", "Remote", "Engineering", "Equity"],
    applicants: 342,
    deadline: "2026-08-15",
    postedDate: "2026-07-01",
    featured: true,
    urgent: false,
    boost: 89,
    saved: true,
    applied: false,
    experienceLevel: "senior",
    category: "Technology",
    eligibility: ["Work authorization required", "5+ years experience"],
    applicationLink: "https://stripe.com/jobs",
    comments: 15,
    contactInfo: {
      email: "careers@stripe.com",
      website: "https://stripe.com/jobs"
    },
    authorId: "user_sarah_kim",
    authorName: "Sarah Kim"
  },
  {
    id: "opp_google_ai_internship",
    title: "Google AI Research Internship",
    type: "internship",
    company: "Google",
    location: "Mountain View, USA",
    remote: false,
    description: "12-week internship program working on cutting-edge AI research projects with mentorship from Google Research scientists. Access to Google's vast computational resources and datasets.",
    requirements: [
      "PhD student in Computer Science or related field",
      "Strong background in machine learning",
      "Published research in top-tier conferences",
      "Available for 12-week commitment"
    ],
    benefits: [
      "Competitive monthly stipend",
      "Housing assistance",
      "Research publication opportunities",
      "Full-time offer potential"
    ],
    amount: {
      value: 8000,
      currency: "USD",
      type: "stipend"
    },
    duration: "12 weeks",
    commitment: "Full-time (Summer 2027)",
    postedBy: {
      name: "Dr. Alex Chen",
      title: "Research Scientist",
      company: "Google Research",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    university: "Stanford University",
    tags: ["AI", "Research", "PhD", "Summer"],
    applicants: 1247,
    deadline: "2026-12-01",
    postedDate: "2026-06-15",
    featured: false,
    urgent: true,
    boost: 234,
    saved: false,
    applied: true,
    experienceLevel: "any",
    category: "Research",
    eligibility: ["PhD student status", "Research background"],
    applicationLink: "https://research.google.com/careers",
    comments: 45,
    contactInfo: {
      email: "research-internships@google.com",
      website: "https://research.google.com/careers"
    },
    authorId: "user_alex_chen",
    authorName: "Dr. Alex Chen"
  },
  {
    id: "opp_techstars_africa",
    title: "TechStars Africa Accelerator Program",
    type: "accelerator",
    company: "Techstars",
    location: "Cape Town, South Africa",
    remote: false,
    description: "13-week mentorship-driven accelerator program for early-stage African startups. Get funding, mentorship, and access to global network. Program culminates in Demo Day.",
    requirements: [
      "Early-stage startup with MVP",
      "African-focused business model",
      "Committed founding team",
      "Scalable technology solution"
    ],
    benefits: [
      "$120K investment",
      "3 months of intensive mentorship",
      "Access to Techstars network",
      "Demo Day presentation"
    ],
    amount: {
      value: 120000,
      currency: "USD",
      type: "funding"
    },
    duration: "13 weeks",
    commitment: "Full-time commitment",
    postedBy: {
      name: "Maya Patel",
      title: "Managing Director",
      company: "Techstars Africa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    tags: ["Startup", "Accelerator", "Africa", "Funding"],
    applicants: 456,
    deadline: "2026-09-30",
    postedDate: "2026-06-20",
    featured: true,
    urgent: false,
    boost: 178,
    saved: true,
    applied: false,
    experienceLevel: "any",
    category: "Entrepreneurship",
    eligibility: ["African startup", "MVP ready", "Committed team"],
    applicationLink: "https://techstars.com/africa",
    comments: 67,
    contactInfo: {
      email: "africa@techstars.com",
      website: "https://techstars.com/africa"
    },
    authorId: "user_maya_patel",
    authorName: "Maya Patel"
  },
  {
    id: "opp_climate_innovation_grant",
    title: "Climate Innovation Grant",
    type: "grant",
    company: "Gates Foundation",
    location: "Global",
    remote: true,
    description: "Funding for innovative solutions addressing climate change in developing countries. Focus on agriculture, energy, and adaptation. Looking for scalable impact potential.",
    requirements: [
      "Innovative climate solution",
      "Focus on developing countries",
      "Scalable impact potential",
      "Strong implementation plan"
    ],
    benefits: [
      "Up to $2M in funding",
      "Technical assistance",
      "Monitoring and evaluation support",
      "Global network access"
    ],
    amount: {
      value: 2000000,
      currency: "USD",
      type: "funding"
    },
    duration: "24 months",
    commitment: "Project-based",
    postedBy: {
      name: "Dr. James Morrison",
      title: "Program Officer",
      company: "Bill & Melinda Gates Foundation",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    tags: ["Climate", "Innovation", "Global", "Impact"],
    applicants: 234,
    deadline: "2026-11-15",
    postedDate: "2026-07-01",
    featured: true,
    urgent: false,
    boost: 112,
    saved: false,
    applied: false,
    experienceLevel: "any",
    category: "Environment",
    eligibility: ["Climate focus", "Developing country impact", "Innovation"],
    applicationLink: "https://gatesfoundation.org/grants",
    comments: 34,
    contactInfo: {
      email: "grants@gatesfoundation.org",
      website: "https://gatesfoundation.org/grants"
    },
    authorId: "user_james_morrison",
    authorName: "Dr. James Morrison"
  },
  {
    id: "opp_afritech_summit",
    title: "AfriTech Summit 2027",
    type: "event",
    company: "AfriTech Conference",
    location: "Lagos, Nigeria",
    remote: false,
    description: "Africa's largest technology conference bringing together entrepreneurs, investors, and innovators. Speaker applications now open. Theme: 'Building Africa's Digital Future'.",
    requirements: [
      "Expertise in African tech ecosystem",
      "Speaking experience preferred",
      "Innovative project or research",
      "Community impact focus"
    ],
    benefits: [
      "Speaking opportunity",
      "Networking with 5000+ attendees",
      "Media coverage",
      "Travel support available"
    ],
    duration: "3 days",
    commitment: "Conference participation",
    postedBy: {
      name: "Amina Hassan",
      title: "Conference Director",
      company: "AfriTech Conference",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    eventDate: "2027-03-15",
    tags: ["Conference", "Speaking", "Technology", "Africa"],
    applicants: 189,
    deadline: "2026-12-01",
    postedDate: "2026-06-10",
    featured: false,
    urgent: false,
    boost: 67,
    saved: false,
    applied: false,
    experienceLevel: "any",
    category: "Technology",
    eligibility: ["Tech expertise", "Speaking ability", "African focus"],
    applicationLink: "https://afritechsummit.com",
    comments: 28,
    contactInfo: {
      email: "speakers@afritechsummit.com",
      website: "https://afritechsummit.com"
    },
    authorId: "user_amina_hassan",
    authorName: "Amina Hassan"
  },
  {
    id: "opp_edtech_cofounder",
    title: "Seeking Co-founder for EdTech Startup",
    type: "community",
    company: "EduInnovate",
    location: "Remote",
    remote: true,
    description: "Looking for a technical co-founder to join our mission of revolutionizing education in Africa through AI-powered learning platforms. Shape the technical direction of the company.",
    requirements: [
      "Strong technical background",
      "Passion for education",
      "Startup experience preferred",
      "Available for equity partnership"
    ],
    benefits: [
      "Co-founder equity",
      "Shape company direction",
      "Impact on education",
      "Flexible working arrangements"
    ],
    commitment: "Co-founder partnership",
    postedBy: {
      name: "David Okafor",
      title: "Founder & CEO",
      company: "EduInnovate",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isVerified: false
    },
    tags: ["Co-founder", "EdTech", "Equity", "Africa"],
    applicants: 78,
    deadline: "2026-09-01",
    postedDate: "2026-07-02",
    featured: false,
    urgent: false,
    boost: 45,
    saved: false,
    applied: false,
    experienceLevel: "mid",
    category: "Entrepreneurship",
    eligibility: ["Technical skills", "Equity partnership", "Education passion"],
    comments: 12,
    contactInfo: {
      email: "david@eduinnovate.com"
    },
    authorId: "user_david_okafor",
    authorName: "David Okafor"
  }
];

// Feed item types that can be auto-generated from user actions
export interface FeedItem {
  id: string;
  type: 'project' | 'campaign' | 'opportunity' | 'milestone' | 'success_story' | 'funding_success' | 'live_event' | 'workroom_live' | 'project_closing' | 'admin_highlight' | 'achievement' | 'certification' | 'collaboration';
  title: string;
  description?: string;
  timestamp: string;
  likes: number;
  location: string;
  category: string;
  urgent?: boolean;
  deadline?: string;
  isLive?: boolean;
  isPinned?: boolean;
  isAdminCurated?: boolean;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  projectId?: string;
  campaignId?: string;
  opportunityId?: string;
  metadata?: Record<string, any>;
  visibility: 'public' | 'authenticated' | 'private';
  significance: 'low' | 'medium' | 'high' | 'critical';
  isAutoGenerated?: boolean;
}

// User actions that trigger automatic feed generation
export interface UserAction {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  actionType: 'project_created' | 'project_joined' | 'project_completed' | 'campaign_launched' | 'campaign_joined' | 'milestone_achieved' | 'opportunity_posted' | 'opportunity_applied' | 'funding_received' | 'session_started' | 'session_completed' | 'certification_earned' | 'achievement_unlocked' | 'collaboration_started' | 'mentor_match' | 'workspace_created';
  entityId: string;
  entityType: 'project' | 'campaign' | 'opportunity' | 'session' | 'certification' | 'achievement' | 'workspace' | 'collaboration';
  entityTitle: string;
  entityCategory: string;
  timestamp: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'authenticated' | 'private';
}

// Admin highlights for curation
export interface AdminHighlight {
  id: string;
  type: 'top_mentor' | 'spotlighted_opportunity' | 'impact_stat' | 'featured_project' | 'announcement' | 'success_spotlight' | 'community_milestone';
  title: string;
  description: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  isPinned: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  visibility: 'public' | 'authenticated';
  projectId?: string;
  opportunityId?: string;
}

// Significance level mapping for auto-generation
const SIGNIFICANCE_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  'project_created': 'high',
  'project_joined': 'low',
  'project_completed': 'high',
  'campaign_launched': 'high',
  'campaign_joined': 'low',
  'milestone_achieved': 'medium',
  'opportunity_posted': 'medium',
  'opportunity_applied': 'low',
  'funding_received': 'critical',
  'session_started': 'medium',
  'session_completed': 'low',
  'certification_earned': 'medium',
  'achievement_unlocked': 'medium',
  'collaboration_started': 'medium',
  'mentor_match': 'low',
  'workspace_created': 'low',
};

export class FeedService {
  private static instance: FeedService;
  private feedItems: FeedItem[] = [];
  private adminHighlights: AdminHighlight[] = [];
  private userActions: UserAction[] = [];
  private subscribers: Array<() => void> = [];

  public static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  // Subscribe to feed updates
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Track user actions and generate feed items
  public trackUserAction(action: UserAction): void {
    this.userActions.push(action);
    
    // Generate feed item from user action
    const feedItem = this.generateFeedItemFromAction(action);
    if (feedItem) {
      this.feedItems.unshift(feedItem); // Add to beginning of feed
      this.notifySubscribers();
    }
  }

  // Generate feed item from user action
  private generateFeedItemFromAction(action: UserAction): FeedItem | null {
    const significance = SIGNIFICANCE_MAP[action.actionType] || 'low';
    
    switch (action.actionType) {
      case 'milestone_achieved':
        return {
          id: `feed_milestone_${action.entityId}_${Date.now()}`,
          type: 'milestone',
          title: `Milestone Achieved: ${action.entityTitle}`,
          description: action.metadata?.milestoneDescription || `Milestone completed in ${action.entityCategory} project`,
          timestamp: this.formatTimestamp(new Date(action.timestamp)),
          likes: Math.floor(Math.random() * 50) + 10,
          location: action.userLocation || 'Global',
          category: action.entityCategory,
          urgent: false,
          isLive: false,
          isPinned: false,
          isAdminCurated: false,
          authorId: action.userId,
          authorName: action.userName,
          authorAvatar: action.userAvatar,
          projectId: action.metadata?.projectId,
          metadata: {
            milestoneId: action.entityId,
            projectTitle: action.metadata?.projectTitle,
            progress: action.metadata?.progress,
            dueDate: action.metadata?.dueDate,
            ...action.metadata
          },
          visibility: action.visibility || 'public',
          significance,
          isAutoGenerated: true
        };
      
      default:
        return null;
    }
  }

  // Generate feed items from projects (fetched from API)
  private async generateProjectFeedItems(): Promise<FeedItem[]> {
    const projectFeedItems: FeedItem[] = [];

    try {
      // Fetch projects from Supabase - only use real projects, no fallback to demo data
      let apiProjects: any[] = [];
      try {
        const { getProjects } = await import('../src/utils/supabaseQueries');
        apiProjects = await getProjects();
      } catch (supabaseError) {
        console.warn('Supabase query failed, trying legacy API:', supabaseError);
        // Fallback to legacy API during migration
        apiProjects = await projectAPI.getProjects();
      }
      
      // Only generate feed items if we have API projects
      if (!apiProjects || apiProjects.length === 0) {
        return [];
      }

      apiProjects.forEach((project: any) => {
      // Create project creation feed item
        const creationDate = new Date(project.startDate || project.createdAt);
      
        // Show all projects from API (no date filter - these are real projects)
        projectFeedItems.push({
          id: `feed_project_${project.id}`,
          type: 'project',
          title: `New Project: ${project.title}`,
          description: project.description,
          timestamp: this.formatTimestamp(creationDate),
          likes: Math.floor(Math.random() * 100) + 20,
          location: project.location || project.university || 'Global', // Use university if location is empty
          category: project.category || project.projectType || 'General',
          urgent: !!(project.status === 'still-open' && project.deadline && this.isDeadlineUrgent(project.deadline)),
          deadline: project.deadline ? this.formatDeadline(project.deadline) : undefined,
          isLive: false,
          isPinned: false,
          isAdminCurated: false,
          authorId: project.authorId,
          authorName: project.authorName,
          authorAvatar: (project.team?.[0] as any)?.avatar, // Added optional chaining
          projectId: project.id,
          metadata: {
            university: project.university,
            tags: project.tags,
            aspiraCategory: project.aspiraCategory,
            team: project.team
          },
          visibility: 'public',
          significance: project.status === 'active' ? 'high' : 'medium',
          isAutoGenerated: true,
        });

      // Create milestone for closed projects
      if (project.status === 'closed' && project.closedDate) {
        const closedDate = new Date(project.closedDate);
        const closedDaysAgo = Math.floor((Date.now() - closedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (closedDaysAgo <= 7) { // Show recently closed projects
          projectFeedItems.push({
            id: `feed_project_closed_${project.id}`,
            type: 'success_story',
            title: `Project Completed: ${project.title}`,
              description: `Successfully completed ${project.aspiraCategory?.replace('-', ' ') || 'project'} project in ${project.category}`,
            timestamp: this.formatTimestamp(closedDate),
            likes: Math.floor(Math.random() * 150) + 50,
            location: project.location,
            category: project.category,
            urgent: false,
            isLive: false,
            isPinned: false,
            isAdminCurated: false,
            authorId: project.authorId,
            authorName: project.authorName,
              authorAvatar: (project.team?.[0] as any)?.avatar,
            projectId: project.id,
            metadata: {
              completionDate: project.closedDate,
              university: project.university,
              tags: project.tags
            },
            visibility: 'public',
            significance: 'high',
            isAutoGenerated: true,
          });
        }
      }
    });

    return projectFeedItems;
    } catch (error) {
      console.error('Error fetching projects for feed:', error);
      // Don't use demo data - return empty array if API fails
      return [];
    }
  }

  // Generate feed items from opportunities (currently using demo data, but should fetch from API)
  private generateOpportunityFeedItems(): FeedItem[] {
    const opportunityFeedItems: FeedItem[] = [];

    // TODO: Fetch opportunities from API instead of using demo data
    // For now, return empty array to remove demo data
    // This removes all demo opportunity data from the feed
    return [];
    
    /* Commented out demo data - uncomment when API is ready
    realOpportunities.forEach(opportunity => {
      const postedDate = new Date(opportunity.postedDate);
      const daysAgo = Math.floor((Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysAgo <= 14) { // Show opportunities posted in last 2 weeks
        opportunityFeedItems.push({
          id: `feed_opportunity_${opportunity.id}`,
          type: 'opportunity',
          title: `New Opportunity: ${opportunity.title}`,
          description: opportunity.description,
          timestamp: this.formatTimestamp(postedDate),
          likes: Math.floor(Math.random() * 80) + 15,
          location: opportunity.location,
          category: opportunity.category,
          urgent: !!(opportunity.urgent || (opportunity.deadline && this.isDeadlineUrgent(opportunity.deadline))),
          deadline: opportunity.deadline ? this.formatDeadline(opportunity.deadline) : undefined,
          isLive: false,
          isPinned: opportunity.featured,
          isAdminCurated: opportunity.featured,
          authorId: opportunity.authorId,
          authorName: opportunity.authorName,
          authorAvatar: opportunity.postedBy.avatar,
          opportunityId: opportunity.id,
          metadata: {
            type: opportunity.type,
            company: opportunity.company,
            remote: opportunity.remote,
            amount: opportunity.amount,
            tags: opportunity.tags,
            applicants: opportunity.applicants,
            experienceLevel: opportunity.experienceLevel
          },
          visibility: 'public',
          significance: opportunity.featured ? 'high' : opportunity.urgent ? 'critical' : 'medium',
          isAutoGenerated: true,
        });
      }
    });

    return opportunityFeedItems;
    */
  }

  // Helper function to check if deadline is urgent (within 7 days)
  private isDeadlineUrgent(deadline: string): boolean {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  }

  // Helper function to format deadline for display
  private formatDeadline(deadline: string): string {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Deadline passed';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    // Format as DD/MM/YYYY
    const day = deadlineDate.getDate().toString().padStart(2, '0');
    const month = (deadlineDate.getMonth() + 1).toString().padStart(2, '0');
    const year = deadlineDate.getFullYear();
    return `Due ${day}/${month}/${year}`;
  }

  // Helper function to format timestamp
  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return diffMinutes <= 1 ? 'just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Record a user action and automatically generate feed item
  public recordUserAction(action: UserAction): FeedItem | null {
    this.userActions.push(action);
    
    const feedItem = this.generateFeedItemFromAction(action);
    if (feedItem) {
      this.addFeedItem(feedItem);
      this.notifySubscribers();
      return feedItem;
    }
    
    return null;
  }


  private getActionFeedType(actionType: string): FeedItem['type'] {
    switch (actionType) {
      case 'project_created': return 'project';
      case 'campaign_launched': return 'campaign';
      case 'opportunity_posted': return 'opportunity';
      case 'project_completed': return 'success_story';
      case 'milestone_achieved': return 'milestone';
      case 'funding_received': return 'funding_success';
      case 'session_started': return 'live_event';
      case 'session_completed': return 'workroom_live';
      case 'certification_earned': return 'certification';
      case 'achievement_unlocked': return 'achievement';
      case 'collaboration_started': return 'collaboration';
      default: return 'milestone';
    }
  }

  private getActionTitle(action: UserAction): string {
    switch (action.actionType) {
      case 'project_created': return `New Project: ${action.entityTitle}`;
      case 'campaign_launched': return `New Campaign: ${action.entityTitle}`;
      case 'opportunity_posted': return `New Opportunity: ${action.entityTitle}`;
      case 'project_completed': return `Project Completed: ${action.entityTitle}`;
      case 'milestone_achieved': return `Milestone Achieved: ${action.entityTitle}`;
      case 'funding_received': return `Funding Success: ${action.entityTitle}`;
      case 'session_started': return `LIVE: ${action.entityTitle}`;
      case 'session_completed': return `Session Completed: ${action.entityTitle}`;
      case 'certification_earned': return `Certification Earned: ${action.entityTitle}`;
      case 'achievement_unlocked': return `Achievement Unlocked: ${action.entityTitle}`;
      case 'collaboration_started': return `New Collaboration: ${action.entityTitle}`;
      default: return action.entityTitle;
    }
  }

  private getActionDescription(action: UserAction): string {
    switch (action.actionType) {
      case 'project_created': return `${action.userName} has launched "${action.entityTitle}" - Join the mission to create impact in ${action.entityCategory}`;
      case 'campaign_launched': return `${action.userName} is rallying the community around ${action.entityCategory}`;
      case 'opportunity_posted': return `${action.userName} has posted a new opportunity in ${action.entityCategory}`;
      case 'project_completed': return `${action.userName} and team have successfully completed their project in ${action.entityCategory}`;
      case 'milestone_achieved': return `${action.userName} has reached a significant milestone in ${action.entityCategory}`;
      case 'funding_received': return `${action.userName} has secured funding for their ${action.entityCategory} initiative`;
      case 'session_started': return `${action.userName} is hosting a live session on ${action.entityCategory}`;
      case 'session_completed': return `${action.userName} has completed a learning session in ${action.entityCategory}`;
      case 'certification_earned': return `${action.userName} has earned certification in ${action.entityCategory}`;
      case 'achievement_unlocked': return `${action.userName} has unlocked a new achievement in ${action.entityCategory}`;
      case 'collaboration_started': return `${action.userName} has started a new collaboration in ${action.entityCategory}`;
      default: return action.metadata?.description || `New activity in ${action.entityCategory}`;
    }
  }

  // Add feed item directly
  public addFeedItem(item: FeedItem): void {
    this.feedItems.unshift(item); // Add to beginning for chronological order
  }

  // Create admin highlight
  public createAdminHighlight(highlight: Omit<AdminHighlight, 'id' | 'createdAt'>): AdminHighlight {
    const newHighlight: AdminHighlight = {
      ...highlight,
      id: `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    this.adminHighlights.push(newHighlight);
    
    // Convert to feed item
    const feedItem = this.convertHighlightToFeedItem(newHighlight);
    this.addFeedItem(feedItem);
    this.notifySubscribers();
    
    return newHighlight;
  }

  // Convert admin highlight to feed item
  private convertHighlightToFeedItem(highlight: AdminHighlight): FeedItem {
    return {
      id: `admin_${highlight.id}`,
      type: 'admin_highlight',
      title: highlight.title,
      description: highlight.description,
      timestamp: this.formatTimestamp(new Date(highlight.createdAt)),
      likes: Math.floor(Math.random() * 200) + 50,
      location: 'Global',
      category: 'Admin Highlight',
      isPinned: highlight.isPinned,
      isAdminCurated: true,
      authorId: highlight.createdBy,
      authorName: 'Aspora Team',
      authorAvatar: undefined,
      projectId: highlight.projectId,
      opportunityId: highlight.opportunityId,
      metadata: {
        image: highlight.image,
        ctaText: highlight.ctaText,
        ctaLink: highlight.ctaLink,
        highlightType: highlight.type,
        expiresAt: highlight.expiresAt,
      },
      visibility: highlight.visibility,
      significance: 'high',
      isAutoGenerated: false,
    };
  }

  // Get feed items with filtering options
  public async getFeedItems(options: {
    includeAdminHighlights?: boolean;
    userFilter?: string;
    categoryFilter?: string;
    significanceFilter?: 'all' | 'low' | 'medium' | 'high' | 'critical';
    limit?: number;
    visibility?: 'public' | 'authenticated' | 'all';
    includeExpired?: boolean;
  } = {}): Promise<FeedItem[]> {
    const { 
      includeAdminHighlights = true, 
      userFilter, 
      categoryFilter,
      significanceFilter = 'all',
      limit, 
      visibility = 'all',
      includeExpired = true 
    } = options;

    // Fetch feed items from Supabase (includes feed items created by backend)
    let apiFeedItems: FeedItem[] = [];
    try {
      // Try Supabase first
      try {
        const { getFeedItems } = await import('../src/utils/supabaseQueries');
        apiFeedItems = await getFeedItems({ limit: 100 });
        // Only log if there are items or if it's the first fetch
        if (apiFeedItems.length > 0) {
          console.log(`Fetched ${apiFeedItems.length} feed items from Supabase`);
        }
      } catch (supabaseError) {
        console.warn('Supabase query failed, trying legacy API:', supabaseError);
        // Fallback to legacy API during migration
        const feedResponse = await feedAPI.getFeed({ limit: 100 });
        apiFeedItems = feedResponse.items || [];
        if (apiFeedItems.length > 0) {
          console.log(`Fetched ${apiFeedItems.length} feed items from API`);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch feed items:', error);
    }

    // Always generate feed items from projects (they may not have feed items in DB yet)
    // This ensures projects show up in the feed even if backend didn't create feed items
    let projectFeedItems: FeedItem[] = [];
    let opportunityFeedItems: FeedItem[] = [];
    
    projectFeedItems = await this.generateProjectFeedItems();
    opportunityFeedItems = this.generateOpportunityFeedItems();
    // Only log once per session when items are first generated (not on every fetch)
    // This prevents excessive logging when feed is refreshed frequently
    
    // Combine: API feed items first (most recent/accurate), then generated, then local
    // Remove duplicates by ID (API items take precedence)
    const allGeneratedItems = [...projectFeedItems, ...opportunityFeedItems];
    const generatedItemIds = new Set(allGeneratedItems.map(item => item.id));
    const uniqueGeneratedItems = allGeneratedItems.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );
    
    // Filter out generated items that already exist in API feed items
    const apiFeedItemIds = new Set(apiFeedItems.map(item => item.id));
    const filteredGeneratedItems = uniqueGeneratedItems.filter(item => !apiFeedItemIds.has(item.id));
    
    // Combine: API feed items first (most recent/accurate), then generated
    // Removed this.feedItems to prevent demo data from showing
    // Only use API feed items and generated items from real projects
    let feedItems = [...apiFeedItems, ...filteredGeneratedItems];

    // Filter by visibility
    if (visibility !== 'all') {
      feedItems = feedItems.filter(item => {
        if (visibility === 'public') {
          return item.visibility === 'public';
        }
        return item.visibility === 'public' || item.visibility === 'authenticated';
      });
    }

    // Filter expired highlights
    if (!includeExpired) {
      feedItems = feedItems.filter(item => {
        if (item.isAdminCurated && item.metadata?.expiresAt) {
          return new Date(item.metadata.expiresAt) > new Date();
        }
        return true;
      });
    }

    // Filter admin highlights
    if (!includeAdminHighlights) {
      feedItems = feedItems.filter(item => !item.isAdminCurated);
    }

    // Filter by significance
    if (significanceFilter !== 'all') {
      const significanceLevels = ['low', 'medium', 'high', 'critical'];
      const minLevel = significanceLevels.indexOf(significanceFilter);
      feedItems = feedItems.filter(item => {
        const itemLevel = significanceLevels.indexOf(item.significance);
        return itemLevel >= minLevel;
      });
    }

    // Apply search filters
    if (userFilter) {
      feedItems = feedItems.filter(item => 
        item.authorName?.toLowerCase().includes(userFilter.toLowerCase()) ||
        item.title.toLowerCase().includes(userFilter.toLowerCase()) ||
        item.description?.toLowerCase().includes(userFilter.toLowerCase())
      );
    }

    if (categoryFilter) {
      feedItems = feedItems.filter(item => 
        item.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Remove duplicates based on ID
    const uniqueItems = feedItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    // Sort by priority (pinned first, then by timestamp)
    uniqueItems.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Sort by creation time for real projects/opportunities, timestamp for others
      return b.timestamp.localeCompare(a.timestamp);
    });

    // Apply limit
    if (limit) {
      return uniqueItems.slice(0, limit);
    }

    return uniqueItems;
  }

  // Get feed statistics
  public async getFeedStats(): Promise<{
    totalItems: number;
    adminHighlights: number;
    userGenerated: number;
    publicItems: number;
    liveEvents: number;
    recentActivity: number;
  }> {
    const allItems = await this.getFeedItems();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      totalItems: allItems.length,
      adminHighlights: allItems.filter(item => item.isAdminCurated).length,
      userGenerated: allItems.filter(item => !item.isAdminCurated).length,
      publicItems: allItems.filter(item => item.visibility === 'public').length,
      liveEvents: allItems.filter(item => item.isLive).length,
      recentActivity: allItems.filter(item => {
        // For items with timestamp strings, parse them
        const itemTime = new Date(item.timestamp);
        return itemTime > last24Hours;
      }).length,
    };
  }

  // Initialize with mock admin highlights for demonstration
  // REMOVED - Feed now only shows data from backend API
  // This method is kept for reference but should not be called
  public initializeMockData(): void {
    // This method has been disabled - feed now only uses backend API data
    // Do not create mock data - all feed items should come from the backend
    console.warn('initializeMockData() called but disabled - feed only uses backend API data');
  }

  // Clear all data (for testing)
  public clearAll(): void {
    this.feedItems = [];
    this.adminHighlights = [];
    this.userActions = [];
    this.notifySubscribers();
  }
}

// React Context for Feed Service
const FeedContext = createContext<FeedService | null>(null);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [feedService] = useState(() => {
    const service = FeedService.getInstance();
    // Removed initializeMockData() - feed now only shows data from backend API
    return service;
  });

  return (
    <FeedContext.Provider value={feedService}>
      {children}
    </FeedContext.Provider>
  );
}

// React Hook for using Feed Service
export function useFeedService() {
  const feedService = useContext(FeedContext) || FeedService.getInstance();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize feed
    const loadFeed = async () => {
      const items = await feedService.getFeedItems();
    setFeedItems(items);
    };
    loadFeed();

    // Subscribe to feed service updates
    const unsubscribe = feedService.subscribe(async () => {
      const updatedItems = await feedService.getFeedItems();
      setFeedItems(updatedItems);
    });

    // Setup Supabase Realtime for feed updates
    let realtimeChannels: any[] = [];
    const setupRealtime = async (): Promise<void> => {
      try {
        const { subscribeToFeed, unsubscribe } = await import('../src/utils/supabaseRealtime');
        
        const feedChannel = subscribeToFeed({
          onInsert: async (payload) => {
            console.log('Real-time feed item added:', payload);
            // Refresh feed to get latest items
            const updatedItems = await feedService.getFeedItems();
            setFeedItems(updatedItems);
          },
          onUpdate: async (payload) => {
            console.log('Feed item updated:', payload);
            const updatedItems = await feedService.getFeedItems();
            setFeedItems(updatedItems);
          },
          onDelete: async (payload) => {
            console.log('Feed item deleted:', payload);
            const updatedItems = await feedService.getFeedItems();
            setFeedItems(updatedItems);
          },
        });
        
        realtimeChannels.push(feedChannel);
        console.log('Supabase Realtime connected for feed updates');
      } catch (error) {
        console.warn('Supabase Realtime connection failed, using polling fallback:', error);
        // Fallback to polling if Realtime fails
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const updatedItems = await feedService.getFeedItems();
            setFeedItems(updatedItems);
          } catch (error) {
            console.error('Polling feed update failed:', error);
          }
        }, 30000); // Poll every 30 seconds
      }
    };

    setupRealtime();

    // Listen for project creation events (local events)
    const handleProjectCreated = async () => {
      const updatedItems = await feedService.getFeedItems();
      setFeedItems(updatedItems);
    };
    window.addEventListener('projectCreated', handleProjectCreated);

    return () => {
      unsubscribe();
      window.removeEventListener('projectCreated', handleProjectCreated);
      
      // Cleanup polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Cleanup Supabase Realtime channels
      if (realtimeChannels.length > 0) {
        import('../src/utils/supabaseRealtime').then(({ unsubscribeAll }) => {
          unsubscribeAll(realtimeChannels);
          realtimeChannels = [];
        }).catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [feedService]);

  const refreshFeed = async (options?: Parameters<typeof feedService.getFeedItems>[0]) => {
    setLoading(true);
    try {
      const items = await feedService.getFeedItems(options);
      setFeedItems(items);
    } finally {
      setLoading(false);
    }
  };

  const recordUserAction = (action: Omit<UserAction, 'id' | 'timestamp'>) => {
    const fullAction: UserAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    return feedService.recordUserAction(fullAction);
  };

  const createAdminHighlight = (highlight: Omit<AdminHighlight, 'id' | 'createdAt'>) => {
    return feedService.createAdminHighlight(highlight);
  };

  const getFeedStats = async () => {
    return await feedService.getFeedStats();
  };

  return {
    feedItems,
    loading,
    refreshFeed,
    recordUserAction,
    createAdminHighlight,
    getFeedStats,
    feedService,
  };
}