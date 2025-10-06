import React, { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  Send,
  Filter,
  Search,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Award,
  Heart,
  MessageCircle,
  Phone,
  Video,
  Mail,
  Globe,
  Users,
  Target,
  BookOpen,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface MentorshipRequest {
  id: string;
  studentName: string;
  studentAvatar?: string;
  university: string;
  program: string;
  year: string;
  location: string;
  requestDate: Date;
  status: 'pending' | 'accepted' | 'declined' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  subject: string;
  message: string;
  expertise: string[];
  goals: string[];
  timeCommitment: string;
  preferredFormat: 'virtual' | 'in-person' | 'flexible';
  rating?: number;
  previousMentors: number;
  gpa?: number;
  linkedinUrl?: string;
  portfolioUrl?: string;
  personalWebsite?: string;
  preferredMeetingTimes?: string[];
  urgency?: string;
  projectDescription?: string;
  achievements?: string[];
  languages?: string[];
  timezone?: string;
}

interface MentorshipRequestsProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced mock mentorship requests data
const mockRequests: MentorshipRequest[] = [
  {
    id: '1',
    studentName: 'Amara Okafor',
    studentAvatar:
      'https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face',
    university: 'University of Lagos',
    program: 'Computer Science',
    year: '3rd Year',
    location: 'Lagos, Nigeria',
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'pending',
    priority: 'high',
    subject: 'AI/ML Career Guidance and Project Mentorship',
    message:
      "Hello Dr. Amina! I'm a 3rd-year Computer Science student passionate about AI/ML. I've been following your work in healthcare AI and would love guidance on transitioning from academic projects to real-world applications. I'm particularly interested in how to build industry-relevant skills and secure internships in top tech companies. I have a strong foundation in Python, TensorFlow, and have completed several projects including a medical image classification system. I'm looking for guidance on advanced ML techniques, industry best practices, and career pathways in AI research vs. industry roles.",
    expertise: [
      'Artificial Intelligence',
      'Machine Learning',
      'Healthcare Tech',
      'Career Development',
    ],
    goals: [
      'Industry Transition',
      'Technical Skills',
      'Internship Preparation',
      'Project Portfolio',
    ],
    timeCommitment: '2-3 hours/week',
    preferredFormat: 'virtual',
    rating: 4.8,
    previousMentors: 1,
    gpa: 3.7,
    linkedinUrl: 'https://linkedin.com/in/amara-okafor',
    portfolioUrl: 'https://amaraokafor.dev',
    personalWebsite: 'https://amaraokafor.com',
    preferredMeetingTimes: ['Weekdays 4-6 PM WAT', 'Saturdays 10 AM - 2 PM WAT'],
    urgency: 'High - Applying for summer internships',
    projectDescription:
      'Currently building an AI-powered health monitoring app for rural communities',
    achievements: [
      "Dean's List 2023",
      'Winner - University AI Hackathon',
      'Published paper on ML applications',
    ],
    languages: ['English', 'Yoruba', 'French'],
    timezone: 'WAT (UTC+1)',
  },
  {
    id: '2',
    studentName: 'David Mensah',
    studentAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    university: 'University of Ghana',
    program: 'Biomedical Engineering',
    year: '4th Year',
    location: 'Accra, Ghana',
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'pending',
    priority: 'medium',
    subject: 'Research Collaboration and Graduate School Guidance',
    message:
      "Dear Dr. Amina, I'm a final year Biomedical Engineering student interested in pursuing graduate studies in Medical AI. Your research in automated diagnostics aligns perfectly with my interests. I'd appreciate guidance on research methodologies, graduate school applications, and potential collaboration opportunities. I have experience with medical device design and signal processing, and I'm particularly interested in the intersection of biomedical engineering and artificial intelligence for diagnostic applications.",
    expertise: ['Medical AI', 'Research Methods', 'Graduate Studies', 'Biomedical Engineering'],
    goals: ['Graduate School Prep', 'Research Skills', 'Publication Strategy', 'Career Planning'],
    timeCommitment: '1-2 hours/week',
    preferredFormat: 'flexible',
    rating: 4.6,
    previousMentors: 0,
    gpa: 3.9,
    linkedinUrl: 'https://linkedin.com/in/david-mensah',
    preferredMeetingTimes: ['Weekends', 'Weekday evenings'],
    urgency: 'Medium - Graduate applications due in 6 months',
    projectDescription: 'Working on biosensor development for early disease detection',
    achievements: [
      'Magna Cum Laude',
      'Research Assistant - Medical Devices Lab',
      'Conference presentation at BMES',
    ],
    languages: ['English', 'Twi'],
    timezone: 'GMT (UTC+0)',
  },
  {
    id: '3',
    studentName: 'Fatima Al-Rashid',
    studentAvatar:
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150&h=150&fit=crop&crop=face',
    university: 'American University of Cairo',
    program: 'Data Science',
    year: '2nd Year',
    location: 'Cairo, Egypt',
    requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'pending',
    priority: 'high',
    subject: 'Data Science in Healthcare - Project Mentorship',
    message:
      "Hello Dr. Amina! I'm a Data Science student with a strong interest in healthcare applications. I'm currently working on a project analyzing patient data patterns and would love your expertise in ethical AI practices and data privacy in healthcare contexts. Your guidance would be invaluable for both technical implementation and understanding the ethical considerations in healthcare AI. I'm particularly interested in learning about real-world challenges in deploying AI solutions in clinical settings.",
    expertise: ['Data Science', 'Healthcare Analytics', 'Ethical AI', 'Data Privacy'],
    goals: [
      'Technical Expertise',
      'Project Guidance',
      'Industry Best Practices',
      'Ethical Frameworks',
    ],
    timeCommitment: '3-4 hours/week',
    preferredFormat: 'virtual',
    rating: 4.9,
    previousMentors: 2,
    gpa: 3.8,
    linkedinUrl: 'https://linkedin.com/in/fatima-alrashid',
    portfolioUrl: 'https://fatima-analytics.com',
    preferredMeetingTimes: ['Weekdays 2-5 PM EET', 'Tuesday/Thursday evenings'],
    urgency: 'High - Project deadline in 3 weeks',
    projectDescription: 'Developing predictive models for patient readmission rates',
    achievements: [
      'Top 5% of class',
      'Kaggle Competition Bronze Medal',
      'Healthcare Data Science Certificate',
    ],
    languages: ['Arabic', 'English', 'French'],
    timezone: 'EET (UTC+2)',
  },
  {
    id: '4',
    studentName: 'Kwame Asante',
    studentAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    university: 'Kwame Nkrumah University',
    program: 'Software Engineering',
    year: '1st Year',
    location: 'Kumasi, Ghana',
    requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'in-progress',
    priority: 'medium',
    subject: 'Career Foundation and Study Path Guidance',
    message:
      "Dr. Amina, as a first-year Software Engineering student, I'm seeking guidance on building a strong foundation for a career in tech. I'd love advice on course selection, skill development priorities, and extracurricular activities that would prepare me for internships and future career opportunities. I'm particularly interested in understanding how to balance academic excellence with practical skill development and building a professional network early in my career.",
    expertise: [
      'Software Engineering',
      'Career Planning',
      'Skill Development',
      'Academic Guidance',
    ],
    goals: ['Career Foundation', 'Academic Planning', 'Skill Roadmap', 'Industry Preparation'],
    timeCommitment: '1 hour/week',
    preferredFormat: 'virtual',
    rating: 4.5,
    previousMentors: 0,
    gpa: 3.6,
    preferredMeetingTimes: ['Weekends', 'Friday evenings'],
    urgency: 'Low - Long-term career planning',
    achievements: ['Programming Club President', 'Hackathon Participant', 'Community Volunteer'],
    languages: ['English', 'Twi', 'Fante'],
    timezone: 'GMT (UTC+0)',
  },
  {
    id: '5',
    studentName: 'Zara Mohamed',
    studentAvatar:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    university: 'University of Cape Town',
    program: 'Information Systems',
    year: '3rd Year',
    location: 'Cape Town, South Africa',
    requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'accepted',
    priority: 'low',
    subject: 'Entrepreneurship and Tech Startup Guidance',
    message:
      "Hello Dr. Amina! I'm an Information Systems student with entrepreneurial aspirations. I'm developing a health tech startup idea and would appreciate guidance on technical feasibility, market validation, and navigating the startup ecosystem in Africa. Your expertise would be incredibly valuable in helping me understand the intersection of technology and healthcare business models, especially in emerging markets.",
    expertise: ['Entrepreneurship', 'Health Tech', 'Startup Strategy', 'Market Validation'],
    goals: ['Startup Development', 'Business Strategy', 'Technical Validation', 'Funding Guidance'],
    timeCommitment: '2 hours/week',
    preferredFormat: 'flexible',
    rating: 4.7,
    previousMentors: 1,
    gpa: 3.5,
    linkedinUrl: 'https://linkedin.com/in/zara-mohamed',
    preferredMeetingTimes: ['Flexible - any time'],
    urgency: 'Medium - Preparing for pitch competition',
    projectDescription: 'Building a telemedicine platform for rural African communities',
    achievements: [
      'Startup Incubator Participant',
      'Business Plan Competition Finalist',
      'Student Entrepreneur Award',
    ],
    languages: ['English', 'Afrikaans', 'Arabic'],
    timezone: 'SAST (UTC+2)',
  },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

function RequestCard({
  request,
  onViewDetails,
  onAccept,
  onDecline,
  onMessage,
}: {
  request: MentorshipRequest;
  onViewDetails: (request: MentorshipRequest) => void;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onMessage: (request: MentorshipRequest) => void;
}) {
  const getStatusIcon = () => {
    switch (request.status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      case 'in-progress':
        return <MessageSquare className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#021ff6]">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-blue-100">
              <AvatarImage src={request.studentAvatar} alt={request.studentName} />
              <AvatarFallback className="text-sm font-medium bg-blue-50 text-blue-700">
                {request.studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg text-gray-900 truncate">
                      {request.studentName}
                    </h4>
                    {request.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-700">
                          {request.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {request.program} • {request.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{request.university}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{request.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <Badge
                    className={`${statusColors[request.status]} text-xs px-2 py-1 font-medium`}
                  >
                    {getStatusIcon()}
                    <span className="ml-1">{request.status.replace('-', ' ')}</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${priorityColors[request.priority]} text-xs px-2 py-1 font-medium`}
                  >
                    {request.priority} priority
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {timeAgo(request.requestDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject and Message Preview */}
          <div className="space-y-2 bg-gray-50 rounded-lg p-3">
            <h5 className="font-medium text-gray-900 line-clamp-1">{request.subject}</h5>
            <p className="text-sm text-gray-600 line-clamp-2">{request.message}</p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{request.timeCommitment}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 capitalize">{request.preferredFormat}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{request.previousMentors} prev mentors</span>
            </div>
            {request.gpa && (
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">GPA: {request.gpa}</span>
              </div>
            )}
          </div>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-1">
            {request.expertise.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {skill}
              </Badge>
            ))}
            {request.expertise.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-600">
                +{request.expertise.length - 3} more
              </Badge>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(request)}
              className="text-sm h-8 px-3 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            >
              <User className="h-3 w-3 mr-1" />
              View Profile
            </Button>

            <div className="flex items-center gap-2">
              {request.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecline(request.id)}
                    className="text-sm h-8 px-3 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAccept(request.id)}
                    className="bg-[#021ff6] hover:bg-[#021ff6]/90 text-sm h-8 px-3"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                </>
              )}

              {(request.status === 'accepted' || request.status === 'in-progress') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage(request)}
                  className="text-sm h-8 px-3 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestDetailsDialog({
  request,
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: {
  request: MentorshipRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 flex flex-col w-[95vw] sm:w-full">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl">Student Mentorship Profile</DialogTitle>
          <DialogDescription className="text-gray-600">
            Complete details and background of mentorship request
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Enhanced Student Profile Header */}
              <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20 flex-shrink-0 ring-4 ring-blue-200">
                      <AvatarImage src={request.studentAvatar} alt={request.studentName} />
                      <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">
                        {request.studentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {request.studentName}
                          </h3>
                          <p className="text-lg text-gray-600">
                            {request.program}, {request.year}
                          </p>
                          <p className="text-base text-gray-500">{request.university}</p>
                        </div>

                        {request.rating && (
                          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">
                              {request.rating}/5.0
                            </span>
                            <span className="text-sm text-gray-500">rating</span>
                          </div>
                        )}
                      </div>

                      {/* External Links */}
                      <div className="flex space-x-3">
                        {request.linkedinUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-blue-600 hover:text-white"
                          >
                            <a href={request.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                        {request.portfolioUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-purple-600 hover:text-white"
                          >
                            <a
                              href={request.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Portfolio <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                        {request.personalWebsite && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-green-600 hover:text-white"
                          >
                            <a
                              href={request.personalWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Website <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic & Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Academic Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">University:</span>
                        <p className="mt-1">{request.university}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Program:</span>
                        <p className="mt-1">{request.program}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">Year:</span>
                        <p className="mt-1">{request.year}</p>
                      </div>
                      {request.gpa && (
                        <div>
                          <span className="text-gray-600 font-medium">GPA:</span>
                          <p className="mt-1 font-semibold text-green-600">{request.gpa}/4.0</p>
                        </div>
                      )}
                    </div>

                    {request.achievements && (
                      <div>
                        <span className="text-gray-600 font-medium">Achievements:</span>
                        <div className="mt-2 space-y-1">
                          {request.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Award className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                              <span className="text-sm">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">Location:</span>
                        <p className="mt-1">{request.location}</p>
                      </div>
                      {request.timezone && (
                        <div>
                          <span className="text-gray-600 font-medium">Timezone:</span>
                          <p className="mt-1">{request.timezone}</p>
                        </div>
                      )}
                      {request.languages && (
                        <div>
                          <span className="text-gray-600 font-medium">Languages:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {request.languages.map((lang, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600 font-medium">Previous Mentors:</span>
                        <p className="mt-1">
                          {request.previousMentors} mentorship
                          {request.previousMentors !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Request Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Mentorship Request Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Subject</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.subject}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Detailed Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg leading-relaxed">
                      {request.message}
                    </p>
                  </div>

                  {request.projectDescription && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Current Project</h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {request.projectDescription}
                      </p>
                    </div>
                  )}

                  {request.urgency && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Urgency & Timeline</h4>
                      <p className="text-gray-700 bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                        {request.urgency}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Goals and Expertise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-red-600" />
                      Learning Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {request.goals.map((goal, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      Expertise Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {request.expertise.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Meeting Preferences */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Meeting Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Time Commitment:</span>
                      <p className="mt-1 font-semibold text-green-600">{request.timeCommitment}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Format:</span>
                      <p className="mt-1 capitalize font-semibold text-blue-600">
                        {request.preferredFormat}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Priority:</span>
                      <Badge className={`${priorityColors[request.priority]} mt-1`}>
                        {request.priority} priority
                      </Badge>
                    </div>
                  </div>

                  {request.preferredMeetingTimes && (
                    <div className="mt-4">
                      <span className="text-gray-600 font-medium">Preferred Meeting Times:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {request.preferredMeetingTimes.map((time, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 border-green-200 text-green-700"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Actions Footer */}
        {request.status === 'pending' && (
          <div className="flex items-center justify-between p-6 pt-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="hover:bg-blue-600 hover:text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="hover:bg-green-600 hover:text-white">
                <Phone className="h-4 w-4 mr-2" />
                Schedule Call
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => onDecline(request.id)}
                className="hover:bg-red-600 hover:text-white hover:border-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Request
              </Button>
              <Button
                onClick={() => onAccept(request.id)}
                className="bg-[#021ff6] hover:bg-[#021ff6]/90 px-6"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Start Mentorship
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MentorshipRequests({ isOpen, onClose }: MentorshipRequestsProps) {
  const [requests, setRequests] = useState<MentorshipRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<MentorshipRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.program.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && request.status === 'pending') ||
      (activeTab === 'active' &&
        (request.status === 'accepted' || request.status === 'in-progress')) ||
      (activeTab === 'completed' &&
        (request.status === 'completed' || request.status === 'declined'));

    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const handleAccept = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'accepted' } : req)),
    );
    setShowDetails(false);
    toast.success(`Mentorship request from ${request?.studentName} has been accepted!`);
  };

  const handleDecline = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'declined' } : req)),
    );
    setShowDetails(false);
    toast.success(`Mentorship request from ${request?.studentName} has been declined.`);
  };

  const handleViewDetails = (request: MentorshipRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleMessage = (request: MentorshipRequest) => {
    toast.success(`Opening message thread with ${request.studentName}`);
  };

  const getTabCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      active: requests.filter((r) => r.status === 'accepted' || r.status === 'in-progress').length,
      completed: requests.filter((r) => r.status === 'completed' || r.status === 'declined').length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] p-0 flex flex-col">
          {/* Enhanced Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="h-10 w-10 bg-[#021ff6] rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <span>Mentorship Requests</span>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  Review and manage student mentorship applications
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Content Area with Enhanced Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Enhanced Tabs Row */}
              <div className="px-6 pt-4 pb-3 border-b bg-white">
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-fit grid-cols-4 bg-gray-100">
                    <TabsTrigger value="all" className="text-sm px-4 py-2">
                      All Requests ({tabCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-sm px-4 py-2">
                      Pending ({tabCounts.pending})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-sm px-4 py-2">
                      Active ({tabCounts.active})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-sm px-4 py-2">
                      Completed ({tabCounts.completed})
                    </TabsTrigger>
                  </TabsList>

                  <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                    {filteredRequests.length} of {requests.length} requests
                  </div>
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, subject, university, or program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36 bg-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-36 bg-white">
                        <SelectValue placeholder="All Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Enhanced Requests List */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {filteredRequests.length > 0 ? (
                      <div className="space-y-4">
                        {filteredRequests.map((request) => (
                          <RequestCard
                            key={request.id}
                            request={request}
                            onViewDetails={handleViewDetails}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                            onMessage={handleMessage}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No requests found
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          {searchQuery
                            ? 'Try adjusting your search terms or filters.'
                            : 'No mentorship requests match your current filters.'}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Details Dialog */}
      <RequestDetailsDialog
        request={selectedRequest}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </>
  );
}
