import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key:    config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload an image buffer to Cloudinary.
   * Uses upload_stream so no temporary file hits disk.
   *
   * @param file   Multer file object (memory storage required).
   * @param folder Cloudinary folder — defaults to 'portfolio/blog'.
   */
  async uploadImage(
    file: Express.Multer.File,
    folder = 'portfolio/blog',
  ): Promise<UploadResult> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is empty. Ensure multer memory storage is enabled.');
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename:    true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error('Cloudinary upload returned no result'));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }
}
