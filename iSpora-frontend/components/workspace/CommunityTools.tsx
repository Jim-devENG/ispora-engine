import React, { useState } from "react";
import {
  Users,
  MapPin,
  TrendingUp,
  Heart,
  Globe,
  MessageCircle,
  Camera,
  Calendar,
  BarChart3,
  Target,
  Plus,
  Search,
  Filter,
  Share2,
  Eye,
  ThumbsUp,
  Star,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Phone,
  Mail,
  Building,
  Users2,
  Megaphone,
  FileText,
  Download,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role: string;
  status: string;
  progress: number;
  isOnline?: boolean;
  email?: string;
  skills?: string[];
}

interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  role: string;
  type: 'community-leader' | 'government' | 'ngo' | 'business' | 'academic' | 'beneficiary';
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  influence: number;
  interest: number;
  engagement: 'high' | 'medium' | 'low';
  notes?: string;
  lastContact?: string;
  avatar?: string;
}

interface ImpactStory {
  id: string;
  title: string;
  description: string;
  category: 'education' | 'health' | 'economic' | 'social' | 'environment';
  author: string;
  authorAvatar?: string;
  location: string;
  date: string;
  beneficiaries: number;
  metrics: {
    reach: number;
    satisfaction: number;
    sustainability: number;
  };
  media: string[];
  tags: string[];
  isVerified: boolean;
  likes: number;
  shares: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'meeting' | 'outreach' | 'celebration' | 'training';
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requirements?: string[];
  isRegistered: boolean;
}

interface CommunityToolsProps {
  mentee: ProjectMember;
  projectType?: string;
}

export function CommunityTools({ mentee, projectType = 'community' }: CommunityToolsProps) {
  const [activeTab, setActiveTab] = useState("stakeholders");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [isAddingStory, setIsAddingStory] = useState(false);

  // Mock data
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    {
      id: "1",
      name: "Dr. Amara Okafor",
      organization: "Lagos Community Health Center",
      role: "Medical Director",
      type: "community-leader",
      contactInfo: {
        email: "amara.okafor@lchc.org",
        phone: "+234-801-234-5678",
        address: "15 Broad Street, Lagos Island, Lagos"
      },
      influence: 85,
      interest: 90,
      engagement: "high",
      notes: "Strong advocate for community health programs. Has been instrumental in previous initiatives.",
      lastContact: "2024-01-20",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "2",
      name: "Chief Samuel Adebayo",
      organization: "Ibadan Traditional Council",
      role: "Community Elder",
      type: "community-leader",
      contactInfo: {
        email: "chief.adebayo@itc.org",
        phone: "+234-802-345-6789"
      },
      influence: 95,
      interest: 70,
      engagement: "medium",
      notes: "Respected community leader. Approval needed for major community initiatives.",
      lastContact: "2024-01-15",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "3",
      name: "Mrs. Grace Nkomo",
      organization: "Women's Cooperative Society",
      role: "President",
      type: "beneficiary",
      contactInfo: {
        email: "grace.nkomo@wcs.org",
        phone: "+234-803-456-7890"
      },
      influence: 60,
      interest: 95,
      engagement: "high",
      notes: "Directly represents target beneficiaries. Great source of community feedback.",
      lastContact: "2024-01-22",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face"
    }
  ]);

  const [impactStories, setImpactStories] = useState<ImpactStory[]>([
    {
      id: "1",
      title: "Mobile Health Clinic Reaches Rural Communities",
      description: "Our mobile health clinic has provided free medical consultations to over 500 families in remote villages, with 90% reporting improved health outcomes.",
      category: "health",
      author: "Dr. Sarah Williams",
      authorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      location: "Kano State, Nigeria",
      date: "2024-01-18",
      beneficiaries: 500,
      metrics: {
        reach: 85,
        satisfaction: 92,
        sustainability: 78
      },
      media: ["health-clinic-1.jpg", "health-clinic-2.jpg"],
      tags: ["healthcare", "rural", "mobile clinic", "preventive care"],
      isVerified: true,
      likes: 34,
      shares: 12
    },
    {
      id: "2",
      title: "Digital Literacy Program Empowers Local Youth",
      description: "125 young adults have completed our digital skills training program, with 80% securing employment or starting online businesses within 3 months.",
      category: "education",
      author: "Alex Chen",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      location: "Accra, Ghana",
      date: "2024-01-15",
      beneficiaries: 125,
      metrics: {
        reach: 78,
        satisfaction: 88,
        sustainability: 85
      },
      media: ["digital-training-1.jpg"],
      tags: ["education", "digital skills", "employment", "youth"],
      isVerified: true,
      likes: 28,
      shares: 8
    }
  ]);

  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([
    {
      id: "1",
      title: "Community Health Workshop",
      description: "Interactive workshop on preventive healthcare and nutrition for families",
      type: "workshop",
      date: "2024-02-05",
      time: "10:00 AM",
      location: "Community Center, Ikeja",
      organizer: "Dr. Amara Okafor",
      attendees: 45,
      maxAttendees: 60,
      status: "upcoming",
      requirements: ["Registration required", "Bring notebook", "Family participation encouraged"],
      isRegistered: true
    },
    {
      id: "2",
      title: "Youth Digital Skills Fair",
      description: "Showcase of digital skills and technology opportunities for young people",
      type: "outreach",
      date: "2024-02-12",
      time: "2:00 PM",
      location: "University of Lagos Campus",
      organizer: "Tech4Good Initiative",
      attendees: 120,
      maxAttendees: 200,
      status: "upcoming",
      requirements: ["Open to all ages", "Bring laptops/phones if available"],
      isRegistered: false
    }
  ]);

  // New stakeholder form state
  const [newStakeholder, setNewStakeholder] = useState({
    name: "",
    organization: "",
    role: "",
    type: "community-leader" as Stakeholder['type'],
    email: "",
    phone: "",
    address: "",
    influence: 50,
    interest: 50,
    notes: ""
  });

  // New impact story form state
  const [newStory, setNewStory] = useState({
    title: "",
    description: "",
    category: "social" as ImpactStory['category'],
    location: "",
    beneficiaries: 0,
    tags: ""
  });

  const stakeholderTypeIcons = {
    'community-leader': Users,
    'government': Building,
    'ngo': Heart,
    'business': Users2,
    'academic': Award,
    'beneficiary': Target
  };

  const stakeholderTypeColors = {
    'community-leader': "bg-blue-100 text-blue-700",
    'government': "bg-purple-100 text-purple-700",
    'ngo': "bg-green-100 text-green-700",
    'business': "bg-orange-100 text-orange-700",
    'academic': "bg-yellow-100 text-yellow-700",
    'beneficiary': "bg-pink-100 text-pink-700"
  };

  const impactCategoryIcons = {
    education: Award,
    health: Heart,
    economic: TrendingUp,
    social: Users,
    environment: Globe
  };

  const impactCategoryColors = {
    education: "bg-blue-100 text-blue-700",
    health: "bg-red-100 text-red-700",
    economic: "bg-green-100 text-green-700",
    social: "bg-purple-100 text-purple-700",
    environment: "bg-teal-100 text-teal-700"
  };

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.organization) {
      const stakeholder: Stakeholder = {
        id: Date.now().toString(),
        name: newStakeholder.name,
        organization: newStakeholder.organization,
        role: newStakeholder.role,
        type: newStakeholder.type,
        contactInfo: {
          email: newStakeholder.email || undefined,
          phone: newStakeholder.phone || undefined,
          address: newStakeholder.address || undefined
        },
        influence: newStakeholder.influence,
        interest: newStakeholder.interest,
        engagement: newStakeholder.influence > 70 && newStakeholder.interest > 70 ? 'high' :
                   newStakeholder.influence > 40 && newStakeholder.interest > 40 ? 'medium' : 'low',
        notes: newStakeholder.notes || undefined
      };
      
      setStakeholders(prev => [...prev, stakeholder]);
      setNewStakeholder({
        name: "",
        organization: "",
        role: "",
        type: "community-leader",
        email: "",
        phone: "",
        address: "",
        influence: 50,
        interest: 50,
        notes: ""
      });
      setIsAddingStakeholder(false);
    }
  };

  const addImpactStory = () => {
    if (newStory.title && newStory.description) {
      const story: ImpactStory = {
        id: Date.now().toString(),
        title: newStory.title,
        description: newStory.description,
        category: newStory.category,
        author: mentee.name,
        authorAvatar: mentee.avatar,
        location: newStory.location,
        date: new Date().toISOString().split('T')[0],
        beneficiaries: newStory.beneficiaries,
        metrics: {
          reach: 0,
          satisfaction: 0,
          sustainability: 0
        },
        media: [],
        tags: newStory.tags ? newStory.tags.split(',').map(t => t.trim()) : [],
        isVerified: false,
        likes: 0,
        shares: 0
      };
      
      setImpactStories(prev => [story, ...prev]);
      setNewStory({
        title: "",
        description: "",
        category: "social",
        location: "",
        beneficiaries: 0,
        tags: ""
      });
      setIsAddingStory(false);
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stakeholder.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || stakeholder.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Community Tools
            </h2>
            <p className="text-sm text-muted-foreground">
              Stakeholder mapping, impact tracking, and community engagement tools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search community resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="community-leader">Community Leaders</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="ngo">NGOs</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="beneficiary">Beneficiaries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick action tools */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
          <span className="text-sm font-medium text-muted-foreground">Quick Tools:</span>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Stakeholder Map
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Impact Dashboard
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Outreach Planner
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Generator
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stakeholders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Stakeholders
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Impact Stories
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="stakeholders" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Community Stakeholders ({filteredStakeholders.length})</h3>
                <Dialog open={isAddingStakeholder} onOpenChange={setIsAddingStakeholder}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stakeholder
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Community Stakeholder</DialogTitle>
                      <DialogDescription>
                        Add a new stakeholder to track community engagement. Include contact information and influence levels.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={newStakeholder.name}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter stakeholder name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Organization *</Label>
                          <Input
                            value={newStakeholder.organization}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, organization: e.target.value }))}
                            placeholder="Enter organization name"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={newStakeholder.role}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Enter role/position"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newStakeholder.type} onValueChange={(value: Stakeholder['type']) => 
                            setNewStakeholder(prev => ({ ...prev, type: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="community-leader">Community Leader</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="ngo">NGO</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="beneficiary">Beneficiary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            value={newStakeholder.email}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                            type="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={newStakeholder.phone}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+234-xxx-xxx-xxxx"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={newStakeholder.address}
                          onChange={(e) => setNewStakeholder(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Influence Level ({newStakeholder.influence}%)</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newStakeholder.influence}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, influence: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Interest Level ({newStakeholder.interest}%)</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={newStakeholder.interest}
                            onChange={(e) => setNewStakeholder(prev => ({ ...prev, interest: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={newStakeholder.notes}
                          onChange={(e) => setNewStakeholder(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes about this stakeholder..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={addStakeholder} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          <Users className="h-4 w-4 mr-2" />
                          Add Stakeholder
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingStakeholder(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-3">
                  {filteredStakeholders.map((stakeholder) => {
                    const TypeIcon = stakeholderTypeIcons[stakeholder.type];
                    return (
                      <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center gap-2">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={stakeholder.avatar} />
                                <AvatarFallback>
                                  {stakeholder.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`p-1.5 rounded-lg ${stakeholderTypeColors[stakeholder.type]}`}>
                                <TypeIcon className="h-3 w-3" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-semibold leading-tight">{stakeholder.name}</h4>
                                  <p className="text-sm text-muted-foreground">{stakeholder.role} at {stakeholder.organization}</p>
                                </div>
                                <Badge variant="outline" className={getEngagementColor(stakeholder.engagement)}>
                                  {stakeholder.engagement} engagement
                                </Badge>
                              </div>
                              
                              {/* Influence and Interest Matrix */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Influence</span>
                                    <span>{stakeholder.influence}%</span>
                                  </div>
                                  <Progress value={stakeholder.influence} className="h-1.5" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Interest</span>
                                    <span>{stakeholder.interest}%</span>
                                  </div>
                                  <Progress value={stakeholder.interest} className="h-1.5" />
                                </div>
                              </div>
                              
                              {stakeholder.notes && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {stakeholder.notes}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {stakeholder.contactInfo.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{stakeholder.contactInfo.email}</span>
                                    </div>
                                  )}
                                  {stakeholder.contactInfo.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{stakeholder.contactInfo.phone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MessageCircle className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Send message</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Calendar className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Schedule meeting</TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="impact" className="h-full space-y-0 mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Impact Stories ({impactStories.length})</h3>
                <Dialog open={isAddingStory} onOpenChange={setIsAddingStory}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Story
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add Impact Story</DialogTitle>
                      <DialogDescription>
                        Document a community impact story with details about beneficiaries, location, and outcomes achieved.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={newStory.title}
                            onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter story title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newStory.category} onValueChange={(value: ImpactStory['category']) => 
                            setNewStory(prev => ({ ...prev, category: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="economic">Economic</SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="environment">Environment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={newStory.description}
                          onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the impact story in detail..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={newStory.location}
                            onChange={(e) => setNewStory(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter location"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Beneficiaries</Label>
                          <Input
                            type="number"
                            value={newStory.beneficiaries}
                            onChange={(e) => setNewStory(prev => ({ ...prev, beneficiaries: parseInt(e.target.value) || 0 }))}
                            placeholder="Number of beneficiaries"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                          value={newStory.tags}
                          onChange={(e) => setNewStory(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={addImpactStory} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          <Heart className="h-4 w-4 mr-2" />
                          Add Story
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingStory(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-4">
                  {impactStories.map((story) => {
                    const CategoryIcon = impactCategoryIcons[story.category];
                    return (
                      <Card key={story.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${impactCategoryColors[story.category]}`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h4 className="font-semibold leading-tight">{story.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage src={story.authorAvatar} />
                                        <AvatarFallback className="text-xs">
                                          {story.author.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm text-muted-foreground">{story.author}</span>
                                    </div>
                                    <Badge variant="outline" className={`text-xs ${impactCategoryColors[story.category]}`}>
                                      {story.category}
                                    </Badge>
                                    {story.isVerified && (
                                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="text-sm">{story.likes}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1">
                                    <Share2 className="h-4 w-4" />
                                    <span className="text-sm">{story.shares}</span>
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">
                                {story.description}
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 mb-3">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600">{story.beneficiaries}</div>
                                  <div className="text-xs text-muted-foreground">Beneficiaries</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">{story.metrics.satisfaction}%</div>
                                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                                </div>
                                <div className="text-center p-2 bg-orange-50 rounded-lg">
                                  <div className="text-lg font-bold text-orange-600">{story.metrics.reach}%</div>
                                  <div className="text-xs text-muted-foreground">Reach</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{story.location}</span>
                                  <Clock className="h-3 w-3 ml-2" />
                                  <span>{new Date(story.date).toLocaleDateString()}</span>
                                </div>
                                
                                {story.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {story.tags.slice(0, 3).map((tag, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="h-full space-y-0 mt-0">
              <div className="mb-4">
                <h3 className="font-medium">Community Events</h3>
                <p className="text-sm text-muted-foreground">Upcoming and past community engagement events</p>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-4">
                  {communityEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{event.title}</h4>
                              <Badge variant="outline" className={
                                event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                event.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }>
                                {event.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {event.description}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{event.attendees}/{event.maxAttendees}</span>
                              </div>
                            </div>
                            
                            {event.requirements && event.requirements.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-sm font-medium mb-1">Requirements:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {event.requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <AlertCircle className="h-3 w-3" />
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {event.isRegistered ? (
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Registered
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                                Register
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="h-full space-y-0 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Stakeholder Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stakeholders.length}</div>
                      <div className="text-sm text-muted-foreground">Total Stakeholders</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stakeholders.filter(s => s.engagement === 'high').length}
                      </div>
                      <div className="text-sm text-muted-foreground">High Engagement</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Rate</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Impact Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {impactStories.reduce((sum, story) => sum + story.beneficiaries, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Beneficiaries</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{impactStories.length}</div>
                      <div className="text-sm text-muted-foreground">Impact Stories</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Community Reach</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Engagement Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {communityEvents.filter(e => e.status === 'upcoming').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Upcoming Events</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {communityEvents.reduce((sum, event) => sum + event.attendees, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Participants</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
