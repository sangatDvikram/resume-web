import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AdminUserService } from '../../admin-user/admin-user.service';
import { AdminUser } from '../../admin-user/admin-user.entity';
import { JwtPayload } from './jwt.strategy';

/** Extended payload shape — refresh tokens carry a `type` discriminator. */
interface RefreshPayload extends JwtPayload {
  type: string;
}

/**
 * Passport strategy for refresh-token verification.
 *
 * Extracts the refresh token from the HTTP-only `refresh_token` cookie,
 * verifies the RS256 signature with the public key, rejects any token that
 * does not carry `type === 'refresh'`, and resolves the `AdminUser` record.
 *
 * Named 'jwt-refresh' so it can be referenced by JwtRefreshGuard without
 * conflicting with the default 'jwt' access-token strategy.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly adminUserService: AdminUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (
            (req?.cookies?.['refresh_token'] as string | undefined) ?? null
          );
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: (config.get<string>('JWT_PUBLIC_KEY') ?? '').replace(
        /\\n/g,
        '\n',
      ),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: RefreshPayload): Promise<AdminUser> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.adminUserService.findByEmail(payload.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
