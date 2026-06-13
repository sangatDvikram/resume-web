import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AdminUser } from '../admin-user/admin-user.entity';

const mockUser = (): AdminUser => {
  const u = new AdminUser();
  u.id = 'user-1';
  u.email = 'admin@test.com';
  u.isActive = true;
  return u;
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('signTokens', () => {
    it('should return accessToken, refreshToken, and expiresIn', () => {
      configService.get.mockReturnValue('1d');
      jwtService.sign
        .mockReturnValueOnce('access.token')
        .mockReturnValueOnce('refresh.token');

      const result = service.signTokens(mockUser());

      expect(result.accessToken).toBe('access.token');
      expect(result.refreshToken).toBe('refresh.token');
      expect(result.expiresIn).toBe('1d');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('defaults expiresIn to "1d" when JWT_EXPIRES_IN is not set', () => {
      configService.get.mockReturnValue(undefined);
      jwtService.sign.mockReturnValue('token');

      const result = service.signTokens(mockUser());

      expect(result.expiresIn).toBe('1d');
    });

    it('embeds sub and email in the access token payload', () => {
      configService.get.mockReturnValue('1d');
      jwtService.sign.mockReturnValue('token');
      const user = mockUser();

      service.signTokens(user);

      const accessCall = jwtService.sign.mock.calls[0];
      expect(accessCall[0]).toMatchObject({ sub: user.id, email: user.email });
    });

    it('embeds type:"refresh" in the refresh token payload', () => {
      configService.get.mockReturnValue('1d');
      jwtService.sign.mockReturnValue('token');

      service.signTokens(mockUser());

      const refreshCall = jwtService.sign.mock.calls[1];
      expect(refreshCall[0]).toMatchObject({ type: 'refresh' });
    });
  });

  describe('verify', () => {
    it('delegates to jwtService.verify and returns the payload', () => {
      const payload = { sub: 'user-1', email: 'admin@test.com' };
      jwtService.verify.mockReturnValue(payload);

      const result = service.verify('some.token');

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith('some.token');
    });
  });
});
