import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { 
  ArrowLeft,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Star,
  Users,
  MessageCircle,
  UserPlus,
  Award,
  Briefcase,
  Globe,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Video,
  Coffee,
  Clock,
  ExternalLink,
  Shield,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  Code,
  Palette,
  BarChart3,
  Rocket,
  Target,
  BookOpen,
  Zap
} from "lucide-react";

interface UserProfileData {
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
    type: 'award' | 'certification' | 'publication' | 'project';
  }[];
  availability?: {
    mentoring: boolean;
    collaboration: boolean;
    consultation: boolean;
  };
  testimonials?: {
    id: string;
    from: {
      name: string;
      title: string;
      avatar?: string;
    };
    content: string;
    date: string;
    type: 'mentorship' | 'collaboration' | 'professional';
  }[];
  projects?: {
    id: string;
    name: string;
    description: string;
    role: string;
    status: 'active' | 'completed';
    technologies?: string[];
  }[];
  publications?: {
    title: string;
    venue: string;
    year: string;
    url?: string;
  }[];
}

// Mock detailed user data
const mockUserProfile: UserProfileData = {
  id: '1',
  name: 'Dr. Kwame Asante',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  title: 'Senior AI Research Scientist',
  company: 'Google DeepMind',
  location: 'London, UK',
  university: 'Stanford University',
  graduationYear: '2015',
  program: 'PhD Computer Science',
  bio: 'Leading AI research in natural language processing and machine learning ethics. Passionate about mentoring the next generation of African tech leaders and building ethical AI systems that benefit humanity.',
  skills: ['Machine Learning', 'Natural Language Processing', 'Python', 'TensorFlow', 'Research', 'Ethics in AI', 'Deep Learning', 'Data Science'],
  expertise: ['Artificial Intelligence', 'Deep Learning', 'Ethics in AI', 'Natural Language Processing', 'Research Methodology'],
  role: 'mentor',
  experience: 8,
  connectionStatus: 'none',
  mutualConnections: 12,
  responseRate: 95,
  isVerified: true,
  isOnline: true,
  lastActive: '2 minutes ago',
  interests: ['AI Ethics', 'Mentorship', 'Tech Leadership', 'Research', 'African Innovation'],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/kwameasante',
    twitter: 'https://twitter.com/kwameasante',
    email: 'kwame@deepmind.com',
    website: 'https://kwameasante.com'
  },
  achievements: [
    {
      title: 'Best Paper Award - NeurIPS 2023',
      description: 'For groundbreaking research in ethical AI frameworks and bias mitigation techniques',
      date: '2023-12-15',
      type: 'award'
    },
    {
      title: 'Google AI Impact Scholar',
      description: 'Recognized for contributions to responsible AI development',
      date: '2023-06-01',
      type: 'award'
    },
    {
      title: 'Certified AI Ethics Practitioner',
      description: 'Professional certification in AI ethics and responsible ML practices',
      date: '2022-09-15',
      type: 'certification'
    }
  ],
  availability: {
    mentoring: true,
    collaboration: true,
    consultation: false
  },
  testimonials: [
    {
      id: '1',
      from: {
        name: 'Sarah Chen',
        title: 'ML Engineer at Meta',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'
      },
      content: 'Kwame is an exceptional mentor who guided me through my transition into AI research. His insights on ethical AI practices have shaped my approach to building responsible ML systems.',
      date: '2024-01-15',
      type: 'mentorship'
    },
    {
      id: '2',
      from: {
        name: 'David Okonkwo',
        title: 'PhD Student at MIT',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face'
      },
      content: 'Working with Kwame on our joint research project was incredible. His expertise in NLP and commitment to ethical AI made our collaboration extremely productive.',
      date: '2023-11-20',
      type: 'collaboration'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'Ethical AI Framework for Healthcare',
      description: 'Developing bias-free AI models for medical diagnosis in underserved communities',
      role: 'Lead Researcher',
      status: 'active',
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'MLflow']
    },
    {
      id: '2',
      name: 'African Language NLP Models',
      description: 'Building natural language processing models for African languages',
      role: 'Principal Investigator',
      status: 'completed',
      technologies: ['Transformers', 'Python', 'HuggingFace', 'NLTK']
    }
  ],
  publications: [
    {
      title: 'Bias Mitigation in Large Language Models: A Comprehensive Survey',
      venue: 'Nature Machine Intelligence',
      year: '2023',
      url: 'https://example.com/paper1'
    },
    {
      title: 'Ethical Considerations in AI for Healthcare Applications',
      venue: 'NeurIPS 2023',
      year: '2023',
      url: 'https://example.com/paper2'
    },
    {
      title: 'Multilingual NLP for African Languages: Challenges and Opportunities',
      venue: 'ACL 2022',
      year: '2022',
      url: 'https://example.com/paper3'
    }
  ]
};

// Skill icons mapping
const skillIcons: Record<string, any> = {
  'Machine Learning': Zap,
  'Natural Language Processing': MessageCircle,
  'Python': Code,
  'TensorFlow': Target,
  'Research': BookOpen,
  'Ethics in AI': Shield,
  'Deep Learning': BarChart3,
  'Data Science': TrendingUp,
  'Leadership': Award
};

// Role configurations
const roleConfig = {
  mentor: { color: 'bg-blue-100 text-blue-800', icon: Users },
  professional: { color: 'bg-green-100 text-green-800', icon: Briefcase },
  alumni: { color: 'bg-purple-100 text-purple-800', icon: GraduationCap },
  student: { color: 'bg-orange-100 text-orange-800', icon: BookOpen },
  researcher: { color: 'bg-indigo-100 text-indigo-800', icon: Target },
  entrepreneur: { color: 'bg-red-100 text-red-800', icon: Rocket }
};

interface UserProfileProps {
  userId?: string;
  onBack?: () => void;
  onConnect?: (userId: string, message: string) => void;
  onMessage?: (userId: string) => void;
}

export function UserProfile({ userId, onBack, onConnect, onMessage }: UserProfileProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectMessage, setConnectMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // In a real app, you would fetch user data based on userId
  const user = mockUserProfile;
  
  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;

  const handleConnect = () => {
    if (!connectMessage.trim()) {
      alert('Please add a message with your connection request.');
      return;
    }
    onConnect?.(user.id, connectMessage);
    setShowConnectDialog(false);
    setConnectMessage('');
  };

  const getConnectionButton = () => {
    switch (user.connectionStatus) {
      case 'connected':
        return (
          <Button onClick={() => onMessage?.(user.id)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        );
      case 'pending_sent':
        return (
          <Button variant="outline" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
        );
      default:
        return (
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Connect with {user.name}</DialogTitle>
                <DialogDescription>
                  Send a personalized message with your connection request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Write a personalized message explaining why you'd like to connect..."
                  value={connectMessage}
                  onChange={(e) => setConnectMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConnectDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConnect}
                    className="flex-1 bg-[#021ff6] hover:bg-[#021ff6]/90"
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Network
          </Button>
        )}

        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar and Online Status */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    {user.isVerified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className={roleInfo.color}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <h2 className="text-xl text-gray-700 mb-1">{user.title}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {user.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {user.university}, {user.graduationYear}
                    </div>
                  </div>
                </div>

                {/* Availability Badges */}
                <div className="flex flex-wrap gap-2">
                  {user.availability?.mentoring && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Users className="h-3 w-3 mr-1" />
                      Available for Mentoring
                    </Badge>
                  )}
                  {user.availability?.collaboration && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Users className="h-3 w-3 mr-1" />
                      Open to Collaboration
                    </Badge>
                  )}
                  {user.availability?.consultation && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Coffee className="h-3 w-3 mr-1" />
                      Offering Consultation
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {user.mutualConnections} mutual connections
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {user.responseRate}% response rate
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {user.experience} years experience
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {getConnectionButton()}
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Social Links */}
                {user.socialLinks && (
                  <div className="flex gap-2">
                    {user.socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${user.socialLinks.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {user.socialLinks.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Skills & Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => {
                      const SkillIcon = skillIcons[skill] || Code;
                      return (
                        <Badge key={skill} variant="outline" className="flex items-center gap-1">
                          <SkillIcon className="h-3 w-3" />
                          {skill}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Expertise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.expertise.map(area => (
                      <div key={area} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map(interest => (
                      <Badge key={interest} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.achievements?.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-2 border-blue-200 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">{user.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-2">{user.company}</p>
                    <p className="text-sm text-gray-500">2020 - Present</p>
                    <p className="text-sm text-gray-700 mt-2">
                      Leading cutting-edge research in AI ethics and natural language processing. 
                      Mentoring junior researchers and contributing to responsible AI development practices.
                    </p>
                  </div>
                  
                  <div className="border-l-2 border-gray-200 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Research Scientist</h3>
                    </div>
                    <p className="text-gray-600 mb-2">Microsoft Research</p>
                    <p className="text-sm text-gray-500">2018 - 2020</p>
                    <p className="text-sm text-gray-700 mt-2">
                      Developed novel machine learning algorithms for natural language understanding
                      and contributed to multiple high-impact publications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <div className="space-y-4">
              {user.projects?.map(project => (
                <Card key={project.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.role}</p>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testimonials" className="mt-6">
            <div className="space-y-4">
              {user.testimonials?.map(testimonial => (
                <Card key={testimonial.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.from.avatar} alt={testimonial.from.name} />
                        <AvatarFallback>
                          {testimonial.from.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{testimonial.from.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {testimonial.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{testimonial.from.title}</p>
                        <blockquote className="text-gray-700 italic">
                          "{testimonial.content}"
                        </blockquote>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(testimonial.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="publications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Publications & Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.publications?.map((publication, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{publication.title}</h4>
                          <p className="text-sm text-gray-600">
                            {publication.venue} • {publication.year}
                          </p>
                        </div>
                        {publication.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={publication.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}