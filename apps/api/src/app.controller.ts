import { Controller, Get, Redirect } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService, HealthResponse } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** GET / → redirect to Swagger UI */
  @Get()
  @Redirect('v1/docs', 302)
  @ApiExcludeEndpoint()
  root() {
    // Redirects to /v1/docs — excluded from Swagger to avoid circular reference.
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns API status and version.',
  })
  @ApiResponse({ status: 200, description: 'API is healthy.' })
  health(): HealthResponse {
    return this.appService.health();
  }
}
