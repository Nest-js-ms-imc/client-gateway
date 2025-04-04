import { RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { NatsClientProxy } from './nats-client-proxy';

describe('NatsClientProxy', () => {
  let service: NatsClientProxy;
  let mockClient: { send: jest.Mock };

  beforeEach(() => {
    mockClient = {
      send: jest.fn(),
    };

    service = new NatsClientProxy(mockClient as any);
  });

  it('should call client.send with correct pattern and data', async () => {
    const pattern = 'test.pattern';
    const data = { key: 'value' };
    const response = { success: true };

    mockClient.send.mockReturnValue(of(response));

    const result = await service.send(pattern, data).toPromise();

    expect(mockClient.send).toHaveBeenCalledWith(pattern, data);
    expect(result).toEqual(response);
  });

  it('should throw RpcException on error', async () => {
    const pattern = 'test.pattern';
    const data = { key: 'value' };
    const error = new Error('Test error');

    mockClient.send.mockReturnValue(throwError(() => error));

    await expect(service.send(pattern, data).toPromise()).rejects.toThrow(
      RpcException,
    );
  });
});
