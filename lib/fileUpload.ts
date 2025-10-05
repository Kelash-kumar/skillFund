import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

export class FileUploadManager {
  private baseUploadPath: string;

  constructor() {
    this.baseUploadPath = join(process.cwd(), 'public', 'uploads');
  }

  /**
   * Upload a file to the specified directory
   * @param file - The file to upload
   * @param studentId - Student ID for folder organization
   * @param documentType - Type of document (academicTranscript, marksheets, etc.)
   * @returns Upload result with file path
   */
  async uploadFile(
    file: File, 
    studentId: string, 
    documentType: string
  ): Promise<FileUploadResult> {
    try {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 5MB limit. Current size: ${Math.round(file.size / 1024 / 1024)}MB`
        };
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Allowed types: PDF, JPG, JPEG, PNG`
        };
      }

      // Generate unique filename
      const fileExtension = this.getFileExtension(file.name);
      const uniqueFileName = `${documentType}_${Date.now()}_${randomUUID()}${fileExtension}`;
      
      // Create student-specific directory
      const studentDir = join(this.baseUploadPath, 'documents', 'students', studentId);
      await mkdir(studentDir, { recursive: true });

      // Save file
      const filePath = join(studentDir, uniqueFileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);

      // Return relative path for database storage
      const relativePath = `/uploads/documents/students/${studentId}/${uniqueFileName}`;

      return {
        success: true,
        filePath: relativePath,
        fileName: uniqueFileName
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: 'Failed to upload file. Please try again.'
      };
    }
  }

  /**
   * Upload multiple files for a student request
   * @param files - Object containing files to upload
   * @param studentId - Student ID
   * @returns Object with upload results for each file
   */
  async uploadMultipleFiles(
    files: Record<string, File | null>,
    studentId: string
  ): Promise<Record<string, FileUploadResult>> {
    const results: Record<string, FileUploadResult> = {};

    for (const [documentType, file] of Object.entries(files)) {
      if (file) {
        results[documentType] = await this.uploadFile(file, studentId, documentType);
      } else {
        results[documentType] = {
          success: false,
          error: 'No file provided'
        };
      }
    }

    return results;
  }

  /**
   * Get file extension from filename
   * @param filename - Original filename
   * @returns File extension with dot
   */
  private getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > -1 ? filename.substring(lastDotIndex) : '';
  }

  /**
   * Generate file metadata for database storage
   * @param file - Original file
   * @param uploadResult - Upload result
   * @returns Metadata object
   */
  static generateFileMetadata(file: File, uploadResult: FileUploadResult) {
    return {
      originalName: file.name,
      fileName: uploadResult.fileName,
      filePath: uploadResult.filePath,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
    };
  }

  /**
   * Delete a specific file from the uploads directory
   * @param studentId - Student ID
   * @param fileName - Name of the file to delete
   * @returns Deletion result
   */
  async deleteFile(studentId: string, fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filePath = join(this.baseUploadPath, 'documents', 'students', studentId, fileName);
      await unlink(filePath);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete file ${fileName} for student ${studentId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete multiple files for a student
   * @param studentId - Student ID
   * @param documents - Document metadata object
   * @returns Array of deletion results
   */
  async deleteMultipleFiles(
    studentId: string, 
    documents: Record<string, any>
  ): Promise<Record<string, { success: boolean; error?: string }>> {
    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const [docType, docInfo] of Object.entries(documents)) {
      if (docInfo && typeof docInfo === 'object' && (docInfo as any).fileName) {
        results[docType] = await this.deleteFile(studentId, (docInfo as any).fileName);
      } else {
        results[docType] = { success: false, error: 'No filename found' };
      }
    }

    return results;
  }
}

export default FileUploadManager;