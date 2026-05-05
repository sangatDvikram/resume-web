import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminUserService } from '../../admin-user/admin-user.service';
import { AdminUser } from '../../admin-user/admin-user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminUserService: AdminUserService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<AdminUser> {
    const user = await this.adminUserService.findAndValidate(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
