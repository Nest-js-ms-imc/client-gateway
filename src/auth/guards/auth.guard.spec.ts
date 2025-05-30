import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';

import { AuthGuard } from './auth.guard';
import { NATS_SERVICE } from '../../config';
import { NatsClientProxy } from '../../services';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let clientProxyMock: Partial<ClientProxy>;
  let natsClientProxy: NatsClientProxy;

  beforeEach(async () => {
    clientProxyMock = {
      send: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: NATS_SERVICE,
          useValue: clientProxyMock,
        },
        {
          provide: NatsClientProxy,
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    guard = moduleRef.get<AuthGuard>(AuthGuard);
    clientProxyMock = moduleRef.get<ClientProxy>(NATS_SERVICE);
    natsClientProxy = moduleRef.get<NatsClientProxy>(NatsClientProxy);
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow request if token is valid', async () => {
    const mockUser = { id: 'user-id' };
    const mockToken = 'new-token';

    (clientProxyMock.send as jest.Mock).mockReturnValue(
      of({ user: mockUser, token: mockToken }),
    );

    const context = createMockContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(clientProxyMock.send).toHaveBeenCalledWith('auth.verify.user', {
      token: 'valid-token',
    });
  });

  it('should allow request if user not found', async () => {
    const mockUser = undefined;
    const mockToken = 'new-token';

    (clientProxyMock.send as jest.Mock).mockReturnValue(
      of({ token: mockToken }),
    );

    const context = createMockContext('Bearer valid-token');

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(clientProxyMock.send).toHaveBeenCalledWith('auth.verify.user', {
      token: 'valid-token',
    });
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    const context = createMockContext();

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (clientProxyMock.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('Invalid token')),
    );

    const context = createMockContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when user is null', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(clientProxyMock, 'send').mockReturnValueOnce(of(null));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      new UnauthorizedException('User not found'),
    );
  });
});
