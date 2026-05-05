import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '../../admin-user/admin-user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminUser }>();
    return request.user;
  },
);
