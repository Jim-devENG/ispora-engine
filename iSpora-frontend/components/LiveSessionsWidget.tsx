import React, { useState, useEffect } from "react";
import { Radio, Clock, Calendar, Bell, Users, ExternalLink, X, Plus, List } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useSessionNotifications } from "./SessionNotifications";
import { SessionCalendar } from "./SessionCalendar";

interface Session {
  id: string;
  title: string;
  type: 'mentorship' | 'workshop' | 'campaign' | 'event';
  startTime: Date;
  duration: number; // in minutes
  isLive: boolean;
  isPublic: boolean;
  hasRSVP: boolean;
  attendeeCount?: number;
  maxAttendees?: number;
  host: string;
  description?: string;
}

// Extended mock data with more sessions across different dates
const mockSessions: Session[] = [
  {
    id: "1",
    title: "Mentoring Next Gen Innovators",
    type: "mentorship",
    startTime: new Date(Date.now() - 25 * 60 * 1000), // Started 25 mins ago
    duration: 60,
    isLive: true,
    isPublic: false,
    hasRSVP: true,
    host: "Dr. Sarah Chen",
    description: "Deep dive into innovation mindset and career guidance"
  },
  {
    id: "2",
    title: "AI in Healthcare Workshop",
    type: "workshop",
    startTime: new Date(Date.now() - 10 * 60 * 1000), // Started 10 mins ago
    duration: 120,
    isLive: true,
    isPublic: true,
    hasRSVP: false,
    attendeeCount: 45,
    maxAttendees: 100,
    host: "Prof. Michael Torres",
    description: "Exploring cutting-edge AI applications in medical research"
  },
  {
    id: "3",
    title: "Research Collaboration Meetup",
    type: "event",
    startTime: new Date(Date.now() + 10 * 60 * 1000), // Starts in 10 mins
    duration: 90,
    isLive: false,
    isPublic: true,
    hasRSVP: true,
    attendeeCount: 23,
    maxAttendees: 50,
    host: "Dr. Lisa Park",
    description: "Connect with researchers in your field"
  },
  {
    id: "4",
    title: "Grant Writing Masterclass",
    type: "workshop",
    startTime: new Date(Date.now() + 45 * 60 * 1000), // Starts in 45 mins
    duration: 150,
    isLive: false,
    isPublic: false,
    hasRSVP: true,
    host: "Dr. James Wilson",
    description: "Advanced techniques for successful grant applications"
  },
  // Additional sessions for calendar view
  {
    id: "5",
    title: "Weekly Team Sync",
    type: "event",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 30,
    isLive: false,
    isPublic: false,
    hasRSVP: true,
    host: "Dr. Amina Hassan",
    description: "Weekly progress review and planning"
  },
  {
    id: "6",
    title: "Advanced Research Methods",
    type: "workshop",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    duration: 180,
    isLive: false,
    isPublic: true,
    hasRSVP: false,
    attendeeCount: 15,
    maxAttendees: 30,
    host: "Prof. Robert Kim",
    description: "Deep dive into quantitative and qualitative research methodologies"
  },
  {
    id: "7",
    title: "Startup Pitch Practice",
    type: "mentorship",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    duration: 90,
    isLive: false,
    isPublic: false,
    hasRSVP: true,
    host: "Dr. Maria Rodriguez",
    description: "Practice your startup pitch and get feedback"
  },
  {
    id: "8",
    title: "Climate Change Campaign",
    type: "campaign",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
    duration: 120,
    isLive: false,
    isPublic: true,
    hasRSVP: false,
    attendeeCount: 67,
    maxAttendees: 200,
    host: "Dr. Environmental Team",
    description: "Join our climate action initiative and make a difference"
  }
];

function formatTimeRemaining(targetTime: Date): string {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return "Now";
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function formatSessionDuration(session: Session): string {
  if (!session.isLive) return `${session.duration} min`;
  
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - session.startTime.getTime()) / (1000 * 60));
  const remaining = session.duration - elapsed;
  
  if (remaining <= 0) return "Ending soon";
  return `${elapsed} min elapsed • ${remaining} min left`;
}

function SessionCard({ session, onJoin, onSetReminder }: {
  session: Session;
  onJoin: (sessionId: string) => void;
  onSetReminder: (sessionId: string) => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState(
    session.isLive ? formatSessionDuration(session) : formatTimeRemaining(session.startTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        session.isLive ? formatSessionDuration(session) : formatTimeRemaining(session.startTime)
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [session]);

  const getTypeIcon = () => {
    switch (session.type) {
      case 'mentorship': return <Users className="h-4 w-4" />;
      case 'workshop': return <Calendar className="h-4 w-4" />;
      case 'campaign': return <Bell className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (session.type) {
      case 'mentorship': return 'text-blue-600 bg-blue-50';
      case 'workshop': return 'text-green-600 bg-green-50';
      case 'campaign': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md w-full">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1 flex-wrap">
                {session.isLive && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-red-600">LIVE</span>
                  </div>
                )}
                <Badge variant="secondary" className={`${getTypeColor()} px-2 py-0.5 flex-shrink-0`}>
                  <div className="flex items-center space-x-1">
                    {getTypeIcon()}
                    <span className="text-xs capitalize">{session.type}</span>
                  </div>
                </Badge>
              </div>
              <h4 className="font-semibold text-sm leading-tight truncate">{session.title}</h4>
              <p className="text-xs text-gray-600 mt-1 truncate">by {session.host}</p>
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <p className="text-xs text-gray-600 line-clamp-2 break-words">{session.description}</p>
          )}

          {/* Time and Attendance Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">
                {session.isLive ? timeRemaining : `Starts in ${timeRemaining}`}
              </span>
            </div>
            {session.isPublic && session.attendeeCount && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Users className="h-3 w-3" />
                <span>{session.attendeeCount}/{session.maxAttendees}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 gap-2">
            <div className="flex items-center space-x-2 flex-wrap min-w-0">
              {session.hasRSVP && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                  ✓ RSVP'd
                </Badge>
              )}
              {session.isPublic && !session.hasRSVP && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 text-green-600 border-green-200 flex-shrink-0">
                  Public
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {session.isLive ? (
                <Button 
                  size="sm" 
                  onClick={() => onJoin(session.id)}
                  className="bg-[#021ff6] hover:bg-[#021ff6]/90 text-white px-2 py-1 h-auto text-xs whitespace-nowrap"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Join
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onSetReminder(session.id)}
                  className="px-2 py-1 h-auto text-xs whitespace-nowrap"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Remind
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveSessionsWidget() {
  const [sessions] = useState<Session[]>(mockSessions);
  const [isOpen, setIsOpen] = useState(false);
  const { showReminderSet, showSessionLive } = useSessionNotifications();

  const liveSessions = sessions.filter(s => s.isLive);
  const upcomingSessions = sessions.filter(s => !s.isLive).sort((a, b) => 
    a.startTime.getTime() - b.startTime.getTime()
  );

  const hasLiveSessions = liveSessions.length > 0;
  const myRSVPSessions = sessions.filter(s => s.hasRSVP && !s.isLive);
  const hasUpcomingRSVP = myRSVPSessions.length > 0;

  const handleJoinSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      console.log("Joining session:", sessionId);
      // Implement session join logic - would typically open session in new tab/modal
      showSessionLive(session.title, () => {
        // Additional join logic
      });
    }
  };

  const handleSetReminder = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      console.log("Setting reminder for session:", sessionId);
      // Implement reminder logic - would typically save to user preferences
      showReminderSet(session.title);
    }
  };

  const handleCalendarSessionSelect = (session: Session) => {
    if (session.isLive) {
      handleJoinSession(session.id);
    } else {
      handleSetReminder(session.id);
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    console.log("Selected date:", date);
    // Could implement additional date selection logic here
  };

  const getTooltipText = () => {
    if (hasLiveSessions) {
      return `${liveSessions.length} live session${liveSessions.length === 1 ? '' : 's'}`;
    }
    if (hasUpcomingRSVP) {
      return `${myRSVPSessions.length} upcoming session${myRSVPSessions.length === 1 ? '' : 's'}`;
    }
    return "No active sessions";
  };

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <button
              onClick={handleButtonClick}
              className="relative p-2 text-gray-600 hover:text-[#021ff6] hover:bg-[#021ff6]/10 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="relative">
                <Radio className="h-5 w-5" />
                {hasLiveSessions && (
                  <>
                    {/* Pulsing live indicator */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                      <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping"></div>
                    </div>
                    {/* Blinking outer ring */}
                    <div className="absolute -top-2 -right-2 h-5 w-5 border-2 border-red-500 rounded-full animate-ping opacity-50"></div>
                  </>
                )}
                {!hasLiveSessions && myRSVPSessions.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">{myRSVPSessions.length}</span>
                  </div>
                )}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipText()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[600px] max-w-[90vw] p-0 overflow-hidden flex flex-col">
          <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
            <SheetTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-[#021ff6]" />
              <span>Live & Upcoming Sessions</span>
            </SheetTitle>
            <SheetDescription>
              Join live sessions or manage your upcoming events
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="list" className="h-full flex flex-col">
              <div className="px-6 pt-4 border-b flex-shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center space-x-2">
                    <List className="h-4 w-4" />
                    <span>List View</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Calendar View</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="list" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <div className="space-y-6">
                  {/* Personal RSVP Alert */}
                  {hasUpcomingRSVP && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-blue-900 text-sm">Your Sessions Starting Soon</h4>
                          <div className="mt-2 space-y-1">
                            {myRSVPSessions.slice(0, 2).map(session => (
                              <p key={session.id} className="text-xs text-blue-700 break-words">
                                <span className="font-medium">"{session.title}"</span> starts in {formatTimeRemaining(session.startTime)}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Now Section */}
                  {hasLiveSessions && (
                    <section>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="font-semibold text-red-600">Live Now ({liveSessions.length})</h3>
                      </div>
                      <div className="space-y-3">
                        {liveSessions.map(session => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onJoin={handleJoinSession}
                            onSetReminder={handleSetReminder}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Separator */}
                  {hasLiveSessions && upcomingSessions.length > 0 && (
                    <Separator />
                  )}

                  {/* Upcoming Sessions */}
                  {upcomingSessions.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h3 className="font-semibold text-gray-900 flex-1">Upcoming Sessions ({upcomingSessions.length})</h3>
                        <Button variant="outline" size="sm" className="h-auto py-1 px-2 text-xs flex-shrink-0">
                          <Plus className="h-3 w-3 mr-1" />
                          Browse All
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {upcomingSessions.slice(0, 4).map(session => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            onJoin={handleJoinSession}
                            onSetReminder={handleSetReminder}
                          />
                        ))}
                      </div>
                      {upcomingSessions.length > 4 && (
                        <Button variant="ghost" className="w-full mt-3 text-xs">
                          View {upcomingSessions.length - 4} more sessions
                        </Button>
                      )}
                    </section>
                  )}

                  {/* Empty State */}
                  {!hasLiveSessions && upcomingSessions.length === 0 && (
                    <div className="text-center py-12">
                      <Radio className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">No Sessions Right Now</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Check back later or browse upcoming events
                      </p>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Browse Events
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                <SessionCalendar
                  sessions={sessions}
                  onSessionSelect={handleCalendarSessionSelect}
                  onDateSelect={handleCalendarDateSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
