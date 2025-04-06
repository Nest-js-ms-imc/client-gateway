import { RpcException } from '@nestjs/microservices';
import { ArgumentsHost } from '@nestjs/common';

import { RpcCustomExceptionFilter } from './use-case.exception';

describe('RpcCustomExceptionFilter', () => {
  let filter: RpcCustomExceptionFilter;

  const mockJson = jest.fn();
  const mockStatus = jest.fn(() => ({
    json: mockJson,
  }));

  const mockResponse = {
    status: mockStatus,
  };

  const mockArgumentsHost = {
    switchToHttp: jest.fn(() => ({
      getResponse: () => mockResponse,
    })),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    filter = new RpcCustomExceptionFilter();
    jest.clearAllMocks();
  });

  it('should return 500 if error contains "Empty response"', () => {
    const exception = new RpcException('Empty response. No subscribers.');
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: 500,
      message: 'View logs MS msg for more details',
    });
  });

  it('should return custom status and message if error is an object', () => {
    const exception = new RpcException({ status: 404, message: 'Not Found' });
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      status: 404,
      message: 'Not Found',
    });
  });

  it('should fallback to 400 if status is not a number', () => {
    const exception = new RpcException({
      status: 'invalid',
      message: 'Bad Request',
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: 'invalid',
      message: 'Bad Request',
    });
  });

  it('should return 400 if error is a string and not "Empty response"', () => {
    const exception = new RpcException('Generic error');
    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: 400,
      message: 'Generic error',
    });
  });
});
