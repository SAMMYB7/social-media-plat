import mongoose from 'mongoose';

// Define allowed user roles
export type UserRole = 'admin' | 'professor' | 'student';

// User interface for type safety
export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  verifyPassword(password: string): Promise<boolean>;
}

// User schema definition
const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'professor', 'student'],
      message: 'Role must be admin, professor, or student'
    },
    default: 'student',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'users',
  timestamps: false
});

// Method to verify password
userSchema.methods.verifyPassword = async function(password: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, this.passwordHash);
};

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema);

// Export type for use in other files
export type UserDocument = IUser;
