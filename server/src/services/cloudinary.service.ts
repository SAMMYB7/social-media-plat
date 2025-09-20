import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import type { Context } from 'hono';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for assignments
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP'));
    }
  }
});

// Upload types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  original_filename?: string;
  created_at: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: object[];
}

/**
 * Upload file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'social-media-platform',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Upload failed: No result returned'));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          resource_type: result.resource_type,
          bytes: result.bytes,
          original_filename: result.original_filename,
          created_at: result.created_at
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      console.warn(`Failed to delete file from Cloudinary: ${publicId}`, result);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
}

/**
 * Get file info from Cloudinary
 */
export async function getCloudinaryFileInfo(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw new Error('Failed to get file information');
  }
}

/**
 * Upload assignment file (for assignments)
 */
export async function uploadAssignmentFile(
  buffer: Buffer,
  originalName: string,
  userId: string,
  assignmentId: string
): Promise<CloudinaryUploadResult> {
  const options: UploadOptions = {
    folder: `social-media-platform/assignments/${assignmentId}`,
    public_id: `${userId}-${Date.now()}`,
    resource_type: 'auto'
  };

  return uploadToCloudinary(buffer, originalName, options);
}

/**
 * Upload post image (for social media posts)
 */
export async function uploadPostImage(
  buffer: Buffer,
  originalName: string,
  userId: string
): Promise<CloudinaryUploadResult> {
  const options: UploadOptions = {
    folder: `social-media-platform/posts/${userId}`,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  };

  return uploadToCloudinary(buffer, originalName, options);
}

/**
 * Middleware to handle file uploads using Multer
 */
export const uploadMiddleware = {
  single: (fieldName: string) => upload.single(fieldName),
  multiple: (fieldName: string, maxCount: number = 5) => upload.array(fieldName, maxCount),
  fields: (fields: { name: string; maxCount?: number }[]) => upload.fields(fields)
};

/**
 * Helper to extract file from Hono request (when using form-data)
 */
export async function extractFileFromRequest(c: Context, fieldName: string = 'file') {
  try {
    const formData = await c.req.formData();
    const file = formData.get(fieldName) as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return {
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error extracting file from request:', error);
    throw new Error('Failed to process uploaded file');
  }
}

/**
 * Validate file size and type
 */
export function validateFile(file: { buffer: Buffer; mimeType: string; size: number }) {
  // Size validation (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  // MIME type validation
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (!allowedTypes.includes(file.mimeType)) {
    throw new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, WEBP, ZIP');
  }

  return true;
}

/**
 * Check if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Get Cloudinary configuration status
 */
export function getCloudinaryStatus() {
  const configured = isCloudinaryConfigured();
  
  return {
    configured,
    cloudName: configured ? process.env.CLOUDINARY_CLOUD_NAME : 'Not configured',
    message: configured 
      ? 'Cloudinary is properly configured' 
      : 'Cloudinary credentials missing in environment variables'
  };
}