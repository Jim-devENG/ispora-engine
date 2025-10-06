import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { useProfile } from './ProfileContext';
import { DashboardHeader } from './DashboardHeader';
import {
  User,
  Camera,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  Globe,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Award,
  GraduationCap,
  Building,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Languages,
  Clock,
  Monitor,
  Sun,
  Moon,
  Linkedin,
  Twitter,
  ExternalLink,
  Star,
  Target,
  Users,
  Users2,
  Heart,
  Video,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Code,
  Palette,
} from 'lucide-react';

// Helper components
function SkillBadge({
  skill,
  onRemove,
  isEditing,
}: {
  skill: string;
  onRemove?: () => void;
  isEditing?: boolean;
}) {
  const skillIcons: Record<string, any> = {
    JavaScript: Code,
    React: Code,
    'Node.js': Code,
    Python: Code,
    AWS: Code,
    Leadership: Users,
    Design: Palette,
    Strategy: Target,
    Mentorship: Users,
    Communication: Users,
  };

  const Icon = skillIcons[skill] || Code;

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {skill}
      {isEditing && onRemove && (
        <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}

function OpenToTag({
  tag,
  onRemove,
  isEditing,
}: {
  tag: string;
  onRemove?: () => void;
  isEditing?: boolean;
}) {
  const tagConfig: Record<string, { color: string; icon: any }> = {
    Mentorship: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users },
    Collaboration: { color: 'bg-green-50 text-green-700 border-green-200', icon: Users2 },
    Consulting: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Briefcase },
    Speaking: { color: 'bg-pink-50 text-pink-700 border-pink-200', icon: Video },
    Volunteering: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Heart },
    Advising: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Lightbulb },
  };

  const config = tagConfig[tag] || {
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: Target,
  };
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {tag}
      {isEditing && onRemove && (
        <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </Badge>
  );
}

export function ProfilePage() {
  const { profile, updateProfile, isEditing, setIsEditing, saveProfile, resetProfile } =
    useProfile();
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newOpenTo, setNewOpenTo] = useState('');
  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = async () => {
    try {
      await saveProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    resetProfile();
    toast.info('Changes cancelled');
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      updateProfile({
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateProfile({
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      updateProfile({
        expertise: [...profile.expertise, newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    updateProfile({
      expertise: profile.expertise.filter((exp) => exp !== expertiseToRemove),
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      updateProfile({
        interests: [...profile.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    updateProfile({
      interests: profile.interests.filter((interest) => interest !== interestToRemove),
    });
  };

  const addOpenTo = () => {
    if (newOpenTo.trim() && !profile.openTo.includes(newOpenTo.trim())) {
      updateProfile({
        openTo: [...profile.openTo, newOpenTo.trim()],
      });
      setNewOpenTo('');
    }
  };

  const removeOpenTo = (openToRemove: string) => {
    updateProfile({
      openTo: profile.openTo.filter((item) => item !== openToRemove),
    });
  };

  const updateAvailability = (key: keyof typeof profile.availability, value: boolean) => {
    updateProfile({
      availability: {
        ...profile.availability,
        [key]: value,
      },
    });
  };

  const updatePrivacy = (key: keyof typeof profile.privacy, value: string) => {
    updateProfile({
      privacy: {
        ...profile.privacy,
        [key]: value,
      },
    });
  };

  const updatePreferences = (key: keyof typeof profile.preferences, value: string) => {
    updateProfile({
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <DashboardHeader userName={profile.firstName} userTitle="Manage your profile information" />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and public profile information
                </p>
              </div>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Profile Picture Section */}
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                      <CardDescription>
                        This will be displayed on your profile and in discussions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={profile.avatar} alt={profile.name} />
                            <AvatarFallback className="bg-[#021ff6] text-white text-xl">
                              {profile.firstName[0]}
                              {profile.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <Button
                              size="sm"
                              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                              onClick={() => toast.info('Photo upload feature coming soon!')}
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {isEditing && (
                          <div className="text-center space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info('Photo upload feature coming soon!')}
                            >
                              Upload New Photo
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG or GIF. Max size 2MB.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Your name and contact details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profile.firstName}
                            onChange={(e) => updateProfile({ firstName: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profile.lastName}
                            onChange={(e) => updateProfile({ lastName: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => updateProfile({ email: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => updateProfile({ phone: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            value={profile.location}
                            onChange={(e) => updateProfile({ location: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          disabled={!isEditing}
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills and Interests */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                      <CardDescription>Your technical and professional skills</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <SkillBadge
                            key={index}
                            skill={skill}
                            onRemove={() => removeSkill(skill)}
                            isEditing={isEditing}
                          />
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill..."
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <Button size="sm" onClick={addSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Interests</CardTitle>
                      <CardDescription>Your personal and professional interests</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {interest}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => removeInterest(interest)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Add an interest..."
                            onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                          />
                          <Button size="sm" onClick={addInterest}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Professional Information Tab */}
              <TabsContent value="professional" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Information</CardTitle>
                      <CardDescription>Your work experience and professional links</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="company"
                              value={profile.company}
                              onChange={(e) => updateProfile({ company: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="position"
                              value={profile.position}
                              onChange={(e) => updateProfile({ position: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={profile.experience}
                            onChange={(e) =>
                              updateProfile({ experience: parseInt(e.target.value) || 0 })
                            }
                            disabled={!isEditing}
                            min="0"
                            max="50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role Type</Label>
                          <Select
                            value={profile.role}
                            onValueChange={(value) => updateProfile({ role: value as any })}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="mentor">Mentor</SelectItem>
                              <SelectItem value="alumni">Alumni</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="website">Personal Website</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="website"
                              value={profile.website}
                              onChange={(e) => updateProfile({ website: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                          <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="linkedIn"
                              value={profile.linkedIn}
                              onChange={(e) => updateProfile({ linkedIn: e.target.value })}
                              disabled={!isEditing}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Profile</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="twitter"
                            value={profile.twitter || ''}
                            onChange={(e) => updateProfile({ twitter: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>Your educational background</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="university">University</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="university"
                            value={profile.university}
                            onChange={(e) => updateProfile({ university: e.target.value })}
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="program">Program</Label>
                          <Input
                            id="program"
                            value={profile.program}
                            onChange={(e) => updateProfile({ program: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g., BS Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            value={profile.graduationYear}
                            onChange={(e) => updateProfile({ graduationYear: e.target.value })}
                            disabled={!isEditing}
                            placeholder="e.g., 2018"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Expertise Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Areas of Expertise</CardTitle>
                    <CardDescription>
                      Your specialized knowledge and experience areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((exp, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                        >
                          <Award className="h-3 w-3" />
                          {exp}
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => removeExpertise(exp)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          placeholder="Add an expertise area..."
                          onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                        />
                        <Button size="sm" onClick={addExpertise}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Connected Universities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Universities</CardTitle>
                    <CardDescription>
                      Universities you're connected with through Aspora
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.universities.map((uni, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{uni.name}</p>
                              <p className="text-sm text-muted-foreground">{uni.role}</p>
                            </div>
                          </div>
                          <Badge variant={uni.isVerified ? 'default' : 'secondary'}>
                            {uni.isVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability & Open To</CardTitle>
                    <CardDescription>
                      Let others know what you're available for and open to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Available for Mentoring</p>
                          <p className="text-sm text-muted-foreground">
                            Help guide others in their career journey
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.mentoring}
                          onCheckedChange={(checked) => updateAvailability('mentoring', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Open to Collaboration</p>
                          <p className="text-sm text-muted-foreground">
                            Work together on projects and initiatives
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.collaboration}
                          onCheckedChange={(checked) =>
                            updateAvailability('collaboration', checked)
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Available for Consultation</p>
                          <p className="text-sm text-muted-foreground">
                            Provide professional advice and guidance
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.consultation}
                          onCheckedChange={(checked) => updateAvailability('consultation', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Open to Volunteering</p>
                          <p className="text-sm text-muted-foreground">
                            Contribute to community initiatives
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.volunteering || false}
                          onCheckedChange={(checked) => updateAvailability('volunteering', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Available for Speaking</p>
                          <p className="text-sm text-muted-foreground">
                            Speak at events and conferences
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.speaking || false}
                          onCheckedChange={(checked) => updateAvailability('speaking', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Open to Advising</p>
                          <p className="text-sm text-muted-foreground">
                            Provide strategic advice to organizations
                          </p>
                        </div>
                        <Switch
                          checked={profile.availability.advising || false}
                          onCheckedChange={(checked) => updateAvailability('advising', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>"Open To" Tags</CardTitle>
                    <CardDescription>
                      These tags will be displayed on your profile to show what you're open to
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.openTo.map((tag, index) => (
                        <OpenToTag
                          key={index}
                          tag={tag}
                          onRemove={() => removeOpenTo(tag)}
                          isEditing={isEditing}
                        />
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Select value={newOpenTo} onValueChange={setNewOpenTo}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select what you're open to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              'Mentorship',
                              'Collaboration',
                              'Consulting',
                              'Speaking',
                              'Volunteering',
                              'Advising',
                            ].map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                disabled={profile.openTo.includes(option)}
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={addOpenTo} disabled={!newOpenTo}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements & Awards</CardTitle>
                    <CardDescription>Showcase your accomplishments and recognition</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Visibility</CardTitle>
                    <CardDescription>
                      Control who can see your profile and contact you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">
                            Who can see your public profile
                          </p>
                        </div>
                        <Select
                          value={profile.privacy.profileVisibility}
                          onValueChange={(value) => updatePrivacy('profileVisibility', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="alumni">Alumni Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Contact Information</p>
                          <p className="text-sm text-muted-foreground">
                            Who can see your email and phone
                          </p>
                        </div>
                        <Select
                          value={profile.privacy.contactVisibility}
                          onValueChange={(value) => updatePrivacy('contactVisibility', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="alumni">Alumni Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Professional Info</p>
                          <p className="text-sm text-muted-foreground">Show your work experience</p>
                        </div>
                        <Select
                          value={profile.privacy.professionalVisibility}
                          onValueChange={(value) => updatePrivacy('professionalVisibility', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="alumni">Alumni Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Preferences</CardTitle>
                    <CardDescription>Customize your account experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Language</p>
                          <p className="text-sm text-muted-foreground">
                            Select your preferred language
                          </p>
                        </div>
                        <Select
                          value={profile.preferences.language}
                          onValueChange={(value) => updatePreferences('language', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Time Zone</p>
                          <p className="text-sm text-muted-foreground">Your local time zone</p>
                        </div>
                        <Select
                          value={profile.preferences.timezone}
                          onValueChange={(value) => updatePreferences('timezone', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PST (GMT-8)">PST (GMT-8)</SelectItem>
                            <SelectItem value="EST (GMT-5)">EST (GMT-5)</SelectItem>
                            <SelectItem value="GMT (GMT+0)">GMT (GMT+0)</SelectItem>
                            <SelectItem value="CET (GMT+1)">CET (GMT+1)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Theme</p>
                          <p className="text-sm text-muted-foreground">
                            Choose your interface theme
                          </p>
                        </div>
                        <Select
                          value={profile.preferences.theme}
                          onValueChange={(value) => updatePreferences('theme', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
