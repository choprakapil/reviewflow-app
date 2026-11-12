import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StoredFile {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  private static uploadDir = path.join(process.cwd(), "public", "uploads");

  private static async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save a buffer securely to public/uploads/
   */
  public static async save(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<StoredFile> {
    await this.ensureDir();

    // Sanitize extension
    const ext = path.extname(originalFilename).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const safeExt = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf"].includes(ext)
      ? ext
      : ".bin";

    const hash = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${hash}${safeExt}`;
    const destinationPath = path.join(this.uploadDir, filename);

    // Guard against path traversal
    if (!destinationPath.startsWith(this.uploadDir)) {
      throw new Error("Invalid storage destination path.");
    }

    await fs.writeFile(destinationPath, buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
      size: buffer.length,
      mimeType,
    };
  }

  /**
   * Delete a stored file safely
   */
  public static async delete(filename: string): Promise<boolean> {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(filename);
    const targetPath = path.join(this.uploadDir, safeFilename);

    if (!targetPath.startsWith(this.uploadDir)) {
      return false;
    }

    try {
      await fs.unlink(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}

