import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  MessageCircle,
  Send,
  Monitor,
  MonitorOff,
  Clock,
  Circle,
  X,
  ChevronRight,
  Share,
  Paperclip,
  Smile
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  isOnline?: boolean;
}

interface LiveSessionProps {
  mentee: Mentee;
  sessionTitle?: string;
  sessionDescription?: string;
  isHost?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  avatar?: string;
  isCurrentUser?: boolean;
  type?: 'message' | 'system';
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  hasVideo: boolean;
  isCurrentUser?: boolean;
  role: 'mentor' | 'mentee' | 'participant';
  isOnline: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

// Mock participants
const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Dr. Jane",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
    isMuted: false,
    hasVideo: true,
    isCurrentUser: true,
    role: 'mentor',
    isOnline: true
  },
  {
    id: "2",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    isMuted: false,
    hasVideo: true,
    role: 'mentee',
    isOnline: true
  }
];

function SessionTimer() {
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Circle className="h-3 w-3 text-red-500 fill-current live-indicator" />
      <span className="font-mono">{formatTime(duration)}</span>
    </div>
  );
}

function VideoArea({ isInSession, onJoinSession, isScreenSharing }: { 
  isInSession: boolean; 
  onJoinSession: () => void;
  isScreenSharing: boolean;
}) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full h-full min-h-[300px] flex items-center justify-center">
      {!isInSession ? (
        // Pre-session state
        <div className="text-center text-white p-6">
          <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg mb-2">Ready to start?</h3>
          <p className="text-gray-300 mb-6">Click "Join Session" to start the video call</p>
          <Button 
            onClick={onJoinSession}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
          >
            <Video className="h-4 w-4 mr-2" />
            Join Session
          </Button>
        </div>
      ) : (
        // In-session state
        <div className="w-full h-full relative video-call-join">
          {/* Main video area */}
          <div className="absolute inset-0">
            {isScreenSharing ? (
              // Screen sharing view
              <div className="w-full h-full bg-gray-800 flex items-center justify-center screen-sharing">
                <div className="text-center text-white">
                  <Monitor className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Screen Share Active</p>
                  <p className="text-sm text-gray-300">Dr. Jane is sharing her screen</p>
                </div>
              </div>
            ) : (
              // Video grid view
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full h-full p-2">
                {mockParticipants.map((participant, index) => (
                  <div 
                    key={participant.id}
                    className={`relative rounded-lg overflow-hidden video-tile ${
                      index === 0 ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                                  : 'bg-gradient-to-br from-green-500 to-blue-600'
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Avatar className={`mx-auto mb-3 border-2 border-white ${
                          index === 0 ? 'h-16 w-16' : 'h-12 w-12'
                        }`}>
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{participant.name}</p>
                        <p className="text-xs opacity-80 capitalize">{participant.role}</p>
                      </div>
                    </div>
                    
                    {/* Participant status indicators */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {participant.isMuted ? (
                        <div className="bg-red-500 rounded-full p-1">
                          <MicOff className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="bg-green-500 rounded-full p-1">
                          <Mic className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {!participant.hasVideo && (
                        <div className="bg-red-500 rounded-full p-1">
                          <VideoOff className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Current user indicator */}
                    {participant.isCurrentUser && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating session controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 session-controls">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0">
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0">
                <Video className="h-4 w-4" />
              </Button>
              
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0">
                <Monitor className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-6 bg-white/30" />
              
              <Button size="sm" variant="destructive" className="rounded-full h-8 w-8 p-0">
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatSidebar({ isOpen, onToggle, eventId }: { isOpen: boolean; onToggle: () => void; eventId?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing chat messages for the live event
  useEffect(() => {
    if (!eventId) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}/live/events/${eventId}/chat`, { headers, signal: controller.signal });
        const json = await res.json();
        const rows = Array.isArray(json.data) ? json.data : [];
        const mapped: ChatMessage[] = rows.map((r: any) => ({
          id: r.id,
          sender: r.sender_name || 'User',
          message: r.content || '',
          timestamp: new Date(r.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(mapped);
      } catch {}
    };
    load();
    const id = setInterval(load, 10000);
    return () => { controller.abort(); clearInterval(id); };
  }, [eventId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!eventId) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const devKey = localStorage.getItem('devKey');
    const token = localStorage.getItem('token');
    if (devKey) headers['X-Dev-Key'] = devKey;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${API_BASE_URL}/live/events/${eventId}/chat`, { method: 'POST', headers, body: JSON.stringify({ content: newMessage, type: 'text' }) });
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'You', message: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isCurrentUser: true }]);
        setNewMessage("");
      }
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
      isOpen ? 'w-80' : 'w-0 overflow-hidden'
    }`}>
      {isOpen && (
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#021ff6]" />
              <h3 className="font-medium">Live Chat</h3>
              <Badge variant="secondary" className="text-xs">{messages.filter(m => m.type !== 'system').length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`message-enter ${
                  message.type === 'system' ? 'text-center' : ''
                }`}>
                  {message.type === 'system' ? (
                    <div className="text-xs text-gray-500 py-2">
                      <div className="bg-gray-100 rounded-full px-3 py-1 inline-block">
                        {message.message}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex gap-2 ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.avatar} />
                        <AvatarFallback className="text-xs">
                          {message.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 min-w-0 ${message.isCurrentUser ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{message.sender}</span>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                        </div>
                        <div className={`inline-block p-2 rounded-lg max-w-[85%] text-sm break-words ${
                          message.isCurrentUser 
                            ? 'bg-[#021ff6] text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.message}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-sm"
              />
              <Button 
                onClick={sendMessage} 
                size="sm" 
                disabled={!newMessage.trim()}
                className="bg-[#021ff6] hover:bg-[#021ff6]/90 px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ParticipantsPanel() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participants (0)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {/* No mock participants */}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function LiveSession({ 
  mentee, 
  sessionTitle = "Live Mentorship Session",
  sessionDescription = "React Advanced Patterns",
  isHost = true 
}: LiveSessionProps) {
  const [isInSession, setIsInSession] = useState(false);
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const handleJoinSession = async () => {
    // Create a live event if none exists, then mark in-session
    if (!eventId) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const body = { title: getSessionTitle(), description: sessionDescription, startAt: new Date().toISOString(), status: 'live' };
        const res = await fetch(`${API_BASE_URL}/live/events`, { method: 'POST', headers, body: JSON.stringify(body) });
        const json = await res.json();
        setEventId(json?.data?.id || json?.id);
      } catch {}
    }
    setIsInSession(true);
  };

  const handleLeaveSession = () => {
    setIsInSession(false);
    setIsRecording(false);
    setIsScreenSharing(false);
  };

  const getSessionTitle = () => {
    return sessionTitle.includes(mentee.name) ? sessionTitle : `${sessionTitle} with ${mentee.name}`;
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Session Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium truncate">{getSessionTitle()}</h1>
            <p className="text-sm text-gray-600 truncate">{sessionDescription}</p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Badge variant={isInSession ? "default" : "secondary"} className="text-xs">
              {isInSession ? "In Session" : "Ready to Join"}
            </Badge>
            {isInSession && <SessionTimer />}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video and Controls Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 p-4 pb-2">
            <VideoArea 
              isInSession={isInSession} 
              onJoinSession={handleJoinSession}
              isScreenSharing={isScreenSharing}
            />
          </div>

          {/* Session Controls Bar */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
              {!isInSession ? (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleJoinSession}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                  <span className="text-sm text-gray-600">Session is ready to start</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant={hasVideo ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => setHasVideo(!hasVideo)}
                    title={hasVideo ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {hasVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                  >
                    {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveSession}
                    title="Leave session"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button 
                  variant={isRecording ? "destructive" : "outline"} 
                  size="sm"
                  onClick={() => setIsRecording(!isRecording)}
                  title={isRecording ? 'Stop recording' : 'Start recording'}
                >
                  <Circle className={`h-4 w-4 ${isRecording ? 'fill-current' : ''}`} />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  title={showChat ? 'Hide chat' : 'Show chat'}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar isOpen={showChat} onToggle={() => setShowChat(!showChat)} eventId={eventId} />
      </div>

      {/* Bottom Panel - Participants (when needed) */}
      {isInSession && (
        <div className="px-4 pb-4 flex-shrink-0">
          <ParticipantsPanel />
        </div>
      )}
    </div>
  );
}
