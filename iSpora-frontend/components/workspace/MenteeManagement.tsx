import React, { useState } from "react";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  MessageCircle,
  Video,
  Phone,
  MoreHorizontal,
  User,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Star,
  Award,
  BookOpen,
  Target,
  ArrowLeft,
  Plus,
  Download,
  Send,
  Eye,
  FileText,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  isOnline?: boolean;
  joinDate: string;
  lastActivity: string;
  totalSessions: number;
  completedTasks: number;
  totalTasks: number;
  gpa?: number;
  goals: string[];
  skills: string[];
  recentAchievements: string[];
  upcomingDeadlines: string[];
  mentorshipFocus: string;
  communicationPreference: 'email' | 'phone' | 'video' | 'text';
  timeZone: string;
  rating: number;
}

// Extended mock mentees data
const mockMentees: Mentee[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    university: "Stanford University",
    program: "Computer Science",
    year: "Junior",
    status: "active",
    progress: 75,
    isOnline: true,
    joinDate: "2024-01-15",
    lastActivity: "2 hours ago",
    totalSessions: 18,
    completedTasks: 12,
    totalTasks: 16,
    gpa: 3.8,
    goals: ["Land FAANG internship", "Master system design", "Build portfolio"],
    skills: ["React", "Python", "Algorithms"],
    recentAchievements: ["Completed React certification", "Won hackathon"],
    upcomingDeadlines: ["Project submission - Oct 25", "Interview prep - Nov 1"],
    mentorshipFocus: "Technical Career Development",
    communicationPreference: "video",
    timeZone: "PST",
    rating: 4.8
  },
  {
    id: "2",
    name: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    university: "MIT",
    program: "Electrical Engineering",
    year: "Sophomore",
    status: "active",
    progress: 60,
    isOnline: false,
    joinDate: "2024-02-01",
    lastActivity: "1 day ago",
    totalSessions: 12,
    completedTasks: 8,
    totalTasks: 12,
    gpa: 3.9,
    goals: ["Research opportunities", "Graduate school prep", "Publication"],
    skills: ["MATLAB", "Circuit Design", "Research"],
    recentAchievements: ["Published paper", "Dean's list"],
    upcomingDeadlines: ["Lab report - Oct 22", "GRE prep - Nov 15"],
    mentorshipFocus: "Academic & Research Excellence",
    communicationPreference: "email",
    timeZone: "EST",
    rating: 4.9
  },
  {
    id: "3",
    name: "Jordan Martinez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    university: "UC Berkeley",
    program: "Business Administration",
    year: "Senior",
    status: "completed",
    progress: 100,
    isOnline: true,
    joinDate: "2023-09-01",
    lastActivity: "3 days ago",
    totalSessions: 24,
    completedTasks: 20,
    totalTasks: 20,
    gpa: 3.7,
    goals: ["Start own company", "Secure funding", "Build network"],
    skills: ["Business Strategy", "Leadership", "Finance"],
    recentAchievements: ["Secured seed funding", "Launched startup"],
    upcomingDeadlines: [],
    mentorshipFocus: "Entrepreneurship & Leadership",
    communicationPreference: "phone",
    timeZone: "PST",
    rating: 4.7
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    university: "Harvard University",
    program: "Pre-Med",
    year: "Sophomore",
    status: "active",
    progress: 45,
    isOnline: false,
    joinDate: "2024-03-01",
    lastActivity: "5 hours ago",
    totalSessions: 8,
    completedTasks: 5,
    totalTasks: 11,
    gpa: 3.95,
    goals: ["Medical school admission", "Research experience", "MCAT prep"],
    skills: ["Biology", "Chemistry", "Research"],
    recentAchievements: ["Research assistant position", "Volunteer work"],
    upcomingDeadlines: ["MCAT registration - Oct 30", "Research proposal - Nov 5"],
    mentorshipFocus: "Medical School Preparation",
    communicationPreference: "video",
    timeZone: "EST",
    rating: 4.6
  },
  {
    id: "5",
    name: "Michael Park",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    university: "Carnegie Mellon",
    program: "Computer Science",
    year: "Senior",
    status: "paused",
    progress: 85,
    isOnline: false,
    joinDate: "2023-08-15",
    lastActivity: "2 weeks ago",
    totalSessions: 20,
    completedTasks: 15,
    totalTasks: 18,
    gpa: 3.6,
    goals: ["Full-time job offer", "Technical interviews", "Salary negotiation"],
    skills: ["Java", "Machine Learning", "Data Structures"],
    recentAchievements: ["Internship completion", "Technical project"],
    upcomingDeadlines: ["Job applications - Nov 1"],
    mentorshipFocus: "Career Transition",
    communicationPreference: "text",
    timeZone: "EST",
    rating: 4.5
  }
];

interface MenteeManagementProps {
  onSelectMentee: (mentee: Mentee) => void;
  onClose: () => void;
  selectedMenteeId?: string;
}

function MenteeCard({ mentee, onSelect, isSelected }: { 
  mentee: Mentee; 
  onSelect: (mentee: Mentee) => void;
  isSelected?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <Award className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`workspace-card-hover cursor-pointer transition-all ${
      isSelected ? 'ring-2 ring-[#021ff6] shadow-lg' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentee.avatar} />
                <AvatarFallback>{mentee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {mentee.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">{mentee.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{mentee.university}</p>
              <p className="text-xs text-gray-500">{mentee.program} • {mentee.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getStatusColor(mentee.status)}>
              {getStatusIcon(mentee.status)}
              <span className="ml-1 capitalize">{mentee.status}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(mentee)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  View Progress
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{mentee.progress}%</span>
          </div>
          <Progress value={mentee.progress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-[#021ff6]">{mentee.totalSessions}</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {mentee.completedTasks}/{mentee.totalTasks}
            </div>
            <div className="text-xs text-gray-600">Tasks</div>
          </div>
        </div>

        {/* Mentorship Focus */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Focus Area</h4>
          <Badge variant="outline" className="text-xs">
            {mentee.mentorshipFocus}
          </Badge>
        </div>

        {/* Key Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Last Activity:</span>
            <span>{mentee.lastActivity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rating:</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{mentee.rating}</span>
            </div>
          </div>
          {mentee.gpa && (
            <div className="flex justify-between">
              <span className="text-gray-600">GPA:</span>
              <span>{mentee.gpa}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelect(mentee)}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-1" />
            Select
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Video className="h-4 w-4 mr-1" />
            Session
          </Button>
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MenteeManagement({ onSelectMentee, onClose, selectedMenteeId }: MenteeManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUniversity, setFilterUniversity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

  const universities = Array.from(new Set(mockMentees.map(m => m.university)));

  const filteredMentees = mockMentees
    .filter(mentee => {
      const matchesSearch = 
        mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentee.program.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || mentee.status === filterStatus;
      const matchesUniversity = filterUniversity === "all" || mentee.university === filterUniversity;
      
      return matchesSearch && matchesStatus && matchesUniversity;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "joinDate":
          aValue = new Date(a.joinDate);
          bValue = new Date(b.joinDate);
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSelectMentee = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    onSelectMentee(mentee);
    onClose();
  };

  const activeCount = mockMentees.filter(m => m.status === 'active').length;
  const completedCount = mockMentees.filter(m => m.status === 'completed').length;
  const avgProgress = Math.round(mockMentees.reduce((sum, m) => sum + m.progress, 0) / mockMentees.length);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Mentee Management</h1>
            <p className="text-gray-600">Manage all your mentees and track their progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Mentee
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{mockMentees.length}</div>
              <div className="text-sm text-gray-600">Total Mentees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-green-600">{activeCount}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-blue-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-semibold text-orange-600">{avgProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mentees by name, university, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUniversity} onValueChange={setFilterUniversity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map(uni => (
                <SelectItem key={uni} value={uni}>{uni}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="joinDate">Join Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentees.map((mentee) => (
                <MenteeCard
                  key={mentee.id}
                  mentee={mentee}
                  onSelect={handleSelectMentee}
                  isSelected={mentee.id === selectedMenteeId}
                />
              ))}
            </div>
            
            {filteredMentees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium mb-2">No mentees found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
                <Button variant="outline">Clear Filters</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
