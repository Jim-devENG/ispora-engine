import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Users,
  UserPlus,
  Calendar,
  MessageCircle,
  Video,
  FileText,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Activity,
  Mail,
  Phone,
  Globe,
  MapPin,
  GraduationCap,
  Briefcase,
  Zap,
  BookOpen,
  Target,
  Heart,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  university: string;
  program: string;
  year: string;
  role: 'mentor' | 'mentee' | 'participant' | 'leader' | 'researcher' | 'volunteer' | 'expert';
  status: 'active' | 'paused' | 'completed' | 'inactive';
  progress: number;
  isOnline?: boolean;
  joinDate: string;
  lastActive: string;
  contributions: number;
  rating?: number;
  location?: string;
  skills?: string[];
  bio?: string;
  projectSpecificData?: {
    tasksCompleted?: number;
    hoursContributed?: number;
    sessionsAttended?: number;
    achievementsEarned?: number;
  };
}

// Extended mock data for comprehensive member management
const mockMembers: ProjectMember[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    email: 'alex.chen@stanford.edu',
    university: 'Stanford University',
    program: 'Computer Science',
    year: 'Junior',
    role: 'researcher',
    status: 'active',
    progress: 85,
    isOnline: true,
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
    contributions: 147,
    rating: 4.8,
    location: 'Palo Alto, CA',
    skills: ['Python', 'Machine Learning', 'Research'],
    bio: 'Passionate about AI ethics and responsible technology development.',
    projectSpecificData: {
      tasksCompleted: 12,
      hoursContributed: 45,
      sessionsAttended: 8,
      achievementsEarned: 3,
    },
  },
  {
    id: '2',
    name: 'Sarah Williams',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face',
    email: 'sarah.williams@mit.edu',
    university: 'MIT',
    program: 'Electrical Engineering',
    year: 'Sophomore',
    role: 'participant',
    status: 'active',
    progress: 72,
    isOnline: false,
    joinDate: '2024-01-20',
    lastActive: '1 day ago',
    contributions: 89,
    rating: 4.6,
    location: 'Cambridge, MA',
    skills: ['Hardware Design', 'Signal Processing'],
    bio: 'Interested in the intersection of hardware and AI ethics.',
    projectSpecificData: {
      tasksCompleted: 8,
      hoursContributed: 32,
      sessionsAttended: 6,
      achievementsEarned: 2,
    },
  },
  {
    id: '3',
    name: 'Dr. Maria Rodriguez',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    email: 'maria.rodriguez@berkeley.edu',
    university: 'UC Berkeley',
    program: 'Faculty',
    year: 'Professor',
    role: 'mentor',
    status: 'active',
    progress: 95,
    isOnline: true,
    joinDate: '2024-01-10',
    lastActive: '30 minutes ago',
    contributions: 203,
    rating: 4.9,
    location: 'Berkeley, CA',
    skills: ['AI Ethics', 'Policy', 'Mentoring'],
    bio: 'Professor of Computer Science specializing in AI ethics and policy.',
    projectSpecificData: {
      tasksCompleted: 15,
      hoursContributed: 68,
      sessionsAttended: 12,
      achievementsEarned: 5,
    },
  },
  {
    id: '4',
    name: 'Jordan Martinez',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'jordan.martinez@ucla.edu',
    university: 'UCLA',
    program: 'Business Administration',
    year: 'Senior',
    role: 'participant',
    status: 'paused',
    progress: 45,
    isOnline: false,
    joinDate: '2024-02-01',
    lastActive: '1 week ago',
    contributions: 34,
    rating: 4.2,
    location: 'Los Angeles, CA',
    skills: ['Business Strategy', 'Project Management'],
    bio: 'Exploring the business implications of ethical AI.',
    projectSpecificData: {
      tasksCompleted: 4,
      hoursContributed: 18,
      sessionsAttended: 3,
      achievementsEarned: 1,
    },
  },
  {
    id: '5',
    name: 'Emma Thompson',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face',
    email: 'emma.thompson@harvard.edu',
    university: 'Harvard University',
    program: 'Philosophy',
    year: 'Graduate',
    role: 'expert',
    status: 'active',
    progress: 78,
    isOnline: true,
    joinDate: '2024-01-25',
    lastActive: '1 hour ago',
    contributions: 124,
    rating: 4.7,
    location: 'Cambridge, MA',
    skills: ['Ethics', 'Philosophy', 'Critical Thinking'],
    bio: 'PhD candidate focusing on moral philosophy in technology.',
    projectSpecificData: {
      tasksCompleted: 10,
      hoursContributed: 42,
      sessionsAttended: 9,
      achievementsEarned: 4,
    },
  },
];

const roleIcons = {
  mentor: Users,
  mentee: BookOpen,
  participant: Users,
  leader: Star,
  researcher: Zap,
  volunteer: Heart,
  expert: Award,
};

const roleColors = {
  mentor: 'bg-blue-100 text-blue-800',
  mentee: 'bg-green-100 text-green-800',
  participant: 'bg-purple-100 text-purple-800',
  leader: 'bg-yellow-100 text-yellow-800',
  researcher: 'bg-indigo-100 text-indigo-800',
  volunteer: 'bg-pink-100 text-pink-800',
  expert: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
};

interface ProjectMemberManagementProps {
  onSelectMember: (member: ProjectMember) => void;
  onClose: () => void;
  selectedMemberId?: string;
  projectType?: string;
}

export function ProjectMemberManagement({
  onSelectMember,
  onClose,
  selectedMemberId,
  projectType = 'research',
}: ProjectMemberManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    mockMembers.find((m) => m.id === selectedMemberId) || null,
  );

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.university.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      case 'contributions':
        return b.contributions - a.contributions;
      case 'joinDate':
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      default:
        return 0;
    }
  });

  const handleMemberSelect = (member: ProjectMember) => {
    setSelectedMember(member);
    onSelectMember(member);
  };

  const MemberCard = ({ member }: { member: ProjectMember }) => {
    const RoleIcon = roleIcons[member.role];
    const isSelected = selectedMemberId === member.id;

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-[#021ff6] bg-blue-50' : ''
        }`}
        onClick={() => handleMemberSelect(member)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium truncate">{member.name}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Session
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-gray-600 truncate">{member.university}</p>
              <p className="text-xs text-gray-500">
                {member.program} • {member.year}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <Badge className={roleColors[member.role]} variant="secondary">
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {member.role}
                </Badge>
                <Badge className={statusColors[member.status]} variant="secondary">
                  {member.status}
                </Badge>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{member.progress}%</span>
                </div>
                <Progress value={member.progress} className="h-1" />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                <div>Contributions: {member.contributions}</div>
                <div>Rating: {member.rating ? `${member.rating}/5` : 'N/A'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const MemberListItem = ({ member }: { member: ProjectMember }) => {
    const RoleIcon = roleIcons[member.role];
    const isSelected = selectedMemberId === member.id;

    return (
      <div
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
          isSelected ? 'ring-2 ring-[#021ff6] bg-blue-50' : ''
        }`}
        onClick={() => handleMemberSelect(member)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            {member.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-6 gap-4 items-center">
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
            <div>
              <p className="text-sm">{member.university}</p>
              <p className="text-xs text-gray-500">{member.program}</p>
            </div>
            <div>
              <Badge className={roleColors[member.role]} variant="secondary">
                <RoleIcon className="h-3 w-3 mr-1" />
                {member.role}
              </Badge>
            </div>
            <div>
              <Badge className={statusColors[member.status]} variant="secondary">
                {member.status}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{member.progress}%</div>
              <Progress value={member.progress} className="h-1 w-16" />
            </div>
            <div className="text-center">
              <div className="text-sm">{member.contributions}</div>
              <div className="text-xs text-gray-500">contributions</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="h-4 w-4 mr-2" />
                Schedule Session
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Project Members</h1>
              <p className="text-gray-600">
                Manage and collaborate with {sortedMembers.length} project members
              </p>
            </div>
          </div>
          <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="mentor">Mentors</SelectItem>
              <SelectItem value="mentee">Mentees</SelectItem>
              <SelectItem value="participant">Participants</SelectItem>
              <SelectItem value="researcher">Researchers</SelectItem>
              <SelectItem value="expert">Experts</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="contributions">Contributions</SelectItem>
              <SelectItem value="joinDate">Join Date</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMembers.map((member) => (
                <MemberListItem key={member.id} member={member} />
              ))}
            </div>
          )}

          {sortedMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No members found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
