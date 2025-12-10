import React, { useState } from "react";
import { 
  Users, 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Filter,
  MessageCircle,
  UserPlus,
  ExternalLink,
  Calendar,
  Star,
  Award,
  Building,
  Globe,
  Mail,
  Linkedin,
  Twitter
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

interface FindAlumniProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AlumniProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  university: string;
  graduationYear: number;
  degree: string;
  field: string;
  expertise: string[];
  bio: string;
  profileImage?: string;
  connectionStatus: 'not-connected' | 'pending' | 'connected';
  isOnline: boolean;
  lastActive: string;
  campaignsParticipated: number;
  studentsHelped: number;
  rating: number;
  isVerified: boolean;
  mentorshipStatus: 'available' | 'busy' | 'not-available';
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  achievements: string[];
}

const mockAlumniProfiles: AlumniProfile[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    location: "San Francisco, USA",
    university: "University of Lagos",
    graduationYear: 2018,
    degree: "B.Sc Computer Science",
    field: "Technology",
    expertise: ["Machine Learning", "Cloud Computing", "Mobile Development"],
    bio: "Passionate about using technology to solve African challenges. Currently working on AI for healthcare at Google.",
    connectionStatus: "not-connected",
    isOnline: true,
    lastActive: "Online now",
    campaignsParticipated: 5,
    studentsHelped: 23,
    rating: 4.9,
    isVerified: true,
    mentorshipStatus: "available",
    socialLinks: {
      linkedin: "linkedin.com/in/sarahchen",
      twitter: "@sarahchen_dev",
      email: "sarah.chen@example.com"
    },
    achievements: ["Top Mentor 2023", "Innovation Award"]
  },
  {
    id: "2",
    name: "Prof. James Okafor",
    title: "Professor of Medicine",
    company: "Johns Hopkins University",
    location: "Baltimore, USA",
    university: "University of Lagos",
    graduationYear: 2008,
    degree: "MBChB Medicine",
    field: "Healthcare",
    expertise: ["Cardiology", "Medical Research", "Public Health"],
    bio: "Leading research in cardiovascular diseases affecting African populations. Active in medical education and mentorship.",
    connectionStatus: "connected",
    isOnline: false,
    lastActive: "2 hours ago",
    campaignsParticipated: 8,
    studentsHelped: 45,
    rating: 4.8,
    isVerified: true,
    mentorshipStatus: "available",
    socialLinks: {
      linkedin: "linkedin.com/in/jamesokafor",
      email: "j.okafor@jhu.edu"
    },
    achievements: ["Medical Excellence Award", "Research Pioneer"]
  },
  {
    id: "3",
    name: "Amina Hassan",
    title: "Investment Banking VP",
    company: "Goldman Sachs",
    location: "London, UK",
    university: "Makerere University",
    graduationYear: 2015,
    degree: "B.Com Finance",
    field: "Finance",
    expertise: ["Investment Banking", "Private Equity", "Financial Analysis"],
    bio: "Specialized in emerging markets finance with focus on African infrastructure projects.",
    connectionStatus: "pending",
    isOnline: true,
    lastActive: "30 minutes ago",
    campaignsParticipated: 3,
    studentsHelped: 18,
    rating: 4.7,
    isVerified: true,
    mentorshipStatus: "busy",
    socialLinks: {
      linkedin: "linkedin.com/in/aminahassan",
      email: "amina.hassan@gs.com"
    },
    achievements: ["Rising Star Award"]
  },
  {
    id: "4",
    name: "David Mwangi",
    title: "Agricultural Engineer",
    company: "FAO",
    location: "Nairobi, Kenya",
    university: "University of Nairobi",
    graduationYear: 2012,
    degree: "B.Sc Agricultural Engineering",
    field: "Agriculture",
    expertise: ["Sustainable Agriculture", "Irrigation Systems", "Food Security"],
    bio: "Working on sustainable farming technologies across East Africa. Passionate about food security solutions.",
    connectionStatus: "not-connected",
    isOnline: false,
    lastActive: "1 day ago",
    campaignsParticipated: 6,
    studentsHelped: 31,
    rating: 4.6,
    isVerified: false,
    mentorshipStatus: "available",
    socialLinks: {
      linkedin: "linkedin.com/in/davidmwangi",
      email: "david.mwangi@fao.org"
    },
    achievements: ["Sustainability Champion"]
  }
];

const universities = ["All Universities", "University of Lagos", "Makerere University", "University of Cape Town", "University of Nairobi"];
const fields = ["All Fields", "Technology", "Healthcare", "Finance", "Engineering", "Agriculture", "Business", "Education"];
const locations = ["All Locations", "USA", "UK", "Canada", "Germany", "Kenya", "Nigeria", "Uganda", "South Africa"];

export function FindAlumni({ isOpen, onClose }: FindAlumniProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("All Universities");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [mentorshipFilter, setMentorshipFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);

  const filteredAlumni = mockAlumniProfiles.filter(alumni => {
    const matchesSearch = alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumni.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesUniversity = selectedUniversity === "All Universities" || alumni.university === selectedUniversity;
    const matchesField = selectedField === "All Fields" || alumni.field === selectedField;
    const matchesLocation = selectedLocation === "All Locations" || alumni.location.includes(selectedLocation);
    const matchesMentorship = mentorshipFilter === "all" || 
                             (mentorshipFilter === "available" && alumni.mentorshipStatus === "available") ||
                             (mentorshipFilter === "online" && alumni.isOnline);
    
    return matchesSearch && matchesUniversity && matchesField && matchesLocation && matchesMentorship;
  });

  const handleConnect = (alumniId: string) => {
    const alumni = mockAlumniProfiles.find(a => a.id === alumniId);
    if (alumni) {
      toast.success(`Connection request sent to ${alumni.name}!`);
    }
  };

  const handleMessage = (alumniId: string) => {
    const alumni = mockAlumniProfiles.find(a => a.id === alumniId);
    if (alumni) {
      toast.success(`Opening chat with ${alumni.name}...`);
    }
  };

  const getConnectionButtonProps = (status: AlumniProfile['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return { text: 'Connected', variant: 'default' as const, disabled: true, icon: <Users className="h-4 w-4" /> };
      case 'pending':
        return { text: 'Pending', variant: 'outline' as const, disabled: true, icon: <Calendar className="h-4 w-4" /> };
      default:
        return { text: 'Connect', variant: 'outline' as const, disabled: false, icon: <UserPlus className="h-4 w-4" /> };
    }
  };

  const getMentorshipStatusColor = (status: AlumniProfile['mentorshipStatus']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Find Alumni</span>
          </DialogTitle>
          <DialogDescription>
            Connect with alumni from your network and build meaningful professional relationships
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Alumni</TabsTrigger>
            <TabsTrigger value="recommendations">Recommended</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, company, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                  <SelectTrigger>
                    <SelectValue placeholder="University" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={mentorshipFilter} onValueChange={setMentorshipFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mentorship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available for Mentorship</SelectItem>
                    <SelectItem value="online">Currently Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {filteredAlumni.length} alumni
                </p>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="recent">Recently Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAlumni.map((alumni) => {
                  const connectionProps = getConnectionButtonProps(alumni.connectionStatus);
                  
                  return (
                    <Card key={alumni.id} className="hover:shadow-md transition-shadow overflow-hidden">
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                              <div className="relative flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={alumni.profileImage} />
                                  <AvatarFallback className="text-sm">{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {alumni.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-sm truncate">{alumni.name}</h3>
                                  {alumni.isVerified && (
                                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                                      <Award className="h-3 w-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{alumni.title}</p>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Building className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{alumni.company}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{alumni.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{alumni.rating}</span>
                            </div>
                          </div>

                          {/* University Info */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate">{alumni.university}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Class of {alumni.graduationYear}</span>
                          </div>

                          {/* Bio */}
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{alumni.bio}</p>

                          {/* Expertise */}
                          <div className="flex flex-wrap gap-1">
                            {alumni.expertise.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {alumni.expertise.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{alumni.expertise.length - 2} more
                              </Badge>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="space-y-1">
                                <div>{alumni.campaignsParticipated} campaigns</div>
                                <div>{alumni.studentsHelped} students helped</div>
                              </div>
                            </div>
                            <Badge className={`${getMentorshipStatusColor(alumni.mentorshipStatus)} text-xs w-full justify-center`}>
                              {alumni.mentorshipStatus === 'available' && 'Available for mentorship'}
                              {alumni.mentorshipStatus === 'busy' && 'Currently busy'}
                              {alumni.mentorshipStatus === 'not-available' && 'Not available'}
                            </Badge>
                          </div>

                          <Separator />

                          {/* Actions */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2">
                              {alumni.socialLinks.linkedin && (
                                <Button variant="ghost" size="sm">
                                  <Linkedin className="h-4 w-4" />
                                </Button>
                              )}
                              {alumni.socialLinks.twitter && (
                                <Button variant="ghost" size="sm">
                                  <Twitter className="h-4 w-4" />
                                </Button>
                              )}
                              {alumni.socialLinks.email && (
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-col space-y-2">
                              {alumni.connectionStatus === 'connected' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMessage(alumni.id)}
                                  className="w-full"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              )}
                              <Button
                                variant={connectionProps.variant}
                                size="sm"
                                disabled={connectionProps.disabled}
                                onClick={() => handleConnect(alumni.id)}
                                className="w-full"
                              >
                                {connectionProps.icon}
                                <span className="ml-2">{connectionProps.text}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Recommendations</h3>
              <p className="text-sm text-gray-600 mb-4">
                We'll recommend alumni based on your interests and career goals
              </p>
              <Button variant="outline">Set Preferences</Button>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Alumni Network</h3>
              <p className="text-sm text-gray-600 mb-4">
                View and manage your existing alumni connections
              </p>
              <Button variant="outline">View All Connections</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}