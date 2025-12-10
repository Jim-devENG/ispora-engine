import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { useNavigation } from "./NavigationContext";
import { 
  Users, 
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  MessageCircle,
  UserPlus,
  UserCheck,
  Shield,
  Star,
  Award,
  TrendingUp,
  Clock,
  ExternalLink,
  Heart,
  Video,
  Lightbulb,
  Building,
  BookOpen,
  Target,
  Rocket,
  Code,
  Palette,
  BarChart3,
  Zap,
  Sparkles,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Edit
} from "lucide-react";

// Enhanced NetworkUser interface (same as in MyNetwork.tsx)
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
  experience: number;
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
    website?: string;
  };
  achievements?: {
    title: string;
    description: string;
    date: string;
    icon?: any;
  }[];
  availability?: {
    mentoring: boolean;
    collaboration: boolean;
    consultation: boolean;
    volunteering?: boolean;
    speaking?: boolean;
    advising?: boolean;
  };
  openTo?: string[];
  workHistory?: {
    title: string;
    company: string;
    duration: string;
    description: string;
    current?: boolean;
  }[];
  education?: {
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }[];
  languages?: string[];
  projects?: {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }[];
}

// Role and tag configurations
const roleConfig = {
  mentor: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: Users },
  professional: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: Briefcase },
  alumni: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', icon: GraduationCap },
  student: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: BookOpen },
  researcher: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300', icon: Target },
  entrepreneur: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: Rocket }
};

const openToConfig = {
  'Mentorship': { 
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', 
    icon: Users 
  },
  'Collaboration': { 
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800', 
    icon: Users 
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

// Connection Request Modal (same as in MyNetwork.tsx but simplified for profile context)
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

  const handleSubmit = () => {
    if (!selectedPurpose || !customMessage.trim()) {
      toast.error('Please select a purpose and add a personal message.');
      return;
    }
    
    onSubmit(selectedPurpose, customMessage);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Connect with {user.name}
          </DialogTitle>
          <DialogDescription>
            Send a personalized connection request to {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Request Purpose</label>
            <select 
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="">Select why you want to connect...</option>
              {connectionPurposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Message</label>
            <textarea
              placeholder="Write a personalized message explaining more about your request..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-2 border rounded-lg bg-background min-h-[100px] resize-none"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">💡 Connection Tip</p>
                <p>Let them know what you're looking for. Be clear and specific to build meaningful connections.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90">
              <Send className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main User Profile Modal Component
export function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onConnect,
  isCurrentUser = false
}: {
  user: NetworkUser | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (userId: string, purpose: string, message: string) => void;
  isCurrentUser?: boolean;
}) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { navigate } = useNavigation();

  if (!user) return null;

  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  const handleConnect = (purpose: string, message: string) => {
    if (onConnect) {
      onConnect(user.id, purpose, message);
      toast.success(`Connection request sent to ${user.name}!`);
    }
  };

  const handleEditProfile = () => {
    onClose(); // Close the modal first
    navigate('Profile'); // Navigate to the profile page
    toast.success('Navigating to your profile...');
  };

  const getConnectionButton = () => {
    if (isCurrentUser) {
      return (
        <Button variant="outline" className="flex-1" onClick={handleEditProfile}>
          <Edit className="h-4 w-4 mr-2" />
          Edit My Profile
        </Button>
      );
    }

    switch (user.connectionStatus) {
      case 'connected':
        return (
          <Button variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" className="flex-1" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button variant="outline" className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        );
      default:
        return (
          <Button 
            className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
            onClick={() => setShowConnectModal(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {isCurrentUser ? 'My Profile' : `${user.name}'s Profile`}
            </DialogTitle>
            <DialogDescription>
              {isCurrentUser 
                ? 'View and manage your profile information' 
                : `Professional profile for ${user.name}, ${user.title} at ${user.company}`
              }
            </DialogDescription>
          </DialogHeader>
          
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">{user.name}</h1>
                    {user.isVerified && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{user.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {user.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-48">
                {getConnectionButton()}
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-sm font-medium">{user.mutualConnections}</div>
                    <div className="text-xs text-muted-foreground">Mutual</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-sm font-medium">{user.responseRate}%</div>
                    <div className="text-xs text-muted-foreground">Response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role and Open To Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={roleInfo.color}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
                  {user.experience} years experience
                </Badge>
              </div>
              
              {user.openTo && user.openTo.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Open to</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.openTo.map(tag => {
                      const tagConfig = openToConfig[tag as keyof typeof openToConfig];
                      const TagIcon = tagConfig?.icon || Heart;
                      return (
                        <Badge key={tag} variant="outline" className={tagConfig?.color || 'bg-gray-50 text-gray-700 border-gray-200'}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mt-4">
              <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="flex-shrink-0 px-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6 pt-4">
                    <TabsContent value="overview" className="space-y-6 m-0">
                      {/* Skills Preview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5" />
                            Top Skills
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.slice(0, 6).map(skill => {
                              const SkillIcon = skillIcons[skill] || Code;
                              return (
                                <Badge key={skill} variant="outline">
                                  <SkillIcon className="h-3 w-3 mr-1" />
                                  {skill}
                                </Badge>
                              );
                            })}
                            {user.skills.length > 6 && (
                              <Badge variant="outline">
                                +{user.skills.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Achievements */}
                      {user.achievements && user.achievements.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              Achievements
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {user.achievements.map((achievement, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{achievement.title}</h4>
                                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(achievement.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Education */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Education
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{user.program}</h4>
                                <p className="text-sm text-muted-foreground">{user.university}</p>
                                <p className="text-xs text-muted-foreground">Class of {user.graduationYear}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-6 m-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Work Experience
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Current Role */}
                            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{user.title}</h4>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
                                    Current
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{user.company}</p>
                                <p className="text-xs text-muted-foreground">{user.experience} years</p>
                                <p className="text-sm mt-2">{user.bio}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-6 m-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Skills & Expertise
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Core Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.skills.map(skill => {
                                  const SkillIcon = skillIcons[skill] || Code;
                                  return (
                                    <Badge key={skill} variant="outline">
                                      <SkillIcon className="h-3 w-3 mr-1" />
                                      {skill}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Areas of Expertise</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.expertise.map(expert => (
                                  <Badge key={expert} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                    <Star className="h-3 w-3 mr-1" />
                                    {expert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Interests</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.interests.map(interest => (
                                  <Badge key={interest} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-6 m-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {user.socialLinks?.linkedin && (
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Linkedin className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                  <p className="font-medium">LinkedIn</p>
                                  <p className="text-sm text-muted-foreground">Professional network</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Visit
                                </Button>
                              </div>
                            )}
                            
                            {user.socialLinks?.twitter && (
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Twitter className="h-5 w-5 text-blue-400" />
                                <div className="flex-1">
                                  <p className="font-medium">Twitter</p>
                                  <p className="text-sm text-muted-foreground">Social updates</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Visit
                                </Button>
                              </div>
                            )}
                            
                            {user.socialLinks?.email && (
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-600" />
                                <div className="flex-1">
                                  <p className="font-medium">Email</p>
                                  <p className="text-sm text-muted-foreground">Direct contact</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Send className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </div>
                            )}
                            
                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-800 dark:text-blue-200">Professional Communication</span>
                              </div>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {isCurrentUser 
                                  ? "Your profile shows your professional availability to the diaspora community."
                                  : `${user.name} is open to professional discussions and networking opportunities.`
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connection Request Modal */}
      {showConnectModal && (
        <ConnectionRequestModal
          user={user}
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSubmit={handleConnect}
        />
      )}
    </>
  );
}