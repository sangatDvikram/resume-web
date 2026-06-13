import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminUser } from '../admin-user/admin-user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Human-readable TTL string for the access token, e.g. "1d". */
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Sign a short-lived access token + long-lived refresh token for the user.
   * The refresh token carries `type: 'refresh'` so the jwt-refresh strategy
   * can reject plain access tokens presented to the refresh endpoint.
   */
  signTokens(user: AdminUser): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '1d';

    const accessToken = this.jwtService.sign(payload, { expiresIn } as object);
    const refreshToken = this.jwtService.sign({ ...payload, type: 'refresh' }, {
      expiresIn: '30d',
    } as object);

    return { accessToken, refreshToken, expiresIn };
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
