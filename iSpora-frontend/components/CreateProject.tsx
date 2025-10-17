import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Plus,
  X,
  Upload,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Tag,
  BookOpen,
  Building,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Briefcase,
  Heart,
  Lightbulb,
  Users2,
  Folder,
  Check,
  Zap,
  Stethoscope,
  Sprout,
  TreePine,
  Factory,
  Palette,
  Shield,
  Globe,
  UserPlus,
  Star,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useProfile } from './ProfileContext';

interface CreateProjectProps {
  onBack: () => void;
  onSave?: (projectData: any) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface DiasporaPosition {
  id: string;
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  commitment: string;
  category: 'leadership' | 'technical' | 'advisory' | 'mentorship' | 'support';
}

// Revised / Expanded Project Categories
const projectTypes = [
  {
    id: 'mentorship',
    label: 'Mentorship & Coaching',
    icon: Users,
    color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300',
    description:
      'Connect mentors with youth/professionals for guidance, coaching, and personal growth',
    features: ['One-on-one sessions', 'feedback', 'guided progress'],
    defaultConnections: { mentorshipConnection: true },
  },
  {
    id: 'academic',
    label: 'Academic & Research Projects',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300',
    description:
      'Support for study groups, academic research, capstones, and faculty-student collaborations',
    features: ['Research tools', 'group collaboration', 'citations'],
    defaultConnections: { mentorshipConnection: false },
  },
  {
    id: 'career',
    label: 'Career & Entrepreneurship',
    icon: Briefcase,
    color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
    description: 'Career development, job readiness, business training, or startup projects',
    features: ['Job board', 'pitch tools', 'entrepreneurship modules'],
    defaultConnections: { mentorshipConnection: true },
  },
  {
    id: 'community',
    label: 'Community Impact Projects',
    icon: Heart,
    color: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300',
    description: 'Volunteering, advocacy, social innovation, or service-driven missions',
    features: ['Outreach tools', 'impact stories', 'local partner collab'],
    defaultConnections: { mentorshipConnection: false },
  },
  {
    id: 'collaboration',
    label: 'Collaboration & Innovation Projects',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300',
    description:
      "General purpose team-based projects that don't fall neatly into the other categories — like tech builds, media, AI tools, etc.",
    features: ['Shared workspace', 'task manager', 'flexible structure'],
    defaultConnections: { mentorshipConnection: false },
  },
];

// All available categories
const allCategories = [
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'healthcare', label: 'Healthcare', icon: Stethoscope },
  { id: 'agriculture', label: 'Agriculture', icon: Sprout },
  { id: 'technology', label: 'Technology', icon: Zap },
  { id: 'environment', label: 'Environment', icon: TreePine },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory },
  { id: 'arts-culture', label: 'Arts & Culture', icon: Palette },
  { id: 'social-services', label: 'Social Services', icon: Heart },
  { id: 'security', label: 'Security & Defense', icon: Shield },
  { id: 'entrepreneurship', label: 'Entrepreneurship', icon: Lightbulb },
  { id: 'research', label: 'Research & Development', icon: BookOpen },
  { id: 'others', label: 'Others', icon: Folder },
];

// Preset diaspora positions with customizable options
const presetDiasporaPositions = [
  {
    id: 'project-host',
    title: 'Project Host',
    description: 'Lead and oversee the overall project direction and execution',
    responsibilities: ['Project oversight', 'Team coordination', 'Strategic planning'],
    requirements: ['Leadership experience', 'Project management skills', 'Strong communication'],
    commitment: '10-15 hours/week',
    category: 'leadership' as const,
  },
  {
    id: 'technical-advisor',
    title: 'Technical Advisor',
    description: 'Provide technical guidance and expertise in specialized areas',
    responsibilities: ['Technical consultation', 'Code review', 'Best practices guidance'],
    requirements: ['Technical expertise', 'Industry experience', 'Mentoring skills'],
    commitment: '5-8 hours/week',
    category: 'technical' as const,
  },
  {
    id: 'diaspora-mentor',
    title: 'Diaspora Mentor',
    description: 'Guide and support project participants with career and academic advice',
    responsibilities: ['One-on-one mentoring', 'Career guidance', 'Skill development'],
    requirements: ['Professional experience', 'Mentoring background', 'Cultural awareness'],
    commitment: '3-5 hours/week',
    category: 'mentorship' as const,
  },
  {
    id: 'industry-expert',
    title: 'Industry Expert',
    description: 'Share industry knowledge and provide real-world perspectives',
    responsibilities: ['Industry insights', 'Market analysis', 'Professional networking'],
    requirements: ['Industry expertise', 'Professional network', 'Speaking experience'],
    commitment: '4-6 hours/week',
    category: 'technical' as const,
  },
  {
    id: 'advisory-board',
    title: 'Advisory Board Member',
    description: 'Provide strategic guidance and high-level oversight',
    responsibilities: ['Strategic advice', 'Network connections', 'Resource identification'],
    requirements: ['Senior experience', 'Strategic thinking', 'Network access'],
    commitment: '2-3 hours/week',
    category: 'advisory' as const,
  },
  {
    id: 'community-supporter',
    title: 'Community Supporter',
    description: 'Help with outreach, engagement, and community building',
    responsibilities: ['Community engagement', 'Event support', 'Promotion'],
    requirements: ['Community connections', 'Communication skills', 'Event experience'],
    commitment: '3-4 hours/week',
    category: 'support' as const,
  },
  {
    id: 'research-collaborator',
    title: 'Research Collaborator',
    description: 'Contribute to research activities and academic components',
    responsibilities: ['Research support', 'Data analysis', 'Publication assistance'],
    requirements: ['Research experience', 'Academic background', 'Analytical skills'],
    commitment: '6-8 hours/week',
    category: 'technical' as const,
  },
  {
    id: 'innovation-catalyst',
    title: 'Innovation Catalyst',
    description: 'Drive innovation and creative problem-solving within the project',
    responsibilities: ['Innovation guidance', 'Creative solutions', 'Technology trends'],
    requirements: ['Innovation experience', 'Creative thinking', 'Technology awareness'],
    commitment: '5-7 hours/week',
    category: 'leadership' as const,
  },
];

export function CreateProject({ onBack, onSave }: CreateProjectProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');

  const [formData, setFormData] = useState({
    projectType: '',
    title: '',
    description: '',
    objectives: [] as string[],
    category: '',
    priority: 'medium',
    status: 'planning',
    startDate: '',
    endDate: '',
    university: '',
    tags: [] as string[],
    mentorshipConnection: false,
    isPublic: true,
  });

  const [newTag, setNewTag] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [universityOpen, setUniversityOpen] = useState(false);
  const [universitySearchValue, setUniversitySearchValue] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [isAddingCustomUniversity, setIsAddingCustomUniversity] = useState(false);

  // Diaspora positions state
  const [diasporaPositions, setDiasporaPositions] = useState<DiasporaPosition[]>([]);
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [newPositionDescription, setNewPositionDescription] = useState('');
  const [newPositionCommitment, setNewPositionCommitment] = useState('');
  const [newPositionCategory, setNewPositionCategory] =
    useState<DiasporaPosition['category']>('support');
  const [positionOpen, setPositionOpen] = useState(false);
  const [isAddingCustomPosition, setIsAddingCustomPosition] = useState(false);

  const [universities, setUniversities] = useState([
    'Stanford University',
    'Massachusetts Institute of Technology (MIT)',
    'Harvard University',
    'University of California, Berkeley',
    'Carnegie Mellon University',
    'Yale University',
    'Princeton University',
    'Columbia University',
    'University of Oxford',
    'University of Cambridge',
    'California Institute of Technology (Caltech)',
    'University of Pennsylvania',
    'University of Chicago',
    'Cornell University',
    'University of Michigan',
    'Georgia Institute of Technology',
    'University of Washington',
    'University of Toronto',
    'University of British Columbia',
    'McGill University',
    'Imperial College London',
    'London School of Economics',
    'ETH Zurich',
    'National University of Singapore',
    'University of Melbourne',
    'Australian National University',
    'University of Sydney',
    'Tsinghua University',
    'Peking University',
    'University of Tokyo',
  ]);

  const steps = [
    { title: 'Project Type', description: 'Choose your project category' },
    { title: 'Basic Info & Timeline', description: 'Project details, timeline and description' },
    { title: 'Team & Positions', description: 'Add team members and diaspora positions' },
    { title: 'Settings', description: 'Integration and visibility options' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectTypeSelect = (typeId: string) => {
    const selectedType = projectTypes.find((t) => t.id === typeId);
    if (selectedType) {
      setSelectedProjectType(typeId);
      setFormData((prev) => ({
        ...prev,
        projectType: typeId,
        ...selectedType.defaultConnections,
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addObjective = () => {
    if (newObjective.trim() && !formData.objectives.includes(newObjective.trim())) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (objectiveToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((objective) => objective !== objectiveToRemove),
    }));
  };

  const addTeamMember = () => {
    if (newMemberEmail.trim() && newMemberRole.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberEmail.split('@')[0] || 'Team Member',
        email: newMemberEmail.trim(),
        role: newMemberRole.trim(),
      };
      setTeamMembers((prev) => [...prev, newMember]);
      setNewMemberEmail('');
      setNewMemberRole('');
    }
  };

  const removeTeamMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  // Diaspora position functions
  const addPresetPosition = (presetPosition: (typeof presetDiasporaPositions)[0]) => {
    const newPosition: DiasporaPosition = {
      id: Date.now().toString(),
      title: presetPosition.title,
      description: presetPosition.description,
      responsibilities: presetPosition.responsibilities,
      requirements: presetPosition.requirements,
      commitment: presetPosition.commitment,
      category: presetPosition.category,
    };
    setDiasporaPositions((prev) => [...prev, newPosition]);
    setPositionOpen(false);
  };

  const addCustomPosition = () => {
    if (newPositionTitle.trim() && newPositionDescription.trim()) {
      const newPosition: DiasporaPosition = {
        id: Date.now().toString(),
        title: newPositionTitle.trim(),
        description: newPositionDescription.trim(),
        responsibilities: [],
        requirements: [],
        commitment: newPositionCommitment.trim() || 'To be determined',
        category: newPositionCategory,
      };
      setDiasporaPositions((prev) => [...prev, newPosition]);
      setNewPositionTitle('');
      setNewPositionDescription('');
      setNewPositionCommitment('');
      setNewPositionCategory('support');
      setIsAddingCustomPosition(false);
      setPositionOpen(false);
    }
  };

  const removePosition = (positionId: string) => {
    setDiasporaPositions((prev) => prev.filter((pos) => pos.id !== positionId));
  };

  const handleAddCustomUniversity = () => {
    if (customUniversity.trim() && !universities.includes(customUniversity.trim())) {
      setUniversities((prev) => [...prev, customUniversity.trim()]);
      handleInputChange('university', customUniversity.trim());
      setCustomUniversity('');
      setIsAddingCustomUniversity(false);
      setUniversityOpen(false);
    }
  };

  const filteredUniversities = universities.filter((university) =>
    university.toLowerCase().includes(universitySearchValue.toLowerCase()),
  );

  const handleSave = (isDraft: boolean = false) => {
    // Basic validation for required fields
    if (!isDraft && (!formData.title || !formData.description || !formData.projectType)) {
      alert('Please fill in all required fields: Title, Description, and Project Type');
      return;
    }

    const projectData = {
      ...formData,
      teamMembers,
      diasporaPositions,
      isDraft,
      createdAt: new Date().toISOString(),
      aspiraCategory: formData.projectType,
    };

    if (onSave) {
      onSave(projectData);
    } else {
      console.warn('No onSave callback provided');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedProjectType !== '';
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return true; // Team and positions are optional
      case 3:
        return true; // Settings step
      default:
        return false;
    }
  };

  const getCategoryIcon = (category: DiasporaPosition['category']) => {
    switch (category) {
      case 'leadership':
        return Crown;
      case 'technical':
        return Zap;
      case 'advisory':
        return Star;
      case 'mentorship':
        return Users;
      case 'support':
        return Heart;
      default:
        return Users;
    }
  };

  const getCategoryColor = (category: DiasporaPosition['category']) => {
    switch (category) {
      case 'leadership':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'technical':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'advisory':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'mentorship':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'support':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold mb-2">What type of project are you creating?</h2>
              <p className="text-muted-foreground">
                Choose the category that best describes your project to get relevant features and
                settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projectTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedProjectType === type.id;

                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'ring-2 ring-[#021ff6] bg-[#021ff6]/5' : 'hover:shadow-lg'
                    }`}
                    onClick={() => handleProjectTypeSelect(type.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${type.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{type.label}</h3>
                            {isSelected && <CheckCircle className="h-5 w-5 text-[#021ff6]" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">
                              Key Features:
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {type.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {/* Basic Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution</Label>
                <Popover open={universityOpen} onOpenChange={setUniversityOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={universityOpen}
                      className="w-full justify-between"
                    >
                      {formData.university || 'Browse institutions...'}
                      <Building className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search universities and institutions..."
                        value={universitySearchValue}
                        onValueChange={setUniversitySearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                              No institutions found.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsAddingCustomUniversity(true);
                                setCustomUniversity(universitySearchValue);
                              }}
                              className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add "{universitySearchValue}"
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredUniversities.map((university) => (
                            <CommandItem
                              key={university}
                              value={university}
                              onSelect={() => {
                                handleInputChange('university', university);
                                setUniversityOpen(false);
                                setUniversitySearchValue('');
                              }}
                            >
                              <Building className="mr-2 h-4 w-4" />
                              {university}
                              {formData.university === university && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {!isAddingCustomUniversity &&
                          universitySearchValue &&
                          filteredUniversities.length > 0 && (
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setIsAddingCustomUniversity(true);
                                  setCustomUniversity(universitySearchValue);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add "{universitySearchValue}" as new institution
                              </CommandItem>
                            </CommandGroup>
                          )}
                      </CommandList>
                    </Command>
                    {isAddingCustomUniversity && (
                      <div className="p-3 border-t border-border">
                        <div className="space-y-2">
                          <Label htmlFor="custom-university">Add New Institution</Label>
                          <div className="flex gap-2">
                            <Input
                              id="custom-university"
                              placeholder="Enter institution name"
                              value={customUniversity}
                              onChange={(e) => setCustomUniversity(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomUniversity()}
                            />
                            <Button
                              size="sm"
                              onClick={handleAddCustomUniversity}
                              className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                            >
                              Add
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsAddingCustomUniversity(false);
                              setCustomUniversity('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project goals, scope, and expected impact"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            {/* Project Objectives */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="objectives">Objectives of the Program</Label>
                <p className="text-sm text-muted-foreground">
                  Define the key objectives that drive your program's mission and impact
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  id="objectives"
                  placeholder="Enter a program objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                />
                <Button
                  type="button"
                  onClick={addObjective}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.objectives.length > 0 && (
                <div className="space-y-2">
                  {formData.objectives.map((objective, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg mt-0.5">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{objective}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(objective)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Subject Area</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject area" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">Project Timeline & Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Diaspora Core Team Positions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#021ff6]" />
                  Diaspora Core Team Positions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Specify leadership and core team positions open to diaspora community members.
                  These are for key roles, not general participants.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Popover open={positionOpen} onOpenChange={setPositionOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Diaspora Position
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search positions..." />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2 text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                  No preset positions found.
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => setIsAddingCustomPosition(true)}
                                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Custom Position
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup heading="Preset Positions">
                              {presetDiasporaPositions.map((position) => {
                                const Icon = getCategoryIcon(position.category);
                                return (
                                  <CommandItem
                                    key={position.id}
                                    onSelect={() => addPresetPosition(position)}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <Icon className="h-4 w-4" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{position.title}</span>
                                          <Badge
                                            variant="outline"
                                            className={`text-xs ${getCategoryColor(position.category)}`}
                                          >
                                            {position.category}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {position.description}
                                        </p>
                                      </div>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                            <CommandGroup>
                              <CommandItem onSelect={() => setIsAddingCustomPosition(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Custom Position
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                        {isAddingCustomPosition && (
                          <div className="p-3 border-t border-border">
                            <div className="space-y-3">
                              <Label htmlFor="custom-position-title">Position Title</Label>
                              <Input
                                id="custom-position-title"
                                placeholder="e.g., Technical Lead, Community Manager"
                                value={newPositionTitle}
                                onChange={(e) => setNewPositionTitle(e.target.value)}
                              />
                              <Label htmlFor="custom-position-description">Description</Label>
                              <Textarea
                                id="custom-position-description"
                                placeholder="Describe the role and responsibilities..."
                                value={newPositionDescription}
                                onChange={(e) => setNewPositionDescription(e.target.value)}
                                rows={3}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                  <Label htmlFor="custom-position-commitment">
                                    Time Commitment
                                  </Label>
                                  <Input
                                    id="custom-position-commitment"
                                    placeholder="e.g., 5-10 hours/week"
                                    value={newPositionCommitment}
                                    onChange={(e) => setNewPositionCommitment(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="custom-position-category">Category</Label>
                                  <Select
                                    value={newPositionCategory}
                                    onValueChange={(value: DiasporaPosition['category']) =>
                                      setNewPositionCategory(value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="leadership">Leadership</SelectItem>
                                      <SelectItem value="technical">Technical</SelectItem>
                                      <SelectItem value="advisory">Advisory</SelectItem>
                                      <SelectItem value="mentorship">Mentorship</SelectItem>
                                      <SelectItem value="support">Support</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={addCustomPosition}
                                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                                >
                                  Add Position
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIsAddingCustomPosition(false);
                                    setNewPositionTitle('');
                                    setNewPositionDescription('');
                                    setNewPositionCommitment('');
                                    setNewPositionCategory('support');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {diasporaPositions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className="bg-[#021ff6]/10 text-[#021ff6] border-[#021ff6]/20"
                        >
                          {diasporaPositions.length} Position
                          {diasporaPositions.length !== 1 ? 's' : ''} Available
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          for Diaspora Community Members
                        </span>
                      </div>
                      {diasporaPositions.map((position) => {
                        const Icon = getCategoryIcon(position.category);
                        return (
                          <div
                            key={position.id}
                            className="border rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  className={`p-2 rounded-lg ${getCategoryColor(position.category)}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{position.title}</h4>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getCategoryColor(position.category)}`}
                                    >
                                      {position.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {position.description}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {position.commitment}
                                    </span>
                                    {position.responsibilities.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        {position.responsibilities.length} responsibilit
                                        {position.responsibilities.length !== 1 ? 'ies' : 'y'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePosition(position.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {diasporaPositions.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        No Diaspora Positions Added Yet
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Add positions to invite diaspora community members to join your core team
                      </p>
                      <Button
                        onClick={() => setPositionOpen(true)}
                        className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Position
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags & Keywords
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Initial Team Members
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add confirmed team members who will start with the project
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Role/Title"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  />
                  <Button type="button" onClick={addTeamMember}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {teamMembers.length > 0 && (
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {member.email} • {member.role}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        const selectedType = projectTypes.find((t) => t.id === selectedProjectType);
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Integration Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentorship-connection">Connect to Mentorship Platform</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable mentorship features for this project
                      </p>
                      {selectedType?.defaultConnections.mentorshipConnection && (
                        <p className="text-xs text-blue-600">
                          Recommended for {selectedType.label} projects
                        </p>
                      )}
                    </div>
                    <Switch
                      id="mentorship-connection"
                      checked={formData.mentorshipConnection}
                      onCheckedChange={(checked) =>
                        handleInputChange('mentorshipConnection', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Project Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-project">Make Project Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to discover and request to join this project
                    </p>
                  </div>
                  <Switch
                    id="public-project"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <h1 className="text-xl font-semibold">Create New Project</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            {currentStep === steps.length - 1 && (
              <Button
                onClick={() => {
                  console.log('Creating project with data:', formData);
                  handleSave(false);
                }}
                className="bg-[#021ff6] hover:bg-[#021ff6]/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${index <= currentStep ? 'text-[#021ff6]' : 'text-gray-400'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-[#021ff6] text-white' : 'bg-gray-200'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-px mx-4 ${index < currentStep ? 'bg-[#021ff6]' : 'bg-gray-200'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">{renderStepContent()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    handleSave(false);
                  }}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
