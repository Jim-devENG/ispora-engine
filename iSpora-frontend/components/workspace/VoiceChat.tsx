import React, { useState, useRef } from "react";
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
}

// Start with empty messages; populate in real-time
const initialMessages: Message[] = [];

// Start with no voice notes
const initialVoiceNotes: VoiceNote[] = [];

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
      
      <div className={`max-w-sm lg:max-w-lg xl:max-w-xl ${isOwnMessage ? 'order-1' : ''}`}>
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

export function VoiceChat({ mentee }: VoiceChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(initialVoiceNotes);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice-notes'>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use logged-in user if available in localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const currentUser = storedUser?.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : (storedUser?.email?.split('@')[0] || 'User');
  const currentUserAvatar = storedUser?.avatar || undefined;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: currentUser,
      senderAvatar: currentUserAvatar,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Start recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Create voice message
    const voiceMessage: Message = {
      id: Date.now().toString(),
      content: "Voice message",
      sender: currentUser,
      senderAvatar: currentUserAvatar,
      timestamp: new Date(),
      type: 'voice',
      duration: recordingTime,
      fileUrl: "#",
      isRead: false
    };

    setMessages(prev => [...prev, voiceMessage]);
    setRecordingTime(0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileMessage: Message = {
      id: Date.now().toString(),
      content: file.name,
      sender: currentUser,
      senderAvatar: currentUserAvatar,
      timestamp: new Date(),
      type: 'file',
      fileName: file.name,
      fileSize: file.size,
      fileUrl: "#",
      isRead: false
    };

    setMessages(prev => [...prev, fileMessage]);
  };

  const handlePlayVoiceNote = (note: VoiceNote) => {
    console.log("Playing voice note:", note.title);
  };

  const handleDeleteVoiceNote = (noteId: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b bg-white">
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
                <div className="px-8 py-6 space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender === currentUser}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 px-8 py-4 border-t bg-white">
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
              <div className="px-8 py-6 space-y-4">
                {voiceNotes.length === 0 ? (
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
