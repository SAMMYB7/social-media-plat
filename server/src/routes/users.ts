import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { getAllUsers, updateUserRole, getUserStats } from '../controllers/user.controller';

const router = new Hono();

/**
 * User Management Routes
 * All routes require admin authentication
 */

// GET /users - Get all users (admin only)
router.get('/', authenticate, getAllUsers);

// GET /users/stats - Get user statistics (admin only)
router.get('/stats', authenticate, getUserStats);

// PATCH /users/:id/role - Update user role (admin only)
router.patch('/:id/role', authenticate, updateUserRole);

export default router;