import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, UserCheck, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Session {
  id: string;
  title: string;
  type: 'mentorship' | 'workshop' | 'campaign' | 'event';
  startTime: Date;
  duration: number;
  isLive: boolean;
  isPublic: boolean;
  hasRSVP: boolean;
  attendeeCount?: number;
  maxAttendees?: number;
  host: string;
  description?: string;
}

interface SessionCalendarProps {
  sessions: Session[];
  onSessionSelect?: (session: Session) => void;
  onDateSelect?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getTypeColor(type: string) {
  switch (type) {
    case 'mentorship': return 'bg-blue-500';
    case 'workshop': return 'bg-green-500';
    case 'campaign': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function SessionDot({ session, onClick }: { session: Session; onClick: () => void }) {
  const getIcon = () => {
    switch (session.type) {
      case 'mentorship': return <Users className="h-2 w-2" />;
      case 'workshop': return <CalendarIcon className="h-2 w-2" />;
      case 'campaign': return <Bell className="h-2 w-2" />;
      default: return <CalendarIcon className="h-2 w-2" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <button
            onClick={onClick}
            className={`
              w-2 h-2 rounded-full flex items-center justify-center
              ${getTypeColor(session.type)} 
              ${session.isLive ? 'animate-pulse ring-2 ring-red-400' : ''}
              hover:scale-125 transition-transform cursor-pointer
            `}
          >
            {session.isLive && <div className="w-1 h-1 bg-white rounded-full" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {session.isLive && (
                <div className="flex items-center space-x-1">
                  <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-red-600">LIVE</span>
                </div>
              )}
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {session.type}
              </Badge>
            </div>
            <p className="font-medium text-sm">{session.title}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{formatTime(session.startTime)}</span>
              <span>({session.duration}min)</span>
            </div>
            <p className="text-xs text-gray-600">by {session.host}</p>
            {session.hasRSVP && (
              <div className="flex items-center space-x-1">
                <UserCheck className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600">RSVP'd</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CalendarDay({ 
  date, 
  isCurrentMonth, 
  isToday, 
  isSelected, 
  sessions, 
  onClick,
  onSessionSelect 
}: {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  sessions: Session[];
  onClick: () => void;
  onSessionSelect: (session: Session) => void;
}) {
  const liveSessions = sessions.filter(s => s.isLive);
  const hasLive = liveSessions.length > 0;

  return (
    <div
      className={`
        min-h-16 p-1 border-r border-b border-gray-100 cursor-pointer
        hover:bg-gray-50 transition-colors relative
        ${!isCurrentMonth ? 'text-gray-400 bg-gray-50/50' : ''}
        ${isToday ? 'bg-blue-50 border-blue-200' : ''}
        ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isToday ? 'font-semibold text-blue-600' : ''}`}>
            {date.getDate()}
          </span>
          {hasLive && (
            <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        
        {sessions.length > 0 && (
          <div className="flex-1 mt-1">
            <div className="space-y-0.5">
              {sessions.slice(0, 3).map((session) => (
                <SessionDot
                  key={session.id}
                  session={session}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionSelect(session);
                  }}
                />
              ))}
              {sessions.length > 3 && (
                <div className="text-xs text-gray-500 mt-1">
                  +{sessions.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionsList({ sessions, onSessionSelect }: {
  sessions: Session[];
  onSessionSelect: (session: Session) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No sessions scheduled for this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {sessions.map((session) => (
        <Card 
          key={session.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSessionSelect(session)}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between space-x-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {session.isLive && (
                    <div className="flex items-center space-x-1">
                      <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-red-600">LIVE</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {session.type}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm truncate">{session.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(session.startTime)}</span>
                  <span>({session.duration}min)</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">by {session.host}</p>
              </div>
              {session.hasRSVP && (
                <UserCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SessionCalendar({ sessions, onSessionSelect, onDateSelect }: SessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar grid
  const calendarDays = [];
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      sessions: sessions.filter(s => 
        s.startTime.toDateString() === date.toDateString()
      )
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({
      date,
      isCurrentMonth: true,
      sessions: sessions.filter(s => 
        s.startTime.toDateString() === date.toDateString()
      )
    });
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      sessions: sessions.filter(s => 
        s.startTime.toDateString() === date.toDateString()
      )
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleSessionSelect = (session: Session) => {
    onSessionSelect?.(session);
  };

  const today = new Date();
  const selectedDateSessions = selectedDate 
    ? sessions.filter(s => s.startTime.toDateString() === selectedDate.toDateString())
    : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-lg">
            {MONTHS[month]} {year}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="h-8 px-3 text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {WEEKDAYS.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((dayData, index) => (
            <CalendarDay
              key={index}
              date={dayData.date}
              isCurrentMonth={dayData.isCurrentMonth}
              isToday={dayData.date.toDateString() === today.toDateString()}
              isSelected={selectedDate?.toDateString() === dayData.date.toDateString()}
              sessions={dayData.sessions}
              onClick={() => handleDateClick(dayData.date)}
              onSessionSelect={handleSessionSelect}
            />
          ))}
        </div>
      </div>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">
            Sessions for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <SessionsList 
            sessions={selectedDateSessions} 
            onSessionSelect={handleSessionSelect}
          />
        </div>
      )}

      {/* Calendar Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Mentorship</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Workshop</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>Campaign</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Live Now</span>
        </div>
      </div>
    </div>
  );
}
