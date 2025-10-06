import React, { useState, useEffect } from 'react';
import {
  School,
  Users,
  Target,
  DollarSign,
  BookOpen,
  Lightbulb,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Bell,
  CheckCircle,
  Star,
  ArrowLeft,
  Filter,
  Search,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  established: number;
  studentsCount: number;
  alumniOnPlatform: number;
  activeCampaigns: number;
}

interface JoinExistingCampaignsProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedUniversity?: {
    id: string;
    name: string;
    location: string;
    country: string;
    established: number;
    studentsCount?: number;
    alumniOnPlatform?: number;
    activeCampaigns?: number;
  } | null;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'mentorship' | 'funding' | 'research' | 'project';
  university: string;
  creator: string;
  participantsCount: number;
  targetParticipants?: number;
  goalAmount?: number;
  raisedAmount?: number;
  status: 'active' | 'upcoming' | 'ending-soon';
  progress: number;
  endDate: Date;
  startDate: Date;
  tags: string[];
  requirements: string[];
  timeCommitment: string;
  isUrgent: boolean;
  spotsRemaining?: number;
}

const mockUniversities: University[] = [
  {
    id: '1',
    name: 'University of Lagos',
    location: 'Lagos, Nigeria',
    country: 'Nigeria',
    established: 1962,
    studentsCount: 42000,
    alumniOnPlatform: 156,
    activeCampaigns: 12,
  },
  {
    id: '2',
    name: 'Makerere University',
    location: 'Kampala, Uganda',
    country: 'Uganda',
    established: 1922,
    studentsCount: 35000,
    alumniOnPlatform: 89,
    activeCampaigns: 8,
  },
  {
    id: '3',
    name: 'University of Cape Town',
    location: 'Cape Town, South Africa',
    country: 'South Africa',
    established: 1829,
    studentsCount: 29000,
    alumniOnPlatform: 203,
    activeCampaigns: 15,
  },
  {
    id: '4',
    name: 'American University in Cairo',
    location: 'Cairo, Egypt',
    country: 'Egypt',
    established: 1919,
    studentsCount: 6500,
    alumniOnPlatform: 78,
    activeCampaigns: 6,
  },
  {
    id: '5',
    name: 'University of Nairobi',
    location: 'Nairobi, Kenya',
    country: 'Kenya',
    established: 1970,
    studentsCount: 84000,
    alumniOnPlatform: 134,
    activeCampaigns: 9,
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Engineering Mentorship Program',
    description:
      'Connect with experienced engineers in the diaspora for career guidance, technical mentorship, and project collaboration opportunities.',
    type: 'mentorship',
    university: 'University of Lagos',
    creator: 'Dr. Sarah Chen',
    participantsCount: 24,
    targetParticipants: 50,
    status: 'active',
    progress: 48,
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    tags: ['Engineering', 'Career Development', 'Technology'],
    requirements: [
      'Engineering student or recent graduate',
      'Active participation commitment',
      'Basic English proficiency',
    ],
    timeCommitment: '2-3 hours per week',
    isUrgent: false,
    spotsRemaining: 26,
  },
  {
    id: '2',
    title: 'Startup Innovation Fund',
    description:
      'Funding initiative for student entrepreneurs developing solutions to local challenges. Get mentorship plus financial support for your startup idea.',
    type: 'funding',
    university: 'University of Lagos',
    creator: 'Amina Hassan',
    participantsCount: 8,
    targetParticipants: 15,
    goalAmount: 50000,
    raisedAmount: 32000,
    status: 'active',
    progress: 64,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    tags: ['Startup', 'Innovation', 'Funding', 'Entrepreneurship'],
    requirements: ['Valid business plan', 'Student or recent graduate', 'Local impact focus'],
    timeCommitment: 'Flexible, project-based',
    isUrgent: true,
    spotsRemaining: 7,
  },
  {
    id: '3',
    title: 'AI for Healthcare Research',
    description:
      'Collaborative research project developing AI solutions for healthcare challenges in Africa. Work with international research teams.',
    type: 'research',
    university: 'University of Cape Town',
    creator: 'Prof. Michael Roberts',
    participantsCount: 12,
    targetParticipants: 20,
    status: 'upcoming',
    progress: 60,
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tags: ['AI', 'Healthcare', 'Research', 'Technology'],
    requirements: ['CS/Medical background', 'Research experience', 'Python programming'],
    timeCommitment: '10-15 hours per week',
    isUrgent: false,
    spotsRemaining: 8,
  },
  {
    id: '4',
    title: 'Clean Water Initiative',
    description:
      'Community project to develop and implement clean water solutions in rural areas. Engineering students and local communities working together.',
    type: 'project',
    university: 'Makerere University',
    creator: 'Dr. James Mukasa',
    participantsCount: 18,
    targetParticipants: 25,
    status: 'ending-soon',
    progress: 72,
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    tags: ['Water', 'Engineering', 'Community', 'Sustainability'],
    requirements: ['Engineering background', 'Field work availability', 'Community engagement'],
    timeCommitment: '5-8 hours per week',
    isUrgent: true,
    spotsRemaining: 7,
  },
  {
    id: '5',
    title: 'Fintech Mentorship Circle',
    description:
      'Connect with fintech professionals working at leading companies. Perfect for students interested in financial technology careers.',
    type: 'mentorship',
    university: 'American University in Cairo',
    creator: 'Khalid El-Rashid',
    participantsCount: 15,
    targetParticipants: 30,
    status: 'active',
    progress: 50,
    endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    tags: ['Fintech', 'Finance', 'Career', 'Technology'],
    requirements: ['Finance/CS background', 'Career focus commitment', 'English proficiency'],
    timeCommitment: '1-2 hours per week',
    isUrgent: false,
    spotsRemaining: 15,
  },
  {
    id: '6',
    title: 'Agricultural Innovation Lab',
    description:
      'Research and development project focusing on sustainable farming techniques and crop optimization for smallholder farmers.',
    type: 'research',
    university: 'University of Nairobi',
    creator: 'Dr. Grace Wanjiku',
    participantsCount: 10,
    targetParticipants: 16,
    status: 'active',
    progress: 63,
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    tags: ['Agriculture', 'Research', 'Sustainability', 'Innovation'],
    requirements: [
      'Agricultural/Environmental science background',
      'Research commitment',
      'Field work availability',
    ],
    timeCommitment: '8-12 hours per week',
    isUrgent: false,
    spotsRemaining: 6,
  },
];

const campaignTypeIcons = {
  mentorship: <Users className="h-4 w-4" />,
  funding: <DollarSign className="h-4 w-4" />,
  research: <BookOpen className="h-4 w-4" />,
  project: <Lightbulb className="h-4 w-4" />,
};

const campaignTypeColors = {
  mentorship: 'bg-blue-100 text-blue-800',
  funding: 'bg-green-100 text-green-800',
  research: 'bg-purple-100 text-purple-800',
  project: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  upcoming: 'bg-yellow-100 text-yellow-800',
  'ending-soon': 'bg-red-100 text-red-800',
};

export function JoinExistingCampaigns({
  isOpen,
  onClose,
  preSelectedUniversity = null,
}: JoinExistingCampaignsProps) {
  const [step, setStep] = useState<'university' | 'campaigns'>('university');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Effect to handle pre-selected university
  useEffect(() => {
    if (preSelectedUniversity && isOpen) {
      // Convert preSelectedUniversity to the full University format
      const fullUniversity: University = {
        id: preSelectedUniversity.id,
        name: preSelectedUniversity.name,
        location: preSelectedUniversity.location,
        country: preSelectedUniversity.country,
        established: preSelectedUniversity.established,
        studentsCount: preSelectedUniversity.studentsCount || 0,
        alumniOnPlatform: preSelectedUniversity.alumniOnPlatform || 0,
        activeCampaigns: preSelectedUniversity.activeCampaigns || 0,
      };
      setSelectedUniversity(fullUniversity);
      setStep('campaigns');
    } else if (!preSelectedUniversity && isOpen) {
      setStep('university');
      setSelectedUniversity(null);
    }
  }, [preSelectedUniversity, isOpen]);

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setStep('campaigns');
  };

  const handleBackToUniversities = () => {
    if (preSelectedUniversity) {
      // If we have a pre-selected university, close the dialog instead of going back
      handleClose();
    } else {
      setStep('university');
      setSelectedUniversity(null);
      setSearchQuery('');
      setTypeFilter('all');
      setStatusFilter('all');
    }
  };

  const handleJoinCampaign = (campaignId: string) => {
    const campaign = mockCampaigns.find((c) => c.id === campaignId);
    if (campaign) {
      toast.success(`Successfully joined "${campaign.title}"!`);
    }
  };

  const handleClose = () => {
    setStep(preSelectedUniversity ? 'campaigns' : 'university');
    if (!preSelectedUniversity) {
      setSelectedUniversity(null);
    }
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    onClose();
  };

  const filteredUniversities = mockUniversities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCampaigns = selectedUniversity
    ? mockCampaigns.filter((campaign) => {
        const matchesUniversity = campaign.university === selectedUniversity.name;
        const matchesSearch =
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesUniversity && matchesSearch && matchesType && matchesStatus;
      })
    : [];

  const formatDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Ended';
    if (diffDays === 1) return '1 day left';
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <span>Join Existing Campaigns</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'university'
              ? 'Select your university to view available campaigns'
              : `Browse and join campaigns at ${selectedUniversity?.name}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'university' && (
          <div className="space-y-6">
            {/* Search Universities */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Universities Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUniversities.map((university) => (
                <Card
                  key={university.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleUniversitySelect(university)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <School className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm">{university.name}</h3>
                            <p className="text-xs text-muted-foreground">{university.location}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Students</p>
                          <p className="font-semibold">
                            {university.studentsCount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Alumni</p>
                          <p className="font-semibold">{university.alumniOnPlatform}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Active Campaigns</span>
                          <Badge variant="secondary" className="text-xs">
                            {university.activeCampaigns} available
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'campaigns' && selectedUniversity && (
          <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={handleBackToUniversities}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {preSelectedUniversity ? 'Close' : 'Back to Universities'}
                </Button>
                <div className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">{selectedUniversity.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUniversity.location}</p>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">{filteredCampaigns.length} campaigns available</Badge>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="funding">Funding</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={campaignTypeColors[campaign.type]}>
                            {campaignTypeIcons[campaign.type]}
                            <span className="ml-1 capitalize">{campaign.type}</span>
                          </Badge>
                          <Badge variant="outline" className={statusColors[campaign.status]}>
                            {campaign.status === 'active' && <Bell className="h-3 w-3 mr-1" />}
                            {campaign.status === 'upcoming' && (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {campaign.status === 'ending-soon' && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {campaign.status.replace('-', ' ')}
                          </Badge>
                          {campaign.isUrgent && (
                            <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {campaign.type === 'funding' ? 'Funding Progress' : 'Participation'}
                          </span>
                          <span className="font-medium">{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {campaign.type === 'funding' ? 'Amount Raised' : 'Participants'}
                          </p>
                          <p className="font-semibold">
                            {campaign.type === 'funding'
                              ? `$${campaign.raisedAmount?.toLocaleString()}`
                              : `${campaign.participantsCount}${campaign.targetParticipants ? ` / ${campaign.targetParticipants}` : ''}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time Commitment</p>
                          <p className="font-semibold">{campaign.timeCommitment}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {campaign.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {campaign.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{campaign.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDaysRemaining(campaign.endDate)}</span>
                            </div>
                            {campaign.spotsRemaining && (
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{campaign.spotsRemaining} spots remaining</span>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleJoinCampaign(campaign.id)}
                            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                          >
                            Join Campaign
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-sm text-gray-600">
                  Try adjusting your filters or check back later for new campaigns.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
