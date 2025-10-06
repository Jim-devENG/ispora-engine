import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import {
  Settings,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Eye,
  Mail,
  Smartphone,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Check,
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    campaignUpdates: true,
    mentorshipRequests: true,
    systemUpdates: false,
    marketingEmails: false,

    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,

    // Appearance
    compactMode: false,
    highContrast: false,

    // Account
    twoFactorEnabled: false,
    loginAlerts: true,
    dataExport: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Light theme',
      iconColor: 'text-yellow-500',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Dark theme',
      iconColor: 'text-blue-500',
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Use system preference',
      iconColor: 'text-gray-500',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <DashboardHeader userName="John" userTitle="Manage your application settings" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your Aspora experience and manage preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Email Notifications</span>
                </CardTitle>
                <CardDescription>
                  Choose what email notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Campaign Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when campaigns you're involved in have updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.campaignUpdates}
                    onCheckedChange={(value) => handleSettingChange('campaignUpdates', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mentorship Requests</p>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone requests mentorship
                    </p>
                  </div>
                  <Switch
                    checked={settings.mentorshipRequests}
                    onCheckedChange={(value) => handleSettingChange('mentorshipRequests', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Important system announcements and maintenance notices
                    </p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(value) => handleSettingChange('systemUpdates', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-muted-foreground">
                      Product updates, tips, and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(value) => handleSettingChange('marketingEmails', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Push Notifications</span>
                </CardTitle>
                <CardDescription>Control push notifications for the web app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Allow Aspora to send push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound</p>
                    <p className="text-sm text-muted-foreground">Play notification sounds</p>
                  </div>
                  <Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Profile Visibility</span>
                </CardTitle>
                <CardDescription>Control who can see your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Email Address</p>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to see your email
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(value) => handleSettingChange('showEmail', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Phone Number</p>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to see your phone number
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(value) => handleSettingChange('showPhone', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Direct Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Let other users send you direct messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMessages}
                    onCheckedChange={(value) => handleSettingChange('allowMessages', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Online Status</p>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're online
                    </p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(value) => handleSettingChange('showOnlineStatus', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
                <CardDescription>Manage your data and privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Processing</p>
                      <p className="text-sm text-muted-foreground">
                        Allow Aspora to process your data for better recommendations
                      </p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">
                        Help improve Aspora by sharing usage analytics
                      </p>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full">
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Theme</span>
                </CardTitle>
                <CardDescription>
                  Choose your preferred color scheme for the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;

                    return (
                      <div key={option.value} className="text-center space-y-2">
                        <button
                          onClick={() => setTheme(option.value as any)}
                          className={`relative w-full p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            isSelected
                              ? 'border-[#021ff6] bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Icon className={`h-8 w-8 mx-auto ${option.iconColor}`} />
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-5 w-5 bg-[#021ff6] rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                        <div>
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Current selection:</strong>{' '}
                    {themeOptions.find((opt) => opt.value === theme)?.label}
                    {theme === 'system' && " (follows your device's preference)"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
                <CardDescription>Adjust display settings for better accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Use less space for interface elements
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(value) => handleSettingChange('compactMode', value)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Contrast</p>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(value) => handleSettingChange('highContrast', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-red-600">
                      Disabled
                    </Badge>
                    <Button size="sm">Setup</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    checked={settings.loginAlerts}
                    onCheckedChange={(value) => handleSettingChange('loginAlerts', value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>Manage your account and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Export Account Data
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
