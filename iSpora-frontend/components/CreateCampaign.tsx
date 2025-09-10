import React, { useState } from "react";
import {
  ArrowLeft,
  Users,
  Target,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  BookOpen,
  Briefcase,
  GraduationCap,
  Plus,
  X,
  Upload,
  Eye,
  Save,
  Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigation } from "./NavigationContext";
import { toast } from "sonner";

interface CampaignFormData {
  title: string;
  description: string;
  type: 'mentorship' | 'project' | 'scholarship' | 'research' | '';
  almaMater: string;
  category: string;
  participantGoal: number;
  fundingGoal: number;
  endDate: string;
  location: string;
  isRemote: boolean;
  mentorshipFocus: string;
  skillsRequired: string[];
  timeCommitment: string;
  tags: string[];
  requirements: string;
  benefits: string;
  resources: string;
}

const initialFormData: CampaignFormData = {
  title: '',
  description: '',
  type: '',
  almaMater: '',
  category: '',
  participantGoal: 50,
  fundingGoal: 10000,
  endDate: '',
  location: '',
  isRemote: true,
  mentorshipFocus: '',
  skillsRequired: [],
  timeCommitment: '',
  tags: [],
  requirements: '',
  benefits: '',
  resources: ''
};

export function CreateCampaign() {
  const { setCurrentPage } = useNavigation();
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
  const [currentTag, setCurrentTag] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skillsRequired.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSaveDraft = () => {
    toast.success("Campaign saved as draft");
    setCurrentPage('Mentorship Workspace');
  };

  const handlePublish = () => {
    toast.success("Campaign published successfully!");
    setCurrentPage('Mentorship Workspace');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mentorship': return <Users className="h-5 w-5" />;
      case 'project': return <Briefcase className="h-5 w-5" />;
      case 'scholarship': return <GraduationCap className="h-5 w-5" />;
      case 'research': return <BookOpen className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  if (isPreview) {
    return (
      <div className="h-full bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Preview Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsPreview(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Editor
              </Button>
              <h1 className="text-2xl font-semibold">Campaign Preview</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handlePublish} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Send className="h-4 w-4 mr-2" />
                Publish Campaign
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#021ff6]/10 rounded-lg">
                    {getTypeIcon(formData.type)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{formData.title || 'Campaign Title'}</CardTitle>
                    <p className="text-gray-600">{formData.almaMater || 'Alma Mater'}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {formData.type || 'Type'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700">{formData.description || 'Campaign description will appear here...'}</p>
                
                {formData.mentorshipFocus && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Mentorship Focus</h4>
                    <p className="text-blue-800">{formData.mentorshipFocus}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Campaign Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Participants:</span>
                        <span>{formData.participantGoal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Commitment:</span>
                        <span>{formData.timeCommitment || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{formData.isRemote ? 'Remote' : formData.location || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {formData.skillsRequired.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Skills Required</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.skillsRequired.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {formData.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('Mentorship Workspace')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Button>
            <h1 className="text-2xl font-semibold">Create Mentorship Campaign</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Campaign Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., CS Mentorship Program - Stanford Alumni"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Campaign Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mentorship">Mentorship Program</SelectItem>
                          <SelectItem value="project">Project Collaboration</SelectItem>
                          <SelectItem value="research">Research Initiative</SelectItem>
                          <SelectItem value="scholarship">Scholarship Fund</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="almaMater">Alma Mater *</Label>
                      <Input
                        id="almaMater"
                        value={formData.almaMater}
                        onChange={(e) => handleInputChange('almaMater', e.target.value)}
                        placeholder="e.g., Stanford University"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="e.g., Career Development, Technical Skills"
                      />
                    </div>

                    <div>
                      <Label htmlFor="participantGoal">Target Participants</Label>
                      <Input
                        id="participantGoal"
                        type="number"
                        value={formData.participantGoal}
                        onChange={(e) => handleInputChange('participantGoal', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your campaign, its goals, and what participants can expect..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mentorshipFocus">Mentorship Focus</Label>
                      <Input
                        id="mentorshipFocus"
                        value={formData.mentorshipFocus}
                        onChange={(e) => handleInputChange('mentorshipFocus', e.target.value)}
                        placeholder="e.g., Technical Career Development"
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeCommitment">Time Commitment</Label>
                      <Select value={formData.timeCommitment} onValueChange={(value) => handleInputChange('timeCommitment', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time commitment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2 hours/week">1-2 hours/week</SelectItem>
                          <SelectItem value="2-3 hours/week">2-3 hours/week</SelectItem>
                          <SelectItem value="3-5 hours/week">3-5 hours/week</SelectItem>
                          <SelectItem value="5-8 hours/week">5-8 hours/week</SelectItem>
                          <SelectItem value="8+ hours/week">8+ hours/week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isRemote"
                        checked={formData.isRemote}
                        onCheckedChange={(checked) => handleInputChange('isRemote', checked)}
                      />
                      <Label htmlFor="isRemote">Remote participation allowed</Label>
                    </div>

                    {!formData.isRemote && (
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Skills Required</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.skillsRequired.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="requirements">Requirements & Eligibility</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="What are the requirements for participants? (e.g., current student status, GPA, specific skills, etc.)"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits & Outcomes</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    placeholder="What will participants gain from this campaign? (e.g., career guidance, networking, certificates, etc.)"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6 mt-6">
                <div>
                  <Label htmlFor="resources">Resources & Materials</Label>
                  <Textarea
                    id="resources"
                    value={formData.resources}
                    onChange={(e) => handleInputChange('resources', e.target.value)}
                    placeholder="What resources will be provided? (e.g., study materials, project templates, access to platforms, etc.)"
                    rows={4}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium mb-2">Upload Campaign Assets</h3>
                  <p className="text-gray-600 mb-4">Add images, documents, or other files to support your campaign</p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setCurrentPage('Mentorship Workspace')}>
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => setIsPreview(true)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview & Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
