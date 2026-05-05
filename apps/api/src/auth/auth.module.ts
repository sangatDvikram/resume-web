import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminUserModule } from '../admin-user/admin-user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    AdminUserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        privateKey: config
          .get<string>('JWT_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
        publicKey: config.get<string>('JWT_PUBLIC_KEY')?.replace(/\\n/g, '\n'),
        signOptions: {
          algorithm: 'RS256' as const,
          // Cast required: @nestjs/jwt uses ms `StringValue` type for expiresIn
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '1d') as '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
