import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Rocket,
  Settings,
  Database,
  Server,
  Code,
  Terminal,
  Zap,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface DevAccessProps {
  onAccessGranted: () => void;
}

export function DevAccess({ onAccessGranted }: DevAccessProps) {
  const [devKey, setDevKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleDevAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check for development key (you can set this in environment variables)
    const validDevKey = import.meta.env.VITE_DEV_KEY || 'dev123';

    if (devKey === validDevKey) {
      // Set development mode
      localStorage.setItem('devMode', 'true');
      localStorage.setItem(
        'devUser',
        JSON.stringify({
          id: 'dev-admin',
          email: 'admin@ispora.dev',
          firstName: 'Dev',
          lastName: 'Admin',
          userType: 'admin',
          username: 'dev-admin',
        }),
      );

      toast.success('Development access granted!');
      onAccessGranted();
    } else {
      toast.error('Invalid development key');
    }

    setIsAuthenticating(false);
  };

  const handleQuickAccess = () => {
    // Quick access for development (bypass authentication)
    localStorage.setItem('devMode', 'true');
    localStorage.setItem(
      'devUser',
      JSON.stringify({
        id: 'dev-admin',
        email: 'admin@ispora.dev',
        firstName: 'Dev',
        lastName: 'Admin',
        userType: 'admin',
        username: 'dev-admin',
      }),
    );

    toast.success('Quick development access granted!');
    onAccessGranted();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Development Access</h1>
          <p className="text-gray-300">Enter your development key to access the platform</p>
        </div>

        {/* Development Access Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Development Authentication
            </CardTitle>
            <CardDescription className="text-gray-300">
              This is a restricted development environment. Only authorized developers can access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDevAccess} className="space-y-4">
              <div>
                <Label htmlFor="dev-key" className="text-white">
                  Development Key
                </Label>
                <div className="relative">
                  <Input
                    id="dev-key"
                    type={showKey ? 'text' : 'password'}
                    placeholder="Enter development key"
                    value={devKey}
                    onChange={(e) => setDevKey(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Access Development Platform
                  </>
                )}
              </Button>
            </form>

            {/* Quick Access for Development */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">Quick Development Access</p>
                <Button
                  variant="outline"
                  onClick={handleQuickAccess}
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Dev Access (Bypass)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Info */}
        <Card className="mt-6 bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Development Environment</span>
            </div>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Server className="h-3 w-3 text-green-400" />
                <span>
                  Backend: {import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-blue-400" />
                <span>Database: SQLite (Development)</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-3 w-3 text-purple-400" />
                <span>Mode: Development</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Security Notice</p>
              <p className="text-xs text-yellow-300 mt-1">
                This is a development environment. Do not use production credentials or sensitive
                data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
