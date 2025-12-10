import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Briefcase,
  Users,
  Award,
  Rocket,
  DollarSign,
  Calendar,
  MessageSquare,
  Heart,
  TrendingUp,
  ArrowUp,
  Bookmark,
  Eye,
  Clock,
  MapPin,
  Building,
  ExternalLink,
  Send,
  Star,
  Globe,
  Zap,
  Target,
  GraduationCap,
  Lightbulb,
  Banknote,
  CalendarDays,
  Megaphone,
  ChevronDown,
  SlidersHorizontal,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  X,
  Link,

} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";



interface Opportunity {
  id: string;
  title: string;
  type: 'scholarship' | 'job' | 'internship' | 'fellowship' | 'accelerator' | 'grant' | 'event' | 'community' | 'others';
  company: string;
  location: string;
  remote: boolean;
  description: string;
  requirements?: string[];
  benefits?: string[];
  amount?: {
    value: number;
    currency: string;
    type: 'salary' | 'stipend' | 'award' | 'funding';
  };
  duration?: string;
  commitment?: string;
  postedBy: {
    name: string;
    title: string;
    company: string;
    avatar?: string;
    isVerified: boolean;
  };
  university?: string;
  tags: string[];
  applicants: number;
  deadline?: string;
  eventDate?: string;
  postedDate: string;
  featured: boolean;
  urgent: boolean;
  boost: number;
  saved: boolean;
  applied: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'any';
  category: string;
  eligibility?: string[];
  applicationLink?: string;
  comments: number;
  fullDescription?: string;
  applicationProcess?: string[];
  contactInfo?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

const opportunityCategories = [
  {
    id: "all",
    label: "All Opportunities",
    icon: Target,
    color: "bg-gray-100 text-gray-700",
    description: "Browse all available opportunities"
  },
  {
    id: "scholarship",
    label: "🎓 Scholarships",
    icon: GraduationCap,
    color: "bg-blue-100 text-blue-700",
    description: "Academic and research scholarships at all levels"
  },
  {
    id: "job",
    label: "💼 Jobs & Remote Work",
    icon: Briefcase,
    color: "bg-green-100 text-green-700",
    description: "Global and local job postings (full-time, part-time, freelance)"
  },
  {
    id: "internship",
    label: "🤝 Internships",
    icon: Users,
    color: "bg-purple-100 text-purple-700",
    description: "Virtual and physical internships, local or international"
  },
  {
    id: "fellowship",
    label: "🧪 Fellowships",
    icon: Lightbulb,
    color: "bg-orange-100 text-orange-700",
    description: "Research or leadership-focused fellowships"
  },
  {
    id: "accelerator",
    label: "🚀 Accelerators",
    icon: Rocket,
    color: "bg-red-100 text-red-700",
    description: "Startup programs, pitch competitions, incubation offers"
  },
  {
    id: "grant",
    label: "💰 Grants",
    icon: Banknote,
    color: "bg-emerald-100 text-emerald-700",
    description: "Research grants, innovation funds, NGO & impact-driven funding"
  },
  {
    id: "event",
    label: "📅 Events/Conferences",
    icon: CalendarDays,
    color: "bg-indigo-100 text-indigo-700",
    description: "Hackathons, summits, and global callouts"
  },
  {
    id: "community",
    label: "📢 Community Highlights",
    icon: Megaphone,
    color: "bg-pink-100 text-pink-700",
    description: "User-submitted gigs, calls for collaborators, peer support opportunities"
  },
  {
    id: "others",
    label: "🔗 Others",
    icon: MoreHorizontal,
    color: "bg-gray-100 text-gray-700",
    description: "Miscellaneous opportunities, special programs, and unique offerings"
  }
];

const mockOpportunities: Opportunity[] = [
  {
    id: "1",
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
    }
  },
  {
    id: "2",
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
    }
  },
  {
    id: "3",
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
    }
  },
  {
    id: "4",
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
    }
  },
  {
    id: "5",
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
    }
  },
  {
    id: "6",
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
    }
  },
  {
    id: "7",
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
    }
  },
  {
    id: "8",
    title: "Digital Nomad Visa Program - Portugal",
    type: "others",
    company: "Government of Portugal",
    location: "Portugal",
    remote: true,
    description: "Special visa program for digital nomads and remote workers. Live and work in Portugal while maintaining your international career. Includes access to co-working spaces and expat community.",
    requirements: [
      "Proof of remote work employment",
      "Minimum monthly income of €2,800",
      "Valid passport",
      "Health insurance coverage"
    ],
    benefits: [
      "1-year renewable visa",
      "Access to co-working network",
      "Tax benefits for foreign residents",
      "EU travel privileges"
    ],
    duration: "1 year (renewable)",
    commitment: "Residence in Portugal",
    postedBy: {
      name: "Ana Silva",
      title: "Immigration Officer",
      company: "Government of Portugal",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      isVerified: true
    },
    tags: ["Digital Nomad", "Visa", "Portugal", "Remote Work"],
    applicants: 89,
    deadline: "2026-12-31",
    postedDate: "2026-06-25",
    featured: false,
    urgent: false,
    boost: 34,
    saved: false,
    applied: false,
    experienceLevel: "any",
    category: "Immigration",
    eligibility: ["Remote work proof", "Income requirements", "Valid passport"],
    applicationLink: "https://portugal.gov.pt/digital-nomad",
    comments: 18,
    contactInfo: {
      email: "nomad-visa@portugal.gov.pt",
      website: "https://portugal.gov.pt/digital-nomad"
    }
  }
];

const locations = ["All Locations", "Remote", "USA", "UK", "Nigeria", "Kenya", "South Africa", "Ghana", "Canada", "Germany"];
const experienceLevels = ["All Levels", "Entry Level", "Mid Level", "Senior Level"];
const sortOptions = ["Most Recent", "Deadline", "Most Boosted", "Most Applied", "Amount"];

export function OpportunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>(["2", "4"]);
  const [boostedOpportunities, setBoostedOpportunities] = useState<string[]>([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Form state for posting new opportunity
  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    type: "",
    company: "",
    location: "",
    description: "",
    requirements: "",
    benefits: "",
    applicationLink: "",
    deadline: "",
    amount: "",
    tags: "",
    remote: false
  });

  const filteredOpportunities = mockOpportunities.filter(opp => {
    const matchesCategory = selectedCategory === "all" || opp.type === selectedCategory;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = selectedLocation === "All Locations" ||
                           (selectedLocation === "Remote" && opp.remote) ||
                           opp.location.includes(selectedLocation);
    const matchesLevel = selectedLevel === "All Levels" ||
                        (selectedLevel === "Entry Level" && opp.experienceLevel === "entry") ||
                        (selectedLevel === "Mid Level" && opp.experienceLevel === "mid") ||
                        (selectedLevel === "Senior Level" && opp.experienceLevel === "senior");
    const matchesRemote = !showRemoteOnly || opp.remote;
    const matchesSaved = !showSavedOnly || savedOpportunities.includes(opp.id);

    return matchesCategory && matchesSearch && matchesLocation && matchesLevel && matchesRemote && matchesSaved;
  });

  const categoryStats = opportunityCategories.map(category => ({
    ...category,
    count: category.id === "all" 
      ? mockOpportunities.length 
      : mockOpportunities.filter(opp => opp.type === category.id).length
  }));

  const handleSaveOpportunity = (oppId: string) => {
    if (savedOpportunities.includes(oppId)) {
      setSavedOpportunities(prev => prev.filter(id => id !== oppId));
      toast.success("Opportunity removed from saved list");
    } else {
      setSavedOpportunities(prev => [...prev, oppId]);
      toast.success("Opportunity saved!");
    }
  };

  const handleBoostOpportunity = (oppId: string) => {
    if (boostedOpportunities.includes(oppId)) {
      setBoostedOpportunities(prev => prev.filter(id => id !== oppId));
      toast.success("Boost removed");
    } else {
      setBoostedOpportunities(prev => [...prev, oppId]);
      toast.success("Opportunity boosted!");
    }
  };

  const handleApply = (oppId: string) => {
    const opp = mockOpportunities.find(o => o.id === oppId);
    if (opp) {
      if (opp.applicationLink) {
        window.open(opp.applicationLink, '_blank');
      }
      toast.success(`Application process started for ${opp.title}!`);
    }
  };

  const handleViewDetails = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailDialogOpen(true);
  };

  const handlePostOpportunity = () => {
    // Validate required fields
    if (!newOpportunity.title || !newOpportunity.type || !newOpportunity.company || !newOpportunity.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Opportunity submitted for review! We'll notify you once it's approved.");
    setIsPostDialogOpen(false);
    
    // Reset form
    setNewOpportunity({
      title: "",
      type: "",
      company: "",
      location: "",
      description: "",
      requirements: "",
      benefits: "",
      applicationLink: "",
      deadline: "",
      amount: "",
      tags: "",
      remote: false
    });
  };

  const getTypeIcon = (type: string) => {
    const category = opportunityCategories.find(cat => cat.id === type);
    if (category) {
      const Icon = category.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Target className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const category = opportunityCategories.find(cat => cat.id === type);
    return category?.color || "bg-gray-100 text-gray-700";
  };

  const formatAmount = (amount: Opportunity['amount']) => {
    if (!amount) return null;
    const value = amount.value >= 1000000 
      ? `${(amount.value / 1000000).toFixed(1)}M`
      : amount.value >= 1000 
      ? `${(amount.value / 1000).toFixed(0)}K`
      : amount.value.toString();
    return `${amount.currency} ${value}`;
  };

  const getUrgencyColor = (deadline?: string) => {
    if (!deadline) return "";
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return "text-red-600";
    if (diffDays <= 30) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-[#021ff6]" />
              Opportunities
            </h1>
            <p className="text-sm text-muted-foreground">
              Discover scholarships, jobs, internships, and more from the global diaspora community
            </p>
          </div>
          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Plus className="h-4 w-4 mr-2" />
                Post Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
              <DialogHeader>
                <DialogTitle>Share an Opportunity</DialogTitle>
                <DialogDescription>
                  Help others in the diaspora community discover amazing opportunities. Provide details to help applicants understand what's required and what they'll gain.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[75vh] pr-4">
                <div className="space-y-4">
                  {/* Essential Information */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Opportunity Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Software Engineer at Google, Rhodes Scholarship 2027"
                        value={newOpportunity.title}
                        onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Category *</Label>
                      <Select 
                        value={newOpportunity.type} 
                        onValueChange={(value) => {
                          console.log('Category selected:', value);
                          setNewOpportunity({...newOpportunity, type: value});
                        }}
                        onOpenChange={(open) => {
                          console.log('Category dropdown opened:', open);
                        }}
                      >
                        <SelectTrigger 
                          id="type" 
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg z-[60] max-h-60"
                          position="popper"
                          sideOffset={4}
                        >
                          {opportunityCategories.slice(1).map((category) => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id}
                              className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer py-2 px-3"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Organization/Company *</Label>
                        <Input 
                          id="company" 
                          placeholder="e.g., Google, Oxford University"
                          value={newOpportunity.company}
                          onChange={(e) => setNewOpportunity({...newOpportunity, company: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g., San Francisco, Remote, Global"
                          value={newOpportunity.location}
                          onChange={(e) => setNewOpportunity({...newOpportunity, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe what this opportunity is about, who it's for, and what makes it special..."
                        rows={4}
                        value={newOpportunity.description}
                        onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Provide a clear overview that helps people understand the opportunity
                      </p>
                    </div>

                    {/* Requirements Section */}
                    <div>
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea 
                        id="requirements" 
                        placeholder="List key requirements, qualifications, or criteria (one per line)"
                        rows={3}
                        value={newOpportunity.requirements}
                        onChange={(e) => setNewOpportunity({...newOpportunity, requirements: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="benefits">Benefits & What's Included</Label>
                      <Textarea 
                        id="benefits" 
                        placeholder="What benefits, perks, or support does this opportunity provide? (one per line)"
                        rows={3}
                        value={newOpportunity.benefits}
                        onChange={(e) => setNewOpportunity({...newOpportunity, benefits: e.target.value})}
                      />
                    </div>

                    {/* Optional Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Application Deadline</Label>
                        <Input 
                          id="deadline" 
                          type="date"
                          value={newOpportunity.deadline}
                          onChange={(e) => setNewOpportunity({...newOpportunity, deadline: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Compensation/Award Amount</Label>
                        <Input 
                          id="amount" 
                          placeholder="e.g., $50,000, €25,000"
                          value={newOpportunity.amount}
                          onChange={(e) => setNewOpportunity({...newOpportunity, amount: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="applicationLink">Application Link</Label>
                      <Input 
                        id="applicationLink" 
                        placeholder="https://..."
                        value={newOpportunity.applicationLink}
                        onChange={(e) => setNewOpportunity({...newOpportunity, applicationLink: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input 
                        id="tags" 
                        placeholder="e.g., Remote, Full-time, Research, Africa"
                        value={newOpportunity.tags}
                        onChange={(e) => setNewOpportunity({...newOpportunity, tags: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remote" 
                        checked={newOpportunity.remote}
                        onCheckedChange={(checked) => setNewOpportunity({...newOpportunity, remote: !!checked})}
                      />
                      <Label htmlFor="remote">This is a remote opportunity</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePostOpportunity} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 ${
                  isActive 
                    ? 'bg-[#021ff6] hover:bg-[#021ff6]/90' 
                    : `${cat.color} border-transparent hover:shadow-md`
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {cat.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {cat.count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-4 bg-muted/50">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                  onClick={() => handleViewDetails(opportunity)}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(opportunity.type)}>
                      {getTypeIcon(opportunity.type)}
                      <span className="ml-1 capitalize">{opportunity.type}</span>
                    </Badge>
                    {opportunity.featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {opportunity.urgent && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveOpportunity(opportunity.id);
                    }}
                  >
                    <Bookmark className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <CardTitle className="group-hover:text-[#021ff6] transition-colors line-clamp-2">
                  {opportunity.title}
                </CardTitle>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{opportunity.company}</span>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{opportunity.location}</span>
                  {opportunity.remote && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">Remote</Badge>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-3">
                  {opportunity.description}
                </CardDescription>



                {opportunity.amount && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatAmount(opportunity.amount)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.amount.type}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {opportunity.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {opportunity.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{opportunity.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{opportunity.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{opportunity.boost}</span>
                    </div>
                  </div>
                  
                  {opportunity.deadline && (
                    <div className={`flex items-center gap-1 ${getUrgencyColor(opportunity.deadline)}`}>
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(opportunity.id);
                    }}
                  >
                    {opportunity.applied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {opportunity.applied ? 'Applied' : 'Apply'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBoostOpportunity(opportunity.id);
                    }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  {opportunity.applicationLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(opportunity.applicationLink, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Button onClick={() => setIsPostDialogOpen(true)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
              <Plus className="h-4 w-4 mr-2" />
              Post an Opportunity
            </Button>
          </div>
        )}
      </div>

      {/* Opportunity Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOpportunity ? selectedOpportunity.title : "Opportunity Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedOpportunity 
                ? `Detailed information about this ${selectedOpportunity.type} opportunity at ${selectedOpportunity.company}.`
                : "View detailed information about this opportunity."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedOpportunity && (
            <>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{selectedOpportunity.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedOpportunity.location}</span>
                      </div>
                      {selectedOpportunity.remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOpportunity.featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {selectedOpportunity.urgent && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {selectedOpportunity.deadline && (
                    <div className={`flex items-center gap-2 ${getUrgencyColor(selectedOpportunity.deadline)}`}>
                      <Clock className="h-5 w-5" />
                      <div className="text-right">
                        <div className="font-medium">Deadline</div>
                        <div className="text-sm">
                          {new Date(selectedOpportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedOpportunity.description}
                  </p>
                </div>

                {selectedOpportunity.requirements && selectedOpportunity.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <ul className="space-y-1">
                      {selectedOpportunity.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOpportunity.benefits && selectedOpportunity.benefits.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Benefits & What's Included</h3>
                    <ul className="space-y-1">
                      {selectedOpportunity.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-muted-foreground">
                          <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedOpportunity.amount && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Compensation</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatAmount(selectedOpportunity.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {selectedOpportunity.amount.type}
                      {selectedOpportunity.duration && ` • ${selectedOpportunity.duration}`}
                      {selectedOpportunity.commitment && ` • ${selectedOpportunity.commitment}`}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedOpportunity.postedBy.avatar} />
                      <AvatarFallback>{selectedOpportunity.postedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedOpportunity.postedBy.name}</span>
                        {selectedOpportunity.postedBy.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedOpportunity.postedBy.title} at {selectedOpportunity.postedBy.company}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedOpportunity.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
                    onClick={() => handleApply(selectedOpportunity.id)}
                  >
                    {selectedOpportunity.applied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {selectedOpportunity.applied ? 'Already Applied' : 'Apply Now'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSaveOpportunity(selectedOpportunity.id)}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${savedOpportunities.includes(selectedOpportunity.id) ? 'fill-current' : ''}`} />
                    {savedOpportunities.includes(selectedOpportunity.id) ? 'Saved' : 'Save'}
                  </Button>
                  {selectedOpportunity.applicationLink && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedOpportunity.applicationLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      External Link
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}