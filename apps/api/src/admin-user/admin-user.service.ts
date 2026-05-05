import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AdminUser } from './admin-user.entity';

const SALT_ROUNDS = 12;

@Injectable()
export class AdminUserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    @InjectRepository(AdminUser)
    private readonly repo: Repository<AdminUser>,
    private readonly config: ConfigService,
  ) {}

  /** Seed the first admin user from env vars if the table is empty. */
  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) return;

      const email = this.config.get<string>('ADMIN_EMAIL');
      const password = this.config.get<string>('ADMIN_PASSWORD');

      if (!email || !password) {
        this.logger.warn(
          'ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping seed.',
        );
        return;
      }

      await this.create(email, password);
      this.logger.log(`Seeded admin user: ${email}`);
    } catch (err) {
      // Table may not exist yet (before first migration).
      this.logger.warn(`Admin seed skipped: ${(err as Error).message}`);
    }
  }

  async create(email: string, password: string): Promise<AdminUser> {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = this.repo.create({ email, passwordHash });
    return this.repo.save(user);
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.repo.findOne({ where: { email } });
  }

  async validatePassword(
    plain: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /** Find a user by e-mail and verify the password in one call. */
  async findAndValidate(
    email: string,
    password: string,
  ): Promise<AdminUser | null> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) return null;
    const valid = await this.validatePassword(password, user.passwordHash);
    return valid ? user : null;
  }
}
