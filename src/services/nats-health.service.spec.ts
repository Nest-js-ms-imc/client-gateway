import { Test, TestingModule } from '@nestjs/testing';
import { NatsHealthService } from './nats-health.service';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError, TimeoutError } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

describe('NatsHealthService', () => {
  let service: NatsHealthService;
  let clientProxy: ClientProxy;

  const mockClientProxy = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NatsHealthService,
        {
          provide: 'NATS_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<NatsHealthService>(NatsHealthService);
    clientProxy = module.get<ClientProxy>('NATS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call client.send with "auth.verify.user"', async () => {
    mockClientProxy.send.mockReturnValue(of({}));

    await expect(service.checkConnection()).resolves.toBeUndefined();
    expect(mockClientProxy.send).toHaveBeenCalledWith('auth.verify.user', {});
  });

  it('should throw UnauthorizedException when NATS times out', async () => {
    jest
      .spyOn(clientProxy, 'send')
      .mockReturnValue(throwError(() => new TimeoutError()));

    // ⛔ silenciar el console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(service.checkConnection()).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException on generic error', async () => {
    const genericError = new Error('Something went wrong');
    mockClientProxy.send.mockReturnValue(throwError(() => genericError));

    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(service.checkConnection()).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
