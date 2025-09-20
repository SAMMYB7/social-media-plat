import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { registerUser, loginUser, getUserProfile } from '../controllers/auth.controller';

const router = new Hono();

/**
 * Authentication routes
 * All business logic is handled in controllers for better separation of concerns
 */

// POST /auth/register - Register new user
router.post('/register', registerUser);

// POST /auth/login - Login existing user
router.post('/login', loginUser);

// GET /auth/me - Get current user profile (requires authentication)
router.get('/me', authenticate, getUserProfile);

export default router;