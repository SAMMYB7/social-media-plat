import type { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, type UserRole } from '../models/User';
import { createAuthToken, getCurrentUser, type AuthUser } from '../middleware/auth';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'professor', 'student']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Types for request/response
type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  token: string;
}

/**
 * Register a new user
 */
export async function registerUser(c: Context) {
  try {
    const body = await c.req.json() as RegisterRequest;
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed',
        details: validation.error.issues
      }, 400);
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Determine user role (first user becomes admin)
    const userCount = await User.countDocuments();
    const role: UserRole = userCount === 0 ? 'admin' : 'student';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    // Create auth response
    const authUser: AuthUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    const token = createAuthToken(authUser);

    const response: AuthResponse = {
      user: authUser,
      token
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
}

/**
 * Login existing user
 */
export async function loginUser(c: Context) {
  try {
    const body = await c.req.json() as LoginRequest;
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed',
        details: validation.error.issues
      }, 400);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Create auth response
    const authUser: AuthUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = createAuthToken(authUser);

    const response: AuthResponse = {
      user: authUser,
      token
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
}

/**
 * Get current authenticated user profile
 */
export async function getUserProfile(c: Context) {
  try {
    const user = getCurrentUser(c);
    
    if (!user) {
      return c.json({ user: null }, 200);
    }

    return c.json({ user }, 200);
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }
}