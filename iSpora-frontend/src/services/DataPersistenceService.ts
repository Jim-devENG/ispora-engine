// Enhanced data persistence service with error handling and localStorage fallback
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ispora-backend.onrender.com/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PersistenceOptions {
  enableLocalStorage?: boolean;
  showToast?: boolean;
  retryAttempts?: number;
}

class DataPersistenceService {
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const devKey = localStorage.getItem('devKey');
    const token = localStorage.getItem('token');
    
    if (devKey) headers['X-Dev-Key'] = devKey;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    persistenceOptions: PersistenceOptions = {}
  ): Promise<ApiResponse<T>> {
    const { enableLocalStorage = true, showToast = true, retryAttempts = 3 } = persistenceOptions;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, data: data.data || data };
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`API request failed (attempt ${attempt}/${retryAttempts}):`, error);
        
        if (attempt === retryAttempts) {
          // Final attempt failed, use localStorage fallback if enabled
          if (enableLocalStorage) {
            return this.handleOfflineFallback(endpoint, options, error as Error, showToast);
          }
          
          if (showToast) {
            toast.error(`Failed to save data: ${(error as Error).message}`);
          }
          return { success: false, error: (error as Error).message };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return { success: false, error: 'All retry attempts failed' };
  }

  private handleOfflineFallback(
    endpoint: string,
    options: RequestInit,
    error: Error,
    showToast: boolean
  ): ApiResponse {
    const method = options.method || 'GET';
    const timestamp = new Date().toISOString();
    
    // Store failed request in localStorage for later retry
    const failedRequest = {
      endpoint,
      method,
      body: options.body,
      timestamp,
      error: error.message,
    };
    
    const failedRequests = JSON.parse(localStorage.getItem('failedRequests') || '[]');
    failedRequests.push(failedRequest);
    localStorage.setItem('failedRequests', JSON.stringify(failedRequests));
    
    if (showToast) {
      toast.warning('Working offline - data will sync when connection is restored');
    }
    
    return { success: true, data: null };
  }

  // Task persistence
  async saveTask(taskData: any, options: PersistenceOptions = {}): Promise<ApiResponse> {
    const isUpdate = taskData.id && !taskData.id.startsWith('temp_');
    
    if (isUpdate) {
      return this.makeRequest(`/tasks/${taskData.id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      }, options);
    } else {
      // Generate temporary ID for new tasks
      const tempId = `temp_${Date.now()}`;
      const taskWithTempId = { ...taskData, id: tempId };
      
      const result = await this.makeRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskWithTempId),
      }, options);
      
      if (result.success && result.data) {
        // Update localStorage with real ID
        this.updateLocalStorageItem('tasks', tempId, result.data.id);
      }
      
      return result;
    }
  }

  async getTasks(projectId?: string): Promise<ApiResponse> {
    const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async deleteTask(taskId: string, options: PersistenceOptions = {}): Promise<ApiResponse> {
    return this.makeRequest(`/tasks/${taskId}`, { method: 'DELETE' }, options);
  }

  // Session persistence
  async saveSession(sessionData: any, options: PersistenceOptions = {}): Promise<ApiResponse> {
    const isUpdate = sessionData.id && !sessionData.id.startsWith('temp_');
    
    if (isUpdate) {
      return this.makeRequest(`/sessions/${sessionData.id}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      }, options);
    } else {
      const tempId = `temp_${Date.now()}`;
      const sessionWithTempId = { ...sessionData, id: tempId };
      
      const result = await this.makeRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionWithTempId),
      }, options);
      
      if (result.success && result.data) {
        this.updateLocalStorageItem('sessions', tempId, result.data.id);
      }
      
      return result;
    }
  }

  async getSessions(projectId?: string): Promise<ApiResponse> {
    const endpoint = projectId ? `/sessions?projectId=${projectId}` : '/sessions';
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async deleteSession(sessionId: string, options: PersistenceOptions = {}): Promise<ApiResponse> {
    return this.makeRequest(`/sessions/${sessionId}`, { method: 'DELETE' }, options);
  }

  // Local storage helpers
  private updateLocalStorageItem(type: string, tempId: string, realId: string) {
    const items = JSON.parse(localStorage.getItem(type) || '[]');
    const updatedItems = items.map((item: any) => 
      item.id === tempId ? { ...item, id: realId } : item
    );
    localStorage.setItem(type, JSON.stringify(updatedItems));
  }

  // Retry failed requests when connection is restored
  async retryFailedRequests(): Promise<void> {
    const failedRequests = JSON.parse(localStorage.getItem('failedRequests') || '[]');
    
    if (failedRequests.length === 0) return;
    
    console.log(`Retrying ${failedRequests.length} failed requests...`);
    
    const successfulRetries: number[] = [];
    
    for (let i = 0; i < failedRequests.length; i++) {
      const request = failedRequests[i];
      
      try {
        const response = await fetch(`${API_BASE_URL}${request.endpoint}`, {
          method: request.method,
          headers: this.getAuthHeaders(),
          body: request.body,
        });
        
        if (response.ok) {
          successfulRetries.push(i);
        }
      } catch (error) {
        console.error(`Retry failed for request ${i}:`, error);
      }
    }
    
    // Remove successful retries from localStorage
    const remainingRequests = failedRequests.filter((_: any, index: number) => 
      !successfulRetries.includes(index)
    );
    
    localStorage.setItem('failedRequests', JSON.stringify(remainingRequests));
    
    if (successfulRetries.length > 0) {
      toast.success(`Synced ${successfulRetries.length} items successfully`);
    }
  }

  // Check connection status
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Initialize service
  async initialize(): Promise<void> {
    // Check connection and retry failed requests
    const isConnected = await this.checkConnection();
    
    if (isConnected) {
      await this.retryFailedRequests();
    } else {
      console.warn('Backend not accessible, working in offline mode');
    }
    
    // Set up periodic connection check
    setInterval(async () => {
      const connected = await this.checkConnection();
      if (connected) {
        await this.retryFailedRequests();
      }
    }, 30000); // Check every 30 seconds
  }
}

// Export singleton instance
export const dataPersistenceService = new DataPersistenceService();

// Initialize on import
dataPersistenceService.initialize();
