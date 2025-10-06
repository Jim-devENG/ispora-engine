import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Search, 
  Filter, 
  MoreHorizontal,
  CheckCircle,
  Clock,
  X,
  Send,
  MessageSquare,
  Crown,
  Shield,
  User,
  Star
} from 'lucide-react';

interface ModernProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMembersChange?: (members: any[]) => void;
}

const memberRoles = [
  { id: 'lead', label: '👑 Project Lead', icon: Crown, color: 'bg-purple-100 text-purple-700' },
  { id: 'admin', label: '🛡️ Admin', icon: Shield, color: 'bg-blue-100 text-blue-700' },
  { id: 'member', label: '👤 Member', icon: User, color: 'bg-green-100 text-green-700' },
  { id: 'observer', label: '👁️ Observer', icon: Star, color: 'bg-gray-100 text-gray-700' },
];

const mockMembers = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'lead',
    status: 'online',
    avatar: '/avatars/sarah.jpg',
    skills: ['Research', 'Leadership', 'Mentoring'],
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'admin',
    status: 'online',
    avatar: '/avatars/michael.jpg',
    skills: ['Development', 'Project Management'],
    joinDate: '2024-01-20',
    lastActive: '1 hour ago',
  },
  {
    id: '3',
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@research.org',
    role: 'member',
    status: 'away',
    avatar: '/avatars/aisha.jpg',
    skills: ['Data Analysis', 'Statistics'],
    joinDate: '2024-02-01',
    lastActive: '3 hours ago',
  },
];

export function ModernProjectMemberModal({ isOpen, onClose, projectId, onMembersChange }: ModernProjectMemberModalProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [members, setMembers] = useState(mockMembers);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleInviteMember = () => {
    if (inviteEmail && inviteRole) {
      // Add new member logic here
      console.log('Inviting member:', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleSendMessage = () => {
    if (messageRecipient && messageSubject && messageContent) {
      console.log('Sending message:', { recipient: messageRecipient, subject: messageSubject, content: messageContent });
      setShowMessageComposer(false);
      setMessageRecipient(null);
      setMessageSubject('');
      setMessageContent('');
    }
  };

  const getRoleInfo = (role: string) => {
    return memberRoles.find(r => r.id === role) || memberRoles[2];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col w-[95vw] sm:w-full">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Project Members
          </DialogTitle>
          <DialogDescription>
            Manage team members, handle requests, and invite new collaborators
          </DialogDescription>
        </DialogHeader>

        {!showMessageComposer ? (
          <>
            {/* Search and Filters */}
            <div className="flex-shrink-0 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {memberRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
                  <TabsTrigger value="requests">Requests (0)</TabsTrigger>
                  <TabsTrigger value="invites">Invites (0)</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="mt-4">
                  <ScrollArea className="h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div className="space-y-3">
                      {filteredMembers.map((member) => {
                        const roleInfo = getRoleInfo(member.role);
                        const Icon = roleInfo.icon;
                        return (
                          <Card key={member.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{member.name}</h4>
                                    <Badge className={roleInfo.color}>
                                      <Icon className="h-3 w-3 mr-1" />
                                      {roleInfo.label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">{member.email}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-gray-400">Joined {member.joinDate}</span>
                                    <span className="text-xs text-gray-400">Last active {member.lastActive}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setMessageRecipient(member);
                                    setShowMessageComposer(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {member.skills && member.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {member.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="requests" className="mt-4">
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No pending requests</p>
                  </div>
                </TabsContent>

                <TabsContent value="invites" className="mt-4">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Invite New Member</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="inviteEmail">Email Address</Label>
                          <Input
                            id="inviteEmail"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inviteRole">Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {memberRoles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleInviteMember} className="w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          /* Message Composer */
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageComposer(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="font-medium">Send Message to {messageRecipient?.name}</h3>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <div>
                <Label htmlFor="messageSubject">Subject</Label>
                <Input
                  id="messageSubject"
                  placeholder="Message subject..."
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="messageContent">Message</Label>
                <Textarea
                  id="messageContent"
                  placeholder="Type your message..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="h-48"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowMessageComposer(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
