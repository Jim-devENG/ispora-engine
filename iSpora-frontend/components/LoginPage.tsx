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
  BookOpen
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

    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = await register({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      userType: registerData.userType,
      username: registerData.username,
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
      description: 'Currently studying',
      icon: GraduationCap,
      color: 'text-[#021ff6]',
      bgColor: 'bg-[#021ff6]/5',
    },
    {
      value: 'professional',
      label: 'Professional',
      description: 'Working in industry',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      value: 'mentor',
      label: 'Mentor',
      description: 'Guiding others',
      icon: BookOpen,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021ff6]/5 via-white to-[#021ff6]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#021ff6] to-[#021ff6]/80 rounded-2xl mb-3 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#021ff6] font-bold text-lg">i</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#021ff6] mb-1">iSpora</h1>
          <p className="text-gray-600 text-sm">Connect, Learn, and Grow Together</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md rounded-xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 pt-4">
            <CardTitle className="text-lg text-center font-bold text-gray-800">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-3 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-xs font-medium text-gray-700">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#021ff6] transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-xs font-medium text-gray-700">Password</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#021ff6] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-9 bg-[#021ff6] hover:bg-[#021ff6]/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName" className="text-xs font-medium text-gray-700">First Name</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="John"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName" className="text-xs font-medium text-gray-700">Last Name</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Doe"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-xs font-medium text-gray-700">Email Address</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#021ff6] transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10 h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">User Type</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {userTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                            registerData.userType === option.value
                              ? 'border-[#021ff6] bg-[#021ff6]/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            name="userType"
                            value={option.value}
                            checked={registerData.userType === option.value}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, userType: e.target.value as 'student' | 'professional' | 'mentor' }))}
                            className="sr-only"
                          />
                          <div className={`flex-shrink-0 mr-3 ${option.color}`}>
                            <option.icon size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-xs font-medium text-gray-700">Password</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#021ff6] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Choose a strong password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10 h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirmPassword" className="text-xs font-medium text-gray-700">Confirm Password</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#021ff6] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="register-confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 h-9 border-gray-200 focus:border-[#021ff6] focus:ring-[#021ff6]/20 rounded-lg transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 bg-[#021ff6] hover:bg-[#021ff6]/90 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>By signing in, you agree to our <span className="text-[#021ff6] hover:text-[#021ff6]/80 cursor-pointer">Terms of Service</span> and <span className="text-[#021ff6] hover:text-[#021ff6]/80 cursor-pointer">Privacy Policy</span></p>
        </div>
      </div>
    </div>
  );
}