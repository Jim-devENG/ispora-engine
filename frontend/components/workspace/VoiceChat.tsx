import React, { useState, useRef, useEffect } from "react";
import { workspaceAPI } from "../../src/utils/api";
import { toast } from "sonner";
import { unsubscribeAll } from "../../src/utils/supabaseRealtime";
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Paperclip,
  Play,
  Pause,
  Download,
  Trash2,
  MoreHorizontal,
  Phone,
  Video,
  Smile
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  sender: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'file';
  duration?: number; // for voice messages in seconds
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
}

interface VoiceNote {
  id: string;
  title: string;
  duration: number;
  url: string;
  timestamp: Date;
  sender: string;
  senderAvatar?: string;
  tags?: string[];
  transcript?: string;
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
}

interface VoiceChatProps {
  mentee: Mentee;
  projectId?: string;
}

// Removed mock data - all messages and voice notes now come from the backend API

function MessageBubble({ message, isOwnMessage }: { message: Message; isOwnMessage: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.sender} />
          <AvatarFallback className="text-xs">
            {message.sender.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : ''}`}>
        <div className={`rounded-lg px-4 py-2 ${
          isOwnMessage 
            ? 'bg-[#021ff6] text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {message.type === 'text' && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {message.type === 'voice' && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isOwnMessage ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <div className={`h-1 rounded-full ${isOwnMessage ? 'bg-white/30' : 'bg-gray-300'}`}>
                  <div 
                    className={`h-1 rounded-full ${isOwnMessage ? 'bg-white' : 'bg-[#021ff6]'}`}
                    style={{ width: `${(currentTime / (message.duration || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                {formatDuration(message.duration || 0)}
              </span>
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName}</p>
                <p className={`text-xs ${isOwnMessage ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatFileSize(message.fileSize || 0)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${isOwnMessage ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-200'}`}
                asChild
              >
                <a href={message.fileUrl} download>
                  <Download className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
          {isOwnMessage && message.isRead && (
            <div className="text-xs text-blue-600 font-medium">Read</div>
          )}
        </div>
      </div>
      
      {isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.sender} />
          <AvatarFallback className="text-xs">
            {message.sender.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function VoiceNoteCard({ voiceNote, onPlay, onDelete }: {
  voiceNote: VoiceNote;
  onPlay: (note: VoiceNote) => void;
  onDelete: (noteId: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{voiceNote.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={voiceNote.senderAvatar} alt={voiceNote.sender} />
                  <AvatarFallback className="text-xs">
                    {voiceNote.sender.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">{voiceNote.sender}</span>
                <span className="text-xs text-gray-500">• {formatDate(voiceNote.timestamp)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={voiceNote.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(voiceNote.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Play Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                setIsPlaying(!isPlaying);
                onPlay(voiceNote);
              }}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-1 bg-gray-200 rounded-full">
                <div className="h-1 bg-[#021ff6] rounded-full w-0" />
              </div>
            </div>
            <span className="text-xs text-gray-500">{formatDuration(voiceNote.duration)}</span>
          </div>

          {/* Tags */}
          {voiceNote.tags && voiceNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {voiceNote.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Transcript Preview */}
          {voiceNote.transcript && (
            <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
              <p className="line-clamp-2">{voiceNote.transcript}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function VoiceChat({ mentee, projectId }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice-notes'>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user from auth (simplified - should come from auth context)
  const currentUser = "Dr. Amina Hassan"; // TODO: Get from auth context
  const currentUserAvatar = "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face"; // TODO: Get from auth context

  // Fetch messages and voice notes from API
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setIsLoading(false);
        setMessages([]);
        setVoiceNotes([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch messages
        // Fetch messages from Supabase
        let messagesData: any[] = [];
        try {
          const { getProjectMessages } = await import('../../src/utils/supabaseQueries');
          messagesData = await getProjectMessages(projectId);
        } catch (supabaseError) {
          // TODO: REMOVE_AFTER_SUPABASE_MIGRATION - Fallback to legacy API
          if (import.meta.env.DEV) {
            console.warn('Supabase query failed, trying legacy API:', supabaseError);
          }
          messagesData = await workspaceAPI.getMessages(projectId);
        }
        
        const transformedMessages: Message[] = (Array.isArray(messagesData) ? messagesData : []).map((m: any) => ({
          id: m.id,
          content: m.content,
          sender: m.senderName || m.sender || m.sender_name,
          senderAvatar: m.senderAvatar || m.sender_avatar,
          timestamp: new Date(m.timestamp),
          type: m.type || 'text',
          duration: m.duration,
          fileUrl: m.fileUrl || m.file_url,
          fileName: m.fileName || m.file_name,
          fileSize: m.fileSize || m.file_size,
          isRead: m.isRead !== undefined ? m.isRead : (m.is_read !== undefined ? m.is_read : false),
        }));
        setMessages(transformedMessages);

        // Fetch voice notes from Supabase
        let voiceNotesData: any[] = [];
        try {
          const { getProjectVoiceNotes } = await import('../../src/utils/supabaseQueries');
          voiceNotesData = await getProjectVoiceNotes(projectId);
        } catch (supabaseError) {
          console.warn('Supabase query failed, trying legacy API:', supabaseError);
          // Fallback to legacy API during migration
          voiceNotesData = await workspaceAPI.getVoiceNotes(projectId);
        }
        
        const transformedVoiceNotes: VoiceNote[] = (Array.isArray(voiceNotesData) ? voiceNotesData : []).map((vn: any) => ({
          id: vn.id,
          title: vn.title,
          duration: vn.duration,
          url: vn.url,
          timestamp: new Date(vn.timestamp),
          sender: vn.sender,
          senderAvatar: vn.senderAvatar || vn.sender_avatar,
          tags: vn.tags || [],
          transcript: vn.transcript,
        }));
        setVoiceNotes(transformedVoiceNotes);
      } catch (err: any) {
        console.error('Failed to fetch messages/voice notes:', err);
        setError(err.message || 'Failed to load messages');
        setMessages([]);
        setVoiceNotes([]);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time message and voice note updates
    if (projectId) {
      let realtimeChannels: any[] = [];
      const setupRealtime = async () => {
        try {
          const { subscribeToProjectMessages, subscribeToProjectVoiceNotes, unsubscribeAll } = await import('../../src/utils/supabaseRealtime');
          
          // Subscribe to messages
          const messageChannel = subscribeToProjectMessages(projectId, {
            onInsert: async () => {
              // Refresh messages when a new message is sent
              const { getProjectMessages } = await import('../../src/utils/supabaseQueries');
              const messagesData = await getProjectMessages(projectId);
              const transformedMessages: Message[] = (Array.isArray(messagesData) ? messagesData : []).map((m: any) => ({
                id: m.id,
                content: m.content,
                sender: m.senderName || m.sender || m.sender_name,
                senderAvatar: m.senderAvatar || m.sender_avatar,
                timestamp: new Date(m.timestamp),
                type: m.type || 'text',
                duration: m.duration,
                fileUrl: m.fileUrl || m.file_url,
                fileName: m.fileName || m.file_name,
                fileSize: m.fileSize || m.file_size,
                isRead: m.isRead !== undefined ? m.isRead : (m.is_read !== undefined ? m.is_read : false),
              }));
              setMessages(transformedMessages);
            },
          });
          
          // Subscribe to voice notes
          const voiceNoteChannel = subscribeToProjectVoiceNotes(projectId, {
            onInsert: async () => {
              // Refresh voice notes when a new voice note is created
              const { getProjectVoiceNotes } = await import('../../src/utils/supabaseQueries');
              const voiceNotesData = await getProjectVoiceNotes(projectId);
              const transformedVoiceNotes: VoiceNote[] = (Array.isArray(voiceNotesData) ? voiceNotesData : []).map((vn: any) => ({
                id: vn.id,
                title: vn.title,
                duration: vn.duration,
                url: vn.url,
                timestamp: new Date(vn.timestamp),
                sender: vn.sender,
                senderAvatar: vn.senderAvatar || vn.sender_avatar,
                tags: vn.tags || [],
                transcript: vn.transcript,
              }));
              setVoiceNotes(transformedVoiceNotes);
            },
          });
          
          realtimeChannels.push(messageChannel, voiceNoteChannel);
        } catch (error) {
          console.warn('Failed to setup real-time subscriptions:', error);
        }
      };
      
      setupRealtime();
      
      return () => {
        if (realtimeChannels.length > 0) {
          unsubscribeAll(realtimeChannels);
        }
      };
    }
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !projectId) return;

    try {
      const messageData = {
        recipientId: mentee.id,
        content: newMessage.trim(),
        type: 'text' as const,
      };

      // Try Supabase first
      let created;
      try {
        const { createMessage } = await import('../../src/utils/supabaseMutations');
        created = await createMessage(projectId, messageData);
      } catch (supabaseError) {
        console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
        created = await workspaceAPI.sendMessage(projectId, {
          recipientId: mentee.id,
          message: newMessage.trim(),
        });
      }
      
      const newMessageObj: Message = {
        id: created.id,
        content: created.content,
        sender: created.senderName || currentUser,
        senderAvatar: created.senderAvatar || currentUserAvatar,
        timestamp: new Date(created.timestamp),
        type: created.type || 'text',
        isRead: created.read || false,
      };

      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage("");
    } catch (err: any) {
      console.error('Failed to send message:', err);
      toast.error(err.message || 'Failed to send message');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Start recording logic here
  };

  const handleStopRecording = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      setIsRecording(false);
      setRecordingTime(0);
      return;
    }

    setIsRecording(false);
    
    try {
      // TODO: In a real implementation, you would:
      // 1. Get the recorded audio blob from MediaRecorder
      // 2. Upload it to Supabase Storage
      // 3. Get the URL and use it below
      
      // For now, we'll create a placeholder URL
      // In production, replace this with actual file upload
      let voiceNoteUrl = "#";
      
      // Example: If you have an audio blob from MediaRecorder:
      // const audioBlob = new Blob([audioData], { type: 'audio/webm' });
      // const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
      // const { uploadVoiceNote } = await import('../../src/utils/supabaseStorage');
      // const uploadResult = await uploadVoiceNote(audioFile, projectId);
      // voiceNoteUrl = uploadResult.publicUrl;
      
      // Create voice note
      const voiceNoteData = {
        title: `Voice message ${new Date().toLocaleString()}`,
        duration: recordingTime,
        url: voiceNoteUrl,
        tags: [],
        transcript: undefined, // TODO: Add transcription if available
      };

      // Try Supabase first
      let created;
      try {
        const { createVoiceNote } = await import('../../src/utils/supabaseMutations');
        created = await createVoiceNote(projectId, voiceNoteData);
      } catch (supabaseError) {
        console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
        created = await workspaceAPI.createVoiceNote(projectId, voiceNoteData);
      }
      
      const newVoiceNote: VoiceNote = {
        id: created.id,
        title: created.title,
        duration: created.duration,
        url: created.url,
        timestamp: new Date(created.timestamp),
        sender: created.sender,
        senderAvatar: created.senderAvatar,
        tags: created.tags || [],
        transcript: created.transcript,
      };

      setVoiceNotes(prev => [...prev, newVoiceNote]);
      setRecordingTime(0);
      toast.success('Voice note saved');
    } catch (err: any) {
      console.error('Failed to save voice note:', err);
      toast.error(err.message || 'Failed to save voice note');
      setRecordingTime(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId) return;

    try {
      // Upload file to Supabase Storage first
      let fileUrl = "#";
      let uploadedPath = "";
      
      try {
        const { uploadProjectFile } = await import('../../src/utils/supabaseStorage');
        const uploadResult = await uploadProjectFile(file, projectId, 'documents');
        fileUrl = uploadResult.publicUrl;
        uploadedPath = uploadResult.path;
      } catch (uploadError) {
        console.warn('Supabase Storage upload failed, trying legacy API:', uploadError);
        // Fallback to legacy upload API
        try {
          const { uploadAPI } = await import('../../src/utils/api');
          const uploadResult = await uploadAPI.uploadFile(file);
          fileUrl = uploadResult.url || uploadResult.path || "#";
          uploadedPath = uploadResult.path || uploadResult.id || "";
        } catch (legacyError) {
          console.error('File upload failed:', legacyError);
          toast.error('Failed to upload file');
          return;
        }
      }

      const fileMessageData = {
        recipientId: mentee.id,
        content: file.name,
        type: 'file' as const,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: fileUrl,
      };

      // Try Supabase first
      let created;
      try {
        const { createMessage } = await import('../../src/utils/supabaseMutations');
        created = await createMessage(projectId, fileMessageData);
      } catch (supabaseError) {
        console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
        created = await workspaceAPI.sendMessage(projectId, {
          recipientId: mentee.id,
          message: file.name,
          type: 'file',
          fileName: file.name,
          fileSize: file.size,
          fileUrl: fileUrl,
        });
      }
      
      const fileMessage: Message = {
        id: created.id,
        content: created.content,
        sender: created.senderName || currentUser,
        senderAvatar: created.senderAvatar || currentUserAvatar,
        timestamp: new Date(created.timestamp),
        type: created.type || 'file',
        fileName: created.fileName,
        fileSize: created.fileSize,
        fileUrl: created.fileUrl || "#",
        isRead: created.read || false,
      };

      setMessages(prev => [...prev, fileMessage]);
      toast.success('File sent');
    } catch (err: any) {
      console.error('Failed to send file:', err);
      toast.error(err.message || 'Failed to send file');
    }
  };

  const handlePlayVoiceNote = (note: VoiceNote) => {
    console.log("Playing voice note:", note.title);
    // TODO: Implement audio playback
  };

  const handleDeleteVoiceNote = async (noteId: string) => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    if (!confirm('Are you sure you want to delete this voice note?')) {
      return;
    }

    try {
      // TODO: Add delete endpoint to API if needed
      // await workspaceAPI.deleteVoiceNote(projectId, noteId);
      setVoiceNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success('Voice note deleted');
    } catch (err: any) {
      console.error('Failed to delete voice note:', err);
      toast.error(err.message || 'Failed to delete voice note');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Voice & Chat</h3>
            <p className="text-gray-600">Communicate with {mentee.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-[#021ff6] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="h-4 w-4 inline mr-2" />
            Chat ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('voice-notes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'voice-notes'
                ? 'bg-white text-[#021ff6] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mic className="h-4 w-4 inline mr-2" />
            Voice Notes ({voiceNotes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-500 mb-4">{error}</p>
                      <Button onClick={() => window.location.reload()} variant="outline">
                        Retry
                      </Button>
                    </div>
                  ) : !projectId ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Project ID required</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwnMessage={message.sender === currentUser}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 border-t bg-white">
              {isRecording && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-700">Recording: {formatDuration(recordingTime)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStopRecording}
                      className="ml-auto"
                    >
                      Stop & Send
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={isRecording ? 'text-red-600' : ''}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                  disabled={isRecording}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isRecording}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading voice notes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Retry
                    </Button>
                  </div>
                ) : !projectId ? (
                  <div className="text-center py-12">
                    <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Project ID required</p>
                  </div>
                ) : voiceNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No voice notes yet</h3>
                    <p className="text-gray-500">Voice messages will appear here for easy access</p>
                  </div>
                ) : (
                  voiceNotes.map((note) => (
                    <VoiceNoteCard
                      key={note.id}
                      voiceNote={note}
                      onPlay={handlePlayVoiceNote}
                      onDelete={handleDeleteVoiceNote}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}