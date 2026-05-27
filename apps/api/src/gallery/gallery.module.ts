import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from '../entities/album.entity';
import { Photo } from '../entities/photo.entity';
import { UploadModule } from '../upload/upload.module';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, Photo]),
    UploadModule,
  ],
  providers:   [GalleryService],
  controllers: [GalleryController],
  exports:     [GalleryService],
})
export class GalleryModule {}
