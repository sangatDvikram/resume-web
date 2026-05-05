import {
  Controller,
  Post,
  Get,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AdminUser } from '../admin-user/admin-user.entity';

/** Name of the HTTP-only cookie that carries the refresh token. */
const REFRESH_COOKIE = 'refresh_token';

/** Cookie options shared between login (set) and logout (clear). */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  // secure is forced in production; disabled locally so plain-HTTP dev works
  secure: process.env.NODE_ENV === 'production',
  /** Cookie lives 30 days — matches refresh token TTL. */
  maxAge: 30 * 24 * 60 * 60 * 1000,
  /** Scope cookie to the refresh endpoint only, minimising exposure. */
  path: '/v1/auth/refresh',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Login ──────────────────────────────────────────────────────────────────

  /**
   * POST /v1/auth/login
   *
   * Validates email + password via LocalStrategy (bcrypt), then:
   * - Returns { accessToken, expiresIn } in the JSON body.
   * - Sets an HTTP-only Secure refresh-token cookie (30 d TTL, path-scoped).
   *
   * Rate-limited to 10 requests per 15 minutes per IP (login throttler).
   */
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle({ login: { ttl: 15 * 60 * 1000, limit: 10 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email + password — returns access token + sets refresh cookie' })
  login(
    @CurrentUser() user: AdminUser,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string; expiresIn: string } {
    const { accessToken, refreshToken, expiresIn } =
      this.authService.signTokens(user);

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken, expiresIn };
  }

  // ── Refresh ────────────────────────────────────────────────────────────────

  /**
   * POST /v1/auth/refresh
   *
   * Reads the refresh-token cookie, verifies it via JwtRefreshGuard, then
   * issues a fresh access token + rotates the refresh cookie.
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Rotate refresh cookie — returns new access token' })
  refresh(
    @CurrentUser() user: AdminUser,
    @Res({ passthrough: true }) res: Response,
  ): { accessToken: string; expiresIn: string } {
    const { accessToken, refreshToken, expiresIn } =
      this.authService.signTokens(user);

    res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken, expiresIn };
  }

  // ── Me ─────────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Return current authenticated admin user' })
  me(@CurrentUser() user: AdminUser) {
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  /**
   * POST /v1/auth/logout
   *
   * Clears the refresh-token cookie and returns 204.
   * The client is responsible for discarding the access token locally.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout — clears refresh cookie, client drops access token' })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });
  }
}
