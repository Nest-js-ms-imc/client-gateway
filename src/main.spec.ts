import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { InfraestructureModule } from './infraestructure.module';
import { EnvsService } from './secrets/envs.service';
import { RpcCustomExceptionFilter } from './exceptions/use-case.exception';
import { envs } from './config/envs';

jest.mock('@nestjs/core', () => {
  const useGlobalPipes = jest.fn();
  const useGlobalFilters = jest.fn();
  const setGlobalPrefix = jest.fn();
  const listen = jest.fn();
  const get = jest.fn().mockImplementation((token) => {
    if (token === EnvsService) {
      return { get: jest.fn().mockReturnValue(3002) };
    }
  });

  return {
    NestFactory: {
      create: jest.fn().mockResolvedValue({
        useGlobalPipes,
        useGlobalFilters,
        setGlobalPrefix,
        listen,
        get,
      }),
    },
  };
});

describe('Main Bootstrap', () => {
  it('should bootstrap the application successfully', async () => {
    process.env.NODE_ENV = 'dev';

    await import('./main');

    const { NestFactory } = await import('@nestjs/core');
    const mockApp = await (NestFactory as any).create.mock.results[0].value;

    expect(NestFactory.create).toHaveBeenCalledWith(InfraestructureModule);
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith(
      'api',
      expect.anything(),
    );
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockApp.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(RpcCustomExceptionFilter),
    );
    expect(mockApp.listen).toHaveBeenCalledWith(3002);
  });
});
