import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { 
  uploadAssignmentSubmission, 
  uploadPostImage, 
  getUploadServiceStatus,
  getUploadInfo 
} from '../controllers/upload.controller';

const router = new Hono();

/**
 * File Upload Routes
 * All routes require authentication
 */

// POST /upload/assignment/:assignmentId - Upload assignment submission file (Students only)
router.post('/assignment/:assignmentId', authenticate, uploadAssignmentSubmission);

// POST /upload/post-image - Upload image for social media post (All authenticated users)
router.post('/post-image', authenticate, uploadPostImage);

// GET /upload/info - Get upload limits and configuration (All authenticated users)
router.get('/info', authenticate, getUploadInfo);

// GET /upload/status - Get service status (Admins and Professors only)
router.get('/status', authenticate, getUploadServiceStatus);

export default router;