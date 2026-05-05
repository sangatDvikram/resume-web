import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AdminJsModule } from './admin/admin.module';

async function bootstrap() {
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
    router.stack.splice(insertAt, 0, ...admin, ...jsonParser, ...urlencodedParser);
  };

  const app = await NestFactory.create(AppModule.withAdmin(adminModule));

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  });

  // ── Cookie parser (required for session cookies) ──────────────────────────
  app.use(cookieParser());

  // ── Start ─────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.info(`🚀 API running at http://localhost:${port}/v1`);
  console.info(`📚 Swagger docs at http://localhost:${port}/v1/docs`);
}

bootstrap();
