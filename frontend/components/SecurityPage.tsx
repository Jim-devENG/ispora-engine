import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Eye,
  Download
} from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";

export function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const [loginActivity] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.100",
      timestamp: "2024-01-15 14:30:00",
      status: "success"
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.101",
      timestamp: "2024-01-15 09:15:00",
      status: "success"
    },
    {
      id: "3",
      device: "Firefox on Linux",
      location: "Unknown Location",
      ipAddress: "203.0.113.195",
      timestamp: "2024-01-14 22:45:00",
      status: "blocked"
    }
  ]);

  const [activeSessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "San Francisco, CA",
      lastActive: "Active now",
      current: true
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "San Francisco, CA",
      lastActive: "2 hours ago",
      current: false
    }
  ]);

  return (
    <div className="h-full">
      <DashboardHeader 
        userName="John" 
        userTitle="Manage your account security"
      />
      
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Security</h1>
            <p className="text-muted-foreground">
              Protect your account with advanced security features
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Security Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Security Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Score</span>
                </CardTitle>
                <CardDescription>
                  Your account security score based on enabled features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.75)}`}
                        className="text-green-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">75%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-600">Good</h3>
                    <p className="text-sm text-gray-600">Your account is well protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  Improve your account security with these recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-yellow-700">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Strong Password</p>
                      <p className="text-sm text-green-700">Your password meets security requirements</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Login Alerts Enabled</p>
                      <p className="text-sm text-green-700">You'll be notified of suspicious login attempts</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Two-Factor Authentication</span>
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      {twoFactorEnabled 
                        ? "Your account is protected with 2FA" 
                        : "Protect your account with 2FA"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={twoFactorEnabled ? "default" : "destructive"}
                      className={twoFactorEnabled ? "bg-green-100 text-green-800" : ""}
                    >
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      {twoFactorEnabled ? "Disable" : "Setup"}
                    </Button>
                  </div>
                </div>

                {twoFactorEnabled && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      2FA is enabled using your authenticator app. Backup codes have been generated.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      View Backup Codes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password</span>
                </CardTitle>
                <CardDescription>
                  Manage your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Security Preferences</CardTitle>
                <CardDescription>
                  Configure additional security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={loginAlerts}
                    onCheckedChange={setLoginAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-600">Automatically log out after 24 hours</p>
                  </div>
                  <Switch
                    checked={sessionTimeout}
                    onCheckedChange={setSessionTimeout}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Active Sessions</h3>
                <p className="text-sm text-gray-600">Manage devices that are currently signed in</p>
              </div>
              <Button variant="outline">
                Sign Out All Other Sessions
              </Button>
            </div>

            <div className="space-y-4">
              {activeSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded">
                          <Globe className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{session.device}</p>
                            {session.current && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{session.location}</p>
                          <p className="text-xs text-gray-500">{session.lastActive}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm">
                          Sign Out
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Login Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Login Activity</h3>
                <p className="text-sm text-gray-600">Recent login attempts and security events</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Activity
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Device</th>
                        <th className="text-left p-4 font-medium">Location</th>
                        <th className="text-left p-4 font-medium">IP Address</th>
                        <th className="text-left p-4 font-medium">Date</th>
                        <th className="text-left p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginActivity.map((activity) => (
                        <tr key={activity.id} className="border-b">
                          <td className="p-4 text-sm">{activity.device}</td>
                          <td className="p-4 text-sm">{activity.location}</td>
                          <td className="p-4 text-sm font-mono">{activity.ipAddress}</td>
                          <td className="p-4 text-sm">{activity.timestamp}</td>
                          <td className="p-4">
                            <Badge 
                              variant={activity.status === 'success' ? 'default' : 'destructive'}
                              className={activity.status === 'success' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {activity.status === 'success' ? 'Success' : 'Blocked'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}