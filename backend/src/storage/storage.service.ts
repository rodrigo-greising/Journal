import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';

@Injectable()
export class StorageService {
  static getMulterOptions() {
    return {
      storage: diskStorage({
        destination: './uploads/audio',
        filename: (
          req: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = randomUUID();
          const extension = extname(file.originalname);
          const filename = `${uniqueSuffix}${extension}`;
          callback(null, filename);
        },
      }),
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/')) {
          callback(null, true);
        } else {
          callback(new Error('Only audio files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    };
  }

  getAudioUrl(filename: string): string {
    return `http://localhost:3001/uploads/audio/${filename}`;
  }
}
