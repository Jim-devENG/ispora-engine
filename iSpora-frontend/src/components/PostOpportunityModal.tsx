import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Link, 
  Tag, 
  CheckCircle,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Globe
} from 'lucide-react';

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const opportunityTypes = [
  { id: 'job', label: '💼 Job', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { id: 'scholarship', label: '🎓 Scholarship', icon: GraduationCap, color: 'bg-green-100 text-green-700' },
  { id: 'internship', label: '🔬 Internship', icon: Building, color: 'bg-purple-100 text-purple-700' },
  { id: 'grant', label: '💰 Grant', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'award', label: '🏆 Award', icon: Award, color: 'bg-red-100 text-red-700' },
  { id: 'program', label: '🌍 Program', icon: Globe, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'event', label: '📅 Event', icon: Calendar, color: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: '🔗 Other', icon: Users, color: 'bg-gray-100 text-gray-700' },
];

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Essential details' },
  { id: 'details', title: 'Details', description: 'Requirements & benefits' },
  { id: 'optional', title: 'Optional', description: 'Additional information' },
  { id: 'review', title: 'Review', description: 'Final check' },
];

export function PostOpportunityModal({ isOpen, onClose, onSubmit }: PostOpportunityModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    benefits: '',
    applicationLink: '',
    deadline: '',
    amount: '',
    tags: '',
    remote: false,
  });

  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, tags: tags.join(', ') });
    onClose();
    // Reset form
    setCurrentStep(0);
    setFormData({
      title: '',
      type: '',
      company: '',
      location: '',
      description: '',
      requirements: '',
      benefits: '',
      applicationLink: '',
      deadline: '',
      amount: '',
      tags: '',
      remote: false,
    });
    setTags([]);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.type && formData.company && formData.description;
      case 1:
        return true; // Optional step
      case 2:
        return true; // Optional step
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Opportunity Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer at Google"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Category *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                {opportunityTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company" className="text-sm font-medium">Organization *</Label>
                <Input
                  id="company"
                  placeholder="e.g., Google, Oxford University"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this opportunity is about..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="requirements" className="text-sm font-medium">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List key requirements (one per line)"
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="benefits" className="text-sm font-medium">Benefits & What's Included</Label>
              <Textarea
                id="benefits"
                placeholder="What benefits does this opportunity provide?"
                rows={3}
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={formData.remote}
                onCheckedChange={(checked) => setFormData({ ...formData, remote: !!checked })}
              />
              <Label htmlFor="remote" className="text-sm">This is a remote opportunity</Label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline" className="text-sm font-medium">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-sm font-medium">Compensation/Award</Label>
                <Input
                  id="amount"
                  placeholder="e.g., $50,000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="applicationLink" className="text-sm font-medium">Application Link</Label>
              <Input
                id="applicationLink"
                placeholder="https://..."
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{formData.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={opportunityTypes.find(t => t.id === formData.type)?.color}>
                    {opportunityTypes.find(t => t.id === formData.type)?.label}
                  </Badge>
                  {formData.remote && <Badge variant="outline">Remote</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{formData.company}</span>
                </div>
                {formData.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location}</span>
                  </div>
                )}
                {formData.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(formData.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                {formData.amount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formData.amount}</span>
                  </div>
                )}
                <p className="text-sm text-gray-700">{formData.description}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Share an Opportunity</DialogTitle>
          <DialogDescription>
            Help others in the diaspora community discover amazing opportunities
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{steps[currentStep].title}</span>
          </div>
          <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
        </div>

        {/* Step Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation - Fixed at bottom */}
        <div className="flex justify-between pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={currentStep === 0 ? onClose : handlePrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Submit for Review
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
