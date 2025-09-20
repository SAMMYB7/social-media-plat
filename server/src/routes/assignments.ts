import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { 
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentStats
} from '../controllers/assignment.controller';

const router = new Hono();

/**
 * Assignment Management Routes
 * All routes require authentication with role-based permissions
 */

// POST /assignments - Create new assignment (Professors and Admins only)
router.post('/', authenticate, createAssignment);

// GET /assignments - Get assignments list with filtering and pagination
// - Professors: See only their assignments
// - Students: See all assignments 
// - Admins: See all assignments
// Query params: ?page=1&limit=10&status=upcoming&sortBy=dueDate&sortOrder=asc
router.get('/', authenticate, getAssignments);

// GET /assignments/stats - Get assignment statistics (Professors and Admins only)
router.get('/stats', authenticate, getAssignmentStats);

// GET /assignments/:id - Get single assignment details with submissions
// - Professors: Only their own assignments
// - Students: Any assignment
// - Admins: Any assignment
router.get('/:id', authenticate, getAssignmentById);

// PUT /assignments/:id - Update assignment (Professors can update their own, Admins can update any)
router.put('/:id', authenticate, updateAssignment);

// DELETE /assignments/:id - Delete assignment (Professors can delete their own, Admins can delete any)
// Note: Cannot delete assignments with existing submissions
router.delete('/:id', authenticate, deleteAssignment);

// POST /assignments/:id/submit - Submit assignment (Students only)
// Body: { content: string, fileUrl?: string }
router.post('/:id/submit', authenticate, submitAssignment);

export default router;