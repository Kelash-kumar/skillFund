import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "crypto";
import path from "path";

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  error?: string;
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export class FileUploadManager {
  /**
   * Upload a single file to S3
   */
  async uploadFile(
    file: File,
    studentId: string,
    documentType: string
  ): Promise<FileUploadResult> {
    try {
      // ✅ Validate size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 5MB. Current: ${Math.round(file.size / 1024 / 1024)}MB`,
        };
      }

      // ✅ Validate type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Allowed: PDF, JPG, JPEG, PNG",
        };
      }

      // ✅ Unique S3 key (path in bucket)
      const fileExt = this.getFileExtension(file.name);
      const uniqueName = `${documentType}_${Date.now()}_${randomUUID()}${fileExt}`;
      const key = `documents/students/${studentId}/${uniqueName}`;

      // ✅ Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // ✅ Upload to S3
      const upload = new Upload({
        client: s3,
        params: {
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        },
      });

      await upload.done();

      // ✅ Generate file URL
      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        success: true,
        fileUrl,
        fileKey: key,
        fileName: uniqueName,
      };
    } catch (error) {
      console.error("S3 Upload Error:", error);
      return {
        success: false,
        error: "Failed to upload file to S3.",
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Record<string, File | null>,
    studentId: string
  ): Promise<Record<string, FileUploadResult>> {
    const results: Record<string, FileUploadResult> = {};
    for (const [docType, file] of Object.entries(files)) {
      results[docType] = file
        ? await this.uploadFile(file, studentId, docType)
        : { success: false, error: "No file provided" };
    }
    return results;
  }

  /**
   * Generate file metadata for DB
   */
  static generateFileMetadata(file: File, uploadResult: FileUploadResult) {
    return {
      originalName: file.name,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.fileUrl,
      fileKey: uploadResult.fileKey,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
    };
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<{ success: boolean; error?: string }> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: fileKey,
      });
      await s3.send(command);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete from S3:", error);
      return { success: false, error: "Error deleting file from S3" };
    }
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    return idx > -1 ? filename.substring(idx) : "";
  }
}

export default FileUploadManager;
