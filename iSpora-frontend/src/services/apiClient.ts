import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

class ApiClient {
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
        const token = authService.getToken();
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
          console.log('401 Unauthorized - clearing auth');
          
          // Check if backend specifically requested token clearing
          const errorData = error.response?.data;
          if (errorData?.clearToken) {
            console.log('🔄 Backend requested token clearing - user not found');
          }
          
          authService.logout();
          
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
      console.error('API request error:', error);
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

  // Project-specific methods
  async createProject(projectData: any) {
    return this.post('/projects', projectData);
  }

  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id: string) {
    return this.get(`/projects/${id}`);
  }

  async updateProject(id: string, projectData: any) {
    return this.put(`/projects/${id}`, projectData);
  }

  async deleteProject(id: string) {
    return this.delete(`/projects/${id}`);
  }

  // Task-specific methods
  async getTasks() {
    return this.get('/tasks');
  }

  async createTask(taskData: any) {
    return this.post('/tasks', taskData);
  }

  async updateTask(id: string, taskData: any) {
    return this.put(`/tasks/${id}`, taskData);
  }

  async deleteTask(id: string) {
    return this.delete(`/tasks/${id}`);
  }

  // Feed-specific methods
  async getFeed() {
    return this.get('/feed');
  }

  async getFeedStream() {
    return this.get('/feed/stream');
  }

  async getFeedSessions() {
    return this.get('/feed/sessions');
  }

  async trackActivity(activityData: any) {
    return this.post('/feed/activity', activityData);
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

export const apiClient = new ApiClient();
