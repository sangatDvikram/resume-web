import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from './admin-user.entity';
import { AdminUserService } from './admin-user.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser])],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
