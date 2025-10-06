import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import {
  Users,
  Shield,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  Mail,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  Database,
  Server,
  Clock,
  Star,
  Flag,
  MessageSquare,
  FileText,
  Image,
  Video,
  Link,
  Calendar,
  MapPin,
  Tag,
  Award,
  Target,
  Zap,
  RefreshCw,
  Plus,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowUpDown,
  ExternalLink,
  Copy,
  Send,
  Archive,
  ArchiveRestore,
  Ban,
  UserCheck,
  UserX,
  Crown,
  Key,
  Database as DatabaseIcon,
  HardDrive,
  Wifi,
  Cpu,
  MemoryStick,
  Monitor,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

// Real-time data fetching functions
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

const fetchSystemStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.data : null;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    return null;
  }
};

const fetchReports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reports`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.data : [];
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
};

// Enhanced mock data for development
const mockSystemStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersToday: 23,
  totalProjects: 156,
  totalOpportunities: 89,
  totalMentorships: 45,
  systemHealth: 'excellent',
  uptime: '99.9%',
  responseTime: '120ms',
  storageUsed: '2.3GB',
  bandwidthUsed: '15.2GB',
  cpuUsage: '45%',
  memoryUsage: '67%',
  diskUsage: '34%',
  networkLatency: '12ms',
  errorRate: '0.1%',
  requestsPerMinute: 156,
  activeConnections: 89,
};

const mockSystemLogs = [
  {
    id: '1',
    timestamp: '2024-12-29 14:30:25',
    level: 'info',
    message: 'User registration successful',
    user: 'sarah.chen@stanford.edu',
    ip: '192.168.1.100',
    category: 'authentication',
  },
  {
    id: '2',
    timestamp: '2024-12-29 14:25:10',
    level: 'warning',
    message: 'High memory usage detected',
    user: 'system',
    ip: 'server-01',
    category: 'system',
  },
  {
    id: '3',
    timestamp: '2024-12-29 14:20:45',
    level: 'error',
    message: 'Database connection timeout',
    user: 'system',
    ip: 'server-01',
    category: 'database',
  },
  {
    id: '4',
    timestamp: '2024-12-29 14:15:30',
    level: 'info',
    message: 'Project created successfully',
    user: 'alex.johnson@mit.edu',
    ip: '192.168.1.101',
    category: 'content',
  },
  {
    id: '5',
    timestamp: '2024-12-29 14:10:15',
    level: 'warning',
    message: 'Suspicious activity detected',
    user: 'system',
    ip: '192.168.1.200',
    category: 'security',
  },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(mockSystemStats);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Check if user has admin privileges
  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <p className="text-sm text-gray-600">
              Contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real-time data fetching
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, statsData, reportsData] = await Promise.all([
          fetchUsers(),
          fetchSystemStats(),
          fetchReports(),
        ]);

        setUsers(usersData);
        if (statsData) setSystemStats(statsData);
        setReports(reportsData);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Failed to load admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [usersData, statsData, reportsData] = await Promise.all([
        fetchUsers(),
        fetchSystemStats(),
        fetchReports(),
      ]);

      setUsers(usersData);
      if (statsData) setSystemStats(statsData);
      setReports(reportsData);
      setLastRefresh(new Date());
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`User ${action} successful`);
        // Refresh users list
        const usersData = await fetchUsers();
        setUsers(usersData);
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`User ${action} error:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/bulk/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (response.ok) {
        toast.success(`Bulk ${action} successful for ${selectedUsers.length} users`);
        setSelectedUsers([]);
        // Refresh users list
        const usersData = await fetchUsers();
        setUsers(usersData);
      } else {
        toast.error(`Failed to ${action} users`);
      }
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

  const handleReportAction = async (action: string, reportId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(`Report ${action} successful`);
        // Refresh reports list
        const reportsData = await fetchReports();
        setReports(reportsData);
      } else {
        toast.error(`Failed to ${action} report`);
      }
    } catch (error) {
      console.error(`Report ${action} error:`, error);
      toast.error(`Failed to ${action} report`);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">
              Manage your iSpora platform • Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              System Healthy
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats.totalUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />+{systemStats.newUsersToday} today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {systemStats.activeUsers.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +5 this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{systemStats.uptime}</div>
                  <p className="text-xs text-muted-foreground">
                    Response: {systemStats.responseTime}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-lg font-bold">{systemStats.cpuUsage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-lg font-bold">{systemStats.memoryUsage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disk Usage</span>
                    <span className="text-lg font-bold">{systemStats.diskUsage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network Latency</span>
                    <span className="text-lg font-bold">{systemStats.networkLatency}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Connections</span>
                    <span className="text-lg font-bold">{systemStats.activeConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requests/Min</span>
                    <span className="text-lg font-bold">{systemStats.requestsPerMinute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-lg font-bold text-red-600">{systemStats.errorRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-lg font-bold">{systemStats.storageUsed}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {mockSystemLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${getLogLevelColor(log.level)}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getLogLevelIcon(log.level)}
                              <span className="text-sm font-medium text-gray-900">
                                {log.message}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{log.timestamp}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{log.user}</span>
                              <span>•</span>
                              <span>{log.ip}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('suspend')}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Suspend ({selectedUsers.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('activate')}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Activate ({selectedUsers.length})
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction('delete')}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete ({selectedUsers.length})
                        </Button>
                      </div>
                    )}
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                            }
                          }}
                        />
                        <img
                          src={user.avatar || '/api/placeholder/40/40'}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction('suspend', user.id)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction('activate', user.id)}
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Moderation</CardTitle>
                  <CardDescription>Review and moderate user-generated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">AI Ethics Research Project</p>
                          <p className="text-sm text-gray-500">Posted by Dr. Sarah Chen</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Featured Content</CardTitle>
                  <CardDescription>Manage featured projects and opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Healthcare Mentorship Network</p>
                          <p className="text-sm text-gray-500">Featured project</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
                <CardDescription>Review and resolve user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={report.priority === 'high' ? 'destructive' : 'secondary'}>
                            {report.priority}
                          </Badge>
                          <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{report.type?.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">Reported by {report.reporter}</p>
                        <p className="text-sm text-gray-500">Content: {report.content}</p>
                        <p className="text-sm text-gray-500">Reason: {report.reason}</p>
                        <p className="text-xs text-gray-400">{report.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleReportAction('resolve', report.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction('dismiss', report.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Key metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Users</span>
                      <span className="text-2xl font-bold">
                        {systemStats.totalUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-2xl font-bold">
                        {systemStats.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Projects</span>
                      <span className="text-2xl font-bold">{systemStats.totalProjects}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Opportunities</span>
                      <span className="text-2xl font-bold">{systemStats.totalOpportunities}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Server and infrastructure metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-2xl font-bold text-green-600">
                        {systemStats.uptime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-2xl font-bold">{systemStats.responseTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Storage Used</span>
                      <span className="text-2xl font-bold">{systemStats.storageUsed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Bandwidth Used</span>
                      <span className="text-2xl font-bold">{systemStats.bandwidthUsed}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="iSpora" />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      defaultValue="Connect, Learn, and Grow Together"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <Select defaultValue="disabled">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure email notifications and templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" placeholder="smtp.gmail.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                  <div>
                    <Label htmlFor="from-email">From Email</Label>
                    <Input id="from-email" placeholder="noreply@ispora.app" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
