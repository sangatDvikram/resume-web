/**
 * One-off CLI script — create an admin user.
 *
 * Usage:
 *   npm run create-admin
 *
 * The script prompts for email and password interactively, then re-uses
 * the existing DataSource so it honours the same DATABASE_URL /
 * DATABASE_URL_UNPOOLED env vars as the app.
 */

import 'reflect-metadata';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../src/database/data-source';
import { AdminUser } from '../src/admin-user/admin-user.entity';

const SALT_ROUNDS = 12;

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Suppress echoed characters so the password stays hidden
    (rl as any).stdoutMuted = true;
    (rl as any)._writeToOutput = (ch: string) => {
      if ((rl as any).stdoutMuted && ch !== '\n' && ch !== '\r\n') return;
      (rl as any).output.write(ch);
    };

    rl.question(question, (answer) => {
      process.stdout.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

async function main(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let email: string;
  let password: string;

  try {
    // ── Email ────────────────────────────────────────────────────────────────
    while (true) {
      email = (await prompt(rl, 'Email: ')).trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) break;
      console.error('  ✗ Invalid e-mail address, please try again.');
    }

    // ── Password ─────────────────────────────────────────────────────────────
    rl.close();
    while (true) {
      password = await promptPassword('Password (hidden): ');
      if (password.length >= 8) break;
      console.error('  ✗ Password must be at least 8 characters, please try again.');
    }
  } catch (err) {
    rl.close();
    throw err;
  }

  // Use unpooled URL for direct DDL-compatible connection (same as migrations)
  process.env.TYPEORM_CLI = 'true';

  console.log('Connecting to database…');
  await AppDataSource.initialize();

  try {
    const repo = AppDataSource.getRepository(AdminUser);

    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      console.error(`Admin user already exists: ${email}`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = repo.create({ email, passwordHash });
    await repo.save(user);

    console.log(`✓ Admin user created: ${email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Failed to create admin user:', err);
  process.exit(1);
});
