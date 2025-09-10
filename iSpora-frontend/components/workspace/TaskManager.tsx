import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Flag,
  MessageCircle,
  Paperclip,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  Filter,
  TrendingUp,
  BarChart3,
  Target,
  Users
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  assignedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  comments: Comment[];
  attachments: Attachment[];
  tags?: string[];
}

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Mentee {
  id: string;
  name: string;
  avatar?: string;
  university: string;
  program: string;
  year: string;
}

interface TaskManagerProps {
  mentee: Mentee;
  projectMembers?: ProjectMember[];
}

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "mentor" | "student" | "collaborator" | "viewer";
  status: "active" | "pending" | "inactive";
  avatar?: string;
}

// Type aliases to avoid JSX parsing issues
type TaskStatus = Task['status'];

// Mock project members data
const mockProjectMembers: ProjectMember[] = [
  {
    id: "1",
    name: "Dr. Amina Hassan",
    email: "amina.hassan@university.edu",
    role: "mentor",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "2",
    name: "Amara Okafor",
    email: "amara.okafor@student.edu",
    role: "student",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    email: "maria.r@techcorp.com",
    role: "collaborator",
    status: "active"
  }
];

// Clean mock tasks data without notifications
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Machine Learning Project",
    description: "Build a classification model using scikit-learn and document the process",
    status: 'in-progress',
    priority: 'high',
    assignee: "Amara Okafor",
    assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: "c1",
        author: "Dr. Amina Hassan",
        authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
        content: "Great progress so far! Make sure to document your feature engineering process.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    attachments: [
      {
        id: "a1",
        name: "project_requirements.pdf",
        size: 245760,
        type: "application/pdf",
        url: "#"
      }
    ],
    tags: ["machine-learning", "project", "python"]
  },
  {
    id: "2",
    title: "Read 'Hands-On Machine Learning' Chapter 3",
    description: "Focus on classification algorithms and take notes",
    status: 'todo',
    priority: 'medium',
    assignee: "Amara Okafor",
    assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    comments: [],
    attachments: [],
    tags: ["reading", "theory"]
  },
  {
    id: "3",
    title: "Update LinkedIn Profile",
    description: "Add recent projects and skills, optimize for AI/ML roles",
    status: 'done',
    priority: 'low',
    assignee: "Amara Okafor",
    assignedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    comments: [
      {
        id: "c2",
        author: "Amara Okafor",
        authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b25f5e55?w=150&h=150&fit=crop&crop=face",
        content: "Completed! Added 3 new projects and updated skills section.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    attachments: [],
    tags: ["career", "networking"]
  },
  {
    id: "4",
    title: "Practice Coding Interview Questions",
    description: "Complete 10 algorithm problems on LeetCode focusing on arrays and strings",
    status: 'todo',
    priority: 'high',
    assignee: "Dr. Amina Hassan",
    assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    comments: [],
    attachments: [],
    tags: ["coding", "interview-prep"]
  },
  {
    id: "5",
    title: "Review Team Performance",
    description: "Analyze team productivity metrics and provide feedback",
    status: 'in-progress',
    priority: 'medium',
    assignee: "Maria Rodriguez",
    assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    comments: [],
    attachments: [],
    tags: ["management", "analytics"]
  }
];

const statusConfig = {
  'todo': { title: 'To Do', color: 'bg-gray-100', textColor: 'text-gray-800' },
  'in-progress': { title: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-800' },
  'done': { title: 'Done', color: 'bg-green-100', textColor: 'text-green-800' }
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityIcons = {
  low: '🟢',
  medium: '🟡',
  high: '🔴'
};

function TaskCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const isOverdue = task.dueDate && task.status !== 'done' && new Date() > task.dueDate;
  const isDueSoon = task.dueDate && task.status !== 'done' && 
    (task.dueDate.getTime() - Date.now()) <= 2 * 24 * 60 * 60 * 1000; // 2 days

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="mb-2 hover:shadow-md transition-shadow cursor-grab">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs font-medium line-clamp-1">{task.title}</CardTitle>
            {task.description && (
              <CardDescription className="text-xs mt-0.5 line-clamp-1 text-gray-500">
                {task.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        {/* Priority and Due Date */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`${priorityColors[task.priority]} text-xs px-1.5 py-0.5`}>
            {priorityIcons[task.priority]} {task.priority}
          </Badge>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {isOverdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 1).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1 py-0.5">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 1 && (
              <Badge variant="secondary" className="text-xs px-1 py-0.5">
                +{task.tags.length - 1}
              </Badge>
            )}
          </div>
        )}

        {/* Attachments and Comments Count */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                <MessageCircle className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </button>
            )}
          </div>
          <Avatar className="h-4 w-4">
            <AvatarFallback className="text-xs">{task.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        </div>

        {/* Attachments */}
        {task.attachments.length > 0 && (
          <div className="space-y-1">
            {task.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                <Paperclip className="h-3 w-3 text-gray-400" />
                <span className="flex-1 truncate">{attachment.name}</span>
                <span className="text-gray-500">{formatFileSize(attachment.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-2 border-t pt-3">
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-5 w-5 flex-shrink-0">
                    <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                    <AvatarFallback className="text-xs">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{comment.author}</div>
                    <div className="text-xs text-gray-600">{comment.content}</div>
                    <div className="text-xs text-gray-400">
                      {formatDate(comment.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="text-xs"
              />
              <Button size="sm" className="px-3">
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Status Change Buttons */}
        <div className="flex gap-1">
          {task.status !== 'todo' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-6"
              onClick={() => onStatusChange(task.id, 'todo')}
            >
              To Do
            </Button>
          )}
          {task.status !== 'in-progress' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-6"
              onClick={() => onStatusChange(task.id, 'in-progress')}
            >
              In Progress
            </Button>
          )}
          {task.status !== 'done' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-6"
              onClick={() => onStatusChange(task.id, 'done')}
            >
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ 
  status, 
  tasks, 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange 
}: {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const config = statusConfig[status];

  return (
    <div className="flex-1 min-w-96 flex flex-col task-manager-column">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{config.title}</h3>
          <Badge variant="outline" className={`${config.color} ${config.textColor}`}>
            {tasks.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onAddTask(status)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tasks in {config.title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskAnalytics({ tasks, projectMembers }: { tasks: Task[], projectMembers: ProjectMember[] }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const overdueTasks = tasks.filter(t => 
    t.dueDate && t.status !== 'done' && new Date() > t.dueDate
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task distribution by assignee
  const tasksByAssignee = projectMembers.map(member => ({
    name: member.name,
    avatar: member.avatar,
    role: member.role,
    total: tasks.filter(t => t.assignee === member.name).length,
    completed: tasks.filter(t => t.assignee === member.name && t.status === 'done').length,
    inProgress: tasks.filter(t => t.assignee === member.name && t.status === 'in-progress').length,
    todo: tasks.filter(t => t.assignee === member.name && t.status === 'todo').length
  })).filter(member => member.total > 0);

  // Priority distribution
  const priorityDistribution = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-xl font-semibold">{totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-semibold">{completedTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-semibold">{inProgressTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-semibold">{overdueTasks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Overall Progress</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            {completionRate}% Complete
          </Badge>
        </div>
        <Progress value={completionRate} className="mb-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{completedTasks} completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>
      </Card>

      {/* Team Performance */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Team Performance</h3>
        <div className="space-y-4">
          {tasksByAssignee.map((member) => (
            <div key={member.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{member.completed}/{member.total}</p>
                  <p className="text-xs text-gray-500">
                    {member.total > 0 ? Math.round((member.completed / member.total) * 100) : 0}%
                  </p>
                </div>
              </div>
              <Progress value={member.total > 0 ? (member.completed / member.total) * 100 : 0} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>✅ {member.completed} • ⏳ {member.inProgress} • 📋 {member.todo}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Priority Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">High Priority</span>
            </div>
            <span className="text-sm font-medium">{priorityDistribution.high}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm">Medium Priority</span>
            </div>
            <span className="text-sm font-medium">{priorityDistribution.medium}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Low Priority</span>
            </div>
            <span className="text-sm font-medium">{priorityDistribution.low}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TaskManager({ mentee, projectMembers = mockProjectMembers }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    assignee: mentee.name,
    tags: ''
  });

  // Filter states
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const assigneeMatch = selectedAssignee === 'all' || task.assignee === selectedAssignee;
    const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
    return assigneeMatch && priorityMatch;
  });

  const tasksByStatus = {
    'todo': filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'done': filteredTasks.filter(t => t.status === 'done')
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateTaskStatus(status);
    setEditingTask(null);
    setNewTaskData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignee: mentee.name,
      tags: ''
    });
    setShowCreateDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      assignee: task.assignee,
      tags: task.tags?.join(', ') || ''
    });
    setShowCreateDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedDate: newStatus === 'done' ? new Date() : undefined
          }
        : task
    ));
  };

  const handleSaveTask = () => {
    if (!newTaskData.title.trim()) return;

    const taskData = {
      id: editingTask?.id || Date.now().toString(),
      title: newTaskData.title,
      description: newTaskData.description || undefined,
      status: editingTask?.status || createTaskStatus,
      priority: newTaskData.priority,
      assignee: newTaskData.assignee,
      assignedDate: editingTask?.assignedDate || new Date(),
      dueDate: newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined,
      completedDate: editingTask?.completedDate,
      comments: editingTask?.comments || [],
      attachments: editingTask?.attachments || [],
      tags: newTaskData.tags ? newTaskData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined
    };

    if (editingTask) {
      setTasks(prev => prev.map(task => task.id === editingTask.id ? taskData : task));
    } else {
      setTasks(prev => [...prev, taskData]);
    }

    setShowCreateDialog(false);
    setEditingTask(null);
  };

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
  const overdueTasks = filteredTasks.filter(t => 
    t.dueDate && t.status !== 'done' && new Date() > t.dueDate
  ).length;

  // Get unique assignees for filter
  const assignees = Array.from(new Set(tasks.map(t => t.assignee)));

  return (
    <div className="flex flex-col">
      <Tabs defaultValue="kanban" className="flex flex-col">
        <div className="flex-shrink-0 px-8 py-6 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Task Manager</h3>
              <p className="text-gray-600">Track tasks and progress for {mentee.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="kanban" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#021ff6] hover:bg-[#021ff6]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTask ? 'Update task details' : `Create a task for ${mentee.name}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Task Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Complete ML project"
                        value={newTaskData.title}
                        onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Task details and requirements..."
                        value={newTaskData.description}
                        onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignee">Assign To</Label>
                      <Select 
                        value={newTaskData.assignee} 
                        onValueChange={(value) => setNewTaskData(prev => ({ ...prev, assignee: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectMembers
                            .filter(member => member.status === 'active')
                            .map((member) => (
                              <SelectItem key={member.id} value={member.name} className="cursor-pointer">
                                <div className="flex items-center gap-2 w-full">
                                  <Avatar className="h-5 w-5 flex-shrink-0">
                                    {member.avatar ? (
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                    ) : (
                                      <AvatarFallback className="text-xs">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="flex-1 truncate">{member.name}</span>
                                  <Badge variant="outline" className="text-xs flex-shrink-0 capitalize">
                                    {member.role}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          value={newTaskData.priority} 
                          onValueChange={(value: Task['priority']) => setNewTaskData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Medium" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Low</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="high">🔴 High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input 
                          id="dueDate" 
                          type="date"
                          value={newTaskData.dueDate}
                          onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input 
                        id="tags" 
                        placeholder="e.g., coding, project, python"
                        value={newTaskData.tags}
                        onChange={(e) => setNewTaskData(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-[#021ff6] hover:bg-[#021ff6]/90"
                        onClick={handleSaveTask}
                        disabled={!newTaskData.title.trim()}
                      >
                        {editingTask ? 'Update Task' : 'Create Task'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#021ff6]">{totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{completedTasks}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">{overdueTasks}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>

        <TabsContent value="kanban" className="flex-1">
          {/* Filters */}
          <div className="px-8 py-6 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {assignee}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">🔴 High priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium priority</SelectItem>
                  <SelectItem value="low">🟢 Low priority</SelectItem>
                </SelectContent>
              </Select>

              {(selectedAssignee !== 'all' || selectedPriority !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedAssignee('all');
                    setSelectedPriority('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="px-8 py-6">
            <div className="flex gap-6 task-manager-kanban">
              {(Object.keys(statusConfig) as TaskStatus[]).map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status]}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="px-8 py-6">
              <TaskAnalytics tasks={tasks} projectMembers={projectMembers} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
