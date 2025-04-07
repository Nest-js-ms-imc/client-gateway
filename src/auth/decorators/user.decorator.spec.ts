import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';

import { User } from './user.decorator';

jest.mock('@nestjs/common', () => {
  const originalModule = jest.requireActual('@nestjs/common');
  return {
    ...originalModule,
    createParamDecorator: (
      factory: (data: unknown, ctx: ExecutionContext) => unknown,
    ) => {
      const decorator = (data: unknown, ctx: ExecutionContext) => {
        return factory(data, ctx);
      };
      return decorator;
    },
  };
});

describe('User Decorator', () => {
  it('should extract user from request', () => {
    const mockUser = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    };

    const mockRequest = { user: mockUser };
    const mockGetRequest = jest.fn().mockReturnValue(mockRequest);
    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getRequest: mockGetRequest,
    });
    const mockExecutionContext = {
      switchToHttp: mockSwitchToHttp,
    } as unknown as ExecutionContext;

    // Llamamos al decorador real
    const result = User(undefined, mockExecutionContext);

    expect(result).toEqual(mockUser);
    expect(mockSwitchToHttp).toHaveBeenCalled();
    expect(mockGetRequest).toHaveBeenCalled();
  });

  it('should throw exception when user is not in request', () => {
    const mockRequest = { user: undefined };
    const mockGetRequest = jest.fn().mockReturnValue(mockRequest);
    const mockSwitchToHttp = jest.fn().mockReturnValue({
      getRequest: mockGetRequest,
    });
    const mockExecutionContext = {
      switchToHttp: mockSwitchToHttp,
    } as unknown as ExecutionContext;

    expect(() => {
      User(undefined, mockExecutionContext);
    }).toThrow(InternalServerErrorException);
    expect(() => {
      User(undefined, mockExecutionContext);
    }).toThrow('User not found in request (AuthGuard called?)');
  });
});
