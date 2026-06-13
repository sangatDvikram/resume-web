import http from 'http';
import path from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AdminJsModule } from './admin/admin.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3001);

  // ── Early healthcheck server ───────────────────────────────────────────────
  // Railway fires its HTTP healthcheck immediately when the container starts.
  // AdminJS + NestJS bootstrap takes ~3–6 s, so the port is closed during that
  // window → Railway gets ECONNREFUSED → "Network error" → deployment fails.
  //
  // Fix: bind the port NOW with a minimal HTTP server that responds 200 to
  // /v1/health (and 503 to everything else) while the real app is booting.
  // Once NestJS is fully up, we close this server and hand the port to NestJS.
  const earlyServer = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/v1/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'starting' }));
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'booting' }));
    }
  });
  await new Promise<void>((resolve) => earlyServer.listen(port, resolve));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const esmImport = new Function('m', 'return import(m)') as (
    m: string,
  ) => Promise<any>;

  const adminModule = await AdminJsModule.createAsync();

  // ── @adminjs/nestjs compatibility fix ─────────────────────────────────────
  // ExpressLoader.reorderRoutes() reads `app.router`, which Express 4 defines
  // as a non-configurable throwing getter on every app instance — it cannot be
  // overridden with Object.defineProperty or lodash set(). Instead we patch the
  // prototype method itself to use `app._router` (the real Express 4 router)
  // before NestFactory.create() triggers onModuleInit and calls reorderRoutes.
  const { ExpressLoader } = await esmImport('@adminjs/nestjs');
  ExpressLoader.prototype.reorderRoutes = function (app: any) {
    const router = app._router;
    if (!app || !router || !router.stack) return;
    let jsonParser: any[] = [];
    let urlencodedParser: any[] = [];
    let admin: any[] = [];
    const jsonIdx = router.stack.findIndex((l: any) => l.name === 'jsonParser');
    if (jsonIdx >= 0) jsonParser = router.stack.splice(jsonIdx, 1);
    const urlIdx = router.stack.findIndex(
      (l: any) => l.name === 'urlencodedParser',
    );
    if (urlIdx >= 0) urlencodedParser = router.stack.splice(urlIdx, 1);
    const adminIdx = router.stack.findIndex((l: any) => l.name === 'admin');
    if (adminIdx >= 0) admin = router.stack.splice(adminIdx, 1);
    const corsIdx = router.stack.findIndex(
      (l: any) => l.name === 'corsMiddleware',
    );
    const initIdx = router.stack.findIndex(
      (l: any) => l.name === 'expressInit',
    );
    const insertAt = (corsIdx >= 0 ? corsIdx : initIdx) + 1;
    router.stack.splice(
      insertAt,
      0,
      ...admin,
      ...jsonParser,
      ...urlencodedParser,
    );
  };

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.withAdmin(adminModule),
  );

  // ── Static assets (favicon, etc.) ────────────────────────────────────────
  app.useStaticAssets(path.join(process.cwd(), 'public'));

  // ── CORS (E10-S7) ─────────────────────────────────────────────────────────
  // Strict allowlist: only the configured frontend origin is permitted.
  // The /\.vercel\.app$/ wildcard has been removed to prevent any Vercel
  // preview deployment from calling the production API without explicit approval.
  // Add additional origins via EXTRA_CORS_ORIGINS (comma-separated).
  const allowedOrigins: (string | RegExp)[] = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    'http://localhost:3001',
  ];
  if (process.env.API_EXTERNAL_URL) {
    allowedOrigins.push(process.env.API_EXTERNAL_URL);
  }
  const extra = process.env.EXTRA_CORS_ORIGINS;
  if (extra) {
    extra
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => allowedOrigins.push(o));
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header) and allowed origins
      if (
        !origin ||
        allowedOrigins.some((o) =>
          typeof o === 'string' ? o === origin : o.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400, // preflight cache: 24 h
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ── Global validation pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Portfolio CMS API')
    .setDescription(
      'REST API for the Portfolio CMS platform — resume, blog, projects, gallery, and media management.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('resume', 'Resume data endpoints')
    .addTag('blog', 'Blog post endpoints')
    .addTag('projects', 'Project showcase endpoints')
    .addTag('gallery', 'Photography gallery endpoints')
    .addTag('upload', 'Media upload endpoints')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('v1/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customfavIcon: '/apple-icon-57x57.png',
  });

  // ── Cookie parser (required for session cookies) ──────────────────────────
  app.use(cookieParser());

  // ── Hand off port from early server to NestJS ────────────────────────────
  await new Promise<void>((resolve, reject) =>
    earlyServer.close((err) => (err ? reject(err) : resolve())),
  );
  await app.listen(port);
  console.info(`🚀 API running at http://localhost:${port}/v1`);
  console.info(`📚 Swagger docs at http://localhost:${port}/v1/docs`);
}

bootstrap();
