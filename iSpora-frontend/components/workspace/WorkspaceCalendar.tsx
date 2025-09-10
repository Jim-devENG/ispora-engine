import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Video,
  CheckSquare,
  FileText,
  Award,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'paused' | 'completed';
  progress: number;
  nextSession?: Date;
  totalSessions: number;
  completedSessions: number;
  completedTasks: number;
  totalTasks: number;
  totalDeliverables: number;
  submittedDeliverables: number;
  certificatesEarned: number;
}

interface WorkspaceCalendarProps {
  selectedMentee: Mentee | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'session' | 'task' | 'submission' | 'review';
  status: 'upcoming' | 'ongoing' | 'completed';
  mentee?: string;
}

interface TaskSummary {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface ProgressMetric {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ComponentType<any>;
}

// Mock data for calendar events
const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "AI/ML Career Discussion",
    time: "2:00 PM",
    date: "Today",
    type: "session",
    status: "upcoming",
    mentee: "Amara Okafor"
  },
  {
    id: "2",
    title: "Project Review Session",
    time: "10:00 AM",
    date: "Tomorrow",
    type: "session",
    status: "upcoming",
    mentee: "David Mensah"
  },
  {
    id: "3",
    title: "Weekly Progress Review",
    time: "3:00 PM",
    date: "Friday",
    type: "review",
    status: "upcoming",
    mentee: "Fatima Al-Rashid"
  }
];

// Mock task summaries
const mockTasks: TaskSummary[] = [
  {
    id: "1",
    title: "Complete ML Project",
    status: "in-progress",
    dueDate: "2 days",
    priority: "high"
  },
  {
    id: "2",
    title: "Read Chapter 3",
    status: "todo",
    dueDate: "5 days",
    priority: "medium"
  },
  {
    id: "3",
    title: "Portfolio Update",
    status: "done",
    dueDate: "Completed",
    priority: "low"
  }
];

const eventTypeColors = {
  session: "bg-blue-100 text-blue-800",
  task: "bg-green-100 text-green-800",
  submission: "bg-purple-100 text-purple-800",
  review: "bg-orange-100 text-orange-800"
};

const taskStatusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800"
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

function MiniCalendar() {
  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  
  // Simple calendar grid (for demo purposes)
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`day-header-${index}-${day}`} className="p-1 text-center font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div
            key={`calendar-day-${index}-${day || 'empty'}`}
            className={`p-1 text-center cursor-pointer rounded hover:bg-gray-100 ${
              day === today ? 'bg-[#021ff6] text-white font-medium' : day ? 'text-gray-700' : ''
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressCard({ title, progress, color, icon: Icon }: {
  title: string;
  progress: number;
  color: string;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-medium">{title}</h5>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progress} className="h-1 flex-1" />
              <span className="text-xs text-gray-600">{progress}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceCalendar({ selectedMentee }: WorkspaceCalendarProps) {
  const [events] = useState<CalendarEvent[]>(mockEvents);
  const [tasks] = useState<TaskSummary[]>(mockTasks);

  // Filter events for selected mentee if provided
  const filteredEvents = selectedMentee 
    ? events.filter(event => event.mentee === selectedMentee.name)
    : events;

  // Calculate progress metrics for selected mentee
  const progressMetrics: ProgressMetric[] = selectedMentee ? [
    {
      label: "Sessions",
      value: selectedMentee.completedSessions,
      total: selectedMentee.totalSessions,
      color: "bg-blue-500",
      icon: Video
    },
    {
      label: "Tasks",
      value: selectedMentee.completedTasks,
      total: selectedMentee.totalTasks,
      color: "bg-green-500",
      icon: CheckSquare
    },
    {
      label: "Submissions",
      value: selectedMentee.submittedDeliverables,
      total: selectedMentee.totalDeliverables,
      color: "bg-purple-500",
      icon: FileText
    },
    {
      label: "Certificates",
      value: selectedMentee.certificatesEarned,
      total: 3, // Example total certificates available
      color: "bg-orange-500",
      icon: Award
    }
  ] : [];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Workspace Dashboard</h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Selected Mentee Overview */}
        {selectedMentee && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMentee.avatar} alt={selectedMentee.name} />
                  <AvatarFallback>
                    {selectedMentee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedMentee.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      selectedMentee.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedMentee.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {selectedMentee.status}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {selectedMentee.progress}% complete
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Overall Progress</span>
                  <span>{selectedMentee.progress}%</span>
                </div>
                <Progress value={selectedMentee.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mini Calendar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniCalendar />
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {selectedMentee ? 'No upcoming events' : 'Select a mentee to see their events'}
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{event.title}</h5>
                      <p className="text-xs text-gray-600">{event.date} at {event.time}</p>
                      <Badge className={`${eventTypeColors[event.type]} text-xs mt-1`}>
                        {event.type}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      {event.type === 'session' ? 'Join' : 'View'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress Metrics */}
        {selectedMentee && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Progress Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${metric.color} h-1.5 rounded-full`}
                          style={{ width: `${(metric.value / metric.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {metric.value}/{metric.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Task Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium">{task.title}</h5>
                    <p className="text-xs text-gray-600">Due {task.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${priorityColors[task.priority]} text-xs`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${taskStatusColors[task.status]} text-xs`}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {!selectedMentee && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Workspace Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">5</div>
                  <div className="text-xs text-blue-600">Active Mentees</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">12</div>
                  <div className="text-xs text-green-600">Sessions This Week</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-semibold text-purple-600">8</div>
                  <div className="text-xs text-purple-600">Pending Tasks</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">3</div>
                  <div className="text-xs text-orange-600">Certificates Ready</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Progress */}
        {selectedMentee && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ProgressCard 
                  title="Technical Skills" 
                  progress={85} 
                  color="bg-blue-500" 
                  icon={CheckSquare}
                />
                <ProgressCard 
                  title="Career Development" 
                  progress={70} 
                  color="bg-green-500" 
                  icon={TrendingUp}
                />
                <ProgressCard 
                  title="Communication" 
                  progress={90} 
                  color="bg-purple-500" 
                  icon={Users}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
