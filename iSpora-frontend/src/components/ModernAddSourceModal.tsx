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
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  X, 
  BookOpen, 
  FileText, 
  Globe, 
  GraduationCap, 
  FileBarChart, 
  Link,
  CheckCircle,
  Search,
  Tag,
  Star,
  Calendar,
  User,
  ExternalLink,
  Save,
  Sparkles,
  Brain,
  Lightbulb
} from 'lucide-react';

interface ModernAddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (source: any) => void;
}

const sourceTypes = [
  { 
    id: 'journal', 
    label: '📄 Journal Article', 
    icon: FileText, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Peer-reviewed academic journal'
  },
  { 
    id: 'conference', 
    label: '🎤 Conference Paper', 
    icon: Globe, 
    color: 'bg-green-100 text-green-700',
    description: 'Conference proceedings or presentation'
  },
  { 
    id: 'book', 
    label: '📚 Book', 
    icon: BookOpen, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Published book or monograph'
  },
  { 
    id: 'report', 
    label: '📊 Report', 
    icon: FileBarChart, 
    color: 'bg-orange-100 text-orange-700',
    description: 'Research report or white paper'
  },
  { 
    id: 'website', 
    label: '🌐 Website', 
    icon: Link, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Online resource or webpage'
  },
  { 
    id: 'thesis', 
    label: '🎓 Thesis', 
    icon: GraduationCap, 
    color: 'bg-red-100 text-red-700',
    description: 'PhD or Master\'s thesis'
  },
];

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Title and type' },
  { id: 'details', title: 'Details', description: 'Authors and publication' },
  { id: 'content', title: 'Content', description: 'Abstract and keywords' },
  { id: 'review', title: 'Review', description: 'Final check' },
];

export function ModernAddSourceModal({ isOpen, onClose, onSubmit }: ModernAddSourceModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    type: 'journal',
    authors: '',
    year: new Date().getFullYear(),
    url: '',
    abstract: '',
    keywords: '',
    notes: '',
    doi: '',
    publisher: '',
    volume: '',
    issue: '',
    pages: '',
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
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
    const source = {
      ...formData,
      keywords: keywords.join(', '),
      authors: formData.authors.split(',').map(a => a.trim()),
    };
    onSubmit(source);
    onClose();
    // Reset form
    setCurrentStep(0);
    setFormData({
      title: '',
      type: 'journal',
      authors: '',
      year: new Date().getFullYear(),
      url: '',
      abstract: '',
      keywords: '',
      notes: '',
      doi: '',
      publisher: '',
      volume: '',
      issue: '',
      pages: '',
    });
    setKeywords([]);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const generateAISuggestions = () => {
    // Simulate AI suggestions based on title and abstract
    const suggestions = [
      'Machine Learning',
      'Artificial Intelligence',
      'Data Analysis',
      'Research Methodology',
      'Statistical Analysis'
    ];
    setAiSuggestions(suggestions);
  };

  const addAISuggestion = (suggestion: string) => {
    if (!keywords.includes(suggestion)) {
      setKeywords([...keywords, suggestion]);
    }
    setAiSuggestions(aiSuggestions.filter(s => s !== suggestion));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.type;
      case 1:
        return formData.authors && formData.year;
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
              <Label htmlFor="title" className="text-sm font-medium">Source Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Machine Learning Applications in Healthcare"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Source Type *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {sourceTypes.map((type) => {
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
              <Label htmlFor="authors" className="text-sm font-medium">Authors *</Label>
              <Input
                id="authors"
                placeholder="e.g., Smith, J., Johnson, A., Williams, B."
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className="text-sm font-medium">Publication Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="publisher" className="text-sm font-medium">Publisher</Label>
                <Input
                  id="publisher"
                  placeholder="e.g., Nature, IEEE, ACM"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volume" className="text-sm font-medium">Volume</Label>
                <Input
                  id="volume"
                  placeholder="e.g., 15"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="issue" className="text-sm font-medium">Issue</Label>
                <Input
                  id="issue"
                  placeholder="e.g., 3"
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pages" className="text-sm font-medium">Pages</Label>
                <Input
                  id="pages"
                  placeholder="e.g., 123-145"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="doi" className="text-sm font-medium">DOI</Label>
                <Input
                  id="doi"
                  placeholder="e.g., 10.1000/182"
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="url" className="text-sm font-medium">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="abstract" className="text-sm font-medium">Abstract</Label>
              <Textarea
                id="abstract"
                placeholder="Brief summary of the source content..."
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Keywords</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add a keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm" variant="outline">
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
              
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeKeyword(keyword)}
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
              <Label htmlFor="notes" className="text-sm font-medium">Personal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Your thoughts, insights, or how this source relates to your research..."
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
                  {sourceTypes.find(t => t.id === formData.type)?.icon && 
                    React.createElement(sourceTypes.find(t => t.id === formData.type)!.icon, { className: "h-5 w-5" })}
                  {formData.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={sourceTypes.find(t => t.id === formData.type)?.color}>
                    {sourceTypes.find(t => t.id === formData.type)?.label}
                  </Badge>
                  <Badge variant="outline">{formData.year}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{formData.authors}</span>
                </div>
                {formData.publisher && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{formData.publisher}</span>
                  </div>
                )}
                {formData.url && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                    <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Source
                    </a>
                  </div>
                )}
                {formData.abstract && (
                  <div>
                    <p className="text-sm font-medium mb-1">Abstract:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{formData.abstract}</p>
                  </div>
                )}
                {keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
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
            <BookOpen className="h-5 w-5" />
            Add Research Source
          </DialogTitle>
          <DialogDescription>
            Add a new research source to your literature collection with detailed bibliographic information
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
              Add Source
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
