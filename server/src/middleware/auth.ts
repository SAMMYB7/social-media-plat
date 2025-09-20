import type { Context, Next } from 'hono';
import { verify, sign } from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { UserRole } from '../models/User';

// Get JWT secret from environment or use development fallback
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const TOKEN_EXPIRY = '7d';

// User data structure for authentication
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Extend Hono context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user?: AuthUser;
  }
}

/**
 * Create JWT token for authenticated user
 */
export function createAuthToken(user: AuthUser): string {
  return sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.slice(7);
    const decoded = verify(token, JWT_SECRET) as JwtPayload & AuthUser;
    
    // Add user to context
    c.set('user', {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    });

    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(c: Context): AuthUser | null {
  return c.get('user') || null;
}