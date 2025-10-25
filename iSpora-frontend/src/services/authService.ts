import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'professional' | 'mentor' | 'admin';
  username?: string;
  avatar?: string;
  isOnline?: boolean;
  lastLogin?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: 'student' | 'professional' | 'mentor';
  username?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.clearAuth();
      }
    }
  }

  private saveToStorage(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.token = token;
    this.user = user;
  }

  private clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = null;
    this.user = null;
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        this.saveToStorage(response.data.token, response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/register`, userData);

      if (response.data.success) {
        this.saveToStorage(response.data.token, response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshUser(): Promise<void> {
    try {
      if (this.token) {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (response.data.success) {
          this.user = response.data.user;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      this.clearAuth();
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }
}

export const authService = new AuthService();
