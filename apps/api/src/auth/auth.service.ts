import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUser } from '../admin-user/admin-user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  sign(user: AdminUser): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
