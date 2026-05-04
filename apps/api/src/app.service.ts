import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  version: string;
  timestamp: string;
  environment: string;
}

@Injectable()
export class AppService {
  health(): HealthResponse {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.0.1',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    };
  }
}
