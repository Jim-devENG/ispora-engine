import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogOverlay, DialogPortal } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { UserProfileModal } from "./UserProfileModal";
import { MessagingPopover, MessagingUser } from "./MessagingPopover";
import { useNavigation } from "./NavigationContext";
import { useProfile, profileToNetworkUser } from "./ProfileContext";
import { 
  Users, 
  Search, 
  Filter,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  Globe,
  Send,
  Check,
  X,
  MoreHorizontal,
  Eye,
  ArrowRight,
  Zap,
  Award,
  Target,
  Coffee,
  Video,
  Calendar,
  BookOpen,
  Heart,
  Users2,
  Building,
  Code,
  Palette,
  BarChart3,
  Rocket,
  Lightbulb,
  Shield,
  Camera,
  Music,
  Plane,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Sparkles
} from "lucide-react";

// Types and Interfaces
interface NetworkUser {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  location: string;
  university: string;
  graduationYear: string;
  program: string;
  bio: string;
  skills: string[];
  expertise: string[];
  role: 'mentor' | 'professional' | 'alumni' | 'student' | 'researcher' | 'entrepreneur';
  experience: number; // years
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
  mutualConnections: number;
  responseRate: number;
  isVerified: boolean;
  isOnline: boolean;
  lastActive: string;
  interests: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  achievements?: {
    title: string;
    description: string;
    date: string;
  }[];
  availability?: {
    mentoring: boolean;
    collaboration: boolean;
    consultation: boolean;
    volunteering?: boolean;
    speaking?: boolean;
    advising?: boolean;
  };
  openTo?: string[]; // New field for "Open To" tags
}

interface ConnectionRequest {
  id: string;
  from: NetworkUser;
  to: NetworkUser;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'connection' | 'mentorship' | 'collaboration';
  purpose?: string; // New field for request purpose
}

interface NetworkStats {
  totalConnections: number;
  pendingRequests: number;
  sentRequests: number;
  profileViews: number;
  monthlyGrowth: number;
}

// Mock data with enhanced availability and openTo fields
const mockUsers: NetworkUser[] = [
  {
    id: '1',
    name: 'Dr. Kwame Asante',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Senior AI Research Scientist',
    company: 'Google DeepMind',
    location: 'London, UK',
    university: 'Stanford University',
    graduationYear: '2015',
    program: 'PhD Computer Science',
    bio: 'Leading AI research in natural language processing and machine learning ethics. Passionate about mentoring the next generation of African tech leaders.',
    skills: ['Machine Learning', 'NLP', 'Python', 'TensorFlow', 'Research'],
    expertise: ['Artificial Intelligence', 'Deep Learning', 'Ethics in AI'],
    role: 'mentor',
    experience: 8,
    connectionStatus: 'none',
    mutualConnections: 12,
    responseRate: 95,
    isVerified: true,
    isOnline: true,
    lastActive: '2 minutes ago',
    interests: ['AI Ethics', 'Mentorship', 'Tech Leadership'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/kwameasante',
      twitter: 'https://twitter.com/kwameasante'
    },
    achievements: [
      {
        title: 'Best Paper Award - NeurIPS 2023',
        description: 'For groundbreaking research in ethical AI frameworks',
        date: '2023-12-15'
      }
    ],
    availability: {
      mentoring: true,
      collaboration: true,
      consultation: false,
      speaking: true,
      advising: true
    },
    openTo: ['Mentorship', 'Collaboration', 'Speaking']
  },
  {
    id: '2',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Product Manager',
    company: 'Stripe',
    location: 'San Francisco, CA',
    university: 'MIT',
    graduationYear: '2018',
    program: 'MS Computer Science',
    bio: 'Building fintech products that democratize access to financial services across Africa. Alumni mentor and startup advisor.',
    skills: ['Product Management', 'Fintech', 'Strategy', 'Data Analysis'],
    expertise: ['Product Strategy', 'Financial Technology', 'User Experience'],
    role: 'professional',
    experience: 6,
    connectionStatus: 'connected',
    mutualConnections: 8,
    responseRate: 88,
    isVerified: true,
    isOnline: false,
    lastActive: '1 hour ago',
    interests: ['Fintech', 'Product Strategy', 'African Markets'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/amaraokafor',
      email: 'amara@stripe.com'
    },
    availability: {
      mentoring: true,
      collaboration: false,
      consultation: true,
      advising: true
    },
    openTo: ['Mentorship', 'Consulting']
  },
  {
    id: '3',
    name: 'David Mensah',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'PhD Student',
    company: 'University of Oxford',
    location: 'Oxford, UK',
    university: 'University of Oxford',
    graduationYear: '2025',
    program: 'PhD Environmental Engineering',
    bio: 'Researching sustainable water systems for African communities. Looking for mentorship in research commercialization and impact scaling.',
    skills: ['Environmental Engineering', 'Research', 'Sustainability', 'Water Systems'],
    expertise: ['Environmental Science', 'Sustainable Technology', 'Research'],
    role: 'student',
    experience: 2,
    connectionStatus: 'pending_received',
    mutualConnections: 5,
    responseRate: 92,
    isVerified: false,
    isOnline: true,
    lastActive: 'Just now',
    interests: ['Sustainability', 'Water Systems', 'Climate Change'],
    availability: {
      mentoring: false,
      collaboration: true,
      consultation: false,
      volunteering: true
    },
    openTo: ['Collaboration', 'Volunteering']
  },
  {
    id: '4',
    name: 'Dr. Fatima Al-Rashid',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    title: 'Founder & CEO',
    company: 'HealthTech Solutions',
    location: 'Cairo, Egypt',
    university: 'Harvard Medical School',
    graduationYear: '2012',
    program: 'MD, MBA',
    bio: 'Building healthcare technology solutions for emerging markets. Serial entrepreneur and angel investor focused on African startups.',
    skills: ['Healthcare', 'Entrepreneurship', 'Investment', 'Strategy'],
    expertise: ['HealthTech', 'Startup Strategy', 'Angel Investing'],
    role: 'entrepreneur',
    experience: 12,
    connectionStatus: 'pending_sent',
    mutualConnections: 15,
    responseRate: 85,
    isVerified: true,
    isOnline: false,
    lastActive: '3 hours ago',
    interests: ['HealthTech', 'Entrepreneurship', 'Angel Investing'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/fatimaalrashid',
      twitter: 'https://twitter.com/fatimaalrashid'
    },
    availability: {
      mentoring: true,
      collaboration: false,
      consultation: true,
      advising: true,
      speaking: true
    },
    openTo: ['Mentorship', 'Consulting', 'Speaking']
  },
  {
    id: '5',
    name: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face',
    title: 'Design Director',
    company: 'Figma',
    location: 'New York, NY',
    university: 'Parsons School of Design',
    graduationYear: '2016',
    program: 'MFA Design Technology',
    bio: 'Leading design systems and user experience for global creative tools. Passionate about design education and accessibility.',
    skills: ['UX Design', 'Design Systems', 'Leadership', 'Accessibility'],
    expertise: ['User Experience', 'Design Systems', 'Creative Direction'],
    role: 'professional',
    experience: 8,
    connectionStatus: 'none',
    mutualConnections: 7,
    responseRate: 90,
    isVerified: true,
    isOnline: true,
    lastActive: '15 minutes ago',
    interests: ['Design', 'Accessibility', 'Creative Tools'],
    availability: {
      mentoring: true,
      collaboration: false,
      consultation: true,
      volunteering: false
    },
    openTo: ['Mentorship', 'Consulting']
  }
];

const mockConnectionRequests: ConnectionRequest[] = [
  {
    id: '1',
    from: mockUsers[2], // David Mensah
    to: mockUsers[0], // Current user (Dr. Kwame Asante)
    message: 'Hi! I\'m working on sustainable water systems research and would love to connect. I\'ve read your papers on AI applications in environmental science and think there could be interesting collaboration opportunities.',
    timestamp: '2025-01-10T14:30:00Z',
    status: 'pending',
    type: 'mentorship',
    purpose: 'Seeking research mentorship and collaboration on AI applications in environmental science'
  },
  {
    id: '2',
    from: mockUsers[4], // Sarah Williams
    to: mockUsers[0], // Current user
    message: 'Hello! I came across your profile through the Stanford alumni network. I\'d love to connect and learn more about your work in AI ethics.',
    timestamp: '2025-01-09T09:15:00Z',
    status: 'pending',
    type: 'connection',
    purpose: 'Stanford alumni networking and AI ethics discussion'
  }
];

// Network stats will be calculated dynamically based on actual data

// Role configurations
const roleConfig = {
  mentor: { color: 'bg-blue-100 text-blue-800', icon: Users },
  professional: { color: 'bg-green-100 text-green-800', icon: Briefcase },
  alumni: { color: 'bg-purple-100 text-purple-800', icon: GraduationCap },
  student: { color: 'bg-orange-100 text-orange-800', icon: BookOpen },
  researcher: { color: 'bg-indigo-100 text-indigo-800', icon: Target },
  entrepreneur: { color: 'bg-red-100 text-red-800', icon: Rocket }
};

// "Open To" tag configurations with colors and icons
const openToConfig = {
  'Mentorship': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', 
    icon: Users 
  },
  'Collaboration': { 
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800', 
    icon: Users2 
  },
  'Volunteering': { 
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800', 
    icon: Heart 
  },
  'Consulting': { 
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800', 
    icon: Briefcase 
  },
  'Speaking': { 
    color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800', 
    icon: Video 
  },
  'Advising': { 
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800', 
    icon: Lightbulb 
  }
};

// Skill icons mapping
const skillIcons: Record<string, any> = {
  'Machine Learning': Zap,
  'Product Management': Target,
  'Design': Palette,
  'Research': BookOpen,
  'Healthcare': Heart,
  'Entrepreneurship': Rocket,
  'Investment': TrendingUp,
  'Strategy': BarChart3,
  'Engineering': Code,
  'Leadership': Award
};

// Connection purpose options
const connectionPurposes = [
  'General networking and professional connection',
  'Seeking mentorship in your field of expertise',
  'Collaboration opportunity on projects',
  'Interest in your research/work',
  'Alumni networking and career advice',
  'Partnership or business opportunity',
  'Speaking or event opportunity',
  'Learning and knowledge sharing',
  'Custom - I\'ll explain in my message'
];

// Enhanced Connection Request Modal Component
function ConnectionRequestModal({ 
  user, 
  isOpen, 
  onClose, 
  onSubmit 
}: {
  user: NetworkUser;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purpose: string, message: string) => void;
}) {
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isCustomPurpose, setIsCustomPurpose] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Connection purpose options - moved inside component for better scope
  const connectionPurposes = [
    'General networking and professional connection',
    'Seeking mentorship in your field of expertise',
    'Collaboration opportunity on projects',
    'Interest in your research/work',
    'Alumni networking and career advice',
    'Partnership or business opportunity',
    'Speaking or event opportunity',
    'Learning and knowledge sharing',
    'Custom - I\'ll explain in my message'
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPurpose('');
      setCustomMessage('');
      setIsCustomPurpose(false);
      setDropdownOpen(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handlePurposeChange = (value: string) => {
    setSelectedPurpose(value);
    setIsCustomPurpose(value.includes('Custom'));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setDropdownOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleOptionSelect = (purpose: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.backgroundColor = '#3b82f6';
    target.style.color = 'white';
    
    // Reset after a brief moment and apply the selection
    setTimeout(() => {
      handlePurposeChange(purpose);
      setDropdownOpen(false);
    }, 100);
  };

  const handleSubmit = () => {
    if (!selectedPurpose) {
      toast.error('Please select a purpose for your connection request.');
      return;
    }
    if (!customMessage.trim()) {
      toast.error('Please add a personal message to your connection request.');
      return;
    }
    
    onSubmit(selectedPurpose, customMessage);
    onClose();
  };

  return (
    <div className="connection-request-modal">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg z-[51]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Connect with {user.name}
          </DialogTitle>
          <DialogDescription>
            Tell them why you're reaching out
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.title} at {user.company}</p>
            </div>
          </div>

          {/* Request Purpose - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Label className="text-sm font-medium mb-2 block">Request Purpose</Label>
            <div className="relative">
              <button
                type="button"
                onClick={handleDropdownToggle}
                onKeyDown={handleKeyDown}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="listbox"
              >
                <span className={selectedPurpose ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"}>
                  {selectedPurpose || "Select why you want to connect..."}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} text-gray-500 dark:text-gray-400`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-[60] mt-1 max-h-[300px] min-w-full overflow-auto rounded-md border bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700 p-1">
                  {connectionPurposes.map((purpose, index) => (
                    <button
                      key={`purpose-${index}`}
                      type="button"
                      onClick={(e) => handleOptionSelect(purpose, e)}
                      className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 text-left text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Personal Message</Label>
            <Textarea
              placeholder={isCustomPurpose 
                ? "Explain your custom request and why you'd like to connect..."
                : "Write a personalized message explaining more about your request..."
              }
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Selected Purpose Confirmation */}
          {selectedPurpose && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-1">Purpose Selected</p>
                  <p>{selectedPurpose}</p>
                </div>
              </div>
            </div>
          )}

          {/* Helper Text */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">💡 Connection Tip</p>
                <p>Let them know what you're looking for. Be clear and specific to build meaningful connections.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to convert NetworkUser to MessagingUser
const convertToMessagingUser = (user: NetworkUser): MessagingUser => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  isOnline: user.isOnline,
  lastSeen: user.lastActive
});

// User Discovery Component
function UserDiscovery({ users, onConnect, onViewProfile }: {
  users: NetworkUser[];
  onConnect: (userId: string, purpose: string, message: string) => void;
  onViewProfile: (userId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesLocation = locationFilter === 'all' || 
                           user.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'mentoring' && user.availability?.mentoring) ||
                               (availabilityFilter === 'collaboration' && user.availability?.collaboration) ||
                               (availabilityFilter === 'consultation' && user.availability?.consultation);

    return matchesSearch && matchesRole && matchesLocation && matchesAvailability;
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(users.map(user => user.location.split(',')[1]?.trim() || user.location.split(',')[0])));

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="mentor">Mentors</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="researcher">Researchers</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Availability</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Availability</SelectItem>
                    <SelectItem value="mentoring">Available for Mentoring</SelectItem>
                    <SelectItem value="collaboration">Open to Collaboration</SelectItem>
                    <SelectItem value="consultation">Offering Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map(user => (
          <UserCard 
            key={user.id} 
            user={user} 
            onConnect={onConnect}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
}

// Enhanced User Card Component with "Open To" tags and View Profile button
function UserCard({ user, onConnect, onViewProfile }: {
  user: NetworkUser;
  onConnect: (userId: string, purpose: string, message: string) => void;
  onViewProfile: (userId: string) => void;
}) {
  const [showConnectModal, setShowConnectModal] = useState(false);

  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  const handleConnect = (purpose: string, message: string) => {
    onConnect(user.id, purpose, message);
    toast.success(`Connection request sent to ${user.name}!`);
  };

  // Get up to 3 "Open To" tags from user's openTo array
  const openToTags = user.openTo?.slice(0, 3) || [];

  const getConnectionButton = () => {
    switch (user.connectionStatus) {
      case 'connected':
        return (
          <MessagingPopover
            user={convertToMessagingUser(user)}
            trigger={
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            }
          />
        );
      case 'pending_sent':
        return (
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button variant="outline" size="sm" className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        );
      default:
        return (
          <>
            <Button 
              size="sm" 
              className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
              onClick={() => setShowConnectModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
            </Button>
            <ConnectionRequestModal
              user={user}
              isOpen={showConnectModal}
              onClose={() => setShowConnectModal(false)}
              onSubmit={handleConnect}
            />
          </>
        );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                  {user.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{user.title}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toast.success(`Opening chat with ${user.name}...`)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role and Company */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={roleInfo.color} variant="secondary">
                <RoleIcon className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
              <span className="text-sm text-gray-600">{user.company}</span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {user.location}
            </p>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>

          {/* Open To Tags */}
          {openToTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500">Open To:</Label>
              <div className="flex flex-wrap gap-1">
                {openToTags.map((tag, index) => {
                  const config = openToConfig[tag as keyof typeof openToConfig];
                  const TagIcon = config?.icon || Target;
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs px-2 py-1 border ${config?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mutual Connections & Response Rate */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{user.mutualConnections} mutual connections</span>
            <span>{user.responseRate}% response rate</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {getConnectionButton()}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewProfile(user.id)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Connection Request Card with View Profile functionality
function ConnectionRequestCard({ request, onAccept, onDecline, onViewProfile }: {
  request: ConnectionRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onViewProfile: (userId: string) => void;
}) {
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const roleInfo = roleConfig[request.from.role];
  const RoleIcon = roleInfo.icon;

  // Get up to 2 "Open To" tags for compact display
  const openToTags = request.from.openTo?.slice(0, 2) || [];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.from.avatar} alt={request.from.name} />
                  <AvatarFallback>
                    {request.from.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {request.from.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{request.from.name}</h4>
                  {request.from.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{request.from.title}</p>
                <p className="text-xs text-gray-500">{request.from.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{formatTimeAgo(request.timestamp)}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile(request.from.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => toast.success(`Opening chat with ${request.from.name}...`)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Request Type & Role */}
          <div className="flex items-center gap-2">
            <Badge className={roleInfo.color} variant="secondary">
              <RoleIcon className="h-3 w-3 mr-1" />
              {request.from.role}
            </Badge>
            <Badge variant="outline" className={
              request.type === 'mentorship' 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-green-50 text-green-700 border-green-200'
            }>
              {request.type === 'mentorship' ? 'Mentorship Request' : 'Connection Request'}
            </Badge>
          </div>

          {/* Open To Tags */}
          {openToTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {openToTags.map((tag, index) => {
                const config = openToConfig[tag as keyof typeof openToConfig];
                const TagIcon = config?.icon || Target;
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs px-2 py-1 border ${config?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Request Purpose */}
          {request.purpose && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-1">Request Purpose:</p>
              <p className="text-sm text-gray-800">{request.purpose}</p>
            </div>
          )}

          {/* Message */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-800">{request.message}</p>
          </div>

          {/* Mutual Connections */}
          <div className="text-xs text-gray-500">
            {request.from.mutualConnections} mutual connections
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => onAccept(request.id)}
              className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDecline(request.id)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onViewProfile(request.from.id)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Connected User Card with View Profile functionality
function ConnectedUserCard({ user, onViewProfile }: {
  user: NetworkUser;
  onViewProfile: (userId: string) => void;
}) {
  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  // Get up to 2 "Open To" tags for compact display
  const openToTags = user.openTo?.slice(0, 2) || [];

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{user.name}</h4>
                  {user.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{user.title}</p>
                <p className="text-xs text-gray-500">{user.company}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewProfile(user.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toast.success(`Opening chat with ${user.name}...`)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success(`Scheduling meeting with ${user.name}...`)}>
                  <Video className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Role and Status */}
          <div className="flex items-center gap-2">
            <Badge className={roleInfo.color} variant="secondary">
              <RoleIcon className="h-3 w-3 mr-1" />
              {user.role}
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <UserCheck className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>

          {/* Open To Tags */}
          {openToTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {openToTags.map((tag, index) => {
                const config = openToConfig[tag as keyof typeof openToConfig];
                const TagIcon = config?.icon || Target;
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`text-xs px-2 py-1 border ${config?.color || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Last Active */}
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Active {user.lastActive}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <MessagingPopover
              user={convertToMessagingUser(user)}
              trigger={
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              }
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewProfile(user.id)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Network Component
export function MyNetwork() {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>(mockConnectionRequests);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { navigate } = useNavigation();
  const { profile } = useProfile();

  // Calculate dynamic stats based on actual data
  const discoveryUsers = mockUsers.filter(user => user.connectionStatus === 'none');
  const connectedUsers = mockUsers.filter(user => user.connectionStatus === 'connected');
  const currentUserAsNetworkUser = profileToNetworkUser(profile);
  const allConnectedUsers = [currentUserAsNetworkUser, ...connectedUsers];
  const sentRequests = mockUsers.filter(user => user.connectionStatus === 'pending_sent').length;
  
  const networkStats: NetworkStats = {
    totalConnections: allConnectedUsers.length,
    pendingRequests: connectionRequests.length,
    sentRequests: sentRequests,
    profileViews: 45, // This would come from analytics in a real app
    monthlyGrowth: 12  // This would come from analytics in a real app
  };

  // Handle connection request
  const handleConnect = (userId: string, purpose: string, message: string) => {
    console.log('Connection request:', { userId, purpose, message });
    toast.success('Connection request sent successfully!');
  };

  // Handle view profile
  const handleViewProfile = (userId: string) => {
    // If viewing current user's profile, navigate to profile page
    if (userId === profile.id) {
      navigate('Profile');
      return;
    }
    
    // Otherwise, show profile modal
    setSelectedProfileUserId(userId);
    setIsProfileModalOpen(true);
  };

  // Handle view my profile
  const handleViewMyProfile = () => {
    navigate('Profile');
    toast.success('Opening your profile page...');
  };

  // Handle accept connection request
  const handleAcceptRequest = (requestId: string) => {
    setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Connection request accepted!');
  };

  // Handle decline connection request
  const handleDeclineRequest = (requestId: string) => {
    setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Connection request declined');
  };

  // Get selected user for profile modal
  const selectedUser = selectedProfileUserId ? mockUsers.find(u => u.id === selectedProfileUserId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Network</h1>
            <p className="text-sm text-muted-foreground">
              Connect with professionals across the diaspora community
            </p>
          </div>
          <Button 
            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
            onClick={handleViewMyProfile}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            View My Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{networkStats.totalConnections}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">{networkStats.pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-green-600">{networkStats.profileViews}</div>
              <div className="text-sm text-muted-foreground">Profile Views</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-purple-600">{networkStats.sentRequests}</div>
              <div className="text-sm text-muted-foreground">Sent Requests</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="discovery" className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b bg-background px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discovery">People to Follow</TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                Requests
                {connectionRequests.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {connectionRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="connections">My Connections</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="discovery" className="h-full m-0 p-6">
              <div className="h-full">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">People to Follow</h2>
                  <p className="text-sm text-muted-foreground">
                    Discover and connect with professionals in your field and interests
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-120px)]">
                  <UserDiscovery 
                    users={discoveryUsers} 
                    onConnect={handleConnect}
                    onViewProfile={handleViewProfile}
                  />
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="h-full m-0 p-6">
              <div className="h-full">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Connection Requests</h2>
                  <p className="text-sm text-muted-foreground">
                    Review and respond to connection requests
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-120px)]">
                  <div className="space-y-4">
                    {connectionRequests.map(request => (
                      <ConnectionRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                    {connectionRequests.length === 0 && (
                      <div className="text-center py-12">
                        <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No pending requests</h3>
                        <p className="text-gray-500 dark:text-gray-400">You're all caught up! New requests will appear here.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="connections" className="h-full m-0 p-6">
              <div className="h-full">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">My Connections</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your professional network and stay in touch
                  </p>
                </div>
                <ScrollArea className="h-[calc(100%-120px)]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allConnectedUsers.map(user => (
                      <ConnectedUserCard
                        key={user.id}
                        user={user}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                  </div>
                  {allConnectedUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No connections yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">Start connecting with people to build your network!</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedProfileUserId(null);
          }}
        />
      )}
    </div>
  );
}
