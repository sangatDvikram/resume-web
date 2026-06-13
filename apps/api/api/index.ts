/**
 * Vercel serverless entry-point for apps/api (NestJS 10).
 *
 * WHY dist/ imports instead of src/:
 *   @vercel/node compiles TypeScript via esbuild, which does NOT support
 *   `emitDecoratorMetadata`. NestJS's DI relies on it. Importing the pre-compiled
 *   CommonJS output from dist/ (produced by `nest build` in vercel.json
 *   buildCommand) sidesteps the issue: tsc compiled the decorators correctly, and
 *   this file only glues them together without introducing new decorated classes.
 *
 * Cold-start note:
 *   AdminJS compiles its React bundle on first boot (~3-6 s). The `cachedApp`
 *   singleton is reused across warm invocations in the same Lambda container.
 */

import 'reflect-metadata';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { IncomingMessage, ServerResponse } from 'http';

// Loaded from pre-compiled dist/ — types sourced from sibling .d.ts files.
/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } =
  require('../dist/app.module') as typeof import('../src/app.module');
const { AdminJsModule } =
  require('../dist/admin/admin.module') as typeof import('../src/admin/admin.module');
/* eslint-enable @typescript-eslint/no-require-imports */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedApp: any;

async function bootstrap(): Promise<any> {
  if (cachedApp) return cachedApp;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const esmImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;

  const adminModule = await AdminJsModule.createAsync();

  // ── @adminjs/nestjs compatibility fix (verbatim from main.ts) ──────────────
  // ExpressLoader.reorderRoutes() reads `app.router` which Express 4 defines as
  // a non-configurable throwing getter; patch the prototype to use `app._router`.
  const { ExpressLoader } = await esmImport('@adminjs/nestjs');
  ExpressLoader.prototype.reorderRoutes = function (app: any) {
    const router = app._router;
    if (!app || !router || !router.stack) return;
    let jsonParser: any[] = [];
    let urlencodedParser: any[] = [];
    let admin: any[] = [];
    const jsonIdx = router.stack.findIndex((l: any) => l.name === 'jsonParser');
    if (jsonIdx >= 0) jsonParser = router.stack.splice(jsonIdx, 1);
    const urlIdx = router.stack.findIndex((l: any) => l.name === 'urlencodedParser');
    if (urlIdx >= 0) urlencodedParser = router.stack.splice(urlIdx, 1);
    const adminIdx = router.stack.findIndex((l: any) => l.name === 'admin');
    if (adminIdx >= 0) admin = router.stack.splice(adminIdx, 1);
    const corsIdx  = router.stack.findIndex((l: any) => l.name === 'corsMiddleware');
    const initIdx  = router.stack.findIndex((l: any) => l.name === 'expressInit');
    const insertAt = (corsIdx >= 0 ? corsIdx : initIdx) + 1;
    router.stack.splice(insertAt, 0, ...admin, ...jsonParser, ...urlencodedParser);
  };

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.withAdmin(adminModule),
  );

  // ── Static assets ──────────────────────────────────────────────────────────
  // __dirname = /var/task/api/ on Vercel; public/ lands at /var/task/public/
  // via vercel.json includeFiles.
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // ── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins: (string | RegExp)[] = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
  ];
  const extra = process.env.EXTRA_CORS_ORIGINS;
  if (extra) {
    extra.split(',').map(o => o.trim()).filter(Boolean).forEach(o => allowedOrigins.push(o));
  }
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin),
      )) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400,
  });

  // ── Global prefix + validation ─────────────────────────────────────────────
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // ── Swagger (opt-in; set SWAGGER_ENABLED=true in Vercel env to enable) ─────
  if (process.env.SWAGGER_ENABLED === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Portfolio CMS API')
      .setDescription('REST API for the Portfolio CMS platform.')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .build();
    SwaggerModule.setup('v1/docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ── Cookie parser ──────────────────────────────────────────────────────────
  app.use(cookieParser());

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const expressApp = await bootstrap();
  return expressApp(req, res);
}
