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
import { ScrollArea } from '../../components/ui/scroll-area';
import { Progress } from '../../components/ui/progress';
import { 
  Brain, 
  MapPin, 
  Bookmark, 
  Calculator,
  Plus,
  X,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  Link,
  Calendar,
  Clock
} from 'lucide-react';

interface ModernResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolType: 'ai-assistant' | 'methodology-planner' | 'reference-manager' | 'survey-builder';
  onSubmit?: (data: any) => void;
}

const researchCategories = [
  { id: 'quantitative', label: '📊 Quantitative', color: 'bg-blue-100 text-blue-700' },
  { id: 'qualitative', label: '🔍 Qualitative', color: 'bg-green-100 text-green-700' },
  { id: 'mixed-methods', label: '🔄 Mixed Methods', color: 'bg-purple-100 text-purple-700' },
  { id: 'case-study', label: '📋 Case Study', color: 'bg-orange-100 text-orange-700' },
  { id: 'literature-review', label: '📚 Literature Review', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'experimental', label: '🧪 Experimental', color: 'bg-red-100 text-red-700' },
];

const methodologySteps = [
  { id: 'planning', title: 'Research Planning', description: 'Define objectives and scope' },
  { id: 'design', title: 'Research Design', description: 'Choose methodology and approach' },
  { id: 'data-collection', title: 'Data Collection', description: 'Gather research data' },
  { id: 'analysis', title: 'Data Analysis', description: 'Analyze and interpret results' },
  { id: 'reporting', title: 'Reporting', description: 'Document and present findings' },
];

export function ModernResearchModal({ isOpen, onClose, toolType, onSubmit }: ModernResearchModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    objectives: '',
    methodology: '',
    timeline: '',
    resources: '',
    expectedOutcomes: '',
  });

  const [newResource, setNewResource] = useState('');
  const [resources, setResources] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < methodologySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
    onClose();
  };

  const addResource = () => {
    if (newResource.trim() && !resources.includes(newResource.trim())) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const removeResource = (resourceToRemove: string) => {
    setResources(resources.filter(resource => resource !== resourceToRemove));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.description && formData.category;
      case 1:
        return formData.objectives && formData.methodology;
      case 2:
        return formData.timeline;
      case 3:
        return resources.length > 0;
      case 4:
        return formData.expectedOutcomes;
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
              <Label htmlFor="title" className="text-sm font-medium">Research Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Impact of Digital Learning on Student Outcomes"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your research project..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Research Category *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {researchCategories.map((category) => {
                  const isSelected = formData.category === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium">{category.label}</span>
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
              <Label htmlFor="objectives" className="text-sm font-medium">Research Objectives *</Label>
              <Textarea
                id="objectives"
                placeholder="List your research objectives..."
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="methodology" className="text-sm font-medium">Methodology *</Label>
              <Textarea
                id="methodology"
                placeholder="Describe your research methodology..."
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeline" className="text-sm font-medium">Research Timeline *</Label>
              <Textarea
                id="timeline"
                placeholder="Describe your research timeline and milestones..."
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Required Resources</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add a resource..."
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addResource()}
                />
                <Button onClick={addResource} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {resources.length > 0 && (
                <div className="space-y-2 mt-2">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{resource}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeResource(resource)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="budget" className="text-sm font-medium">Budget Estimate</Label>
              <Input
                id="budget"
                placeholder="e.g., $5,000"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expectedOutcomes" className="text-sm font-medium">Expected Outcomes *</Label>
              <Textarea
                id="expectedOutcomes"
                placeholder="Describe the expected outcomes and deliverables..."
                value={formData.expectedOutcomes}
                onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="successMetrics" className="text-sm font-medium">Success Metrics</Label>
              <Textarea
                id="successMetrics"
                placeholder="How will you measure success?"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getToolInfo = () => {
    switch (toolType) {
      case 'ai-assistant':
        return { title: 'AI Research Assistant', icon: Brain, color: 'bg-blue-100 text-blue-700' };
      case 'methodology-planner':
        return { title: 'Methodology Planner', icon: Target, color: 'bg-green-100 text-green-700' };
      case 'reference-manager':
        return { title: 'Reference Manager', icon: Bookmark, color: 'bg-purple-100 text-purple-700' };
      case 'survey-builder':
        return { title: 'Survey Builder', icon: Calculator, color: 'bg-orange-100 text-orange-700' };
      default:
        return { title: 'Research Tool', icon: Brain, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const toolInfo = getToolInfo();
  const Icon = toolInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {toolInfo.title}
          </DialogTitle>
          <DialogDescription>
            Plan and organize your research project with structured methodology
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {methodologySteps.length}</span>
            <span className="text-sm text-gray-500">{methodologySteps[currentStep].title}</span>
          </div>
          <Progress value={(currentStep + 1) / methodologySteps.length * 100} className="h-2" />
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
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep === methodologySteps.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Create Research Plan
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
