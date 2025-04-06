import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

import { InfraestructureModule } from './infraestructure.module';
import { EnvsService } from './secrets/envs.service';
import { RpcCustomExceptionFilter } from './exceptions/use-case.exception';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');

  const app = await NestFactory.create(InfraestructureModule);

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
  // await app.listen(envs.port);

  logger.log(`🚀 Gateway is running on port ${envsService.get('PORT')}`);
  // logger.log(`🚀 Gateway is running on port ${envs.port}`);
}

void bootstrap();
