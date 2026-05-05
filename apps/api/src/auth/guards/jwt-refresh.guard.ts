import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that validates the HTTP-only refresh-token cookie via JwtRefreshStrategy. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
