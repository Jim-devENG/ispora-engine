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
import { io, Socket } from "socket.io-client";
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
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://ispora-backend.onrender.com';

// WebRTC configuration
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

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
  localStream, 
  remoteStreams, 
  isMuted, 
  hasVideo, 
  onToggleMute, 
  onToggleVideo, 
  onToggleScreenShare, 
  onLeaveSession 
}: { 
  isInSession: boolean; 
  onJoinSession: () => void;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  isMuted: boolean;
  hasVideo: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveSession: () => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set up remote video streams
  useEffect(() => {
    remoteStreams.forEach((stream, index) => {
      if (remoteVideoRefs.current[index]) {
        remoteVideoRefs.current[index]!.srcObject = stream;
      }
    });
  }, [remoteStreams]);

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
        // In-session state with real video streams
        <div className="w-full h-full relative video-call-join">
          {/* Video grid */}
          <div className="absolute inset-0 p-2">
            {isScreenSharing ? (
              // Screen sharing view
              <div className="w-full h-full bg-gray-800 flex items-center justify-center screen-sharing">
                <div className="text-center text-white">
                  <Monitor className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">Screen Share Active</p>
                  <p className="text-sm text-gray-300">Screen sharing in progress</p>
                </div>
              </div>
            ) : (
              // Video grid with real streams
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full h-full">
                {/* Local video */}
                {localStream && (
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    </div>
                    {isMuted && (
                      <div className="absolute bottom-2 left-2 bg-red-500 rounded-full p-1">
                        <MicOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {!hasVideo && (
                      <div className="absolute bottom-2 left-2 bg-red-500 rounded-full p-1">
                        <VideoOff className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Remote videos */}
                {remoteStreams.map((stream, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-blue-600">
                    <video
                      ref={el => remoteVideoRefs.current[index] = el}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">Participant {index + 1}</Badge>
                    </div>
                  </div>
                ))}
                
                {/* Empty state when no streams */}
                {!localStream && remoteStreams.length === 0 && (
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-70" />
                      <p className="text-sm text-gray-300">Waiting for participants...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating session controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 session-controls">
              <Button 
                size="sm" 
                variant={isMuted ? "destructive" : "ghost"} 
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                onClick={onToggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button 
                size="sm" 
                variant={hasVideo ? "ghost" : "destructive"} 
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                onClick={onToggleVideo}
              >
                {hasVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button 
                size="sm" 
                variant={isScreenSharing ? "default" : "ghost"} 
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                onClick={onToggleScreenShare}
              >
                {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </Button>
              
              <Separator orientation="vertical" className="h-6 bg-white/30" />
              
              <Button 
                size="sm" 
                variant="destructive" 
                className="rounded-full h-8 w-8 p-0"
                onClick={onLeaveSession}
              >
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
  
  // WebRTC state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<MediaStream | null>(null);

  // WebRTC functions
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  const initializeSocket = () => {
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
        devKey: localStorage.getItem('devKey')
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to signaling server');
      // Authenticate with the server
      newSocket.emit('authenticate', {
        token: localStorage.getItem('token'),
        devKey: localStorage.getItem('devKey')
      });
    });

    newSocket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket authenticated:', data.userId);
        // Join the session room
        if (eventId) {
          newSocket.emit('join-room', { roomId: eventId, userId: data.userId });
        }
      } else {
        console.error('Socket authentication failed:', data.error);
      }
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data.userId);
      createPeerConnection(data.userId, true);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left:', data.userId);
      removePeer(data.userId);
    });

    newSocket.on('offer', async (data) => {
      await handleOffer(data.from, data.offer);
    });

    newSocket.on('answer', async (data) => {
      await handleAnswer(data.from, data.answer);
    });

    newSocket.on('ice-candidate', async (data) => {
      await handleIceCandidate(data.from, data.candidate);
    });

    newSocket.on('room-members', (members) => {
      console.log('Room members:', members);
      // Create peer connections for existing members
      members.forEach((member: any) => {
        createPeerConnection(member.userId, true);
      });
    });

    setSocket(newSocket);
    return newSocket;
  };

  const createPeerConnection = async (userId: string, isInitiator: boolean) => {
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => [...prev, remoteStream]);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate
        });
      }
    };

    setPeers(prev => new Map(prev).set(userId, peerConnection));

    if (isInitiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        if (socket) {
          socket.emit('offer', {
            to: userId,
            offer: offer
          });
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }

    return peerConnection;
  };

  const handleOffer = async (from: string, offer: RTCSessionDescriptionInit) => {
    const peerConnection = await createPeerConnection(from, false);
    await peerConnection.setRemoteDescription(offer);
    
    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (socket) {
        socket.emit('answer', {
          to: from,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  };

  const handleAnswer = async (from: string, answer: RTCSessionDescriptionInit) => {
    const peerConnection = peers.get(from);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (from: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peers.get(from);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  const removePeer = (userId: string) => {
    const peerConnection = peers.get(userId);
    if (peerConnection) {
      peerConnection.close();
      setPeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(userId);
        return newPeers;
      });
    }
  };

  const handleJoinSession = async () => {
    try {
      // Initialize local stream
      const stream = await initializeLocalStream();
      if (!stream) {
        alert('Could not access camera/microphone. Please check permissions.');
        return;
      }

      // Create a live event if none exists
      let currentEventId = eventId;
      if (!currentEventId) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const devKey = localStorage.getItem('devKey');
        const token = localStorage.getItem('token');
        if (devKey) headers['X-Dev-Key'] = devKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const body = { title: getSessionTitle(), description: sessionDescription, startAt: new Date().toISOString(), status: 'live' };
        const res = await fetch(`${API_BASE_URL}/live/events`, { method: 'POST', headers, body: JSON.stringify(body) });
        const json = await res.json();
        currentEventId = json?.data?.id || json?.id;
        setEventId(currentEventId);
      }

      // Initialize socket connection
      const newSocket = initializeSocket();
      
      // Wait for socket to be ready and join room
      newSocket.on('authenticated', (data) => {
        if (data.success && currentEventId) {
          newSocket.emit('join-room', { roomId: currentEventId, userId: data.userId });
        }
      });

      setIsInSession(true);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    }
  };

  const handleLeaveSession = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Stop screen sharing
    if (screenShareRef.current) {
      screenShareRef.current.getTracks().forEach(track => track.stop());
      screenShareRef.current = null;
    }

    // Leave room if socket is connected
    if (socket && eventId) {
      socket.emit('leave-room', { roomId: eventId });
    }

    // Close all peer connections
    peers.forEach(peer => peer.close());
    setPeers(new Map());
    setRemoteStreams([]);

    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    setIsInSession(false);
    setIsRecording(false);
    setIsScreenSharing(false);
  };

  const handleToggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
      }
    }
  };

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenShareRef.current = screenStream;
        
        // Replace video track in all peer connections
        peers.forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender && screenStream.getVideoTracks()[0]) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          handleToggleScreenShare();
        };
      } else {
        // Stop screen sharing
        if (screenShareRef.current) {
          screenShareRef.current.getTracks().forEach(track => track.stop());
          screenShareRef.current = null;
        }
        
        // Restore camera track in all peer connections
        if (localStream) {
          peers.forEach(peer => {
            const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && localStream.getVideoTracks()[0]) {
              sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          });
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
      peers.forEach(peer => peer.close());
    };
  }, []);

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
              localStream={localStream}
              remoteStreams={remoteStreams}
              isMuted={isMuted}
              hasVideo={hasVideo}
              onToggleMute={handleToggleMute}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
              onLeaveSession={handleLeaveSession}
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
                    onClick={handleToggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant={hasVideo ? "outline" : "destructive"}
                    size="sm"
                    onClick={handleToggleVideo}
                    title={hasVideo ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {hasVideo ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleScreenShare}
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
