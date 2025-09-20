import type { Context } from 'hono';
import { z } from 'zod';
import { User, type UserRole } from '../models/User';
import { getCurrentUser, type AuthUser } from '../middleware/auth';

// Validation schemas
const updateRoleSchema = z.object({
  role: z.enum(['admin', 'professor', 'student'], {
    errorMap: () => ({ message: 'Role must be admin, professor, or student' })
  })
});

// Types
type UpdateRoleRequest = z.infer<typeof updateRoleSchema>;

interface UserListResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Fetch all users excluding password fields
    const users = await User.find({}, { passwordHash: 0, __v: 0 }).lean();

    const userList: UserListResponse[] = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }));

    return c.json({ users: userList }, 200);
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const userId = c.req.param('id');
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const body = await c.req.json() as UpdateRoleRequest;
    
    // Validate request body
    const validation = updateRoleSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed',
        details: validation.error.issues
      }, 400);
    }

    const { role } = validation.data;

    // Find the user to update
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Prevent admin from demoting themselves
    if (userToUpdate._id.toString() === currentUser.id && role !== 'admin') {
      return c.json({ error: 'You cannot change your own admin role' }, 400);
    }

    // Update user role
    userToUpdate.role = role;
    await userToUpdate.save();

    // Return updated user (excluding sensitive data)
    const updatedUser: UserListResponse = {
      id: userToUpdate._id.toString(),
      name: userToUpdate.name,
      email: userToUpdate.email,
      role: userToUpdate.role
    };

    return c.json({ user: updatedUser }, 200);
  } catch (error) {
    console.error('Update user role error:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Get user counts by role
    const [adminCount, professorCount, studentCount, totalCount] = await Promise.all([
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'professor' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({})
    ]);

    const stats = {
      total: totalCount,
      admins: adminCount,
      professors: professorCount,
      students: studentCount
    };

    return c.json({ stats }, 200);
  } catch (error) {
    console.error('Get user stats error:', error);
    return c.json({ error: 'Failed to fetch user statistics' }, 500);
  }
}