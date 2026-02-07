import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AdminInviteDialog } from "./AdminInviteDialog";
import { 
  ArrowLeft,
  Users, 
  Target, 
  Calendar, 
  MapPin,
  DollarSign,
  BookOpen,
  Lightbulb,
  Bell,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  UserPlus,
  UserMinus,
  Download,
  ExternalLink,
  Plus,
  Edit,
  Shield,
  Mail,
  Crown,
  UserCheck,
  MoreHorizontal
} from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { useNavigation } from "./NavigationContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export function CampaignDetail() {
  const { selectedCampaign, navigate } = useNavigation();
  const [isParticipant, setIsParticipant] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (!selectedCampaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl text-gray-600">No Campaign Selected</h2>
          <Button onClick={() => navigate('Alma Mater')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Alma Mater
          </Button>
        </div>
      </div>
    );
  }

  const campaign = selectedCampaign;

  const campaignTypeIcons = {
    mentorship: <Users className="h-5 w-5" />,
    funding: <DollarSign className="h-5 w-5" />,
    research: <BookOpen className="h-5 w-5" />,
    project: <Lightbulb className="h-5 w-5" />
  };

  const campaignTypeColors = {
    mentorship: "bg-blue-100 text-blue-800",
    funding: "bg-green-100 text-green-800", 
    research: "bg-purple-100 text-purple-800",
    project: "bg-orange-100 text-orange-800"
  };

  const statusColors = {
    active: "bg-green-100 text-green-800",
    upcoming: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800"
  };

  const handleJoinLeave = () => {
    setIsParticipant(!isParticipant);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleInvite = (email: string, role: string) => {
    console.log(`Inviting ${email} as ${role}`);
    // Here you would send the invitation
  };

  const handlePromoteToAdmin = (participantId: string) => {
    console.log(`Promoting participant ${participantId} to admin`);
  };

  const handleRemoveAdmin = (adminId: string) => {
    console.log(`Removing admin ${adminId}`);
  };

  // Mock data with multiple admins
  const mockAdmins: Array<{ id: string; name: string; role: string; avatar: string; university: string; joinedDate: string }> = [];

  const mockParticipants: Array<{ id: string; name: string; role: string; avatar: string; university: string; canPromote: boolean }> = [];

  const mockUpdates: Array<{ id: string; title: string; content: string; author: string; timestamp: string; type: string }> = [];

  const mockResources: Array<{ id: string; name: string; type: string; size: string; downloads: number }> = [];

  return (
    <div className="h-full flex flex-col">
      <DashboardHeader 
        userTitle={`Campaign: ${campaign.title}`}
      />
      
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Back Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('Alma Mater')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Alma Mater
        </Button>

        {/* Campaign Header */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Badges */}
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={campaignTypeColors[campaign.type as keyof typeof campaignTypeColors] || "bg-gray-100 text-gray-800"}>
                        {campaignTypeIcons[campaign.type as keyof typeof campaignTypeIcons]}
                        <span className="ml-1 capitalize">{campaign.type}</span>
                      </Badge>
                      <Badge variant="outline" className={statusColors[campaign.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
                        {campaign.status === "active" && <Bell className="h-3 w-3 mr-1" />}
                        {campaign.status === "upcoming" && <Clock className="h-3 w-3 mr-1" />}
                        {campaign.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {campaign.status}
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-bold">{campaign.title}</h1>
                    <p className="text-muted-foreground max-w-2xl">
                      {campaign.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{campaign.university}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>Managed by {mockAdmins.length} admin{mockAdmins.length > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleFavorite}
                      className={isFavorited ? "text-red-600 border-red-200" : ""}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={handleJoinLeave}
                      className={isParticipant ? "bg-red-600 hover:bg-red-700" : "bg-[#021ff6] hover:bg-[#021ff6]/90"}
                    >
                      {isParticipant ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Leave Campaign
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Campaign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Dashboard */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium">
                      {campaign.participantsCount}
                      {campaign.targetParticipants && ` / ${campaign.targetParticipants}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {campaign.type === "funding" && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Raised</p>
                      <p className="font-medium text-green-600">
                        ${campaign.raisedAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ends</p>
                    <p className="font-medium">
                      {campaign.endDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AdminInviteDialog - Moved outside of tabs to be globally accessible */}
        <AdminInviteDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onInvite={handleInvite}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants ({mockParticipants.length + mockAdmins.length})</TabsTrigger>
            <TabsTrigger value="updates">Updates ({mockUpdates.length})</TabsTrigger>
            <TabsTrigger value="resources">Resources ({mockResources.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Campaign</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {campaign.description}
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Campaign Goals:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Connect students with industry professionals for mentorship</li>
                        <li>Provide career guidance and project collaboration opportunities</li>
                        <li>Foster knowledge transfer between diaspora and local talent</li>
                        <li>Build sustainable professional networks</li>
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.tags?.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{campaign.recentActivity}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Campaign Admins</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={admin.avatar} />
                          <AvatarFallback className="bg-[#021ff6] text-white">
                            {admin.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.university}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Crown className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs text-muted-foreground">{admin.role}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => setShowInviteDialog(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite to Campaign
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Started</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.startDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Ends</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.endDate?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Campaign Team</h3>
                <p className="text-sm text-muted-foreground">
                  Manage admins and participants in this campaign
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowInviteDialog(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Invite People
              </Button>
            </div>

            <div className="space-y-6">
              {/* Admins Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Admins ({mockAdmins.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAdmins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={admin.avatar} />
                            <AvatarFallback>
                              {admin.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.university}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Crown className="h-3 w-3 text-yellow-600" />
                              <span className="text-xs text-muted-foreground">{admin.role}</span>
                              <span className="text-xs text-muted-foreground">• {admin.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                          {admin.role !== "Primary Admin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleRemoveAdmin(admin.id)}>
                                  Remove Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Participants Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Participants ({mockParticipants.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {mockParticipants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-muted-foreground">{participant.role}</p>
                            <p className="text-xs text-muted-foreground">{participant.university}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                          {participant.canPromote && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handlePromoteToAdmin(participant.id)}>
                                  <UserCheck className="h-3 w-3 mr-2" />
                                  Promote to Admin
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Remove from Campaign
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Campaign Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Latest news and announcements from the campaign team
                </p>
              </div>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Subscribe to Updates
              </Button>
            </div>

            <div className="space-y-4">
              {mockUpdates.map((update) => (
                <Card key={update.id}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{update.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {update.author} • {update.timestamp}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {update.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{update.content}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Shared Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Documents, guides, and materials shared by the campaign team
                </p>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Upload Resource
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {mockResources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{resource.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <span>{resource.type}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}