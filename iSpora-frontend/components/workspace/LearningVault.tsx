import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, 
  Play, 
  Eye, 
  Download, 
  Filter, 
  Search, 
  Star, 
  Clock, 
  User,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Pause,
  Square,
  RotateCcw,
  Upload,
  Trash2,
  Settings,
  Camera,
  Save,
  Plus,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface LearningContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'recording';
  category: 'orientation' | 'skills' | 'reflections' | 'tools' | 'recordings';
  duration?: number;
  thumbnail?: string;
  url: string;
  progress: number;
  rating?: number;
  uploadDate: Date;
  lastAccessed?: Date;
  tags: string[];
  size?: number;
  status?: 'processing' | 'ready' | 'failed';
}

interface Recording {
  id: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  url: string;
  thumbnail?: string;
  timestamp: Date;
  type: 'screen' | 'webcam' | 'both';
  tags?: string[];
  size: number; // in bytes
  status: 'processing' | 'ready' | 'failed';
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
}

interface LearningVaultProps {
  mentee: Mentee;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

// No mock recordings

const categoryConfig = {
  orientation: { label: "Orientation", color: "bg-blue-100 text-blue-800" },
  skills: { label: "Skills", color: "bg-green-100 text-green-800" },
  reflections: { label: "Reflections", color: "bg-purple-100 text-purple-800" },
  tools: { label: "Tools", color: "bg-orange-100 text-orange-800" },
  recordings: { label: "Recordings", color: "bg-red-100 text-red-800" }
};

const typeIcons = {
  video: Play,
  document: BookOpen,
  quiz: Star,
  assignment: User,
  recording: Video
};

const recordingTypeIcons = {
  screen: Monitor,
  webcam: Camera,
  both: Video
};

const statusColors = {
  processing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

function ContentCard({ content, onView }: {
  content: LearningContent;
  onView: (content: LearningContent) => void;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  const TypeIcon = typeIcons[content.type];
  const categoryInfo = categoryConfig[content.category];

  return (
    <Card className="card-gradient card-hover-lift cursor-pointer overflow-hidden" onClick={() => onView(content)}>
      <CardContent className="p-3 card-content">
        <div className="space-y-2 min-h-0">
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {content.thumbnail ? (
                <img src={content.thumbnail} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TypeIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="absolute top-1 left-1">
                <Badge className="badge-primary text-xs px-1.5 py-0.5">{categoryInfo.label}</Badge>
              </div>
              {content.duration && (
                <div className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                  {formatDuration(content.duration)}
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0">
            <h4 className="font-medium text-xs line-clamp-1 break-words">{content.title}</h4>
            <div className="flex justify-between text-xs mt-1">
              <span className="truncate">{content.progress}%</span>
              {content.rating && <span className="truncate">★ {content.rating}</span>}
            </div>
            <Progress value={content.progress} className="h-1 mt-1 progress-gradient" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecordingCard({ recording, onPlay, onDelete, onEdit }: {
  recording: Recording;
  onPlay: (recording: Recording) => void;
  onDelete: (recordingId: string) => void;
  onEdit: (recording: Recording) => void;
}) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const TypeIcon = recordingTypeIcons[recording.type];

  return (
    <Card className="card-gradient card-hover-lift overflow-hidden">
      <CardContent className="p-4 card-content">
        <div className="space-y-3 min-h-0">
          {/* Thumbnail and Play Button */}
          <div className="relative">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {recording.thumbnail ? (
                <img 
                  src={recording.thumbnail} 
                  alt={recording.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {recording.status === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => onPlay(recording)}
                    className="btn-primary-gradient rounded-full h-12 w-12 p-0 pulse-blue"
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
              )}
              {recording.status === 'processing' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {formatDuration(recording.duration)}
              </div>
            </div>
          </div>

          {/* Recording Info */}
          <div className="space-y-2 min-h-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 break-words">{recording.title}</h4>
                {recording.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1 break-words">{recording.description}</p>
                )}
              </div>
              <Badge className="badge-accent flex-shrink-0">
                {recording.status}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500 min-h-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <TypeIcon className="h-3 w-3" />
                  <span className="capitalize truncate">{recording.type}</span>
                </div>
                <span className="truncate">{formatFileSize(recording.size)}</span>
                <span className="truncate">{formatDate(recording.timestamp)}</span>
              </div>
            </div>

            {/* Tags */}
            {recording.tags && recording.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 min-h-0">
                {recording.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} className="badge-accent text-xs px-1.5 py-0.5 truncate max-w-[80px]">
                    {tag}
                  </Badge>
                ))}
                {recording.tags.length > 3 && (
                  <Badge className="badge-accent text-xs px-1.5 py-0.5 flex-shrink-0">
                    +{recording.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 border-t border-blue-100 flex-wrap">
              {recording.status === 'ready' && (
                <>
                  <Button size="sm" onClick={() => onPlay(recording)} className="btn-primary-gradient flex-shrink-0">
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" asChild className="btn-secondary-blue flex-shrink-0">
                    <a href={recording.url} download>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </Button>
                </>
              )}
              <Button size="sm" onClick={() => onEdit(recording)} className="btn-secondary-blue flex-shrink-0">
                <Settings className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(recording.id)} className="flex-shrink-0 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoRecorderPanel({ mentee, onBackToLibrary }: {
  mentee: Mentee;
  onBackToLibrary: () => void;
}) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingType, setRecordingType] = useState<'screen' | 'webcam' | 'both'>('both');
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);

  // Recording settings
  const [settings, setSettings] = useState({
    includeAudio: true,
    includeMicrophone: true,
    quality: 'high',
    fps: 30
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Start recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setShowSaveDialog(true);
    // Stop recording logic here
  };

  const handlePauseRecording = () => {
    // Pause recording logic here
  };

  const handleSaveRecording = async (title: string, description: string, tags: string[]) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const devKey = localStorage.getItem('devKey');
      const token = localStorage.getItem('token');
      if (devKey) headers['X-Dev-Key'] = devKey;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const body = {
        title,
        description,
        duration: recordingTime,
        url: '#',
        transcript: null
      };
      const res = await fetch(`${API_BASE_URL}/learning/recordings`, { method: 'POST', headers, body: JSON.stringify(body) });
      const json = await res.json();
      const r = json.data || json;
      const created: Recording = {
        id: r.id,
        title: r.title,
        description: r.description || undefined,
        duration: r.duration || recordingTime,
        url: r.url || '#',
        timestamp: new Date(r.created_at || Date.now()),
        type: recordingType,
        tags,
        size: 0,
        status: 'ready'
      };
      setRecordings(prev => [created, ...prev]);
      setShowSaveDialog(false);
      setRecordingTime(0);
    } catch {}
  };

  const handlePlayRecording = (recording: Recording) => {
    console.log("Playing recording:", recording.title);
    // Play recording logic here
  };

  const handleDeleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
  };

  const handleEditRecording = (recording: Recording) => {
    setEditingRecording(recording);
    setShowSaveDialog(true);
  };

  const totalRecordings = recordings.length;
  const totalDuration = recordings.reduce((acc, r) => acc + r.duration, 0);
  const totalSize = recordings.reduce((acc, r) => acc + r.size, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-pattern">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b glass-effect">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBackToLibrary} className="btn-secondary-blue">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-gradient">Video Recorder</h3>
              <p className="text-gray-600">Create mini lessons for {mentee.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button size="sm" className="btn-secondary-blue">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recording Settings</DialogTitle>
                  <DialogDescription>
                    Configure your recording preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeAudio">Include System Audio</Label>
                    <Switch
                      id="includeAudio"
                      checked={settings.includeAudio}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeAudio: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeMicrophone">Include Microphone</Label>
                    <Switch
                      id="includeMicrophone"
                      checked={settings.includeMicrophone}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeMicrophone: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quality">Video Quality</Label>
                    <Select value={settings.quality} onValueChange={(value) => setSettings(prev => ({ ...prev, quality: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (480p)</SelectItem>
                        <SelectItem value="medium">Medium (720p)</SelectItem>
                        <SelectItem value="high">High (1080p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            {!isRecording ? (
              <Button onClick={handleStartRecording} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handlePauseRecording}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button variant="destructive" onClick={handleStopRecording}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        {!isRecording && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-gray-700 font-medium">Record:</Label>
              <Select value={recordingType} onValueChange={(value: any) => setRecordingType(value)}>
                <SelectTrigger className="w-40 input-beautiful">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Screen Only</SelectItem>
                  <SelectItem value="webcam">Webcam Only</SelectItem>
                  <SelectItem value="both">Screen + Webcam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleStartRecording}
              className="btn-primary-gradient pulse-blue"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 flex items-center justify-between shadow-blue">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium text-red-700">Recording</span>
              </div>
              <span className="text-red-600 font-mono">{formatDuration(recordingTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Monitor className="h-4 w-4" />
              <span className="capitalize">{recordingType}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center card-gradient p-4 rounded-lg shadow-blue">
            <div className="text-2xl font-semibold text-gradient">{totalRecordings}</div>
            <div className="text-sm text-gray-600">Recordings</div>
          </div>
          <div className="text-center card-gradient p-4 rounded-lg shadow-blue">
            <div className="text-2xl font-semibold text-gradient">{formatDuration(totalDuration)}</div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
          <div className="text-center card-gradient p-4 rounded-lg shadow-blue">
            <div className="text-2xl font-semibold text-gradient">{formatFileSize(totalSize)}</div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full scrollbar-beautiful">
          <div className="px-8 py-6">
          {recordings.length === 0 ? (
            <div className="text-center py-12">
              <div className="float-animation">
                <Video className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gradient mb-2">No recordings yet</h3>
              <p className="text-gray-500 mb-4">Create your first mini lesson for {mentee.name}</p>
              <Button onClick={handleStartRecording} className="btn-primary-gradient pulse-blue">
                <Video className="h-4 w-4 mr-2" />
                Start First Recording
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onPlay={handlePlayRecording}
                  onDelete={handleDeleteRecording}
                  onEdit={handleEditRecording}
                />
              ))}
            </div>
          )}
          </div>
        </ScrollArea>
      </div>

      {/* Save Recording Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRecording ? 'Edit Recording' : 'Save Recording'}
            </DialogTitle>
            <DialogDescription>
              {editingRecording 
                ? 'Update recording details'
                : 'Add details for your new recording'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recording Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Introduction to Machine Learning"
                defaultValue={editingRecording?.title}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief description of what you covered..."
                defaultValue={editingRecording?.description}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input 
                id="tags" 
                placeholder="e.g., machine-learning, tutorial, beginner"
                defaultValue={editingRecording?.tags?.join(', ')}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                onClick={() => handleSaveRecording("Sample Title", "Sample Description", ["sample"])}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRecording ? 'Update' : 'Save'} Recording
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LearningVault({ mentee }: LearningVaultProps) {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeView, setActiveView] = useState<"library" | "recorder">("library");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/learning/content`, { headers, signal: controller.signal });
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        const mapped: LearningContent[] = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          type: (r.type || 'document'),
          category: 'tools',
          duration: undefined,
          url: r.url || '#',
          progress: 0,
          uploadDate: new Date(r.created_at || Date.now()),
          tags: r.tags ? String(r.tags).split(',').filter(Boolean) : []
        }));
        setContent(mapped);
      } catch {
        setContent([]);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { controller.abort(); clearInterval(id); };
  }, []);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (activeView === "recorder") {
    return <VideoRecorderPanel mentee={mentee} onBackToLibrary={() => setActiveView("library")} />;
  }

  return (
    <div className="flex flex-col bg-pattern">
      <div className="flex-shrink-0 px-8 py-6 border-b glass-effect">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gradient">Learning Vault</h3>
            <p className="text-gray-600">Curated content and recordings for {mentee.name}</p>
          </div>
          <Button 
            onClick={() => setActiveView("recorder")}
            className="btn-primary-gradient float-animation"
          >
            <Video className="h-4 w-4 mr-2" />
            Create Recording
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="recordings">My Recordings</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-beautiful"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 input-beautiful">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="orientation">Orientation</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="recordings">Recordings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredContent.map((item) => (
                <ContentCard key={item.id} content={item} onView={() => console.log("View", item.title)} />
              ))}
              {/* No mock recordings listed here */}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredContent.filter(item => item.type === 'video').map((item) => (
                <ContentCard key={item.id} content={item} onView={() => console.log("View", item.title)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredContent.filter(item => item.type === 'document').map((item) => (
                <ContentCard key={item.id} content={item} onView={() => console.log("View", item.title)} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recordings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockRecordings.map((recording) => (
                <RecordingCard 
                  key={recording.id} 
                  recording={recording} 
                  onPlay={() => console.log("Play", recording.title)}
                  onDelete={() => console.log("Delete", recording.id)}
                  onEdit={() => console.log("Edit", recording.title)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
