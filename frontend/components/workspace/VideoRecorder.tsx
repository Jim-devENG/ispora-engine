import React, { useState, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  Settings,
  Camera,
  Save
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

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
  university: string;
  program: string;
  year: string;
}

interface VideoRecorderProps {
  mentee: Mentee;
}

// Mock recordings data
const mockRecordings: Recording[] = [
  {
    id: "1",
    title: "Introduction to Feature Engineering",
    description: "A comprehensive walkthrough of feature engineering techniques for machine learning projects",
    duration: 1245, // 20:45
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: 'both',
    tags: ["machine-learning", "feature-engineering", "tutorial"],
    size: 89456789,
    status: 'ready'
  },
  {
    id: "2",
    title: "Career Path Discussion - AI/ML Roles",
    description: "Exploring different career opportunities in AI and Machine Learning",
    duration: 892, // 14:52
    url: "#",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    type: 'webcam',
    tags: ["career", "ai", "ml", "advice"],
    size: 67234567,
    status: 'ready'
  },
  {
    id: "3",
    title: "Code Review Session",
    description: "Reviewing the student's machine learning project implementation",
    duration: 654, // 10:54
    url: "#",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'screen',
    tags: ["code-review", "python", "debugging"],
    size: 45678912,
    status: 'processing'
  }
];

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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
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
                    className="bg-black/70 hover:bg-black/80 text-white rounded-full h-12 w-12 p-0"
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
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-1">{recording.title}</h4>
                {recording.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{recording.description}</p>
                )}
              </div>
              <Badge className={statusColors[recording.status]}>
                {recording.status}
              </Badge>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  <span className="capitalize">{recording.type}</span>
                </div>
                <span>{formatFileSize(recording.size)}</span>
                <span>{formatDate(recording.timestamp)}</span>
              </div>
            </div>

            {/* Tags */}
            {recording.tags && recording.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recording.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {recording.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    +{recording.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t">
              {recording.status === 'ready' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onPlay(recording)}>
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={recording.url} download>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </a>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => onEdit(recording)}>
                <Settings className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(recording.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VideoRecorder({ mentee }: VideoRecorderProps) {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingType, setRecordingType] = useState<'screen' | 'webcam' | 'both'>('both');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
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

  const handleSaveRecording = (title: string, description: string, tags: string[]) => {
    const newRecording: Recording = {
      id: Date.now().toString(),
      title,
      description,
      duration: recordingTime,
      url: "#",
      timestamp: new Date(),
      type: recordingType,
      tags,
      size: Math.floor(Math.random() * 100000000), // Mock size
      status: 'processing'
    };

    setRecordings(prev => [newRecording, ...prev]);
    setShowSaveDialog(false);
    setRecordingTime(0);

    // Simulate processing
    setTimeout(() => {
      setRecordings(prev => prev.map(r => 
        r.id === newRecording.id ? { ...r, status: 'ready' as const } : r
      ));
    }, 3000);
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Video Recorder</h3>
            <p className="text-gray-600">Create mini lessons for {mentee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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
                  <div>
                    <Label htmlFor="fps">Frame Rate</Label>
                    <Select value={settings.fps.toString()} onValueChange={(value) => setSettings(prev => ({ ...prev, fps: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
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
              <Label>Record:</Label>
              <Select value={recordingType} onValueChange={(value: any) => setRecordingType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Screen Only</SelectItem>
                  <SelectItem value="webcam">Webcam Only</SelectItem>
                  <SelectItem value="both">Screen + Webcam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
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
          <div className="text-center">
            <div className="text-2xl font-semibold text-[#021ff6]">{totalRecordings}</div>
            <div className="text-sm text-gray-600">Recordings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">{formatDuration(totalDuration)}</div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">{formatFileSize(totalSize)}</div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Recordings Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
          {recordings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
              <p className="text-gray-500 mb-4">Create your first mini lesson for {mentee.name}</p>
              <Button onClick={handleStartRecording} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                <Video className="h-4 w-4 mr-2" />
                Start First Recording
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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