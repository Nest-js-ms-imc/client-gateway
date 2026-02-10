import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

import { InfraestructureModule } from './infraestructure.module';
import { EnvsService } from './secrets/envs.service';
import { RpcCustomExceptionFilter } from './exceptions/use-case.exception';
import { envs } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  if (envsService.get('NODE_ENV') === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('API IMC')
      .setDescription('API for body mass index calculation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);
  }

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  await app.listen(envsService.get('PORT'));
  // await app.listen(envs.port);

  logger.log(`🚀 Gateway is running on port ${envsService.get('PORT')}`);
  // logger.log(`🚀 Gateway is running on port ${envs.port}`);
}

void bootstrap();
