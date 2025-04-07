import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.decorator';
import { CurrentUser } from '../interfaces/current-user.interface';

describe('User Decorator', () => {
  const mockExecutionContext = (user?: CurrentUser): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should return the user from the request', () => {
    const ctx = mockExecutionContext({
      id: '1',
      name: 'mocked-user',
      email: 'mocked-user@example.com',
    });

    const result = User(null, ctx);
    expect(result).toBe({
      id: '1',
      name: 'mocked-user',
      email: 'mocked-user@example.com',
    });
  });

  it('should throw InternalServerErrorException if user is missing', () => {
    const ctx = mockExecutionContext(undefined);

    expect(() => User(null, ctx)).toThrow(InternalServerErrorException);
    expect(() => User(null, ctx)).toThrow(
      'User not found in request (AuthGuard called?)',
    );
  });
});
