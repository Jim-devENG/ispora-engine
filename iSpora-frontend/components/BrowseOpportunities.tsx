import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  BookOpen,
  Users,
  Globe,
  Filter,
  ExternalLink,
  Bookmark,
  Send,
  Calendar,
  Award,
  Building,
  Zap,
  Target,
  Star,
  Plus,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';

interface BrowseOpportunitiesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'volunteer' | 'collaboration' | 'internship' | 'mentorship';
  company: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  duration?: string;
  commitment: string;
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
  postedDate: string;
  featured: boolean;
  urgent: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'any';
  category: string;
}

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Senior Software Engineer - AI/ML',
    type: 'job',
    company: 'Google',
    location: 'San Francisco, USA',
    remote: true,
    description:
      "Join Google's AI team to develop cutting-edge machine learning solutions for healthcare applications in emerging markets.",
    requirements: [
      '5+ years of software engineering experience',
      'Strong background in Python, TensorFlow, or PyTorch',
      'Experience with distributed systems',
      'PhD in Computer Science or related field preferred',
    ],
    benefits: [
      'Competitive salary + equity',
      'Health insurance',
      'Relocation assistance',
      'Professional development budget',
    ],
    salary: {
      min: 150000,
      max: 250000,
      currency: 'USD',
    },
    commitment: 'Full-time',
    postedBy: {
      name: 'Dr. Sarah Chen',
      title: 'Senior Engineering Manager',
      company: 'Google',
      isVerified: true,
    },
    tags: ['Machine Learning', 'Python', 'Healthcare', 'AI'],
    applicants: 127,
    deadline: '2024-02-15',
    postedDate: '2024-01-10',
    featured: true,
    urgent: false,
    experienceLevel: 'senior',
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Medical Research Volunteer - Tropical Diseases',
    type: 'volunteer',
    company: 'Johns Hopkins University',
    location: 'Baltimore, USA',
    remote: false,
    description:
      'Contribute to groundbreaking research on tropical diseases affecting African populations. Perfect for medical students and early-career professionals.',
    requirements: [
      'Medical or public health background',
      'Passion for global health',
      'Available for 6-month commitment',
      'Basic research experience preferred',
    ],
    benefits: [
      'Research publication opportunities',
      'Mentorship from leading experts',
      'Professional networking',
      'Certificate of participation',
    ],
    duration: '6 months',
    commitment: 'Part-time (20 hours/week)',
    postedBy: {
      name: 'Prof. James Okafor',
      title: 'Professor of Medicine',
      company: 'Johns Hopkins University',
      isVerified: true,
    },
    university: 'University of Lagos',
    tags: ['Medical Research', 'Global Health', 'Tropical Diseases', 'Volunteer'],
    applicants: 34,
    deadline: '2024-01-30',
    postedDate: '2024-01-05',
    featured: false,
    urgent: true,
    experienceLevel: 'entry',
    category: 'Healthcare',
  },
  {
    id: '3',
    title: 'African Startup Investment Analyst',
    type: 'job',
    company: 'Goldman Sachs',
    location: 'London, UK',
    remote: false,
    description:
      'Analyze and evaluate investment opportunities in African startups and emerging markets. Focus on fintech and agtech sectors.',
    requirements: [
      'MBA or equivalent finance qualification',
      '3+ years in investment banking or private equity',
      'Knowledge of African markets',
      'Financial modeling expertise',
    ],
    benefits: [
      'Competitive base + bonus',
      'International exposure',
      'Professional growth opportunities',
      'Networking with industry leaders',
    ],
    salary: {
      min: 80000,
      max: 120000,
      currency: 'GBP',
    },
    commitment: 'Full-time',
    postedBy: {
      name: 'Amina Hassan',
      title: 'Investment Banking VP',
      company: 'Goldman Sachs',
      isVerified: true,
    },
    tags: ['Investment', 'Finance', 'African Markets', 'Startups'],
    applicants: 89,
    deadline: '2024-02-28',
    postedDate: '2024-01-08',
    featured: true,
    urgent: false,
    experienceLevel: 'mid',
    category: 'Finance',
  },
  {
    id: '4',
    title: 'Agricultural Innovation Collaboration',
    type: 'collaboration',
    company: 'FAO',
    location: 'Nairobi, Kenya',
    remote: true,
    description:
      'Collaborate on developing sustainable agricultural technologies for smallholder farmers across East Africa. Seeking partners from academia and industry.',
    requirements: [
      'Background in agriculture or engineering',
      'Experience with innovation projects',
      'Understanding of African agricultural challenges',
      'Available for 12-month project',
    ],
    benefits: [
      'Publication opportunities',
      'International conference presentations',
      'Networking with FAO experts',
      'Impact measurement certification',
    ],
    duration: '12 months',
    commitment: 'Flexible (10-15 hours/week)',
    postedBy: {
      name: 'David Mwangi',
      title: 'Agricultural Engineer',
      company: 'FAO',
      isVerified: false,
    },
    university: 'University of Nairobi',
    tags: ['Agriculture', 'Innovation', 'Sustainability', 'Collaboration'],
    applicants: 23,
    deadline: '2024-02-10',
    postedDate: '2024-01-12',
    featured: false,
    urgent: false,
    experienceLevel: 'any',
    category: 'Agriculture',
  },
  {
    id: '5',
    title: 'Fintech Product Manager Internship',
    type: 'internship',
    company: 'Flutterwave',
    location: 'Lagos, Nigeria',
    remote: false,
    description:
      '6-month internship program focused on product management in African fintech. Gain hands-on experience in payment solutions and financial inclusion.',
    requirements: [
      'Final year student or recent graduate',
      'Interest in fintech and payments',
      'Strong analytical skills',
      'Previous internship experience preferred',
    ],
    benefits: [
      'Monthly stipend',
      'Mentorship program',
      'Full-time offer potential',
      'Industry networking events',
    ],
    duration: '6 months',
    commitment: 'Full-time',
    postedBy: {
      name: 'Kemi Adebayo',
      title: 'Head of Product',
      company: 'Flutterwave',
      isVerified: true,
    },
    university: 'University of Lagos',
    tags: ['Fintech', 'Product Management', 'Internship', 'Payments'],
    applicants: 156,
    deadline: '2024-01-25',
    postedDate: '2024-01-01',
    featured: false,
    urgent: true,
    experienceLevel: 'entry',
    category: 'Technology',
  },
];

const opportunityTypes = [
  'All Types',
  'Jobs',
  'Volunteer',
  'Collaboration',
  'Internship',
  'Mentorship',
];
const locations = [
  'All Locations',
  'Remote',
  'USA',
  'UK',
  'Nigeria',
  'Kenya',
  'South Africa',
  'Ghana',
];
const categories = [
  'All Categories',
  'Technology',
  'Healthcare',
  'Finance',
  'Agriculture',
  'Education',
  'Engineering',
];
const experienceLevels = ['All Levels', 'Entry Level', 'Mid Level', 'Senior Level'];

export function BrowseOpportunities({ isOpen, onClose }: BrowseOpportunitiesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [showRemoteOnly, setShowRemoteOnly] = useState(false);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  const filteredOpportunities = mockOpportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedType === 'All Types' ||
      (selectedType === 'Jobs' && opp.type === 'job') ||
      (selectedType === 'Volunteer' && opp.type === 'volunteer') ||
      (selectedType === 'Collaboration' && opp.type === 'collaboration') ||
      (selectedType === 'Internship' && opp.type === 'internship') ||
      (selectedType === 'Mentorship' && opp.type === 'mentorship');

    const matchesLocation =
      selectedLocation === 'All Locations' ||
      (selectedLocation === 'Remote' && opp.remote) ||
      opp.location.includes(selectedLocation);

    const matchesCategory =
      selectedCategory === 'All Categories' || opp.category === selectedCategory;

    const matchesLevel =
      selectedLevel === 'All Levels' ||
      (selectedLevel === 'Entry Level' && opp.experienceLevel === 'entry') ||
      (selectedLevel === 'Mid Level' && opp.experienceLevel === 'mid') ||
      (selectedLevel === 'Senior Level' && opp.experienceLevel === 'senior');

    const matchesRemote = !showRemoteOnly || opp.remote;

    return (
      matchesSearch &&
      matchesType &&
      matchesLocation &&
      matchesCategory &&
      matchesLevel &&
      matchesRemote
    );
  });

  const handleSaveOpportunity = (oppId: string) => {
    if (savedOpportunities.includes(oppId)) {
      setSavedOpportunities((prev) => prev.filter((id) => id !== oppId));
      toast.success('Opportunity removed from saved list');
    } else {
      setSavedOpportunities((prev) => [...prev, oppId]);
      toast.success('Opportunity saved!');
    }
  };

  const handleApply = (oppId: string) => {
    const opp = mockOpportunities.find((o) => o.id === oppId);
    if (opp) {
      toast.success(`Application submitted for ${opp.title}!`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'volunteer':
        return <Heart className="h-4 w-4" />;
      case 'collaboration':
        return <Users className="h-4 w-4" />;
      case 'internship':
        return <BookOpen className="h-4 w-4" />;
      case 'mentorship':
        return <Award className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800';
      case 'volunteer':
        return 'bg-red-100 text-red-800';
      case 'collaboration':
        return 'bg-purple-100 text-purple-800';
      case 'internship':
        return 'bg-green-100 text-green-800';
      case 'mentorship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSalary = (salary: Opportunity['salary']) => {
    if (!salary) return null;
    const min = (salary.min / 1000).toFixed(0);
    const max = (salary.max / 1000).toFixed(0);
    return `${salary.currency} ${min}k - ${max}k`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-orange-600" />
            <span>Browse Opportunities</span>
          </DialogTitle>
          <DialogDescription>
            Discover jobs, volunteer opportunities, collaborations, and more from your alumni
            network
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedOpportunities.length})</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Post Opportunity
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={showRemoteOnly ? 'default' : 'outline'}
                  onClick={() => setShowRemoteOnly(!showRemoteOnly)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Remote Only
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredOpportunities.length} opportunities found
                </p>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="applicants">Applicants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(opportunity.type)}>
                              {getTypeIcon(opportunity.type)}
                              <span className="ml-1 capitalize">{opportunity.type}</span>
                            </Badge>
                            {opportunity.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {opportunity.urgent && (
                              <Badge className="bg-red-100 text-red-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                            {opportunity.remote && (
                              <Badge variant="outline">
                                <Globe className="h-3 w-3 mr-1" />
                                Remote
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                            {opportunity.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Building className="h-4 w-4" />
                              <span>{opportunity.company}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{opportunity.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{opportunity.commitment}</span>
                            </div>
                            {opportunity.salary && (
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatSalary(opportunity.salary)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveOpportunity(opportunity.id)}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? 'fill-current text-blue-600' : ''}`}
                            />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {opportunity.description}
                      </p>

                      {/* Posted By */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={opportunity.postedBy.avatar} />
                          <AvatarFallback>
                            {opportunity.postedBy.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{opportunity.postedBy.name}</span>
                            {opportunity.postedBy.isVerified && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opportunity.postedBy.title} at {opportunity.postedBy.company}
                          </p>
                        </div>
                        {opportunity.university && (
                          <Badge variant="outline" className="text-xs">
                            {opportunity.university}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {opportunity.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Separator />

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{opportunity.applicants} applicants</span>
                          </div>
                          {opportunity.deadline && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <span>
                            Posted {new Date(opportunity.postedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApply(opportunity.id)}
                            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Featured Opportunities</h3>
              <p className="text-sm text-gray-600">
                High-priority opportunities recommended by your alumni network
              </p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Saved Opportunities</h3>
              <p className="text-sm text-gray-600">
                You have {savedOpportunities.length} saved opportunities
              </p>
            </div>
          </TabsContent>

          <TabsContent value="my-posts" className="space-y-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Posted Opportunities</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage opportunities you've posted for the community
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post New Opportunity
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
