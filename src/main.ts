import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

import { InfraestructureModule } from './infraestructure.module';
import { EnvsService } from './secrets/envs.service';
import { RpcCustomExceptionFilter } from './shared/exceptions/use-case.exception';

async function bootstrap() {
  const app = await NestFactory.create(InfraestructureModule);
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

void bootstrap();
