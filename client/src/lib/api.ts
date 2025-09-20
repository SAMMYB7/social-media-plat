/**
 * API Configuration and Client
 * Centralized HTTP client with authentication and error handling
 */

// Configuration
const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

// Types
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// Token management
function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Generic API client with authentication support
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  // Set default content type
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add authentication token if available
  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    // Check if it's already an ApiError (has status and message properties)
    if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
      throw error;
    }
    
    // Network or other errors
    const apiError: ApiError = {
      status: 0,
      message: 'Network error or server unavailable'
    };
    throw apiError;
  }
}

/**
 * Handle API error responses
 */
async function handleApiError(response: Response): Promise<never> {
  let message = response.statusText || 'Request failed';
  
  try {
    const errorData = await response.json();
    message = errorData.error || errorData.message || message;
  } catch {
    // Ignore JSON parsing errors - use status text
  }

  const apiError: ApiError = {
    status: response.status,
    message
  };
  
  throw apiError;
}

// Authentication API methods
export const authApi = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null }> {
    return apiRequest<{ user: AuthUser | null }>('/auth/me');
  }
};

// Export token management utilities
export const tokenUtils = {
  get: getAuthToken,
  set: setAuthToken,
  remove: removeAuthToken
};

// Export generic API client for future use
export { apiRequest };

// User Management API methods
export const usersApi = {
  /**
   * Get all users (admin only)
   */
  async getAll(): Promise<{ users: AuthUser[] }> {
    return apiRequest<{ users: AuthUser[] }>('/users');
  },

  /**
   * Update user role (admin only)
   */
  async updateRole(userId: string, role: string): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  },

  /**
   * Get user statistics (admin only)
   */
  async getStats(): Promise<{ stats: { total: number; admins: number; professors: number; students: number } }> {
    return apiRequest<{ stats: { total: number; admins: number; professors: number; students: number } }>('/users/stats');
  }
};

// Legacy API exports for backward compatibility
export const loginApi = authApi.login;
export const registerApi = authApi.register;
export const currentUserApi = authApi.getCurrentUser;
