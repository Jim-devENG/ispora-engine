import React, { useState, useEffect } from "react";
import { workspaceAPI } from "../../src/utils/api";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  MapPin,
  CalendarDays,
  Play,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  Share2,
  Copy,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Phone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface Session {
  id: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // in minutes
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  agenda?: string[];
  notes?: string;
  recordings?: { url: string; title: string; duration: number }[];
  attendees: { name: string; avatar?: string; attended?: boolean }[];
  isPublic?: boolean;
  tags?: string[];
  maxParticipants?: number;
  shareUrl?: string;
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
}

interface SessionBoardProps {
  mentee: Mentee;
  projectId?: string;
}

interface SessionDetails {
  title: string;
  description: string;
  isPublic: boolean;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  tags: string[];
  maxParticipants?: number;
  type: 'video' | 'phone' | 'in-person';
  location?: string;
  agenda: string[];
}

// Removed mock data - all sessions now come from the backend API

const statusColors = {
  upcoming: "bg-blue-100 text-blue-800",
  'in-progress': "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-yellow-100 text-yellow-800"
};

const statusIcons = {
  upcoming: Clock,
  'in-progress': Play,
  completed: CheckCircle,
  cancelled: AlertCircle,
  rescheduled: Calendar
};

function ShareSessionDialog({ session, isOpen, onClose }: {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = session.shareUrl || `https://ispora.com/sessions/${session.id}`;
  const shareText = `Join me for "${session.title}" - ${session.description}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(session.title);
    const summary = encodeURIComponent(session.description || '');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Session
          </DialogTitle>
          <DialogDescription>
            Share "{session.title}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#021ff6] rounded-lg">
                <Video className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{session.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{session.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {session.isPublic ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {session.scheduledDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Session Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Share on Social Media</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={shareOnTwitter}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4 text-blue-500" />
                Twitter
              </Button>
              <Button
                onClick={shareOnLinkedIn}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                onClick={shareOnFacebook}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Quick Copy Options */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Share Text</Label>
            <div className="p-3 bg-gray-50 rounded text-sm">
              <p className="text-gray-700">{shareText}</p>
              <p className="text-[#021ff6] mt-1">{shareUrl}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SessionCreateDialog({ isOpen, onClose, onCreateSession, editingSession, mentee }: {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (session: SessionDetails) => void;
  editingSession?: Session | null;
  mentee: Mentee;
}) {
  const [sessionData, setSessionData] = useState<SessionDetails>({
    title: editingSession?.title || '',
    description: editingSession?.description || '',
    isPublic: editingSession?.isPublic || false,
    scheduledDate: editingSession?.scheduledDate ? editingSession.scheduledDate.toISOString().split('T')[0] : '',
    scheduledTime: editingSession?.scheduledDate ? editingSession.scheduledDate.toTimeString().split(' ')[0].slice(0, 5) : '',
    duration: editingSession?.duration || 60,
    tags: editingSession?.tags || [],
    maxParticipants: editingSession?.maxParticipants || 50,
    type: editingSession?.type || 'video',
    location: editingSession?.location || '',
    agenda: editingSession?.agenda || []
  });

  const [tagsInput, setTagsInput] = useState(editingSession?.tags?.join(', ') || '');
  const [agendaInput, setAgendaInput] = useState(editingSession?.agenda?.join('\n') || '');

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!isOpen && !editingSession) {
      setSessionData({
        title: '',
        description: '',
        isPublic: false,
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        tags: [],
        maxParticipants: 50,
        type: 'video',
        location: '',
        agenda: []
      });
      setTagsInput('');
      setAgendaInput('');
    }
  }, [isOpen, editingSession]);

  const handleSubmit = () => {
    if (!sessionData.title.trim() || !sessionData.scheduledDate || !sessionData.scheduledTime) {
      return;
    }

    const session: SessionDetails = {
      ...sessionData,
      tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      agenda: agendaInput ? agendaInput.split('\n').map(item => item.trim()).filter(item => item) : []
    };

    onCreateSession(session);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? 'Edit Session' : 'Schedule New Session'}
          </DialogTitle>
          <DialogDescription>
            {editingSession 
              ? 'Update session details and settings'
              : `Set up a new session with ${mentee.name} or make it public for the iSpora community`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Title */}
          <div>
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              placeholder="e.g., React Advanced Patterns Workshop"
              value={sessionData.title}
              onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this session will cover..."
              value={sessionData.description}
              onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Session Visibility */}
          <div className="space-y-3">
            <Label>Session Visibility</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Project Members Only</p>
                      <p className="text-xs text-gray-600">Only project team members can join</p>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={!sessionData.isPublic}
                  onCheckedChange={(checked) => setSessionData(prev => ({ ...prev, isPublic: !checked }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Public Session</p>
                      <p className="text-xs text-gray-600">Open to all iSpora community members</p>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={sessionData.isPublic}
                  onCheckedChange={(checked) => setSessionData(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Session Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={sessionData.scheduledDate}
                onChange={(e) => setSessionData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={sessionData.scheduledTime}
                onChange={(e) => setSessionData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Duration and Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select 
                value={sessionData.duration.toString()} 
                onValueChange={(value) => setSessionData(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Session Type</Label>
              <Select 
                value={sessionData.type} 
                onValueChange={(value: 'video' | 'phone' | 'in-person') => setSessionData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>Video call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-person">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>In-person</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location (for in-person sessions) */}
          {sessionData.type === 'in-person' && (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter meeting location"
                value={sessionData.location}
                onChange={(e) => setSessionData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
              />
            </div>
          )}

          {/* Max Participants (Public only) */}
          {sessionData.isPublic && (
            <div>
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Select 
                value={sessionData.maxParticipants?.toString() || "50"} 
                onValueChange={(value) => setSessionData(prev => ({ ...prev, maxParticipants: parseInt(value) }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 participants</SelectItem>
                  <SelectItem value="25">25 participants</SelectItem>
                  <SelectItem value="50">50 participants</SelectItem>
                  <SelectItem value="100">100 participants</SelectItem>
                  <SelectItem value="200">200 participants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., react, javascript, frontend, tutorial"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Agenda */}
          <div>
            <Label htmlFor="agenda">Session Agenda (one item per line)</Label>
            <Textarea
              id="agenda"
              placeholder="Review current skills&#10;Explore career paths&#10;Create action plan"
              value={agendaInput}
              onChange={(e) => setAgendaInput(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Session Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Session Preview</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {sessionData.isPublic ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              <Badge variant="secondary">{sessionData.duration}min</Badge>
              <Badge variant="secondary" className="capitalize">{sessionData.type}</Badge>
              {sessionData.isPublic && sessionData.maxParticipants && (
                <Badge variant="secondary">Max {sessionData.maxParticipants}</Badge>
              )}
            </div>
            {sessionData.scheduledDate && sessionData.scheduledTime && (
              <p className="text-xs text-gray-600">
                Scheduled for {new Date(sessionData.scheduledDate).toLocaleDateString()} at {sessionData.scheduledTime}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!sessionData.title.trim() || !sessionData.scheduledDate || !sessionData.scheduledTime}
            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
          >
            {editingSession ? 'Update Session' : 'Schedule Session'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SessionCard({ session, onEdit, onDelete, onJoin, onShare }: {
  session: Session;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onJoin: (session: Session) => void;
  onShare: (session: Session) => void;
}) {
  const StatusIcon = statusIcons[session.status];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isUpcoming = session.status === 'upcoming';
  const canJoin = session.status === 'upcoming' && 
    Math.abs(session.scheduledDate.getTime() - Date.now()) <= 30 * 60 * 1000; // 30 minutes

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{session.title}</CardTitle>
              {session.isPublic ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <CardDescription>{session.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[session.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {session.status.replace('-', ' ')}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onShare(session)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Share Session
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onEdit(session)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Session
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <span>{formatDate(session.scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{session.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-gray-500" />
            <span className="capitalize">{session.type}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{session.location}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {session.tags && session.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {session.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
            {session.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                +{session.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Attendees */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <div className="flex -space-x-2">
            {session.attendees.slice(0, 5).map((attendee, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={attendee.avatar} alt={attendee.name} />
                <AvatarFallback className="text-xs">
                  {attendee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {session.attendees.length} attendee{session.attendees.length !== 1 ? 's' : ''}
            {session.isPublic && session.maxParticipants && (
              <span className="text-gray-400"> / {session.maxParticipants} max</span>
            )}
          </span>
        </div>

        {/* Agenda Preview */}
        {session.agenda && session.agenda.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Agenda</Label>
            <ul className="text-sm text-gray-600 space-y-1">
              {session.agenda.slice(0, 2).map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {session.agenda.length > 2 && (
                <li className="text-gray-400 text-xs">
                  +{session.agenda.length - 2} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Notes (for completed sessions) */}
        {session.notes && session.status === 'completed' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Session Notes</Label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              {session.notes}
            </p>
          </div>
        )}

        {/* Recordings */}
        {session.recordings && session.recordings.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recordings</Label>
            <div className="space-y-1">
              {session.recordings.map((recording, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{recording.title}</span>
                    <span className="text-xs text-gray-500">({recording.duration}min)</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={recording.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {isUpcoming && session.meetingLink && (
            <Button 
              className={`${canJoin ? 'bg-[#021ff6] hover:bg-[#021ff6]/90' : 'bg-gray-400'} flex-1`}
              onClick={() => onJoin(session)}
              disabled={!canJoin}
            >
              <Video className="h-4 w-4 mr-2" />
              {canJoin ? 'Join Session' : 'Not Ready'}
            </Button>
          )}
          {session.status === 'upcoming' && (
            <Button variant="outline" onClick={() => onEdit(session)}>
              Edit
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onDelete(session.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionBoard({ mentee, projectId }: SessionBoardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [shareSession, setShareSession] = useState<Session | null>(null);

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      if (!projectId) {
        setIsLoading(false);
        setSessions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        // TODO (Supabase migration): Re-enable Supabase-based queries AFTER backend Workroom is 100% stable.
        // Fetch sessions from backend API
        let data: any[] = [];
        try {
          data = await workspaceAPI.getSessions(projectId);
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
          setError(error instanceof Error ? error.message : 'Failed to load sessions');
        }
        
        // Transform API response to match component interface
        const transformed: Session[] = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          scheduledDate: new Date(s.scheduledDate || s.scheduled_date),
          duration: s.duration,
          status: s.status,
          type: s.type,
          meetingLink: s.meetingLink || s.meeting_link,
          location: s.location,
          agenda: s.agenda || [],
          notes: s.notes,
          recordings: s.recordings || [],
          attendees: s.attendees || [],
          isPublic: s.isPublic !== false && s.is_public !== false,
          tags: s.tags || [],
          maxParticipants: s.maxParticipants || s.max_participants,
          shareUrl: s.shareUrl || s.share_url,
        }));
        
        setSessions(transformed);
      } catch (err: any) {
        console.error('Failed to fetch sessions:', err);
        setError(err.message || 'Failed to load sessions');
        setSessions([]); // Empty array instead of mock data
        toast.error('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [projectId]);

  const filteredSessions = sessions.filter(session => {
    if (viewFilter === 'all') return true;
    if (viewFilter === 'upcoming') return session.status === 'upcoming';
    if (viewFilter === 'completed') return session.status === 'completed';
    return true;
  });

  const generateShareUrl = (sessionId: string) => {
    return `https://ispora.com/sessions/${sessionId}`;
  };

  const handleCreateSession = async (sessionDetails: SessionDetails) => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    try {
      const sessionData = {
        title: sessionDetails.title,
        description: sessionDetails.description,
        scheduledDate: sessionDetails.scheduledDate,
        scheduledTime: sessionDetails.scheduledTime,
        duration: sessionDetails.duration,
        type: sessionDetails.type,
        location: sessionDetails.location,
        agenda: sessionDetails.agenda,
        isPublic: sessionDetails.isPublic,
        tags: sessionDetails.tags,
        maxParticipants: sessionDetails.maxParticipants,
        attendees: [
          { 
            name: mentee.name, 
            avatar: mentee.avatar,
            userId: mentee.id,
            attended: false
          }
        ]
      };

      if (editingSession) {
        // Update existing session - try Supabase first
        let updated;
        try {
          const { updateSession } = await import('../../src/utils/supabaseMutations');
          updated = await updateSession(projectId, editingSession.id, sessionData);
        } catch (supabaseError) {
          console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
          updated = await workspaceAPI.updateSession(projectId, editingSession.id, sessionData);
        }
        
        setSessions(prev => prev.map(s => {
          if (s.id === editingSession.id) {
            return {
              ...s,
              ...updated,
              scheduledDate: new Date(updated.scheduledDate || updated.scheduled_date),
            };
          }
          return s;
        }));
        toast.success('Session updated successfully');
      } else {
        // Create new session - try Supabase first
        let created;
        try {
          const { createSession } = await import('../../src/utils/supabaseMutations');
          created = await createSession(projectId, sessionData);
        } catch (supabaseError) {
          console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
          created = await workspaceAPI.createSession(projectId, sessionData);
        }
        
        const newSession: Session = {
          ...created,
          scheduledDate: new Date(created.scheduledDate || created.scheduled_date),
        };
        setSessions(prev => [newSession, ...prev]);
        toast.success('Session created successfully');
      }

      setEditingSession(null);
      setShowCreateDialog(false);
    } catch (err: any) {
      console.error('Failed to save session:', err);
      toast.error(err.message || 'Failed to save session');
    }
  };

  const handleJoinSession = (session: Session) => {
    if (session.meetingLink) {
      // Update session status to in-progress
      setSessions(prev => prev.map(s => 
        s.id === session.id ? { ...s, status: 'in-progress' as const } : s
      ));
      // Open meeting link or navigate to LiveSession
      window.open(session.meetingLink, '_blank');
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowCreateDialog(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!projectId) {
      toast.error('Project ID is required');
      return;
    }

    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      // Try Supabase first
      try {
        const { deleteSession } = await import('../../src/utils/supabaseMutations');
        await deleteSession(projectId, sessionId);
      } catch (supabaseError) {
        console.warn('Supabase mutation failed, trying legacy API:', supabaseError);
        await workspaceAPI.deleteSession(projectId, sessionId);
      }
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Session deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete session:', err);
      toast.error(err.message || 'Failed to delete session');
    }
  };

  const handleShareSession = (session: Session) => {
    setShareSession(session);
  };

  const upcomingCount = sessions.filter(s => s.status === 'upcoming').length;
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const publicCount = sessions.filter(s => s.isPublic).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Session Board</h3>
            <p className="text-gray-600">Manage mentorship sessions with {mentee.name} and public workshops</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#021ff6] hover:bg-[#021ff6]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </div>

        {/* Stats and Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{upcomingCount}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{publicCount}</div>
              <div className="text-sm text-gray-600">Public</div>
            </div>
          </div>
          
          <Select value={viewFilter} onValueChange={(value: any) => setViewFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#021ff6] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading sessions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading sessions</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : !projectId ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Project ID required</h3>
                <p className="text-gray-500">Please select a project to view sessions</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-500 mb-4">
                  {viewFilter === 'all' 
                    ? 'Schedule your first mentorship session'
                    : `No ${viewFilter} sessions`
                  }
                </p>
                {viewFilter === 'all' && (
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Session
                  </Button>
                )}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                  onJoin={handleJoinSession}
                  onShare={handleShareSession}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Session Create Dialog */}
      <SessionCreateDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingSession(null);
        }}
        onCreateSession={handleCreateSession}
        editingSession={editingSession}
        mentee={mentee}
      />

      {/* Share Session Dialog */}
      {shareSession && (
        <ShareSessionDialog
          session={shareSession}
          isOpen={!!shareSession}
          onClose={() => setShareSession(null)}
        />
      )}
    </div>
  );
}