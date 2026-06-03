import path from 'path';
import { promises as fs } from 'fs';
import { logger } from './logger';

const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'csv', 'txt'];
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  fileType: string;
  path: string;
}

export async function validateFile(
  originalName: string,
  size: number,
): Promise<{ valid: boolean; error?: string; fileType?: string }> {
  // Check file size
  const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  // Extract file extension
  const ext = path.extname(originalName).substring(1).toLowerCase();

  if (!ext) {
    return {
      valid: false,
      error: 'File must have an extension',
    };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  return {
    valid: true,
    fileType: ext,
  };
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
): Promise<UploadedFile> {
  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const filename = `${timestamp}-${randomStr}${ext}`;

    // Full path for storage
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    await fs.writeFile(filepath, buffer);

    logger.info(`File saved: ${filename} (${buffer.length} bytes)`);

    return {
      filename,
      originalName,
      size: buffer.length,
      fileType: ext.substring(1).toLowerCase(),
      path: filepath,
    };
  } catch (error) {
    logger.error('Error saving uploaded file:', error);
    throw error;
  }
}

export async function deleteUploadedFile(filepath: string): Promise<boolean> {
  try {
    await fs.unlink(filepath);
    logger.info(`File deleted: ${filepath}`);
    return true;
  } catch (error) {
    logger.error('Error deleting file:', error);
    return false;
  }
}

export async function getFileBuffer(filepath: string): Promise<Buffer> {
  try {
    return await fs.readFile(filepath);
  } catch (error) {
    logger.error('Error reading file:', error);
    throw error;
  }
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export function getAllowedFileTypes(): string[] {
  return ALLOWED_FILE_TYPES;
}

export function getMaxFileSizeMB(): number {
  return MAX_FILE_SIZE_MB;
}
