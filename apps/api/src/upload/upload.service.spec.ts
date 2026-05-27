import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';

// Prevent real Cloudinary config from running
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: { upload_stream: jest.fn() },
  },
}));

import { v2 as cloudinary } from 'cloudinary';

const makeFile = (buffer: Buffer, mimetype = 'image/jpeg'): Express.Multer.File =>
  ({ buffer, mimetype, originalname: 'test.jpg', size: buffer.length } as Express.Multer.File);

const jpegBuffer = () => Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array(20).fill(0x00)]);
const pngBuffer  = () => Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Array(12).fill(0x00)]);
const webpBuffer = () => {
  const b = Buffer.alloc(24);
  b.write('RIFF', 0, 'ascii');
  b.write('WEBP', 8, 'ascii');
  return b;
};
const invalidBuffer = () => Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-value') },
        },
      ],
    }).compile();

    service = module.get(UploadService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('uploadImage — magic-byte validation', () => {
    it('throws BadRequestException for an empty buffer', async () => {
      await expect(service.uploadImage({ buffer: null } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for an unrecognized file signature', async () => {
      await expect(service.uploadImage(makeFile(invalidBuffer())))
        .rejects.toThrow(BadRequestException);
    });

    it('accepts a JPEG file and calls Cloudinary upload_stream', async () => {
      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts: unknown, cb: (err: null, result: object) => void) => {
          cb(null, { secure_url: 'https://example.com/img.jpg', public_id: 'pid' });
          return mockStream;
        },
      );

      const result = await service.uploadImage(makeFile(jpegBuffer()));
      expect(result.url).toBe('https://example.com/img.jpg');
      expect(result.publicId).toBe('pid');
    });

    it('accepts a PNG file', async () => {
      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts: unknown, cb: (err: null, result: object) => void) => {
          cb(null, { secure_url: 'https://example.com/img.png', public_id: 'pid2' });
          return mockStream;
        },
      );

      const result = await service.uploadImage(makeFile(pngBuffer(), 'image/png'));
      expect(result.url).toContain('img.png');
    });

    it('accepts a WebP file', async () => {
      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts: unknown, cb: (err: null, result: object) => void) => {
          cb(null, { secure_url: 'https://example.com/img.webp', public_id: 'pid3' });
          return mockStream;
        },
      );

      const result = await service.uploadImage(makeFile(webpBuffer(), 'image/webp'));
      expect(result.url).toContain('img.webp');
    });

    it('rejects when Cloudinary returns an error', async () => {
      const mockStream = { end: jest.fn() };
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (_opts: unknown, cb: (err: Error, result: null) => void) => {
          cb(new Error('Cloudinary error'), null);
          return mockStream;
        },
      );

      await expect(service.uploadImage(makeFile(jpegBuffer())))
        .rejects.toThrow('Cloudinary error');
    });
  });
});
