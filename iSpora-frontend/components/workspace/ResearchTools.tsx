import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  FileText,
  Users,
  Link,
  Download,
  Filter,
  Star,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Globe,
  Microscope,
  Calculator,
  BarChart3,
  Lightbulb,
  Share2,
  Tag,
  Calendar,
  Target,
  Bookmark,
  Copy,
  RefreshCw,
  Upload,
  Eye,
  MessageCircle,
  Brain,
  MapPin,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Alert, AlertDescription } from "../ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ProjectMember {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  role: string;
  status: string;
  progress: number;
  isOnline?: boolean;
  email?: string;
  skills?: string[];
}

interface ResearchSource {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: 'journal' | 'conference' | 'book' | 'report' | 'website' | 'thesis';
  url?: string;
  abstract?: string;
  keywords: string[];
  relevance: number;
  notes?: string;
  addedBy: string;
  addedDate: string;
  favorite: boolean;
  citations?: number;
  doi?: string;
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdDate: string;
  lastModified: string;
  sourceId?: string;
  shared: boolean;
  category: 'hypothesis' | 'observation' | 'methodology' | 'insight' | 'todo' | 'question';
}

interface DataSet {
  id: string;
  name: string;
  description: string;
  type: 'survey' | 'experimental' | 'observational' | 'secondary' | 'qualitative';
  size: number;
  format: string;
  uploadedBy: string;
  uploadedDate: string;
  tags: string[];
  public: boolean;
  url?: string;
}

interface ResearchToolsProps {
  mentee: ProjectMember;
  projectType?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

export function ResearchTools({ mentee, projectType = 'academic' }: ResearchToolsProps) {
  const [activeTab, setActiveTab] = useState("literature");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null);
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);

  // Quick tools modal states
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [generatedCitation, setGeneratedCitation] = useState("");
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
    questions: [""]
  });
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [methodologyPlan, setMethodologyPlan] = useState({
    approach: "",
    dataCollection: "",
    analysis: "",
    timeline: ""
  });
  const [referenceCategories, setReferenceCategories] = useState<string[]>(["Literature Review", "Methodology", "Theory"]);

  // Real-time state (no demo)
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([]);
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const devKey = localStorage.getItem('devKey');
    const token = localStorage.getItem('token');
    if (devKey) headers['X-Dev-Key'] = devKey;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const load = async () => {
      try {
        const [sRes, nRes, dRes] = await Promise.all([
          fetch(`${API_BASE_URL}/research/sources`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/research/notes`, { headers, signal: controller.signal }),
          fetch(`${API_BASE_URL}/research/datasets`, { headers, signal: controller.signal })
        ]);
        const [sJson, nJson, dJson] = await Promise.all([sRes.json(), nRes.json(), dRes.json()]);
        const sRows = Array.isArray(sJson.data) ? sJson.data : [];
        const nRows = Array.isArray(nJson.data) ? nJson.data : [];
        const dRows = Array.isArray(dJson.data) ? dJson.data : [];
        setResearchSources(sRows);
        setResearchNotes(nRows);
        setDataSets(dRows);
      } catch {
        setResearchSources([]);
        setResearchNotes([]);
        setDataSets([]);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(id); };
  }, []);

  // New source form state
  const [newSource, setNewSource] = useState({
    title: "",
    authors: "",
    year: new Date().getFullYear(),
    type: "journal" as ResearchSource['type'],
    url: "",
    abstract: "",
    keywords: "",
    notes: ""
  });

  // New note form state
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    category: "observation" as ResearchNote['category']
  });

  const sourceTypeIcons = {
    journal: BookOpen,
    conference: Users,
    book: BookOpen,
    report: FileText,
    website: Globe,
    thesis: Microscope
  };

  const noteTypeIcons = {
    hypothesis: Lightbulb,
    observation: Search,
    methodology: Calculator,
    insight: TrendingUp,
    todo: CheckCircle,
    question: AlertCircle
  };

  const noteTypeColors = {
    hypothesis: "bg-purple-100 text-purple-700",
    observation: "bg-blue-100 text-blue-700",
    methodology: "bg-green-100 text-green-700",
    insight: "bg-orange-100 text-orange-700",
    todo: "bg-red-100 text-red-700",
    question: "bg-yellow-100 text-yellow-700"
  };

  const addSource = async () => {
    if (newSource.title && newSource.authors) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const body = {
        title: newSource.title,
        authors: newSource.authors,
        year: newSource.year,
        type: newSource.type,
        url: newSource.url,
        abstract: newSource.abstract,
        keywords: newSource.keywords,
        notes: newSource.notes
      };
      try {
        const res = await fetch(`${API_BASE_URL}/research/sources`, { method: 'POST', headers, body: JSON.stringify(body) });
        const json = await res.json();
        if (res.ok) setResearchSources(prev => [json.data || json, ...prev]);
      } catch {}
      setNewSource({
        title: "",
        authors: "",
        year: new Date().getFullYear(),
        type: "journal",
        url: "",
        abstract: "",
        keywords: "",
        notes: ""
      });
      setIsAddingSource(false);
    }
  };

  const addNote = async () => {
    if (newNote.title && newNote.content) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const body = {
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        category: newNote.category
      };
      try {
        const res = await fetch(`${API_BASE_URL}/research/notes`, { method: 'POST', headers, body: JSON.stringify(body) });
        const json = await res.json();
        if (res.ok) setResearchNotes(prev => [json.data || json, ...prev]);
      } catch {}
      setNewNote({
        title: "",
        content: "",
        tags: "",
        category: "observation"
      });
      setIsAddingNote(false);
    }
  };

  const toggleFavorite = (sourceId: string) => {
    setResearchSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, favorite: !source.favorite }
          : source
      )
    );
  };

  const filteredSources = researchSources.filter(source => {
    const matchesSearch = source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      source.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === "all" || source.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const filteredNotes = researchNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const getProjectSpecificTools = () => {
    switch (projectType) {
      case 'research':
        return [
          { id: 'ai-research-assistant', name: 'AI Research Assistant', icon: Brain },
          { id: 'methodology-planner', name: 'Methodology Planner', icon: MapPin },
          { id: 'reference-manager', name: 'Reference Manager', icon: Bookmark },
          { id: 'citation-generator', name: 'Citation Generator', icon: FileText },
          { id: 'statistical-analysis', name: 'Statistical Analysis', icon: BarChart3 },
          { id: 'survey-builder', name: 'Survey Builder', icon: Calculator }
        ];
      case 'mentorship':
        return [
          { id: 'ai-research-assistant', name: 'AI Research Assistant', icon: Brain },
          { id: 'methodology-planner', name: 'Methodology Planner', icon: MapPin },
          { id: 'reference-manager', name: 'Reference Manager', icon: Bookmark }
        ];
      case 'innovation':
      case 'challenge':
        return [
          { id: 'ai-research-assistant', name: 'AI Research Assistant', icon: Brain },
          { id: 'patent-search', name: 'Patent Search', icon: Search },
          { id: 'market-analysis', name: 'Market Analysis', icon: BarChart3 },
          { id: 'competitor-tracker', name: 'Competitor Tracker', icon: Target }
        ];
      case 'community':
        return [
          { id: 'ai-research-assistant', name: 'AI Research Assistant', icon: Brain },
          { id: 'impact-tracker', name: 'Impact Tracker', icon: TrendingUp },
          { id: 'stakeholder-map', name: 'Stakeholder Mapping', icon: Users },
          { id: 'community-insights', name: 'Community Insights', icon: Globe }
        ];
      default:
        return [
          { id: 'ai-research-assistant', name: 'AI Research Assistant', icon: Brain },
          { id: 'methodology-planner', name: 'Methodology Planner', icon: MapPin },
          { id: 'reference-manager', name: 'Reference Manager', icon: Bookmark }
        ];
    }
  };

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
    
    // Generate mock data based on tool type
    switch (toolId) {
      case 'citation-generator':
        generateCitation();
        break;
      case 'statistical-analysis':
        generateAnalysis();
        break;
      case 'survey-builder':
        setSurveyData({ title: "", description: "", questions: [""] });
        break;
      case 'ai-research-assistant':
        generateAISuggestions();
        break;
      case 'methodology-planner':
        setMethodologyPlan({ approach: "", dataCollection: "", analysis: "", timeline: "" });
        break;
      case 'reference-manager':
        // Initialize reference manager
        break;
      case 'literature-search':
        // Initialize literature search
        break;
      case 'data-analysis':
        // Initialize data analysis
        break;
    }
  };

  const generateCitation = () => {
    if (researchSources.length > 0) {
      const randomSource = researchSources[Math.floor(Math.random() * researchSources.length)];
      const citation = `${randomSource.authors.join(', ')} (${randomSource.year}). ${randomSource.title}. Retrieved from ${randomSource.url || 'https://example.com'}`;
      setGeneratedCitation(citation);
    } else {
      setGeneratedCitation('Smith, J., & Johnson, M. (2024). Research Methodology in Digital Age. Journal of Academic Research, 15(3), 45-62.');
    }
  };

  const generateAnalysis = () => {
    const mockResults = {
      sampleSize: 250,
      mean: 3.47,
      standardDeviation: 1.23,
      confidence: 95,
      pValue: 0.032,
      conclusion: "Statistically significant difference detected (p < 0.05)"
    };
    setAnalysisResults(mockResults);
  };

  const addSurveyQuestion = () => {
    setSurveyData(prev => ({
      ...prev,
      questions: [...prev.questions, ""]
    }));
  };

  const updateSurveyQuestion = (index: number, value: string) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? value : q)
    }));
  };

  const removeSurveyQuestion = (index: number) => {
    setSurveyData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const generateAISuggestions = () => {
    // Generate AI-powered research suggestions based on project context
    const suggestions = [
      "Consider exploring the ethical implications of AI in education within developing countries",
      "Investigate the correlation between digital literacy and economic outcomes in rural communities",
      "Examine the role of cultural factors in technology adoption patterns",
      "Analyze the effectiveness of mobile-first learning platforms in low-bandwidth environments",
      "Study the impact of peer-to-peer learning networks on knowledge transfer"
    ];
    setAiSuggestions(suggestions);
  };

  const generateMethodologyPlan = () => {
    const plan = {
      approach: "Mixed-methods research combining quantitative surveys and qualitative interviews",
      dataCollection: "Online surveys (n=500), Semi-structured interviews (n=25), Focus groups (n=5)",
      analysis: "Statistical analysis using SPSS, Thematic analysis for qualitative data",
      timeline: "Data collection: 3 months, Analysis: 2 months, Writing: 2 months"
    };
    setMethodologyPlan(plan);
  };

  const addReferenceCategory = () => {
    const newCategory = `Category ${referenceCategories.length + 1}`;
    setReferenceCategories(prev => [...prev, newCategory]);
  };

  return (
    <div className="flex flex-col bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Microscope className="h-5 w-5" />
              Research Tools
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage literature, notes, data, and research workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search research materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="journal">Journals</SelectItem>
                <SelectItem value="conference">Conferences</SelectItem>
                <SelectItem value="book">Books</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="website">Websites</SelectItem>
                <SelectItem value="thesis">Thesis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>



        {/* Quick Tools Modals */}
        {/* AI Research Assistant Modal */}
        <Dialog open={activeTool === 'ai-research-assistant'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Research Assistant
              </DialogTitle>
              <DialogDescription>
                Get AI-powered research suggestions and insights based on your project context.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Research Context</Label>
                <Textarea
                  placeholder="Describe your research topic, objectives, or current focus area..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>AI Suggestions</Label>
                {aiSuggestions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm">{suggestion}</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Notes
                          </Button>
                          <Button variant="outline" size="sm">
                            <Search className="h-3 w-3 mr-1" />
                            Research This
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click "Generate Suggestions" to get AI-powered research insights</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={generateAISuggestions} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </Button>
                <Button variant="outline" onClick={generateAISuggestions}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Ideas
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Methodology Planner Modal */}
        <Dialog open={activeTool === 'methodology-planner'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Methodology Planner
              </DialogTitle>
              <DialogDescription>
                Plan your research methodology with structured guidance and templates.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Research Approach</Label>
                <Textarea
                  value={methodologyPlan.approach}
                  onChange={(e) => setMethodologyPlan(prev => ({ ...prev, approach: e.target.value }))}
                  placeholder="Describe your overall research approach (e.g., mixed-methods, qualitative, quantitative)..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Collection Methods</Label>
                <Textarea
                  value={methodologyPlan.dataCollection}
                  onChange={(e) => setMethodologyPlan(prev => ({ ...prev, dataCollection: e.target.value }))}
                  placeholder="Detail your data collection methods (surveys, interviews, observations, etc.)..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Analysis Plan</Label>
                <Textarea
                  value={methodologyPlan.analysis}
                  onChange={(e) => setMethodologyPlan(prev => ({ ...prev, analysis: e.target.value }))}
                  placeholder="Describe your data analysis approach and tools..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Textarea
                  value={methodologyPlan.timeline}
                  onChange={(e) => setMethodologyPlan(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="Outline your research timeline and milestones..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={generateMethodologyPlan} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <MapPin className="h-4 w-4 mr-2" />
                  Generate Template
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Plan
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reference Manager Modal */}
        <Dialog open={activeTool === 'reference-manager'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Reference Manager
              </DialogTitle>
              <DialogDescription>
                Organize your references into categories and manage citations efficiently.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reference Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {referenceCategories.map((category, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      {category}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Button onClick={addReferenceCategory} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Recent References ({researchSources.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {researchSources.slice(0, 5).map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{source.title}</p>
                        <p className="text-xs text-muted-foreground">{source.authors.join(', ')}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Tag className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Bibliography
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Collection
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import References
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'citation-generator'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Citation Generator
              </DialogTitle>
              <DialogDescription>
                Generate academic citations from your research sources in various formats.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Citation (APA Format)</Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm">{generatedCitation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={generateCitation} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New
                </Button>
                <Button 
                  onClick={() => navigator.clipboard.writeText(generatedCitation)}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Citation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'statistical-analysis'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistical Analysis
              </DialogTitle>
              <DialogDescription>
                Analyze your research data with statistical tests and visualizations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {analysisResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Sample Size</div>
                      <div className="text-xl font-semibold">{analysisResults.sampleSize}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Mean</div>
                      <div className="text-xl font-semibold">{analysisResults.mean}</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Std. Deviation</div>
                      <div className="text-xl font-semibold">{analysisResults.standardDeviation}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">P-Value</div>
                      <div className="text-xl font-semibold">{analysisResults.pValue}</div>
                    </div>
                  </div>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {analysisResults.conclusion}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={generateAnalysis} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Analysis
                </Button>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'survey-builder'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Survey Builder
              </DialogTitle>
              <DialogDescription>
                Create research surveys with customizable questions and response options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Survey Title</Label>
                <Input
                  value={surveyData.title}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter survey title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={surveyData.description}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of your survey"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Button onClick={addSurveyQuestion} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                <div className="space-y-2">
                  {surveyData.questions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={question}
                        onChange={(e) => updateSurveyQuestion(index, e.target.value)}
                        placeholder={`Question ${index + 1}`}
                        className="flex-1"
                      />
                      {surveyData.questions.length > 1 && (
                        <Button
                          onClick={() => removeSurveyQuestion(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Survey
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Survey
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'literature-search'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Literature Search
              </DialogTitle>
              <DialogDescription>
                Search academic databases and repositories for relevant literature.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Query</Label>
                <Input
                  placeholder="Enter keywords, authors, or topics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Database</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select database" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pubmed">PubMed</SelectItem>
                      <SelectItem value="ieee">IEEE Xplore</SelectItem>
                      <SelectItem value="scholar">Google Scholar</SelectItem>
                      <SelectItem value="arxiv">arXiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Publication Year</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="last5">Last 5 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Search className="h-4 w-4 mr-2" />
                Search Literature
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'data-analysis'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Analysis
              </DialogTitle>
              <DialogDescription>
                Upload and analyze your research data with various statistical methods.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your data file here, or click to browse
                </p>
                <Button variant="outline" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">Descriptive Statistics</SelectItem>
                      <SelectItem value="correlation">Correlation Analysis</SelectItem>
                      <SelectItem value="regression">Regression Analysis</SelectItem>
                      <SelectItem value="anova">ANOVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="95%" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="95">95%</SelectItem>
                      <SelectItem value="99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Community Tools Modals */}
        <Dialog open={activeTool === 'impact-tracker'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Impact Tracker
              </DialogTitle>
              <DialogDescription>
                Track and measure the impact of your community initiatives.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">342</div>
                  <div className="text-sm text-muted-foreground">People Reached</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-muted-foreground">Active Programs</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Add New Impact Metric</Label>
                <div className="flex gap-2">
                  <Input placeholder="Metric name" className="flex-1" />
                  <Input placeholder="Value" className="w-24" />
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Download className="h-4 w-4 mr-2" />
                Generate Impact Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'stakeholder-map'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Stakeholder Mapping
              </DialogTitle>
              <DialogDescription>
                Visualize and manage relationships with community stakeholders.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stakeholder Name</Label>
                  <Input placeholder="Enter stakeholder name" />
                </div>
                <div className="space-y-2">
                  <Label>Influence Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Influence</SelectItem>
                      <SelectItem value="medium">Medium Influence</SelectItem>
                      <SelectItem value="low">Low Influence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stakeholder Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="ngo">NGO/Non-profit</SelectItem>
                    <SelectItem value="community">Community Leader</SelectItem>
                    <SelectItem value="business">Business Partner</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Add notes about this stakeholder..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Map
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'community-insights'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Community Insights
              </DialogTitle>
              <DialogDescription>
                Gather and analyze feedback from community members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">4.2/5</div>
                      <div className="text-sm text-muted-foreground">Community Satisfaction</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Feedback Responses</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-2">
                <Label>Recent Feedback</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    "The digital literacy program has been incredibly helpful for our youth."
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    "More sessions on entrepreneurship would be valuable."
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    "Great initiative! Hope to see more collaboration opportunities."
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Collect Feedback
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Collaboration/Innovation Tools Modals */}
        <Dialog open={activeTool === 'patent-search'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Patent Search
              </DialogTitle>
              <DialogDescription>
                Search patent databases to ensure innovation uniqueness and identify opportunities.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Keywords</Label>
                <Input placeholder="Enter technology keywords or concepts" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patent Office</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uspto">USPTO (US)</SelectItem>
                      <SelectItem value="epo">EPO (Europe)</SelectItem>
                      <SelectItem value="wipo">WIPO (International)</SelectItem>
                      <SelectItem value="all">All Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Classification</Label>
                  <Input placeholder="IPC or CPC classification" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Publication date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last1">Last year</SelectItem>
                      <SelectItem value="last5">Last 5 years</SelectItem>
                      <SelectItem value="last10">Last 10 years</SelectItem>
                      <SelectItem value="all">All dates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Patent status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="granted">Granted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="all">All Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Search className="h-4 w-4 mr-2" />
                Search Patents
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'market-analysis'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Analysis
              </DialogTitle>
              <DialogDescription>
                Analyze market trends, size, and opportunities for your innovation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">$2.3B</div>
                  <div className="text-sm text-muted-foreground">Market Size</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">+15.2%</div>
                  <div className="text-sm text-muted-foreground">Growth Rate</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-orange-600">42</div>
                  <div className="text-sm text-muted-foreground">Key Players</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Market Sector</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthtech">HealthTech</SelectItem>
                    <SelectItem value="edtech">EdTech</SelectItem>
                    <SelectItem value="cleantech">CleanTech</SelectItem>
                    <SelectItem value="agtech">AgTech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Geographic Region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="americas">Americas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'competitor-tracker'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Competitor Tracker
              </DialogTitle>
              <DialogDescription>
                Monitor competitors and track their activities, funding, and market position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add Competitor</Label>
                <div className="flex gap-2">
                  <Input placeholder="Company name" className="flex-1" />
                  <Button>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Competitors</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">TechCorp Solutions</div>
                      <div className="text-sm text-muted-foreground">Series B • $15M raised</div>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">InnovateLab</div>
                      <div className="text-sm text-muted-foreground">Seed • $2M raised</div>
                    </div>
                    <Badge variant="outline">Tracking</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">FutureTech Inc</div>
                      <div className="text-sm text-muted-foreground">Series A • $8M raised</div>
                    </div>
                    <Badge variant="outline">Watching</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Tracking
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={activeTool === 'collaboration-tools'} onOpenChange={() => setActiveTool(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaboration Tools
              </DialogTitle>
              <DialogDescription>
                Manage team collaboration, communication, and project coordination.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Team Members</span>
                    </div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Active collaborators</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">Messages</span>
                    </div>
                    <div className="text-2xl font-bold">24</div>
                    <div className="text-sm text-muted-foreground">Unread messages</div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Set Milestone
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Team Chat
                  </Button>
                </div>
              </div>
              <Button className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Users className="h-4 w-4 mr-2" />
                Open Team Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="literature" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Literature
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="literature" className="h-full space-y-0 mt-0">
              {/* Literature Tools */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
                <span className="text-sm font-medium text-muted-foreground">Literature Tools:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('literature-search')}
                >
                  <Search className="h-4 w-4" />
                  Literature Search
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('citation-generator')}
                >
                  <FileText className="h-4 w-4" />
                  Citation Generator
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('ai-research-assistant')}
                >
                  <Brain className="h-4 w-4" />
                  AI Research Assistant
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Literature Sources ({filteredSources.length})</h3>
                <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[75vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Research Source</DialogTitle>
                      <DialogDescription>
                        Add a new research source to your literature collection. Include bibliographic details and notes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={newSource.title}
                            onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter source title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newSource.type} onValueChange={(value: ResearchSource['type']) => 
                            setNewSource(prev => ({ ...prev, type: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="journal">Journal Article</SelectItem>
                              <SelectItem value="conference">Conference Paper</SelectItem>
                              <SelectItem value="book">Book</SelectItem>
                              <SelectItem value="report">Report</SelectItem>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="thesis">Thesis</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Authors *</Label>
                          <Input
                            value={newSource.authors}
                            onChange={(e) => setNewSource(prev => ({ ...prev, authors: e.target.value }))}
                            placeholder="Author 1, Author 2, Author 3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={newSource.year}
                            onChange={(e) => setNewSource(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={newSource.url}
                          onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Abstract</Label>
                        <Textarea
                          value={newSource.abstract}
                          onChange={(e) => setNewSource(prev => ({ ...prev, abstract: e.target.value }))}
                          placeholder="Brief summary of the source..."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input
                          value={newSource.keywords}
                          onChange={(e) => setNewSource(prev => ({ ...prev, keywords: e.target.value }))}
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={newSource.notes}
                          onChange={(e) => setNewSource(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Personal notes about this source..."
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={addSource} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          <Save className="h-4 w-4 mr-2" />
                          Add Source
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingSource(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-3">
                  {filteredSources.map((source) => {
                    const TypeIcon = sourceTypeIcons[source.type];
                    return (
                      <Card key={source.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium leading-tight">{source.title}</h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFavorite(source.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Star className={`h-4 w-4 ${source.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {source.favorite ? 'Remove from favorites' : 'Add to favorites'}
                                    </TooltipContent>
                                  </Tooltip>
                                  {source.url && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(source.url, '_blank')}
                                          className="h-8 w-8 p-0"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Open source</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-1">
                                {source.authors.join(', ')} ({source.year})
                              </p>
                              
                              {source.abstract && (
                                <p className="text-sm mt-2 line-clamp-2">{source.abstract}</p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="outline" className="text-xs">
                                  {source.type}
                                </Badge>
                                {source.citations && (
                                  <span className="text-xs text-muted-foreground">
                                    {source.citations} citations
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Added by {source.addedBy}
                                </span>
                              </div>
                              
                              {source.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {source.keywords.slice(0, 4).map((keyword, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {keyword}
                                    </Badge>
                                  ))}
                                  {source.keywords.length > 4 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{source.keywords.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="h-full space-y-0 mt-0">
              {/* Notes Tools */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
                <span className="text-sm font-medium text-muted-foreground">Notes Tools:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('methodology-planner')}
                >
                  <MapPin className="h-4 w-4" />
                  Methodology Planner
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('reference-manager')}
                >
                  <Bookmark className="h-4 w-4" />
                  Reference Manager
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('ai-research-assistant')}
                >
                  <Brain className="h-4 w-4" />
                  AI Research Assistant
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Research Notes ({filteredNotes.length})</h3>
                <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>Add Research Note</DialogTitle>
                      <DialogDescription>
                        Create a new research note with content, tags, and categorization for easy organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={newNote.title}
                            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter note title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newNote.category} onValueChange={(value: ResearchNote['category']) => 
                            setNewNote(prev => ({ ...prev, category: value }))
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hypothesis">Hypothesis</SelectItem>
                              <SelectItem value="observation">Observation</SelectItem>
                              <SelectItem value="methodology">Methodology</SelectItem>
                              <SelectItem value="insight">Insight</SelectItem>
                              <SelectItem value="todo">To Do</SelectItem>
                              <SelectItem value="question">Question</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Content *</Label>
                        <Textarea
                          value={newNote.content}
                          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your research note..."
                          rows={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <Input
                          value={newNote.tags}
                          onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="tag1, tag2, tag3"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={addNote} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                          <Save className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-3">
                  {filteredNotes.map((note) => {
                    const CategoryIcon = noteTypeIcons[note.category];
                    return (
                      <Card key={note.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${noteTypeColors[note.category]}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium leading-tight">{note.title}</h4>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {note.shared && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Share2 className="h-4 w-4 text-green-600" />
                                      </TooltipTrigger>
                                      <TooltipContent>Shared with team</TooltipContent>
                                    </Tooltip>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm mt-2">{note.content}</p>
                              
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="outline" className={`text-xs ${noteTypeColors[note.category]}`}>
                                  {note.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  By {note.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {note.createdDate}
                                </span>
                              </div>
                              
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {note.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="data" className="h-full space-y-0 mt-0">
              {/* Data Tools */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
                <span className="text-sm font-medium text-muted-foreground">Data Tools:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('data-analysis')}
                >
                  <Database className="h-4 w-4" />
                  Data Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('statistical-analysis')}
                >
                  <BarChart3 className="h-4 w-4" />
                  Statistical Analysis
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                  onClick={() => handleToolClick('survey-builder')}
                >
                  <Calculator className="h-4 w-4" />
                  Survey Builder
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Research Data ({dataSets.length})</h3>
                <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>

              <ScrollArea className="h-[calc(100%-4rem)]">
                <div className="space-y-3">
                  {dataSets.map((dataset) => (
                    <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                            <Database className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium leading-tight">{dataset.name}</h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">{dataset.description}</p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="outline" className="text-xs">
                                {dataset.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {dataset.size} records
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {dataset.format}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                By {dataset.uploadedBy}
                              </span>
                              {dataset.public && (
                                <Badge variant="secondary" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                            
                            {dataset.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {dataset.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analysis" className="h-full space-y-0 mt-0">
              {/* Analysis Tools */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
                <span className="text-sm font-medium text-muted-foreground">Analysis Tools:</span>
                {getProjectSpecificTools().filter(tool => 
                  ['statistical-analysis', 'data-analysis', 'ai-research-assistant', 'impact-tracker', 'patent-search', 'market-analysis', 'competitor-tracker'].includes(tool.id)
                ).map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Button 
                      key={tool.id} 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 hover:bg-[#021ff6] hover:text-white transition-colors"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <Icon className="h-4 w-4" />
                      {tool.name}
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Research Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{researchSources.length}</div>
                        <div className="text-sm text-muted-foreground">Sources</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{researchNotes.length}</div>
                        <div className="text-sm text-muted-foreground">Notes</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{dataSets.length}</div>
                        <div className="text-sm text-muted-foreground">Datasets</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {researchSources.filter(s => s.favorite).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Favorites</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Research Progress
                  </h3>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Analysis tools will provide insights into your research patterns, 
                        collaboration trends, and knowledge gaps.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Literature Review</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Data Collection</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analysis</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
