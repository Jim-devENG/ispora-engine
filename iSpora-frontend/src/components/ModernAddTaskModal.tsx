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
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  CheckSquare, 
  Calendar, 
  User, 
  Flag, 
  Clock,
  Target,
  Users,
  Tag,
  MessageCircle,
  Paperclip,
  Save,
  Sparkles,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Zap,
  Star,
  Rocket
} from 'lucide-react';

interface ModernAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  projectMembers: any[];
  mentee: any;
}

const priorityLevels = [
  { 
    id: 'low', 
    label: '🟢 Low Priority', 
    icon: CheckCircle, 
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Can be done when convenient'
  },
  { 
    id: 'medium', 
    label: '🟡 Medium Priority', 
    icon: Clock, 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Should be completed soon'
  },
  { 
    id: 'high', 
    label: '🔴 High Priority', 
    icon: AlertCircle, 
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Urgent and important'
  },
];

const taskTypes = [
  { 
    id: 'development', 
    label: '💻 Development', 
    icon: Target, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Coding and technical work'
  },
  { 
    id: 'research', 
    label: '🔬 Research', 
    icon: Lightbulb, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Investigation and analysis'
  },
  { 
    id: 'design', 
    label: '🎨 Design', 
    icon: Star, 
    color: 'bg-pink-100 text-pink-700',
    description: 'UI/UX and visual design'
  },
  { 
    id: 'meeting', 
    label: '🤝 Meeting', 
    icon: Users, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Team collaboration and planning'
  },
  { 
    id: 'review', 
    label: '📝 Review', 
    icon: CheckSquare, 
    color: 'bg-orange-100 text-orange-700',
    description: 'Code review and feedback'
  },
  { 
    id: 'deployment', 
    label: '🚀 Deployment', 
    icon: Rocket, 
    color: 'bg-green-100 text-green-700',
    description: 'Release and production tasks'
  },
];

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Title and type' },
  { id: 'details', title: 'Details', description: 'Description and priority' },
  { id: 'assignment', title: 'Assignment', description: 'Assignee and timeline' },
  { id: 'review', title: 'Review', description: 'Final check' },
];

export function ModernAddTaskModal({ isOpen, onClose, onSubmit, projectMembers, mentee }: ModernAddTaskModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: 'development',
    description: '',
    priority: 'medium',
    assignee: mentee.name,
    dueDate: '',
    estimatedHours: '',
    tags: '',
    notes: '',
  });

  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

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
    const task = {
      ...formData,
      tags: tags.join(', '),
      status: 'todo',
      assignedDate: new Date(),
    };
    onSubmit(task);
    onClose();
    // Reset form
    setCurrentStep(0);
    setFormData({
      title: '',
      type: 'development',
      description: '',
      priority: 'medium',
      assignee: mentee.name,
      dueDate: '',
      estimatedHours: '',
      tags: '',
      notes: '',
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

  const generateAISuggestions = () => {
    // Simulate AI suggestions based on title and description
    const suggestions = [
      'Frontend',
      'Backend',
      'Database',
      'Testing',
      'Documentation',
      'UI/UX',
      'API',
      'Security'
    ];
    setAiSuggestions(suggestions);
  };

  const addAISuggestion = (suggestion: string) => {
    if (!tags.includes(suggestion)) {
      setTags([...tags, suggestion]);
    }
    setAiSuggestions(aiSuggestions.filter(s => s !== suggestion));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.type;
      case 1:
        return formData.description && formData.priority;
      case 2:
        return formData.assignee;
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  const getAssigneeAvatar = (assigneeName: string) => {
    const member = projectMembers.find(m => m.name === assigneeName);
    return member?.avatar;
  };

  const getAssigneeRole = (assigneeName: string) => {
    const member = projectMembers.find(m => m.name === assigneeName);
    return member?.role;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Implement user authentication system"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Task Type *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {taskTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, type: type.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                        </div>
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
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Task Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what needs to be done, requirements, and any specific details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Priority Level *</Label>
              <div className="space-y-3 mt-2">
                {priorityLevels.map((priority) => {
                  const Icon = priority.icon;
                  const isSelected = formData.priority === priority.id;
                  return (
                    <button
                      key={priority.id}
                      onClick={() => setFormData({ ...formData, priority: priority.id })}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? `${priority.color} border-current` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium text-sm">{priority.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{priority.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignee" className="text-sm font-medium">Assign To *</Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => setFormData({ ...formData, assignee: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers
                    .filter((member) => member.status === 'active')
                    .map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-5 w-5 flex-shrink-0">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
                            ) : (
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map((n) => n[0]).join('')}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="flex-1 truncate">{member.name}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
                            {member.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estimatedHours" className="text-sm font-medium">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  placeholder="e.g., 8"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  className="mt-1"
                />
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
                <Button 
                  onClick={generateAISuggestions} 
                  size="sm" 
                  variant="outline"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI
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

              {aiSuggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Brain className="h-4 w-4 text-purple-500" />
                    AI Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        size="sm"
                        variant="outline"
                        onClick={() => addAISuggestion(suggestion)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context, dependencies, or special instructions..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {taskTypes.find(t => t.id === formData.type)?.icon && 
                    React.createElement(taskTypes.find(t => t.id === formData.type)!.icon, { className: "h-5 w-5" })}
                  {formData.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={taskTypes.find(t => t.id === formData.type)?.color}>
                    {taskTypes.find(t => t.id === formData.type)?.label}
                  </Badge>
                  <Badge className={priorityLevels.find(p => p.id === formData.priority)?.color}>
                    {priorityLevels.find(p => p.id === formData.priority)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <Avatar className="h-5 w-5">
                    {getAssigneeAvatar(formData.assignee) ? (
                      <AvatarImage src={getAssigneeAvatar(formData.assignee)} alt={formData.assignee} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {formData.assignee.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{formData.assignee}</span>
                  <Badge variant="outline" className="text-xs">
                    {getAssigneeRole(formData.assignee)}
                  </Badge>
                </div>
                
                {formData.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(formData.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {formData.estimatedHours && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Estimated: {formData.estimatedHours} hours</span>
                  </div>
                )}
                
                {formData.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{formData.description}</p>
                  </div>
                )}
                
                {tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{formData.notes}</p>
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
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Create a new task for {mentee.name} with detailed information and assignment
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
              <Save className="h-4 w-4" />
              Create Task
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
