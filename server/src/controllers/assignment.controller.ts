import type { Context } from 'hono';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Assignment, type CreateAssignmentData, type CreateSubmissionData } from '../models/Assignment';
import { User } from '../models/User';
import { getCurrentUser, type AuthUser } from '../middleware/auth';
import type { UserRole } from '../models/User';

// Validation schemas
const createAssignmentSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description cannot exceed 10000 characters')
    .trim(),
  dueDate: z.string()
    .datetime('Invalid date format')
    .transform((str) => new Date(str))
    .refine(
      (date) => date > new Date(Date.now() - 24 * 60 * 60 * 1000),
      'Due date must be in the future'
    )
});

const updateAssignmentSchema = createAssignmentSchema.partial();

const submitAssignmentSchema = z.object({
  content: z.string()
    .min(1, 'Submission content is required')
    .max(5000, 'Submission content cannot exceed 5000 characters')
    .trim(),
  fileUrl: z.string()
    .url('Invalid file URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
});

const assignmentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  status: z.enum(['upcoming', 'overdue', 'all']).optional().default('all'),
  sortBy: z.enum(['dueDate', 'createdAt', 'title']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc')
});

// Types
type CreateAssignmentRequest = z.infer<typeof createAssignmentSchema>;
type UpdateAssignmentRequest = z.infer<typeof updateAssignmentSchema>;
type SubmitAssignmentRequest = z.infer<typeof submitAssignmentSchema>;
type AssignmentQuery = z.infer<typeof assignmentQuerySchema>;

interface AssignmentListResponse {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  submissionCount: number;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AssignmentDetailResponse extends AssignmentListResponse {
  submissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    content: string;
    fileUrl?: string;
    submittedAt: Date;
  }>;
}

/**
 * Create a new assignment (Professors and Admins only)
 */
export async function createAssignment(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || (!['professor', 'admin'].includes(currentUser.role))) {
      return c.json({ error: 'Only professors and admins can create assignments' }, 403);
    }

    const body = await c.req.json() as CreateAssignmentRequest;
    
    // Validate input
    const validation = createAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, 400);
    }

    const { title, description, dueDate } = validation.data;

    // Create assignment
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      createdBy: new mongoose.Types.ObjectId(currentUser.id)
    });

    await assignment.save();

    // Populate creator info for response
    await assignment.populate('createdBy', 'name email role');

    const response: AssignmentListResponse = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      createdBy: {
        id: (assignment.createdBy as any)._id.toString(),
        name: (assignment.createdBy as any).name,
        email: (assignment.createdBy as any).email
      },
      submissionCount: assignment.getSubmissionCount(),
      isOverdue: assignment.isOverdue(),
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    };

    console.log(`✅ Assignment created: ${title} by ${currentUser.name}`);
    return c.json({ assignment: response }, 201);

  } catch (error) {
    console.error('Create assignment error:', error);
    
    if (error instanceof Error && error.message.includes('Only professors and admins')) {
      return c.json({ error: error.message }, 403);
    }
    
    return c.json({ error: 'Failed to create assignment' }, 500);
  }
}

/**
 * Get assignments list with filtering and pagination
 */
export async function getAssignments(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Parse query parameters
    const queryParams = c.req.query();
    const validation = assignmentQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return c.json({ 
        error: 'Invalid query parameters', 
        details: validation.error.issues 
      }, 400);
    }

    const { page, limit, status, sortBy, sortOrder } = validation.data;

    // Build query based on user role and filters
    let query = Assignment.find();

    // Role-based filtering
    if (currentUser.role === 'professor') {
      // Professors see only their assignments
      query = query.find({ createdBy: currentUser.id });
    } else if (currentUser.role === 'student') {
      // Students see all assignments
      query = query.find({});
    }
    // Admins see all assignments (no additional filter)

    // Status filtering
    if (status === 'upcoming') {
      query = query.find({ dueDate: { $gte: new Date() } });
    } else if (status === 'overdue') {
      query = query.find({ dueDate: { $lt: new Date() } });
    }

    // Sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortDirection;
    query = query.sort(sortOptions);

    // Pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Population and execution
    query = query.populate('createdBy', 'name email role');
    const assignments = await query.exec();

    // Get total count for pagination
    const totalQuery = Assignment.find(query.getFilter());
    const total = await totalQuery.countDocuments();

    const response: AssignmentListResponse[] = assignments.map(assignment => ({
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      createdBy: {
        id: (assignment.createdBy as any)._id.toString(),
        name: (assignment.createdBy as any).name,
        email: (assignment.createdBy as any).email
      },
      submissionCount: assignment.getSubmissionCount(),
      isOverdue: assignment.isOverdue(),
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    }));

    return c.json({
      assignments: response,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }, 200);

  } catch (error) {
    console.error('Get assignments error:', error);
    return c.json({ error: 'Failed to fetch assignments' }, 500);
  }
}

/**
 * Get single assignment details with submissions
 */
export async function getAssignmentById(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const assignmentId = c.req.param('id');

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return c.json({ error: 'Invalid assignment ID' }, 400);
    }

    // Find assignment with creator info
    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .exec();

    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    // Permission check: professors can only see their own assignments
    if (currentUser.role === 'professor' && 
        assignment.createdBy._id.toString() !== currentUser.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Populate submission student info
    const populatedAssignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email role')
      .populate('submissions.studentId', 'name email')
      .exec();

    if (!populatedAssignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    const response: AssignmentDetailResponse = {
      id: populatedAssignment._id.toString(),
      title: populatedAssignment.title,
      description: populatedAssignment.description,
      dueDate: populatedAssignment.dueDate,
      createdBy: {
        id: (populatedAssignment.createdBy as any)._id.toString(),
        name: (populatedAssignment.createdBy as any).name,
        email: (populatedAssignment.createdBy as any).email
      },
      submissionCount: populatedAssignment.getSubmissionCount(),
      isOverdue: populatedAssignment.isOverdue(),
      createdAt: populatedAssignment.createdAt,
      updatedAt: populatedAssignment.updatedAt,
      submissions: populatedAssignment.submissions.map(submission => ({
        id: submission._id.toString(),
        studentId: (submission.studentId as any)._id.toString(),
        studentName: (submission.studentId as any).name,
        studentEmail: (submission.studentId as any).email,
        content: submission.content,
        fileUrl: submission.fileUrl,
        submittedAt: submission.submittedAt
      }))
    };

    return c.json({ assignment: response }, 200);

  } catch (error) {
    console.error('Get assignment by ID error:', error);
    return c.json({ error: 'Failed to fetch assignment' }, 500);
  }
}

/**
 * Update assignment (Professors can update their own, Admins can update any)
 */
export async function updateAssignment(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || (!['professor', 'admin'].includes(currentUser.role))) {
      return c.json({ error: 'Only professors and admins can update assignments' }, 403);
    }

    const assignmentId = c.req.param('id');

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return c.json({ error: 'Invalid assignment ID' }, 400);
    }

    const body = await c.req.json() as UpdateAssignmentRequest;
    
    // Validate input
    const validation = updateAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, 400);
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    // Permission check: professors can only update their own assignments
    if (currentUser.role === 'professor' && 
        assignment.createdBy.toString() !== currentUser.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Update fields
    const updates = validation.data;
    if (updates.title !== undefined) assignment.title = updates.title;
    if (updates.description !== undefined) assignment.description = updates.description;
    if (updates.dueDate !== undefined) assignment.dueDate = updates.dueDate;

    await assignment.save();

    // Populate creator info for response
    await assignment.populate('createdBy', 'name email role');

    const response: AssignmentListResponse = {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      createdBy: {
        id: (assignment.createdBy as any)._id.toString(),
        name: (assignment.createdBy as any).name,
        email: (assignment.createdBy as any).email
      },
      submissionCount: assignment.getSubmissionCount(),
      isOverdue: assignment.isOverdue(),
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    };

    console.log(`✅ Assignment updated: ${assignment.title} by ${currentUser.name}`);
    return c.json({ assignment: response }, 200);

  } catch (error) {
    console.error('Update assignment error:', error);
    return c.json({ error: 'Failed to update assignment' }, 500);
  }
}

/**
 * Delete assignment (Professors can delete their own, Admins can delete any)
 */
export async function deleteAssignment(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || (!['professor', 'admin'].includes(currentUser.role))) {
      return c.json({ error: 'Only professors and admins can delete assignments' }, 403);
    }

    const assignmentId = c.req.param('id');

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return c.json({ error: 'Invalid assignment ID' }, 400);
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    // Permission check: professors can only delete their own assignments
    if (currentUser.role === 'professor' && 
        assignment.createdBy.toString() !== currentUser.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Check if assignment has submissions
    if (assignment.submissions.length > 0) {
      return c.json({ 
        error: 'Cannot delete assignment with existing submissions',
        submissionCount: assignment.submissions.length 
      }, 400);
    }

    await Assignment.findByIdAndDelete(assignmentId);

    console.log(`🗑️ Assignment deleted: ${assignment.title} by ${currentUser.name}`);
    return c.json({ message: 'Assignment deleted successfully' }, 200);

  } catch (error) {
    console.error('Delete assignment error:', error);
    return c.json({ error: 'Failed to delete assignment' }, 500);
  }
}

/**
 * Submit assignment (Students only)
 */
export async function submitAssignment(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || currentUser.role !== 'student') {
      return c.json({ error: 'Only students can submit assignments' }, 403);
    }

    const assignmentId = c.req.param('id');

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return c.json({ error: 'Invalid assignment ID' }, 400);
    }

    const body = await c.req.json() as SubmitAssignmentRequest;
    
    // Validate input
    const validation = submitAssignmentSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: validation.error.issues 
      }, 400);
    }

    const { content, fileUrl } = validation.data;

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return c.json({ error: 'Assignment not found' }, 404);
    }

    // Check if assignment is overdue
    if (assignment.isOverdue()) {
      return c.json({ 
        error: 'Assignment submission deadline has passed',
        dueDate: assignment.dueDate 
      }, 400);
    }

    // Check if student already submitted
    if (assignment.hasStudentSubmitted(currentUser.id)) {
      return c.json({ error: 'You have already submitted this assignment' }, 400);
    }

    // Add submission
    assignment.submissions.push({
      studentId: new mongoose.Types.ObjectId(currentUser.id),
      content,
      fileUrl,
      submittedAt: new Date()
    } as any);

    await assignment.save();

    console.log(`📝 Assignment submitted: ${assignment.title} by ${currentUser.name}`);
    return c.json({ 
      message: 'Assignment submitted successfully',
      submittedAt: new Date()
    }, 201);

  } catch (error) {
    console.error('Submit assignment error:', error);
    
    if (error instanceof Error && error.message.includes('Student has already submitted')) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ error: 'Failed to submit assignment' }, 500);
  }
}

/**
 * Get assignment statistics (Professors and Admins only)
 */
export async function getAssignmentStats(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || (!['professor', 'admin'].includes(currentUser.role))) {
      return c.json({ error: 'Only professors and admins can view assignment statistics' }, 403);
    }

    // Build query based on user role
    let matchStage: any = {};
    if (currentUser.role === 'professor') {
      matchStage.createdBy = new mongoose.Types.ObjectId(currentUser.id);
    }

    const stats = await Assignment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          upcomingAssignments: {
            $sum: {
              $cond: [{ $gte: ['$dueDate', new Date()] }, 1, 0]
            }
          },
          overdueAssignments: {
            $sum: {
              $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0]
            }
          },
          totalSubmissions: {
            $sum: { $size: '$submissions' }
          },
          avgSubmissionsPerAssignment: {
            $avg: { $size: '$submissions' }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAssignments: 0,
      upcomingAssignments: 0,
      overdueAssignments: 0,
      totalSubmissions: 0,
      avgSubmissionsPerAssignment: 0
    };

    // Remove the aggregation _id field
    delete result._id;

    return c.json({ stats: result }, 200);

  } catch (error) {
    console.error('Get assignment stats error:', error);
    return c.json({ error: 'Failed to fetch assignment statistics' }, 500);
  }
}