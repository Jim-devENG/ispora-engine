import React, { useState } from 'react';
import {
  School,
  Search,
  Plus,
  Users,
  Target,
  MapPin,
  Calendar,
  ChevronRight,
  CheckCircle,
  Star,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { JoinExistingCampaigns } from './JoinExistingCampaigns';
import { toast } from 'sonner';

interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  type: string;
  established: number;
  studentsCount?: number;
  alumniOnPlatform?: number;
  activeCampaigns?: number;
  logo?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'mentorship' | 'project' | 'funding' | 'research';
  university: string;
  creator: string;
  participantsCount: number;
  goalAmount?: number;
  raisedAmount?: number;
  status: 'active' | 'completed' | 'upcoming';
  endDate: Date;
}

// Mock university data
const mockUniversities: University[] = [
  {
    id: '1',
    name: 'University of Lagos',
    location: 'Lagos',
    country: 'Nigeria',
    type: 'Public Research University',
    established: 1962,
    studentsCount: 42000,
    alumniOnPlatform: 156,
    activeCampaigns: 8,
  },
  {
    id: '2',
    name: 'Makerere University',
    location: 'Kampala',
    country: 'Uganda',
    type: 'Public Research University',
    established: 1922,
    studentsCount: 35000,
    alumniOnPlatform: 89,
    activeCampaigns: 5,
  },
  {
    id: '3',
    name: 'University of Cape Town',
    location: 'Cape Town',
    country: 'South Africa',
    type: 'Public Research University',
    established: 1829,
    studentsCount: 29000,
    alumniOnPlatform: 234,
    activeCampaigns: 12,
  },
  {
    id: '4',
    name: 'American University in Cairo',
    location: 'Cairo',
    country: 'Egypt',
    type: 'Private Liberal Arts University',
    established: 1919,
    studentsCount: 6500,
    alumniOnPlatform: 78,
    activeCampaigns: 4,
  },
  {
    id: '5',
    name: 'University of Nairobi',
    location: 'Nairobi',
    country: 'Kenya',
    type: 'Public Research University',
    established: 1956,
    studentsCount: 84000,
    alumniOnPlatform: 145,
    activeCampaigns: 9,
  },
];

// Mock campaign data
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Engineering Mentorship Circle',
    description:
      'Connect engineering students with diaspora professionals for career guidance and project collaboration.',
    type: 'mentorship',
    university: 'University of Lagos',
    creator: 'Dr. Adaora Okafor',
    participantsCount: 24,
    status: 'active',
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Startup Innovation Lab',
    description:
      'Fund and mentor student entrepreneurs to develop tech solutions for local challenges.',
    type: 'funding',
    university: 'University of Cape Town',
    creator: 'Prof. Sarah Mitchell',
    participantsCount: 15,
    goalAmount: 25000,
    raisedAmount: 18500,
    status: 'active',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Medical Research Collaboration',
    description:
      'Joint research project on tropical diseases with international medical professionals.',
    type: 'research',
    university: 'Makerere University',
    creator: 'Dr. James Mukasa',
    participantsCount: 8,
    status: 'upcoming',
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
];

interface AlmaMaterConnectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlmaMaterConnection({ isOpen, onClose }: AlmaMaterConnectionProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [connectionType, setConnectionType] = useState<string>('');
  const [showJoinExistingCampaigns, setShowJoinExistingCampaigns] = useState(false);

  const filteredUniversities = mockUniversities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.country.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const universityCampaigns = mockCampaigns.filter(
    (campaign) => campaign.university === selectedUniversity?.name,
  );

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setStep(2);
  };

  const handleConnectionTypeSelect = (type: string) => {
    setConnectionType(type);
    if (type === 'join-existing') {
      setShowJoinExistingCampaigns(true);
    } else {
      // Handle other connection types
      handleConnect(type);
    }
  };

  const handleConnect = (type: string) => {
    if (!selectedUniversity) return;

    switch (type) {
      case 'link-alumni':
        toast.success(`Successfully linked to ${selectedUniversity.name} as alumni!`);
        break;
      case 'nominate':
        toast.success(`${selectedUniversity.name} has been nominated for partnership!`);
        break;
      default:
        break;
    }
    onClose();
    setStep(1);
  };

  const resetDialog = () => {
    setStep(1);
    setSelectedUniversity(null);
    setConnectionType('');
    setSearchQuery('');
    setShowJoinExistingCampaigns(false);
  };

  const handleClose = () => {
    onClose();
    resetDialog();
  };

  const handleJoinExistingCampaignsClose = () => {
    setShowJoinExistingCampaigns(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <School className="h-5 w-5 text-purple-600" />
              <span>Connect to Your Alma Mater</span>
            </DialogTitle>
            <DialogDescription>
              {step === 1 && 'Search and connect to your university to start making an impact'}
              {step === 2 && `Connect with ${selectedUniversity?.name}`}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: University Search */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="university-search">Search for your university</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="university-search"
                    placeholder="Enter university name, location, or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university) => (
                    <Card
                      key={university.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleUniversitySelect(university)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{university.name}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {university.type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {university.location}, {university.country}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Est. {university.established}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{university.studentsCount?.toLocaleString()} students</span>
                              <span>{university.alumniOnPlatform} alumni on Aspora</span>
                              <span>{university.activeCampaigns} active campaigns</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No universities found</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Can't find your university? You can add it manually.
                    </p>
                    <Button variant="outline" onClick={() => setStep(4)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add My University
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Connection Options */}
          {step === 2 && selectedUniversity && (
            <div className="space-y-6">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <School className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedUniversity.name}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedUniversity.location}, {selectedUniversity.country}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{selectedUniversity.alumniOnPlatform} alumni on platform</span>
                        <span>{selectedUniversity.activeCampaigns} active campaigns</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                  onClick={() => handleConnectionTypeSelect('link-alumni')}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Link as Alumni</h3>
                      <p className="text-sm text-gray-600">
                        Connect your profile to your alma mater and join the alumni network
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-200"
                  onClick={() => handleConnectionTypeSelect('join-existing')}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold">Join Existing Campaigns</h3>
                      <p className="text-sm text-gray-600">
                        Participate in ongoing alumni initiatives and projects
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                  onClick={() => handleConnectionTypeSelect('nominate')}
                >
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Star className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Nominate for Partnership</h3>
                      <p className="text-sm text-gray-600">
                        Recommend your university for official Aspora partnership
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Existing Campaigns Preview */}
              {universityCampaigns.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-600" />
                    <span>Active Campaigns</span>
                  </h4>
                  <div className="space-y-3">
                    {universityCampaigns.slice(0, 2).map((campaign) => (
                      <Card key={campaign.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h5 className="font-medium text-sm">{campaign.title}</h5>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {campaign.description}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span>{campaign.participantsCount} participants</span>
                                <Badge variant="outline" className="text-xs">
                                  {campaign.type}
                                </Badge>
                              </div>
                            </div>
                            {campaign.goalAmount && (
                              <div className="text-right text-xs">
                                <div className="font-medium text-green-600">
                                  ${campaign.raisedAmount?.toLocaleString()}
                                </div>
                                <div className="text-gray-500">
                                  of ${campaign.goalAmount.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Search
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Add University Manually */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Add Your University</h3>
                <p className="text-sm text-gray-600">
                  Help us expand our database by adding your alma mater
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="uni-name">University Name *</Label>
                  <Input id="uni-name" placeholder="e.g., University of Ghana" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uni-location">Location *</Label>
                  <Input id="uni-location" placeholder="e.g., Accra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uni-country">Country *</Label>
                  <Input id="uni-country" placeholder="e.g., Ghana" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uni-type">Type</Label>
                  <Input id="uni-type" placeholder="e.g., Public Research University" />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Search
                </Button>
                <Button
                  onClick={() => {
                    toast.success('University added successfully!');
                    handleClose();
                  }}
                >
                  Add University
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Existing Campaigns Dialog */}
      <JoinExistingCampaigns
        isOpen={showJoinExistingCampaigns}
        onClose={handleJoinExistingCampaignsClose}
        preSelectedUniversity={selectedUniversity}
      />
    </>
  );
}
