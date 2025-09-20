import { useContext } from 'react';
import { InternalAuthContext } from './auth-context';

export function useAuth() {
  const ctx = useContext(InternalAuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}