import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  Share2,
  Download,
  Upload,
  Plus,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Activity,
  GitBranch,
  Zap,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Star,
  Eye,
  MessageCircle,
  Video,
  Phone,
  UserPlus,
  Lightbulb,
  HeartHandshake,
  BookOpen,
  Briefcase,
  ExternalLink,
  Stethoscope,
  Sprout,
  TreePine,
  Factory,
  Palette,
  Heart,
  Shield,
  Globe,
  Crown,
  Folder,
  Tag,
  Building,
  Compass,
  Rocket,
  Users2,
  GraduationCap,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useNavigation } from "./NavigationContext";
import { FeedService } from "./FeedService";
import { useProfile } from "./ProfileContext";
// Placeholder for example image - replace with actual image path
const exampleImage = '';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onJoinProject?: (projectId: string, role: string, area: string) => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  milestone?: string;
  source: string;
  lastUpdated: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  progress: number;
  tasks: string[];
  source: string;
  lastUpdated: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  contribution: number;
}

interface CommunityMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  university?: string;
  expertise: string[];
  joinedDate: string;
  bio: string;
}

interface DiasporaPosition {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  commitment: string;
  category: 'leadership' | 'technical' | 'advisory' | 'mentorship' | 'support';
  isActive: boolean;
  currentContributors?: string[];
}

interface JoinOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  targetArea: string;
  requirements?: string[];
}

interface ProjectObjective {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Project types matching CreateProject.tsx exactly
const projectTypes = [
  {
    id: "mentorship",
    label: "Mentorship & Coaching",
    icon: Users,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300",
    description: "Connect mentors with youth/professionals for guidance, coaching, and personal growth",
    features: ["One-on-one sessions", "feedback", "guided progress"]
  },
  {
    id: "academic",
    label: "Academic & Research Projects",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
    description: "Support for study groups, academic research, capstones, and faculty-student collaborations",
    features: ["Research tools", "group collaboration", "citations"]
  },
  {
    id: "career",
    label: "Career & Entrepreneurship",
    icon: Briefcase,
    color: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300",
    description: "Career development, job readiness, business training, or startup projects",
    features: ["Job board", "pitch tools", "entrepreneurship modules"]
  },
  {
    id: "community",
    label: "Community Impact Projects",
    icon: HeartHandshake,
    color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-300",
    description: "Volunteering, advocacy, social innovation, or service-driven missions",
    features: ["Outreach tools", "impact stories", "local partner collab"]
  },
  {
    id: "collaboration",
    label: "Collaboration & Innovation Projects",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300",
    description: "General purpose team-based projects that don't fall neatly into the other categories",
    features: ["Shared workspace", "task manager", "flexible structure"]
  }
];

// Categories matching CreateProject.tsx exactly
const allCategories = [
  { id: "education", label: "Education", icon: BookOpen },
  { id: "healthcare", label: "Healthcare", icon: Stethoscope },
  { id: "agriculture", label: "Agriculture", icon: Sprout },
  { id: "technology", label: "Technology", icon: Zap },
  { id: "environment", label: "Environment", icon: TreePine },
  { id: "energy", label: "Energy", icon: Zap },
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "arts-culture", label: "Arts & Culture", icon: Palette },
  { id: "social-services", label: "Social Services", icon: Heart },
  { id: "security", label: "Security & Defense", icon: Shield },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: Lightbulb },
  { id: "research", label: "Research & Development", icon: BookOpen },
  { id: "others", label: "Others", icon: Folder }
];

// Extended mock data for detailed project view
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design ethics curriculum framework",
    description: "Create comprehensive framework for AI ethics education",
    status: "completed",
    priority: "high",
    assignee: "Dr. Sarah Chen",
    dueDate: "2024-02-15",
    milestone: "1",
    source: 'workroom-task-manager',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    title: "Recruit diaspora mentors",
    description: "Identify and onboard 15 diaspora professionals as mentors",
    status: "completed",
    priority: "high",
    assignee: "Prof. Amara Okafor",
    dueDate: "2024-03-01",
    milestone: "1",
    source: 'workroom-task-manager',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    title: "Develop Module 1: Introduction to AI Ethics",
    description: "Create interactive content and assignments",
    status: "completed",
    priority: "medium",
    assignee: "Maria Rodriguez",
    dueDate: "2024-04-15",
    milestone: "2",
    source: 'workroom-task-manager',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    title: "Student assessment rubric",
    description: "Design evaluation criteria for student progress",
    status: "in-progress",
    priority: "medium",
    assignee: "Dr. Sarah Chen",
    dueDate: "2024-11-01",
    milestone: "3",
    source: 'workroom-task-manager',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "5",
    title: "Final program evaluation",
    description: "Assess overall program effectiveness and impact",
    status: "todo",
    priority: "high",
    assignee: "Dr. Michael Lee",
    dueDate: "2024-12-15",
    milestone: "4",
    source: 'workroom-task-manager',
    lastUpdated: new Date().toISOString()
  }
];

const mockMilestones: Milestone[] = [
  {
    id: "1",
    title: "Program Foundation",
    description: "Establish curriculum framework and diaspora mentor network",
    dueDate: "2024-03-15",
    status: "completed",
    progress: 100,
    tasks: ["1", "2"],
    source: 'auto-generated-from-activities',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "2",
    title: "Content Development",
    description: "Create interactive learning modules with diaspora input",
    dueDate: "2024-06-30",
    status: "completed",
    progress: 100,
    tasks: ["3"],
    source: 'auto-generated-from-activities',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "3",
    title: "Program Implementation",
    description: "Launch pilot program with global diaspora mentors",
    dueDate: "2024-10-31",
    status: "in-progress",
    progress: 75,
    tasks: ["4"],
    source: 'auto-generated-from-activities',
    lastUpdated: new Date().toISOString()
  },
  {
    id: "4",
    title: "Evaluation & Scale",
    description: "Assess impact and prepare for global scaling",
    dueDate: "2024-12-15",
    status: "upcoming",
    progress: 0,
    tasks: ["5"],
    source: 'auto-generated-from-activities',
    lastUpdated: new Date().toISOString()
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@stanford.edu",
    role: "Project Host & Lead",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    contribution: 95
  },
  {
    id: "2",
    name: "Prof. Amara Okafor",
    email: "amara.okafor@mit.edu",
    role: "Diaspora Mentor (MIT)",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    isOnline: false,
    contribution: 92
  },
  {
    id: "3",
    name: "Dr. Michael Lee",
    email: "michael.lee@google.com",
    role: "Industry Expert (Google AI)",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    contribution: 88
  },
  {
    id: "4",
    name: "Dr. Fatima Al-Rashid",
    email: "fatima.rashid@microsoft.com",
    role: "Technical Advisor (Microsoft)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    contribution: 85
  },
  {
    id: "5",
    name: "Marcus Williams",
    email: "marcus.w@aspora.com",
    role: "Community Supporter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isOnline: true,
    contribution: 78
  }
];

const mockCommunityMembers: CommunityMember[] = [
  {
    id: "1",
    name: "Prof. David Kumar",
    role: "Faculty Advisor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    university: "MIT",
    expertise: ["Machine Learning", "AI Ethics", "Computer Vision"],
    joinedDate: "2024-01-20",
    bio: "Professor of AI Ethics at MIT, interested in curriculum development and mentoring"
  },
  {
    id: "2",
    name: "Emma Thompson",
    role: "Student Participant",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    university: "Stanford University",
    expertise: ["Computer Science", "Ethics", "Research"],
    joinedDate: "2024-02-05",
    bio: "CS Graduate student passionate about ethical AI development and looking to contribute"
  },
  {
    id: "3",
    name: "James Wilson",
    role: "Industry Mentor",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    university: "Google",
    expertise: ["AI Safety", "Product Ethics", "Team Leadership"],
    joinedDate: "2024-01-28",
    bio: "Senior AI Ethics Lead at Google, experienced in implementing ethical AI frameworks"
  },
  {
    id: "4",
    name: "Dr. Lisa Park",
    role: "Research Collaborator",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    university: "Carnegie Mellon",
    expertise: ["Educational Technology", "Curriculum Design", "Assessment"],
    joinedDate: "2024-02-10",
    bio: "Assistant Professor specializing in educational technology and AI curriculum development"
  },
  {
    id: "5",
    name: "Marcus Rodriguez",
    role: "Student Participant", 
    university: "UC Berkeley",
    expertise: ["Philosophy", "AI Ethics", "Policy"],
    joinedDate: "2024-02-15",
    bio: "Philosophy major with focus on AI ethics, following the project to learn about curriculum approaches"
  },
  {
    id: "6",
    name: "Sarah Kim",
    role: "Graduate Teaching Assistant",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    university: "Stanford University",
    expertise: ["Teaching", "Student Mentoring", "Curriculum Support"],
    joinedDate: "2024-02-01",
    bio: "PhD candidate interested in supporting course delivery and student mentoring"
  },
  {
    id: "7",
    name: "Dr. Robert Chen",
    role: "External Reviewer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    university: "Microsoft Research",
    expertise: ["AI Research", "Ethics Review", "Industry Standards"],
    joinedDate: "2024-01-25",
    bio: "Principal Researcher at Microsoft, providing external review and industry perspective"
  },
  {
    id: "8",
    name: "Ana Gutierrez",
    role: "Community Advocate",
    university: "Local Tech Community",
    expertise: ["Community Outreach", "Diversity & Inclusion", "Public Speaking"],
    joinedDate: "2024-02-12",
    bio: "Community leader focused on making AI education more accessible and inclusive"
  }
];

const mockRecentActivity = [
  {
    id: "1",
    type: "milestone",
    title: "Completed Module 3: Bias in AI",
    user: "Dr. Sarah Chen",
    timestamp: "2 hours ago",
    description: "Successfully finished development and review of the bias detection module"
  },
  {
    id: "2",
    type: "task",
    title: "Reviewed 15 student submissions",
    user: "Prof. Amara Okafor",
    timestamp: "4 hours ago",
    description: "Provided feedback on ethical case study analyses from diaspora perspective"
  },
  {
    id: "3",
    type: "comment",
    title: "Great progress on the bias detection exercise!",
    user: "Dr. Michael Lee",
    timestamp: "6 hours ago",
    description: "Students are really engaging with the real-world scenarios from industry"
  },
  {
    id: "4",
    type: "update",
    title: "Added 3 new diaspora mentors",
    user: "Dr. Sarah Chen",
    timestamp: "1 day ago",
    description: "Expanded mentor network with experts from MIT, Google, and Microsoft diaspora"
  },
  {
    id: "5",
    type: "task",
    title: "Finalized Module 4 learning objectives",
    user: "Dr. Fatima Al-Rashid",
    timestamp: "2 days ago",
    description: "Outlined goals for AI accountability and transparency section"
  }
];

// Key objectives explaining why this program was created
const projectObjectives: ProjectObjective[] = [
  {
    id: "1",
    title: "Bridge AI Ethics Education Gap",
    description: "Address the critical disconnect between rapidly advancing AI technology and the ethical frameworks needed for responsible development, ensuring students understand both technical capabilities and ethical implications",
    icon: Target
  },
  {
    id: "2", 
    title: "Connect Global Diaspora Expertise",
    description: "Leverage knowledge and experience of diaspora professionals to provide world-class mentorship, real-world perspectives, and industry connections that enhance local learning with global insights",
    icon: Globe
  },
  {
    id: "3",
    title: "Develop Ethical AI Leaders",
    description: "Prepare industry-ready graduates who can champion ethical AI practices in their careers, foster responsible innovation culture, and influence positive change in technology companies worldwide",
    icon: Crown
  }
];

// Join Project Dialog Component - Rebuilt with modern design
function JoinProjectDialog({ project, onJoin, isOpen, onOpenChange, preSelectedRole }: { 
  project: any; 
  onJoin?: (projectId: string, role: string, area: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  preSelectedRole?: string;
}) {
  const [selectedRole, setSelectedRole] = useState(preSelectedRole || "");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useProfile();

  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!dialogOpen) {
      // Delay reset to allow animations to complete
      setTimeout(() => {
        if (!preSelectedRole) {
          setSelectedRole("");
        }
        setMotivation("");
        setExperience("");
        setIsSubmitting(false);
      }, 200);
    }
  }, [dialogOpen, preSelectedRole]);

  // Update selected role when preSelectedRole changes
  React.useEffect(() => {
    if (preSelectedRole) {
      setSelectedRole(preSelectedRole);
    }
  }, [preSelectedRole]);

  const getJoinOptions = (): JoinOption[] => {
    const options: JoinOption[] = [];
    const aspiraCategory = project.projectType;
    const mentorshipConnection = project.mentorshipConnection;

    // Different options based on user's diaspora status
    if (profile.isDiaspora) {
      // Diaspora users get core team options
      if (aspiraCategory === "mentorship" || mentorshipConnection) {
        options.push({
          id: "diaspora-mentor",
          label: "Diaspora Mentor",
          description: "Share global expertise and guide project development",
          icon: Users,
          targetArea: "mentorship",
          requirements: ["Professional experience", "Global perspective", "Mentoring commitment"]
        });
      }

      options.push({
        id: "industry-expert",
        label: "Industry Expert",
        description: "Provide technical guidance and real-world industry insights",
        icon: Briefcase,
        targetArea: "advisory",
        requirements: ["Industry experience", "Technical expertise", "Global network"]
      });

      options.push({
        id: "technical-advisor",
        label: "Technical Advisor",
        description: "Contribute technical expertise and strategic oversight",
        icon: Zap,
        targetArea: "advisory",
        requirements: ["Technical background", "Advisory experience", "Strategic thinking"]
      });

      options.push({
        id: "community-supporter",
        label: "Community Supporter",
        description: "Help with outreach, engagement, and community building",
        icon: HeartHandshake,
        targetArea: "support",
        requirements: ["Community connections", "Communication skills", "Event experience"]
      });
    } else {
      // Non-diaspora users get local participation options
      options.push({
        id: "student-participant",
        label: "Student Participant",
        description: "Learn and contribute as a project participant",
        icon: BookOpen,
        targetArea: "participation",
        requirements: ["Academic eligibility", "Learning commitment", "Active participation"]
      });

      options.push({
        id: "local-supporter",
        label: "Local Supporter",
        description: "Provide local support and assistance",
        icon: HeartHandshake,
        targetArea: "support",
        requirements: ["Local presence", "Support commitment", "Collaborative spirit"]
      });
    }

    return options;
  };

  const joinOptions = getJoinOptions();
  const selectedOption = joinOptions.find(option => option.id === selectedRole);
  const isFormValid = selectedRole && motivation.trim().length >= 10;

  const handleJoin = async () => {
    if (!selectedRole || !selectedOption || !isFormValid) return;

    setIsSubmitting(true);
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      onJoin?.(project.id, selectedRole, selectedOption.targetArea);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error joining project:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Section */}
        <DialogHeader className="flex-shrink-0 px-8 pt-8 pb-6 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#021ff6]/10 border border-[#021ff6]/20">
              <UserPlus className="h-6 w-6 text-[#021ff6]" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">Join This Project</DialogTitle>
              <DialogDescription className="text-base">
                Become part of <span className="font-semibold text-foreground">"{project.title}"</span> and make a meaningful impact
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-6 space-y-8">
            {/* Step 1: Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#021ff6] text-white text-sm font-semibold">
                  1
                </div>
                <div>
                  <Label className="text-lg font-semibold">Choose Your Role</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Select how you'd like to contribute to this project
                  </p>
                </div>
              </div>
              
              {joinOptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRole === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`group relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'border-[#021ff6] bg-[#021ff6]/5 shadow-lg shadow-[#021ff6]/10 scale-[1.02]' 
                            : 'border-border hover:border-[#021ff6]/50 hover:shadow-md bg-card'
                        }`}
                        onClick={() => setSelectedRole(option.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-[#021ff6] flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-[#021ff6] text-white shadow-md' 
                              : 'bg-muted group-hover:bg-[#021ff6]/10'
                          }`}>
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-[#021ff6]'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className={`font-semibold mb-1.5 ${isSelected ? 'text-[#021ff6]' : 'text-foreground'}`}>
                              {option.label}
                            </h5>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {option.description}
                            </p>
                            {option.requirements && option.requirements.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {option.requirements.slice(0, 3).map((req, idx) => (
                                  <Badge 
                                    key={req} 
                                    variant="secondary" 
                                    className={`text-xs px-2 py-0.5 ${
                                      isSelected 
                                        ? 'bg-[#021ff6]/10 text-[#021ff6] border-[#021ff6]/20' 
                                        : 'bg-muted'
                                    }`}
                                  >
                                    {req}
                                  </Badge>
                                ))}
                                {option.requirements.length > 3 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted">
                                    +{option.requirements.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/30">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h5 className="font-semibold text-lg mb-2">No Current Openings</h5>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    This project is not currently seeking new contributors, but you can express interest for future opportunities.
                  </p>
                  <Button variant="outline" size="sm">
                    Express Interest
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2: Application Form */}
            {selectedRole && joinOptions.length > 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Separator className="my-6" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#021ff6] text-white text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <Label className="text-lg font-semibold">Tell Us About Yourself</Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Help us understand your interest and qualifications
                    </p>
                  </div>
                </div>

                {/* Selected Role Preview */}
                {selectedOption && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-[#021ff6] text-white shadow-md">
                        <selectedOption.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                            {selectedOption.label}
                          </h5>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                            Selected
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          {selectedOption.description}
                        </p>
                        {selectedOption.requirements && selectedOption.requirements.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Expected Qualifications:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedOption.requirements.map((req) => (
                                <Badge 
                                  key={req} 
                                  variant="secondary" 
                                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                                >
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="motivation" className="text-base font-medium">
                        Why do you want to join this project? *
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {motivation.length}/500 characters
                      </span>
                    </div>
                    <Textarea
                      id="motivation"
                      placeholder="Share your motivation, what you hope to contribute, and what you'd like to gain from this experience. Be specific about how this aligns with your goals..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value.slice(0, 500))}
                      rows={4}
                      className="resize-none text-base leading-relaxed"
                      maxLength={500}
                    />
                    {motivation.length > 0 && motivation.length < 10 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Please provide at least 10 characters for your motivation
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="experience" className="text-base font-medium">
                        Relevant Experience or Background
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {experience.length}/1000 characters
                      </span>
                    </div>
                    <Textarea
                      id="experience"
                      placeholder="Briefly describe your relevant experience, skills, education, or background that make you a good fit for this role. Include any notable achievements or certifications..."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value.slice(0, 1000))}
                      rows={4}
                      className="resize-none text-base leading-relaxed"
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional but recommended - helps project leaders better understand your fit
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom spacing */}
            <div className="pb-4"></div>
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <DialogFooter className="flex-shrink-0 px-8 py-5 border-t bg-muted/30">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>* Required fields</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleJoin}
                disabled={!isFormValid || isSubmitting}
                className="bg-[#021ff6] hover:bg-[#021ff6]/90 min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectDetail({ projectId, onBack, onJoinProject }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMembersTab, setActiveMembersTab] = useState("core-team");
  const [activeProgressTab, setActiveProgressTab] = useState("milestones-tasks");
  const [workspaceData, setWorkspaceData] = useState<{
    tasks: Task[];
    milestones: Milestone[];
    isLoading: boolean;
  }>({
    tasks: [],
    milestones: [],
    isLoading: false
  });
  
  // Get user profile to check diaspora status
  const { profile } = useProfile();

  // Connect to workspace data and set up live feed integration
  React.useEffect(() => {
    const loadWorkspaceData = async () => {
      setWorkspaceData(prev => ({ ...prev, isLoading: true }));
      
      // In a real app, this would fetch from the workspace APIs
      // For now, we're using the mock data but indicating it comes from workspace
      const workspaceTasks = mockTasks;
      const workspaceMilestones = mockMilestones;
      
      // Simulate API delay
      setTimeout(() => {
        const newWorkspaceData = {
          tasks: workspaceTasks,
          milestones: workspaceMilestones,
          isLoading: false
        };
        
        setWorkspaceData(newWorkspaceData);
        
        // Auto-post milestone updates to live feed
        const feedService = FeedService.getInstance();
        workspaceMilestones.forEach(milestone => {
          if (milestone.status === 'completed') {
            feedService.trackUserAction({
              id: `milestone_${milestone.id}_${Date.now()}`,
              userId: project.authorId || "user_sarah_chen",
              userName: project.authorName || "Dr. Sarah Chen",
              userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
              userLocation: project.location || "Stanford, CA",
              actionType: 'milestone_achieved',
              entityId: milestone.id,
              entityType: 'project',
              entityTitle: milestone.title,
              entityCategory: project.category || 'Education',
              timestamp: new Date().toISOString(),
              metadata: {
                projectId: projectId,
                projectTitle: project.title,
                milestoneDescription: milestone.description,
                progress: milestone.progress,
                dueDate: milestone.dueDate
              },
              visibility: 'public'
            });
          }
        });
      }, 500);
    };

    loadWorkspaceData();
    
    // Set up periodic sync for milestone updates
    const syncInterval = setInterval(() => {
      // Check for milestone status changes and post to feed
      const feedService = FeedService.getInstance();
      
      // Simulate milestone completion events
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomMilestone = mockMilestones[Math.floor(Math.random() * mockMilestones.length)];
        if (randomMilestone.status !== 'completed') {
          feedService.trackUserAction({
            id: `milestone_progress_${randomMilestone.id}_${Date.now()}`,
            userId: project.authorId || "user_sarah_chen", 
            userName: project.authorName || "Dr. Sarah Chen",
            userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
            userLocation: project.location || "Stanford, CA",
            actionType: 'milestone_achieved',
            entityId: randomMilestone.id,
            entityType: 'project',
            entityTitle: `${randomMilestone.title} - Progress Update`,
            entityCategory: project.category || 'Education',
            timestamp: new Date().toISOString(),
            metadata: {
              projectId: projectId,
              projectTitle: project.title,
              milestoneDescription: `${randomMilestone.description} - ${randomMilestone.progress}% complete`,
              progress: randomMilestone.progress
            },
            visibility: 'public'
          });
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(syncInterval);
  }, [projectId]);

  const [hasJoinedProject, setHasJoinedProject] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [preSelectedRole, setPreSelectedRole] = useState("");
  const { navigateToWorkroom } = useNavigation();

  // Project data structure exactly matching CreateProject.tsx output
  const project = {
    id: projectId,
    title: "Stanford AI Ethics Mentorship Program",
    description: "Developing an AI ethics curriculum with Stanford students and industry mentors to promote responsible AI development and deployment across academic and professional settings.",
    authorId: "user_sarah_chen",
    authorName: "Dr. Sarah Chen",
    location: "Stanford, CA",
    
    // Basic Info & Timeline fields from CreateProject.tsx
    projectType: "mentorship", // From step 1 - Project Type selection
    category: "education", // From step 2 - Subject Area
    university: "Stanford University", // From step 2 - University/Institution
    tags: ["AI", "Ethics", "Mentorship", "Stanford", "Global Diaspora"], // From step 3 - Tags
    
    // Timeline fields from CreateProject.tsx step 2
    startDate: "2024-01-15",
    endDate: "2024-12-15", 
    priority: "high",
    status: "active",
    
    // Settings from CreateProject.tsx step 4
    mentorshipConnection: true,
    isPublic: true,
    
    // Team & Positions from CreateProject.tsx step 3
    teamMembers: mockTeamMembers,
    diasporaPositions: [
      {
        id: "technical-advisor",
        title: "Technical Advisor",
        description: "Provide technical guidance and expertise for the program",
        responsibilities: ["Technical oversight", "Expert guidance", "Strategic consultation"],
        requirements: ["Technical expertise", "Advisory experience", "Strong communication"],
        commitment: "8-12 hours/week",
        category: "advisory" as const,
        isActive: true
      },
      {
        id: "diaspora-mentor",
        title: "Diaspora Mentor",
        description: "Guide and support project participants with career and academic advice",
        responsibilities: ["One-on-one mentoring", "Career guidance", "Skill development"],
        requirements: ["Professional experience", "Mentoring background", "Cultural awareness"],
        commitment: "3-5 hours/week",
        category: "mentorship" as const,
        isActive: true
      },
      {
        id: "industry-expert",
        title: "Industry Expert",
        description: "Share industry knowledge and provide real-world perspectives",
        responsibilities: ["Industry insights", "Market analysis", "Professional networking"],
        requirements: ["Industry expertise", "Professional network", "Speaking experience"],
        commitment: "4-6 hours/week",
        category: "technical" as const,
        isActive: true
      },
      {
        id: "community-supporter",
        title: "Community Supporter",
        description: "Help with outreach, engagement, and community building",
        responsibilities: ["Community engagement", "Event support", "Promotion"],
        requirements: ["Community connections", "Communication skills", "Event experience"],
        commitment: "3-4 hours/week",
        category: "support" as const,
        isActive: true
      }
    ],
    
    // Current project progress and metrics
    progress: 75,
    metrics: {
      tasksCompleted: 18,
      totalTasks: 24,
      milestonesHit: 3,
      totalMilestones: 4,
      participantsReached: 156,
      impactScore: 8.7
    }
  };

  const handleJoinProject = (projectId: string, role: string, area: string) => {
    onJoinProject?.(projectId, role, area);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
      setHasJoinedProject(true);
    }, 2000);
    console.log(`Successfully joined project as ${role} in ${area} area`);
  };

  const handleApplyForRole = (positionId: string) => {
    // Map position IDs to role selection IDs that match the join dialog options
    const roleMapping: { [key: string]: string } = {
      'technical-advisor': 'technical-advisor',
      'diaspora-mentor': 'diaspora-mentor',
      'industry-expert': 'industry-expert',
      'community-supporter': 'community-supporter'
    };
    
    const mappedRole = roleMapping[positionId] || 'diaspora-mentor';
    setPreSelectedRole(mappedRole);
    setJoinDialogOpen(true);
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: DiasporaPosition['category']) => {
    switch (category) {
      case 'leadership': return Crown;
      case 'technical': return Zap;
      case 'advisory': return Star;
      case 'mentorship': return Users;
      case 'support': return HeartHandshake;
      default: return Users;
    }
  };

  const getCategoryColor = (category: DiasporaPosition['category']) => {
    switch (category) {
      case 'leadership': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'technical': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'advisory': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'mentorship': return 'bg-green-100 text-green-700 border-green-300';
      case 'support': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };



  // Get project type info
  const projectTypeInfo = projectTypes.find(type => type.id === project.projectType);
  const categoryInfo = allCategories.find(cat => cat.id === project.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Active</span>
            </div>
            <Badge className="bg-orange-100 text-orange-800 text-xs">
              HIGH PRIORITY
            </Badge>
            {projectTypeInfo && (
              <Badge variant="outline" className={`text-xs ${projectTypeInfo.color}`}>
                {projectTypeInfo.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {hasJoinedProject ? (
              <Button
                onClick={() => navigateToWorkroom(projectId)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Video className="h-4 w-4 mr-2" />
                Open Workspace
              </Button>
            ) : showSuccessMessage ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Successfully joined!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <JoinProjectDialog 
                  project={project} 
                  onJoin={handleJoinProject}
                  isOpen={joinDialogOpen}
                  onOpenChange={setJoinDialogOpen}
                  preSelectedRole={preSelectedRole}
                />
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => {
                    setPreSelectedRole("");
                    setJoinDialogOpen(true);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Project
                </Button>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90 text-white" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Project Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
          <p className="text-gray-600 leading-relaxed max-w-4xl">
            {project.description}
          </p>
          <div className="flex items-center gap-2 mt-4">
            {categoryInfo && (
              <Badge variant="outline" className="flex items-center gap-1">
                <categoryInfo.icon className="h-3 w-3" />
                {categoryInfo.label}
              </Badge>
            )}
            {project.university && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {project.university}
              </Badge>
            )}
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Key Objectives Section */}
        <div className="bg-white rounded-lg p-6 mb-8 border">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Key Objectives</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            The fundamental goals that drive this program's mission and the impact we aim to create for students and the broader tech community.
          </p>
          
          <div className="space-y-4">
            {projectObjectives.map((objective, index) => {
              const Icon = objective.icon;
              
              return (
                <div key={objective.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0 mt-1">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-2">{objective.title}</h4>
                    <p className="text-sm text-gray-600">{objective.description}</p>
                  </div>
                  
                  <div className="flex-shrink-0 text-xs text-gray-400 mt-1">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Project Timeline */}
        <div className="bg-white rounded-lg p-6 mb-8 border">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Start Date: {new Date(project.startDate).toLocaleDateString()}</span>
            <span>End Date: {new Date(project.endDate).toLocaleDateString()}</span>
            <span>Priority: {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full" style={{width: `${project.progress}%`}}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {project.progress}% complete
            </div>
            <div className="text-xs text-gray-500">
              3 months remaining
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* How You Can Help - Conditional rendering based on diaspora status */}
        {profile.isDiaspora && (
          <div className="bg-white rounded-lg p-6 mb-8 border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">How the Diaspora Community Can Help</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This project is actively seeking support from the global diaspora community in the following specialized roles:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.diasporaPositions.filter(pos => pos.isActive).map((position) => {
                const Icon = getCategoryIcon(position.category);
                const colorClass = getCategoryColor(position.category);
                
                return (
                  <div key={position.id} className={`border rounded-lg p-4 ${colorClass.replace('text-', 'bg-').replace('border-', 'border-').replace('-700', '-50/30').replace('-300', '-200')}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('border-', '').replace('-700', '-100')}`}>
                        <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-2 ${colorClass.split(' ')[1].replace('-700', '-900')}`}>
                          {position.title}
                        </h4>
                        <p className={`text-sm mb-3 ${colorClass.split(' ')[1].replace('-700', '-800')}`}>
                          {position.description}
                        </p>
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600">Commitment: {position.commitment}</p>
                        </div>
                        <Button 
                          className={`${colorClass.split(' ')[1].replace('-700', '-600')} hover:${colorClass.split(' ')[1].replace('-700', '-700')} text-white`}
                          size="sm"
                          onClick={() => handleApplyForRole(position.id)}
                        >
                          Apply for Role
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* General How You Can Help for non-diaspora users */}
        {!profile.isDiaspora && (
          <div className="bg-white rounded-lg p-6 mb-8 border">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">How You Can Help</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              This project welcomes contributions from students, faculty, and local community members:
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Student Participation */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Student Participants</h4>
                    <p className="text-sm text-green-800 mb-4">
                      Join as a student participant and contribute to research and learning activities
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                      Join as Student
                    </Button>
                  </div>
                </div>
              </div>

              {/* Local Support */}
              <div className="border border-orange-200 rounded-lg p-6 bg-orange-50/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <HeartHandshake className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">Local Support</h4>
                    <p className="text-sm text-orange-800 mb-4">
                      Provide local support, research assistance, or administrative help
                    </p>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" size="sm">
                      Offer Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="mb-8" />

        {/* Bottom Tabs */}
        <div className="bg-white rounded-lg overflow-hidden border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-none border-b">
              <TabsTrigger value="overview" className="text-gray-600 data-[state=active]:text-[#021ff6] data-[state=active]:bg-white">Overview</TabsTrigger>
              <TabsTrigger value="members" className="text-gray-600 data-[state=active]:text-[#021ff6] data-[state=active]:bg-white">Members ({mockTeamMembers.length + mockCommunityMembers.length})</TabsTrigger>
              <TabsTrigger value="progress" className="text-gray-600 data-[state=active]:text-[#021ff6] data-[state=active]:bg-white">Progress</TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div>
                  <h4 className="font-medium mb-3">Project Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">Project Type:</span>
                        <Badge variant="outline" className={projectTypeInfo?.color}>
                          {projectTypeInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">Subject Area:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {categoryInfo && <categoryInfo.icon className="h-3 w-3" />}
                          {categoryInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">Priority:</span>
                        <Badge variant="outline" className={
                          project.priority === 'high' ? 'bg-red-100 text-red-700' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">University:</span>
                        <span className="text-sm text-gray-600">{project.university}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">Status:</span>
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-700">Visibility:</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          {project.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Tags & Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-6 mt-0">
                {/* Members Header with Summary and Sub-navigation */}
                <div className="flex items-center justify-between">
                  {/* Summary Counts */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#021ff6] mb-1">
                        {mockTeamMembers.length + mockCommunityMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Total Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {mockTeamMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Core Team</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {mockCommunityMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                  </div>
                  
                  {/* Sub-navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeMembersTab === "core-team" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveMembersTab("core-team")}
                      className={activeMembersTab === "core-team" ? "bg-[#021ff6] hover:bg-[#021ff6]/90" : ""}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Core Team ({mockTeamMembers.length})
                    </Button>
                    <Button
                      variant={activeMembersTab === "participants" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveMembersTab("participants")}
                      className={activeMembersTab === "participants" ? "bg-[#021ff6] hover:bg-[#021ff6]/90" : ""}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Participants ({mockCommunityMembers.length})
                    </Button>
                  </div>
                </div>

                {/* Core Team Content */}
                {activeMembersTab === "core-team" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Core Team Members</h4>
                      <p className="text-sm text-gray-600">
                        Global diaspora professionals and local leaders contributing as hosts, mentors, industry experts, and strategic advisors
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockTeamMembers.map((member) => {
                        // Determine role-based styling
                        const getRoleColor = (role: string) => {
                          if (role.includes('Host') || role.includes('Lead')) return 'bg-orange-100 text-orange-800 border-orange-200';
                          if (role.includes('Mentor')) return 'bg-blue-100 text-blue-800 border-blue-200';
                          if (role.includes('Industry') || role.includes('Expert') || role.includes('Advisor')) return 'bg-purple-100 text-purple-800 border-purple-200';
                          if (role.includes('Supporter')) return 'bg-green-100 text-green-800 border-green-200';
                          return 'bg-gray-100 text-gray-800 border-gray-200';
                        };

                        const getRoleIcon = (role: string) => {
                          if (role.includes('Host') || role.includes('Lead')) return <Star className="h-3 w-3" />;
                          if (role.includes('Mentor')) return <Users className="h-3 w-3" />;
                          if (role.includes('Industry') || role.includes('Expert') || role.includes('Advisor')) return <Briefcase className="h-3 w-3" />;
                          if (role.includes('Supporter')) return <HeartHandshake className="h-3 w-3" />;
                          return <Users className="h-3 w-3" />;
                        };

                        return (
                          <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-blue-50/50">
                            <Avatar className="h-12 w-12">
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} alt={member.name} />
                              ) : (
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{member.name}</h5>
                                <Badge className={`${getRoleColor(member.role)} flex items-center gap-1 text-xs`}>
                                  {getRoleIcon(member.role)}
                                  Core Team
                                </Badge>
                                {member.isOnline && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                              <p className="text-xs text-gray-500 mb-2">{member.email}</p>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Community Impact</span>
                                <span>{member.contribution}%</span>
                              </div>
                              <Progress value={member.contribution} className="h-1" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Participants Content */}
                {activeMembersTab === "participants" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Project Participants</h4>
                      <p className="text-sm text-gray-600">
                        Community members participating in this project as contributors, learners, or supporters
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {mockCommunityMembers.map((member) => (
                        <div key={member.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} alt={member.name} />
                              ) : (
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h5 className="font-medium">{member.name}</h5>
                                  <p className="text-sm text-gray-600">{member.role}</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  Participant
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{member.bio}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {member.expertise.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {member.expertise.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{member.expertise.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {member.university && (
                                    <span className="text-xs text-gray-500">{member.university}</span>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    Joined {new Date(member.joinedDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-6 mt-0">
                {/* Progress Header with Sub-navigation */}
                <div className="flex items-center justify-between">
                  {/* Progress Summary */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#021ff6] mb-1">{project.progress}%</div>
                      <div className="text-sm text-gray-600">Overall Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {workspaceData.isLoading ? "..." : `${workspaceData.tasks.filter(t => t.status === 'completed').length}/${workspaceData.tasks.length}`}
                      </div>
                      <div className="text-sm text-gray-600">Tasks (Workroom)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {workspaceData.isLoading ? "..." : `${workspaceData.milestones.filter(m => m.status === 'completed').length}/${workspaceData.milestones.length}`}
                      </div>
                      <div className="text-sm text-gray-600">Milestones (Auto)</div>
                    </div>
                  </div>
                  
                  {/* Progress Sub-navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeProgressTab === "milestones-tasks" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveProgressTab("milestones-tasks")}
                      className={activeProgressTab === "milestones-tasks" ? "bg-[#021ff6] hover:bg-[#021ff6]/90" : ""}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Milestones + Tasks ({workspaceData.isLoading ? "..." : workspaceData.milestones.length + workspaceData.tasks.length})
                    </Button>
                    <Button
                      variant={activeProgressTab === "analytics" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveProgressTab("analytics")}
                      className={activeProgressTab === "analytics" ? "bg-[#021ff6] hover:bg-[#021ff6]/90" : ""}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>

                {/* Integrated Milestones + Tasks Content */}
                {activeProgressTab === "milestones-tasks" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2 text-blue-900">Connected to Project Workroom</h4>
                          <p className="text-sm text-blue-800 mb-3">
                            Tasks are created and assigned in the workroom using the Task Manager. 
                            Milestones are automatically generated based on project activities and completed tasks from the workshop.
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigateToWorkroom(projectId)}
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open Workroom
                            </Button>
                            <span className="text-xs text-blue-600">
                              Live data synced from workspace
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Milestones & Tasks</h4>
                      <p className="text-sm text-gray-600">
                        Track major deliverables and their associated tasks across the project timeline
                      </p>
                    </div>
                    
                    {workspaceData.isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Loading workspace data...</p>
                        </div>
                      </div>
                    ) : (
                      workspaceData.milestones.map((milestone) => (
                        <div key={milestone.id} className="border rounded-lg p-6 space-y-4">
                          {/* Milestone Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{milestone.title}</h4>
                                <p className="text-sm text-gray-600">{milestone.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                    Auto-generated
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Updated: {new Date(milestone.lastUpdated).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className={
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {milestone.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            <span>{milestone.progress}% Complete</span>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>
                        
                        <Separator />
                        
                        {/* Associated Tasks */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Associated Tasks</span>
                          </div>
                          
                          <div className="space-y-3 ml-6">
                            {workspaceData.tasks
                              .filter(task => milestone.tasks.includes(task.id))
                              .map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getPriorityIcon(task.priority)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h6 className="font-medium text-sm">{task.title}</h6>
                                      <Badge variant="outline" className={getTaskStatusColor(task.status) + " text-xs"}>
                                        {task.status.replace('-', ' ')}
                                      </Badge>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                        Workroom
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span>{task.assignee}</span>
                                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                      <span>Updated: {new Date(task.lastUpdated).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                    
                    <Separator />
                    
                    {/* Unassigned Tasks */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Additional Tasks</span>
                        <Badge variant="outline" className="text-xs">
                          {workspaceData.tasks.filter(task => !workspaceData.milestones.some(m => m.tasks.includes(task.id))).length} tasks
                        </Badge>
                      </div>
                      
                      {workspaceData.tasks
                        .filter(task => !workspaceData.milestones.some(m => m.tasks.includes(task.id)))
                        .map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              {getPriorityIcon(task.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">{task.title}</h5>
                                <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                                  {task.status.replace('-', ' ')}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  From Workroom
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Assigned to: {task.assignee}</span>
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                <span>Priority: {task.priority}</span>
                                <span>Updated: {new Date(task.lastUpdated).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Analytics Content */}
                {activeProgressTab === "analytics" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Project Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Performance metrics and activity tracking
                      </p>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h5 className="font-medium mb-4">Performance Metrics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-semibold text-blue-600">{project.progress}%</div>
                          <div className="text-xs text-blue-700">Completion Rate</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-semibold text-green-600">{mockTeamMembers.length + mockCommunityMembers.length}</div>
                          <div className="text-xs text-green-700">Active Contributors</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-semibold text-purple-600">{project.metrics.impactScore}/10</div>
                          <div className="text-xs text-purple-700">Impact Score</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                          <div className="text-2xl font-semibold text-orange-600">{project.metrics.participantsReached}</div>
                          <div className="text-xs text-orange-700">Students Impacted</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Recent Activity */}
                    <div>
                      <h5 className="font-medium mb-4">Recent Activity</h5>
                      <div className="space-y-4">
                        {mockRecentActivity.map((activity) => (
                          <div key={activity.id} className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <Activity className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-sm">{activity.title}</h5>
                                <span className="text-xs text-gray-500">by {activity.user}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                              <span className="text-xs text-gray-500">{activity.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Global Diaspora Impact Section - Moved below tabs */}
        {profile.isDiaspora && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HeartHandshake className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-green-900 mb-2">Global Diaspora Impact</h5>
                <p className="text-sm text-green-800">
                  The diaspora community is already making significant contributions! Our core team includes professionals from 
                  MIT, Google, Microsoft, and other leading institutions who are leveraging their global expertise to advance 
                  AI ethics education worldwide.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}