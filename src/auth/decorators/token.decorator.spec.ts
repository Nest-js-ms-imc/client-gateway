import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { Token } from './token.decorator';

describe('Token', () => {
  it('should return the token from the request', () => {
    const mockCtx: Partial<ExecutionContext> = {
      switchToHttp: () =>
        ({
          getRequest: () => ({ token: 'mocked-token' }),
          getResponse: () => ({}),
          getNext: () => ({}),
        }) as any,
    };

    const result = Token(undefined, mockCtx as ExecutionContext);
    expect(result).toBe('mocked-token');
  });

  it('should throw InternalServerErrorException if token is missing', () => {
    const mockCtx: Partial<ExecutionContext> = {
      switchToHttp: () =>
        ({
          getRequest: () => ({}),
          getResponse: () => ({}),
          getNext: () => ({}),
        }) as any,
    };

    expect(() => Token(undefined, mockCtx as ExecutionContext)).toThrow(
      InternalServerErrorException,
    );
  });
});
