import { createContext } from 'react';
import type { AuthUser, RegisterData } from '@/lib/api';

/**
 * Authentication Context Type Definition
 * Defines the shape of the auth context value
 */
export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

/**
 * Internal Auth Context
 * Used internally by AuthProvider and useAuth hook
 */
export const InternalAuthContext = createContext<AuthContextValue | undefined>(undefined);
