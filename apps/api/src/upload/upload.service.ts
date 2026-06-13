import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { ExifDto } from '../gallery/dto/gallery.dto';

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface PhotoUploadResult {
  publicId: string;
  originalUrl: string;
  thumbUrl: string;
  lqipUrl: string;
  width: number;
  height: number;
  exif: ExifDto | null;
}

// ── Magic-byte validators ─────────────────────────────────────────────────────

/**
 * E10-S2: File type signatures detected from the first 12 bytes of the buffer.
 *
 * References:
 *  - JPEG: SOI marker FF D8 FF
 *  - PNG:  89 50 4E 47 0D 0A 1A 0A
 *  - GIF:  GIF87a / GIF89a
 *  - WebP: RIFF....WEBP (bytes 8-11)
 *  - MP4:  ftyp box at offset 4 (bytes 4-7 = "ftyp")
 *  - MOV:  ftyp box with "qt  " brand OR mdat/moov atom — also "ftyp" at offset 4
 */
const IMAGE_SIGNATURES: Array<{
  mime: string;
  bytes: number[];
  offset: number;
}> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff], offset: 0 },
  {
    mime: 'image/png',
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    offset: 0,
  },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38], offset: 0 },
  { mime: 'image/webp', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
];

const VIDEO_SIGNATURES: Array<{
  mime: string;
  bytes: number[];
  offset: number;
}> = [
  // MP4 & MOV both use ISO Base Media File Format with "ftyp" at byte offset 4
  { mime: 'video/mp4', bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // "ftyp"
  // QuickTime MOV files also start with ftyp, but the brand (bytes 8-11) is "qt  "
  { mime: 'video/quicktime', bytes: [0x71, 0x74, 0x20, 0x20], offset: 8 }, // "qt  "
];

function matchSig(buf: Buffer, sigs: typeof IMAGE_SIGNATURES): string | null {
  for (const sig of sigs) {
    if (buf.length < sig.offset + sig.bytes.length) continue;
    const slice = [...buf.subarray(sig.offset, sig.offset + sig.bytes.length)];
    if (sig.bytes.every((b, i) => b === slice[i])) return sig.mime;
  }
  return null;
}

/** Detect image MIME type from file buffer. Returns null if unrecognized. */
function detectImageMime(buf: Buffer): string | null {
  return matchSig(buf, IMAGE_SIGNATURES);
}

/** Detect video MIME type from file buffer. Returns null if unrecognized. */
function detectVideoMime(buf: Buffer): string | null {
  // Both MP4 and MOV share the ftyp sig at offset 4 — check MOV brand first
  return (
    matchSig(buf, VIDEO_SIGNATURES.slice(1)) ??
    matchSig(buf, VIDEO_SIGNATURES.slice(0, 1))
  );
}

/** Detect any allowed MIME type (image or video). */
function detectMime(buf: Buffer): string | null {
  return detectImageMime(buf) ?? detectVideoMime(buf);
}

@Injectable()
export class UploadService {
  // ConfigService is only needed at construction time to configure Cloudinary.
  // It is not stored as an instance property to satisfy TS6138 (noUnusedLocals).
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
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
      throw new BadRequestException(
        'File buffer is empty. Ensure multer memory storage is enabled.',
      );
    }

    // E10-S2: magic-byte validation — reject spoofed image files
    const detectedMime = detectImageMime(file.buffer);
    if (!detectedMime) {
      throw new BadRequestException(
        'Invalid file type. Accepted: JPEG, PNG, WebP, GIF.',
      );
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error ?? new Error('Cloudinary upload returned no result'),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  /**
   * Upload a photo to Cloudinary for the gallery.
   * Validates magic bytes, extracts EXIF metadata, and constructs LQIP URL.
   *
   * @param file   Multer file object (memory storage required).
   * @param folder Cloudinary folder — defaults to 'portfolio/gallery'.
   */
  async uploadPhoto(
    file: Express.Multer.File,
    folder = 'portfolio/gallery',
  ): Promise<PhotoUploadResult> {
    if (!file?.buffer) {
      throw new BadRequestException('File buffer is empty.');
    }

    // Magic-byte validation — rejects files whose extension was spoofed
    const detectedMime = detectMime(file.buffer);
    if (!detectedMime) {
      throw new BadRequestException(
        'Invalid file type. Accepted: JPEG, PNG, WebP, GIF.',
      );
    }

    return new Promise<PhotoUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
          image_metadata: true, // request EXIF from Cloudinary
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error ?? new Error('Cloudinary upload returned no result'),
            );
          }

          const publicId = result.public_id;
          const originalUrl = result.secure_url;

          // Construct on-the-fly transformation URLs via Cloudinary URL params
          const thumbUrl = originalUrl.replace(
            '/upload/',
            '/upload/c_fill,w_400,f_auto,q_auto/',
          );
          const lqipUrl = originalUrl.replace(
            '/upload/',
            '/upload/e_blur:2000,q_1,f_auto/',
          );

          // Map EXIF from Cloudinary response (keys follow Exif standard names)
          const meta: Record<string, string> =
            (result as any).image_metadata ?? {};
          const exif: ExifDto | null = Object.keys(meta).length
            ? {
                make: meta['Make'],
                model: meta['Model'],
                focalLength: meta['FocalLength'],
                aperture: meta['FNumber'],
                iso: meta['ISOSpeedRatings'],
                shutterSpeed: meta['ExposureTime'],
              }
            : null;

          resolve({
            publicId,
            originalUrl,
            thumbUrl,
            lqipUrl,
            width: result.width,
            height: result.height,
            exif,
          });
        },
      );
      stream.end(file.buffer);
    });
  }
}
