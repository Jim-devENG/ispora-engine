import React, { useState, useEffect } from 'react';
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
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Phone, 
  Globe, 
  Lock, 
  Unlock,
  CheckCircle,
  Tag,
  List,
  Settings
} from 'lucide-react';

interface ModernSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: any) => void;
  editingSession?: any;
  mentee: any;
}

const sessionTypes = [
  { id: 'video', label: '📹 Video Call', icon: Video, color: 'bg-blue-100 text-blue-700' },
  { id: 'phone', label: '📞 Phone Call', icon: Phone, color: 'bg-green-100 text-green-700' },
  { id: 'in-person', label: '🏢 In-Person', icon: MapPin, color: 'bg-purple-100 text-purple-700' },
  { id: 'hybrid', label: '🔄 Hybrid', icon: Globe, color: 'bg-orange-100 text-orange-700' },
];

const visibilityOptions = [
  { id: 'private', label: '🔒 Project Members Only', icon: Lock, description: 'Only visible to project team members' },
  { id: 'public', label: '🌍 Public Session', icon: Unlock, description: 'Visible to the entire iSpora community' },
];

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Session details' },
  { id: 'schedule', title: 'Schedule', description: 'Date and time' },
  { id: 'settings', title: 'Settings', description: 'Visibility and options' },
  { id: 'review', title: 'Review', description: 'Final check' },
];

export function ModernSessionModal({ isOpen, onClose, onSubmit, editingSession, mentee }: ModernSessionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    visibility: 'private',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    location: '',
    maxParticipants: 50,
    tags: '',
    agenda: '',
  });

  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [agendaItems, setAgendaItems] = useState<string[]>([]);

  useEffect(() => {
    if (editingSession) {
      setFormData({
        title: editingSession.title || '',
        description: editingSession.description || '',
        type: editingSession.type || 'video',
        visibility: editingSession.isPublic ? 'public' : 'private',
        scheduledDate: editingSession.scheduledDate ? editingSession.scheduledDate.toISOString().split('T')[0] : '',
        scheduledTime: editingSession.scheduledDate ? editingSession.scheduledDate.toTimeString().split(' ')[0].slice(0, 5) : '',
        duration: editingSession.duration || 60,
        location: editingSession.location || '',
        maxParticipants: editingSession.maxParticipants || 50,
        tags: editingSession.tags?.join(', ') || '',
        agenda: editingSession.agenda?.join('\n') || '',
      });
      setTags(editingSession.tags || []);
      setAgendaItems(editingSession.agenda || []);
    }
  }, [editingSession]);

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
    const session = {
      ...formData,
      tags: tags,
      agenda: agendaItems,
      isPublic: formData.visibility === 'public',
    };
    onSubmit(session);
    onClose();
    // Reset form
    setCurrentStep(0);
    setFormData({
      title: '',
      description: '',
      type: 'video',
      visibility: 'private',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      location: '',
      maxParticipants: 50,
      tags: '',
      agenda: '',
    });
    setTags([]);
    setAgendaItems([]);
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

  const addAgendaItem = () => {
    if (formData.agenda.trim()) {
      setAgendaItems([...agendaItems, formData.agenda.trim()]);
      setFormData({ ...formData, agenda: '' });
    }
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.description;
      case 1:
        return formData.scheduledDate && formData.scheduledTime;
      case 2:
        return true;
      case 3:
        return true;
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
              <Label htmlFor="title" className="text-sm font-medium">Session Title *</Label>
              <Input
                id="title"
                placeholder="e.g., React Advanced Patterns Workshop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this session will cover..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Session Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {sessionTypes.map((type) => {
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
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate" className="text-sm font-medium">Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime" className="text-sm font-medium">Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes)</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxParticipants" className="text-sm font-medium">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            {formData.type === 'in-person' && (
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Conference Room A, 123 Main St"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Session Visibility</Label>
              <div className="space-y-3 mt-2">
                {visibilityOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.visibility === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setFormData({ ...formData, visibility: option.id })}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
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

            <div>
              <Label htmlFor="agenda" className="text-sm font-medium">Agenda Items</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add agenda item..."
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addAgendaItem()}
                />
                <Button onClick={addAgendaItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {agendaItems.length > 0 && (
                <div className="space-y-2 mt-2">
                  {agendaItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAgendaItem(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
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
                  <Badge className={sessionTypes.find(t => t.id === formData.type)?.color}>
                    {sessionTypes.find(t => t.id === formData.type)?.label}
                  </Badge>
                  <Badge variant="outline">
                    {visibilityOptions.find(v => v.id === formData.visibility)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(formData.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formData.scheduledTime} ({formData.duration} minutes)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Max {formData.maxParticipants} participants</span>
                </div>
                {formData.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location}</span>
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
                {agendaItems.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Agenda:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {agendaItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
          <DialogTitle className="text-xl font-semibold">
            {editingSession ? 'Edit Session' : 'Schedule New Session'}
          </DialogTitle>
          <DialogDescription>
            {editingSession
              ? 'Update session details and settings'
              : `Set up a new session with ${mentee.name} or make it public for the iSpora community`}
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
              {editingSession ? 'Update Session' : 'Schedule Session'}
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
