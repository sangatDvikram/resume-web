import { Global, Module } from '@nestjs/common';
import { SqidsService } from './sqids.service';

/**
 * SqidsModule
 *
 * A global module that provides `SqidsService` to every feature module in the
 * application without needing to import it explicitly.
 *
 * Registered in `AppModule` via `SqidsModule` in the imports array.
 */
@Global()
@Module({
  providers: [SqidsService],
  exports: [SqidsService],
})
export class SqidsModule {}
