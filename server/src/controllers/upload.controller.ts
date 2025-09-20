import type { Context } from 'hono';
import { 
  uploadAssignmentFile, 
  uploadPostImage as uploadPostImageService, 
  extractFileFromRequest, 
  validateFile,
  isCloudinaryConfigured,
  getCloudinaryStatus,
  type CloudinaryUploadResult 
} from '../services/cloudinary.service';
import { getCurrentUser } from '../middleware/auth';
import { Assignment } from '../models/Assignment';
import mongoose from 'mongoose';

/**
 * Upload file for assignment submission
 */
export async function uploadAssignmentSubmission(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || currentUser.role !== 'student') {
      return c.json({ error: 'Only students can upload assignment files' }, 403);
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return c.json({ 
        error: 'File upload service not configured',
        details: 'Please configure Cloudinary credentials'
      }, 503);
    }

    const assignmentId = c.req.param('assignmentId');
    
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return c.json({ error: 'Valid assignment ID is required' }, 400);
    }

    // Verify assignment exists
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

    // Extract file from request
    const fileData = await extractFileFromRequest(c, 'file');
    
    // Validate file
    validateFile(fileData);

    // Upload to Cloudinary
    const uploadResult = await uploadAssignmentFile(
      fileData.buffer,
      fileData.originalName,
      currentUser.id,
      assignmentId
    );

    console.log(`📁 Assignment file uploaded: ${fileData.originalName} by ${currentUser.name}`);

    return c.json({
      message: 'File uploaded successfully',
      file: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: fileData.originalName,
        format: uploadResult.format,
        size: uploadResult.bytes,
        uploadedAt: new Date().toISOString()
      }
    }, 201);

  } catch (error) {
    console.error('Upload assignment file error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid file type') || 
          error.message.includes('File size exceeds')) {
        return c.json({ error: error.message }, 400);
      }
      
      if (error.message.includes('No file provided')) {
        return c.json({ error: 'Please select a file to upload' }, 400);
      }
    }
    
    return c.json({ error: 'Failed to upload file' }, 500);
  }
}

/**
 * Upload image for social media post
 */
export async function uploadPostImage(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return c.json({ 
        error: 'Image upload service not configured',
        details: 'Please configure Cloudinary credentials'
      }, 503);
    }

    // Extract file from request
    const fileData = await extractFileFromRequest(c, 'image');
    
    // Validate that it's an image
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!imageTypes.includes(fileData.mimeType)) {
      return c.json({ 
        error: 'Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed' 
      }, 400);
    }

    // Validate file size (5MB max for images)
    if (fileData.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Image size exceeds 5MB limit' }, 400);
    }

    // Upload to Cloudinary with image optimizations
    const uploadResult = await uploadPostImageService(
      fileData.buffer,
      fileData.originalName,
      currentUser.id
    );

    console.log(`🖼️ Post image uploaded: ${fileData.originalName} by ${currentUser.name}`);

    return c.json({
      message: 'Image uploaded successfully',
      image: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: fileData.originalName,
        format: uploadResult.format,
        size: uploadResult.bytes,
        uploadedAt: new Date().toISOString()
      }
    }, 201);

  } catch (error) {
    console.error('Upload post image error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid file type') || 
          error.message.includes('Image size exceeds')) {
        return c.json({ error: error.message }, 400);
      }
      
      if (error.message.includes('No file provided')) {
        return c.json({ error: 'Please select an image to upload' }, 400);
      }
    }
    
    return c.json({ error: 'Failed to upload image' }, 500);
  }
}

/**
 * Get Cloudinary service status
 */
export async function getUploadServiceStatus(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser || (!['admin', 'professor'].includes(currentUser.role))) {
      return c.json({ error: 'Only admins and professors can check service status' }, 403);
    }

    const status = getCloudinaryStatus();
    
    return c.json({
      service: 'Cloudinary File Upload',
      status: status.configured ? 'active' : 'inactive',
      ...status
    }, 200);

  } catch (error) {
    console.error('Get upload service status error:', error);
    return c.json({ error: 'Failed to get service status' }, 500);
  }
}

/**
 * Get upload limits and allowed file types
 */
export async function getUploadInfo(c: Context) {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    return c.json({
      limits: {
        assignmentFiles: {
          maxSize: '10MB',
          allowedTypes: [
            'PDF', 'DOC', 'DOCX', 'TXT', 'JPG', 'PNG', 'GIF', 'WEBP', 'ZIP'
          ]
        },
        postImages: {
          maxSize: '5MB',
          allowedTypes: ['JPG', 'PNG', 'GIF', 'WEBP']
        }
      },
      endpoints: {
        assignmentUpload: '/api/upload/assignment/:assignmentId',
        postImageUpload: '/api/upload/post-image'
      },
      configured: isCloudinaryConfigured()
    }, 200);

  } catch (error) {
    console.error('Get upload info error:', error);
    return c.json({ error: 'Failed to get upload information' }, 500);
  }
}