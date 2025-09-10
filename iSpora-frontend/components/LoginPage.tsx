import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2,
  Globe,
  GraduationCap,
  Users,
  BookOpen,
  UserPlus
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const { login, register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'student' as 'student' | 'professional' | 'mentor',
    username: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      onSuccess?.();
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const result = await register({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      userType: registerData.userType,
      username: registerData.username || undefined,
    });
    
    if (result.success) {
      toast.success('Account created successfully!');
      onSuccess?.();
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const userTypeOptions = [
    {
      value: 'student',
      label: 'Student',
      description: 'Currently studying or learning',
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      value: 'professional',
      label: 'Professional',
      description: 'Working in industry',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      value: 'mentor',
      label: 'Mentor',
      description: 'Experienced professional',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl mb-6 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">iSpora</h1>
          <p className="text-gray-600 text-lg">Connect, Learn, and Grow Together</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8">
            <CardTitle className="text-2xl text-center font-bold text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-6">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="register-firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="First name"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="register-lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Last name"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-username" className="text-sm font-medium text-gray-700">Username (Optional)</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">User Type</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {userTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                              registerData.userType === option.value
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="userType"
                              value={option.value}
                              checked={registerData.userType === option.value}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, userType: e.target.value as any }))}
                              className="sr-only"
                            />
                            <Icon className={`mr-4 h-6 w-6 ${option.color}`} />
                            <div>
                              <div className="font-semibold text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-12 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="register-confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        id="register-confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>By signing in, you agree to our <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Terms of Service</span> and <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Privacy Policy</span></p>
        </div>
      </div>
    </div>
  );
}
