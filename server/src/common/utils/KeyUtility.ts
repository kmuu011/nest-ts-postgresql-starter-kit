import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface CreateKeyOptions {
  prisma: PrismaService;
  tableName: string;
  columnKey: string;
  path: string;
  includeDate?: boolean;
  suffixText?: string;
}

export class KeyUtility {
  static async createKey(options: CreateKeyOptions): Promise<string> {
    const { prisma, tableName, columnKey, path: basePath, includeDate, suffixText } = options;

    let fileKey: string;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 100;

    while (exists && attempts < maxAttempts) {
      const randomString = crypto.randomBytes(16).toString('hex');
      let fileName = randomString;

      if (includeDate) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        fileName = `${dateStr}_${randomString}`;
      }

      if (suffixText) {
        fileName += suffixText;
      }

      fileKey = `${basePath}${fileName}`;

      // Check if key exists in database
      const whereCondition = { [columnKey]: fileKey };
      const count = await (prisma.db as any)[tableName].count({
        where: whereCondition
      });

      exists = count > 0;
      attempts++;
    }

    if (exists) {
      throw new Error('Failed to generate unique file key');
    }

    return fileKey!;
  }

  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
