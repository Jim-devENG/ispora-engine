import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

class ApiClientV2 {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🔐 Auth v2 - 401 Unauthorized - clearing token');
          
          // Clear token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show user-friendly error message
          if (typeof window !== 'undefined') {
            // Import toast dynamically to avoid circular dependencies
            import('sonner').then(({ toast }) => {
              toast.error('Session expired. Please log in again.');
            });
            
            // Redirect to login page
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      console.error('❌ Auth v2 - API request error:', error);
      throw error;
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Auth v2 methods
  async login(email: string, password: string) {
    console.log('🔍 Auth v2 - Login attempt:', { email });
    const response = await this.post('/auth/login', { email, password });
    
    if (response.success) {
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ Auth v2 - Login successful:', { userId: response.user.id, email });
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType?: string;
  }) {
    console.log('🔍 Auth v2 - Register attempt:', { email: userData.email });
    const response = await this.post('/auth/register', userData);
    
    if (response.success) {
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('✅ Auth v2 - Registration successful:', { userId: response.user.id, email: userData.email });
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('❌ Auth v2 - Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Auth v2 - Logged out successfully');
    }
  }

  // Project v2 methods
  async createProject(projectData: {
    title: string;
    description: string;
    type?: string;
    category?: string;
    tags?: string[];
    objectives?: string[];
    teamMembers?: any[];
    diasporaPositions?: any[];
    priority?: string;
    university?: string;
    mentorshipConnection?: boolean;
    isPublic?: boolean;
  }) {
    console.log('🔍 Auth v2 - Create project:', { title: projectData.title });
    const response = await this.post('/projects', projectData);
    console.log('✅ Auth v2 - Project created:', { projectId: response.project?.id });
    return response;
  }

  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id: string) {
    return this.get(`/projects/${id}`);
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('❌ Auth v2 - Error parsing user:', error);
        return null;
      }
    }
    return null;
  }
}

export const apiClientV2 = new ApiClientV2();
