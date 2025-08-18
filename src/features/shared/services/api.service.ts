/**
 * Centralized API service for making HTTP requests
 * Handles authentication, error handling, and request/response formatting
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getDefaultHeaders(requireAuth: boolean = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          message: data.message
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        message: 'Invalid response format'
      };
    }
  }

  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true
    } = config;

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const requestHeaders = {
        ...this.getDefaultHeaders(requireAuth),
        ...headers
      };

      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== 'GET') {
        if (body instanceof FormData) {
          // Remove Content-Type for FormData (browser will set it with boundary)
          delete requestHeaders['Content-Type'];
          requestConfig.body = body;
        } else {
          requestConfig.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, requestConfig);
      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Failed to connect to server'
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', requireAuth });
  }

  async post<T = any>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: data, requireAuth });
  }

  async put<T = any>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, requireAuth });
  }

  async patch<T = any>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data, requireAuth });
  }

  async delete<T = any>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth });
  }

  // File upload method
  async uploadFile<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      requireAuth: true
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types
export type { ApiResponse, RequestConfig };
