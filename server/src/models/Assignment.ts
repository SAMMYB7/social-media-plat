import mongoose, { Document } from 'mongoose';
import type { UserRole } from './User';

// Assignment submission interface for document type
export interface IAssignmentSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  content: string;
  fileUrl?: string;
  submittedAt: Date;
}

// Assignment interface for type safety
export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId;
  submissions: IAssignmentSubmission[];
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  getSubmissionByStudent(studentId: string | mongoose.Types.ObjectId): IAssignmentSubmission | null;
  hasStudentSubmitted(studentId: string | mongoose.Types.ObjectId): boolean;
  isOverdue(): boolean;
  getSubmissionCount(): number;
}

// Submission schema definition
const submissionSchema = new mongoose.Schema<IAssignmentSubmission>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  content: {
    type: String,
    required: [true, 'Submission content is required'],
    trim: true,
    maxlength: [5000, 'Submission content cannot exceed 5000 characters']
  },
  fileUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        // Basic URL validation for Cloudinary or other valid URLs
        const urlRegex = /^https?:\/\/.+/;
        return urlRegex.test(url);
      },
      message: 'Invalid file URL format'
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  _id: true,
  timestamps: false // We handle submittedAt manually
});

// Assignment schema definition
const assignmentSchema = new mongoose.Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(date: Date) {
        // Due date should be in the future (allow some flexibility for editing)
        return date > new Date(Date.now() - 24 * 60 * 60 * 1000); // Allow dates up to 24 hours ago
      },
      message: 'Due date must be in the future'
    },
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    index: true
  },
  submissions: [submissionSchema]
}, {
  collection: 'assignments',
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for performance optimization
assignmentSchema.index({ createdBy: 1, dueDate: 1 }); // For professor's assignments sorted by due date
assignmentSchema.index({ dueDate: 1, createdAt: -1 }); // For listing assignments by due date and creation
assignmentSchema.index({ 'submissions.studentId': 1 }); // For finding student's submissions

// Instance methods
assignmentSchema.methods.getSubmissionByStudent = function(studentId: string | mongoose.Types.ObjectId): IAssignmentSubmission | null {
  const submission = this.submissions.find((sub: IAssignmentSubmission) => 
    sub.studentId.toString() === studentId.toString()
  );
  return submission || null;
};

assignmentSchema.methods.hasStudentSubmitted = function(studentId: string | mongoose.Types.ObjectId): boolean {
  return this.submissions.some((sub: IAssignmentSubmission) => 
    sub.studentId.toString() === studentId.toString()
  );
};

assignmentSchema.methods.isOverdue = function(): boolean {
  return new Date() > this.dueDate;
};

assignmentSchema.methods.getSubmissionCount = function(): number {
  return this.submissions.length;
};

// Static methods
assignmentSchema.statics.findByCreator = function(creatorId: string | mongoose.Types.ObjectId) {
  return this.find({ createdBy: creatorId })
    .populate('createdBy', 'name email role')
    .sort({ dueDate: 1, createdAt: -1 });
};

assignmentSchema.statics.findUpcoming = function(days: number = 7) {
  const future = new Date();
  future.setDate(future.getDate() + days);
  
  return this.find({
    dueDate: { $gte: new Date(), $lte: future }
  })
    .populate('createdBy', 'name email role')
    .sort({ dueDate: 1 });
};

assignmentSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() }
  })
    .populate('createdBy', 'name email role')
    .sort({ dueDate: -1 });
};

// Middleware to validate creator role before saving
assignmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('createdBy')) {
    try {
      const User = mongoose.model('User');
      const creator = await User.findById(this.createdBy);
      
      if (!creator) {
        return next(new Error('Creator not found'));
      }
      
      if (creator.role !== 'professor' && creator.role !== 'admin') {
        return next(new Error('Only professors and admins can create assignments'));
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Middleware to validate student submissions
assignmentSchema.pre('save', async function(next) {
  if (this.isModified('submissions')) {
    try {
      const User = mongoose.model('User');
      
      // Get the submissions that were added (new ones won't have _id yet)
      const newSubmissions = this.submissions.filter(sub => !sub._id || sub.isNew);
      
      for (const submission of newSubmissions) {
        const student = await User.findById(submission.studentId);
        
        if (!student) {
          return next(new Error('Student not found'));
        }
        
        if (student.role !== 'student') {
          return next(new Error('Only students can submit assignments'));
        }
        
        // Check for duplicate submissions (excluding the current submission being added)
        const existingSubmission = this.submissions.find((sub) => {
          return sub !== submission && sub.studentId.toString() === submission.studentId.toString();
        });
        
        if (existingSubmission) {
          return next(new Error('Student has already submitted this assignment'));
        }
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Add static methods to the interface
interface IAssignmentModel extends mongoose.Model<IAssignment> {
  findByCreator(creatorId: string | mongoose.Types.ObjectId): mongoose.Query<IAssignment[], IAssignment>;
  findUpcoming(days?: number): mongoose.Query<IAssignment[], IAssignment>;
  findOverdue(): mongoose.Query<IAssignment[], IAssignment>;
}

// Create and export the model
export const Assignment = mongoose.model<IAssignment, IAssignmentModel>('Assignment', assignmentSchema);

// Export types for use in other files
export type AssignmentDocument = IAssignment;
export type SubmissionDocument = IAssignmentSubmission;

// Helper type for creating new assignments (without generated fields)
export interface CreateAssignmentData {
  title: string;
  description: string;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId | string;
}

// Helper type for submitting assignments
export interface CreateSubmissionData {
  studentId: mongoose.Types.ObjectId | string;
  content: string;
  fileUrl?: string;
}

// Helper type for assignment responses (with populated creator)
export interface AssignmentWithCreator extends Omit<IAssignment, 'createdBy'> {
  createdBy: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: UserRole;
  };
}