import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

import { InfrastructureModule } from './infrastructure.module';
import { EnvsService } from './secrets/envs.service';
import { RpcCustomExceptionFilter } from './shared/exceptions/use-case.exception';

async function bootstrap() {
  const app = await NestFactory.create(InfrastructureModule);
  const logger = new Logger('Main-Gateway');

  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: '',
        method: RequestMethod.GET,
      },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const envsService = app.get(EnvsService);

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  await app.listen(envsService.get('PORT'));

  logger.log(`🚀 Gateway is running on port ${envsService.get('PORT')}`);
}

bootstrap()
  .then()
  .catch((error: Error) => {
    console.error('Application failed to start:', error);
    process.exit(1);
  });
