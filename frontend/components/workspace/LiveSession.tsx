import React, { useState, useRef, useEffect } from "react";
import { workspaceAPI } from "../../src/utils/api";
import { toast } from "sonner";
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
  projectId?: string;
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

// Removed mock data - all data now comes from the backend API

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

function VideoArea({ 
  isInSession, 
  onJoinSession, 
  isScreenSharing,
  participants 
}: { 
  isInSession: boolean; 
  onJoinSession: () => void;
  isScreenSharing: boolean;
  participants: Participant[];
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
                  <p className="text-sm text-gray-300">A participant is sharing their screen</p>
                </div>
              </div>
            ) : (
              // Video grid view
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full h-full p-2">
                {participants.length === 0 ? (
                  <div className="col-span-2 flex items-center justify-center text-white">
                    <p>No participants yet</p>
                  </div>
                ) : (
                  participants.map((participant, index) => (
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
                  ))
                )}
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

function ChatSidebar({ 
  isOpen, 
  onToggle, 
  projectId,
  currentUserId 
}: { 
  isOpen: boolean; 
  onToggle: () => void;
  projectId?: string;
  currentUserId?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      if (!projectId || !isOpen) return;

      try {
        setIsLoading(true);
        // Fetch messages from Supabase
        let data: any[] = [];
        // Fetch messages from Supabase
        try {
          const { getProjectMessages } = await import('../../src/utils/supabaseQueries');
          data = await getProjectMessages(projectId);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
        
        const transformed: ChatMessage[] = data.map((m: any) => ({
          id: m.id,
          sender: m.senderName || m.sender || m.sender_name,
          message: m.content,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: m.avatar || m.senderAvatar || m.sender_avatar,
          isCurrentUser: (m.senderId || m.sender_id) === currentUserId,
        }));
        
        setMessages(transformed);
      } catch (err: any) {
        console.error('Failed to fetch messages:', err);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [projectId, isOpen, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !projectId) return;

    try {
      const messageData = {
        content: newMessage,
        type: 'text',
      };
      
      const { createMessage } = await import('../../src/utils/supabaseMutations');
      await createMessage(projectId, {
        content: newMessage,
        type: 'text',
      });
      
      // Optimistically add message to UI
      const tempMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentUser: true
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // Refresh messages to get the actual message from server
      setTimeout(async () => {
        try {
          let data: any[] = [];
          // Fetch messages from Supabase
          try {
            const { getProjectMessages } = await import('../../src/utils/supabaseQueries');
            data = await getProjectMessages(projectId);
          } catch (error) {
            console.error('Failed to fetch messages:', error);
          }
          
          const transformed: ChatMessage[] = data.map((m: any) => ({
            id: m.id,
            sender: m.senderName || m.sender || m.sender_name,
            message: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: m.avatar || m.senderAvatar || m.sender_avatar,
            isCurrentUser: (m.senderId || m.sender_id) === currentUserId,
          }));
          setMessages(transformed);
        } catch (err) {
          console.error('Failed to refresh messages:', err);
        }
      }, 500);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      toast.error(err.message || 'Failed to send message');
    }
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
              {isLoading && messages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
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
              )))}
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

function ParticipantsPanel({ participants }: { participants: Participant[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No participants yet</p>
            ) : (
              participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-xs">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{participant.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {participant.isMuted ? (
                    <MicOff className="h-3 w-3 text-red-500" />
                  ) : (
                    <Mic className="h-3 w-3 text-green-500" />
                  )}
                  {participant.hasVideo ? (
                    <Video className="h-3 w-3 text-green-500" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              ))
            )}
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
  isHost = true,
  projectId 
}: LiveSessionProps) {
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentLiveSession, setCurrentLiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = 'current-user'; // TODO: Get from auth context

  // Fetch live sessions and participants
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        // Fetch live sessions from Supabase
        let sessions: any[] = [];
        try {
          const { getProjectLiveSessions } = await import('../../src/utils/supabaseQueries');
          sessions = await getProjectLiveSessions(projectId);
        } catch (error) {
          console.error('Failed to fetch live sessions:', error);
        }
        
        let transformedParticipants: Participant[] = [];
        
        // Get active session or most recent
        const activeSession = sessions.find((s: any) => s.status === 'active') || sessions[0];
        if (activeSession) {
          setCurrentLiveSession(activeSession);
          setIsInSession(activeSession.status === 'active');
          
          // Transform participants from session
          transformedParticipants = (activeSession.participants || []).map((p: any) => ({
            id: p.userId || p.id,
            name: p.name || p.userName,
            avatar: p.avatar,
            isMuted: p.isMuted || false,
            hasVideo: p.hasVideo || false,
            isCurrentUser: p.userId === currentUserId,
            role: p.role || 'participant',
            isOnline: p.isOnline !== false,
          }));
          setParticipants(transformedParticipants);
        }

        // Also fetch project members as potential participants from Supabase
        try {
          const { getProject } = await import('../../src/utils/supabaseQueries');
          const project = await getProject(projectId);
          const members = project?.teamMembers || project?.team || [];
          const memberParticipants: Participant[] = members.map((m: any) => ({
            id: m.id || m.userId,
            name: m.name || m.userName,
            avatar: m.avatar || m.avatarUrl,
            isMuted: false,
            hasVideo: false,
            isCurrentUser: (m.id || m.userId) === currentUserId,
            role: m.role || 'participant',
            isOnline: m.isOnline !== false,
          }));
          
          // Merge with session participants, avoiding duplicates
          const existingIds = new Set(transformedParticipants.map(p => p.id));
          const newMembers = memberParticipants.filter(m => !existingIds.has(m.id));
          setParticipants(prev => [...prev, ...newMembers]);
        } catch (err) {
          console.error('Failed to fetch members:', err);
        }
      } catch (err: any) {
        console.error('Failed to fetch live sessions:', err);
        toast.error('Failed to load live session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, currentUserId]);

  const handleJoinSession = async () => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    try {
      let session = currentLiveSession;
      
      // Create or update session using Supabase
      const { createLiveSession, updateLiveSession } = await import('../../src/utils/supabaseMutations');
      if (!session) {
        session = await createLiveSession(projectId, {
          sessionTitle,
          sessionDescription,
          status: 'active',
          startTime: new Date().toISOString(),
        });
        setCurrentLiveSession(session);
      } else {
        session = await updateLiveSession(projectId, session.id, {
          status: 'active',
          startTime: new Date().toISOString(),
        });
        setCurrentLiveSession(session);
      }
      
    setIsInSession(true);
      toast.success('Joined session');
    } catch (err: any) {
      console.error('Failed to join session:', err);
      toast.error(err.message || 'Failed to join session');
    }
  };

  const handleLeaveSession = async () => {
    if (!projectId || !currentLiveSession) {
      setIsInSession(false);
      setIsRecording(false);
      setIsScreenSharing(false);
      return;
    }

    try {
      const { updateLiveSession } = await import('../../src/utils/supabaseMutations');
      await updateLiveSession(projectId, currentLiveSession.id, {
        status: 'ended',
        endTime: new Date().toISOString(),
      });
      
    setIsInSession(false);
    setIsRecording(false);
    setIsScreenSharing(false);
      toast.success('Left session');
    } catch (err: any) {
      console.error('Failed to leave session:', err);
      toast.error(err.message || 'Failed to leave session');
    }
  };

  const getSessionTitle = () => {
    return sessionTitle.includes(mentee.name) ? sessionTitle : `${sessionTitle} with ${mentee.name}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
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
              participants={participants}
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
        <ChatSidebar 
          isOpen={showChat} 
          onToggle={() => setShowChat(!showChat)}
          projectId={projectId}
          currentUserId={currentUserId}
        />
      </div>

      {/* Bottom Panel - Participants (when needed) */}
      {isInSession && (
        <div className="px-4 pb-4 flex-shrink-0">
          <ParticipantsPanel participants={participants} />
        </div>
      )}
    </div>
  );
}