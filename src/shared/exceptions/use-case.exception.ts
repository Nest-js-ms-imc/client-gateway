import { Observable } from 'rxjs';
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();

    if (rpcError.toString().includes('Empty response'))
      return response.status(500).json({
        status: 500,
        message: 'View logs MS msg for more details',
      });

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(+(rpcError as any).status)
        ? 400
        : (rpcError as any).status;
      return response.status(status).json(rpcError);
    }
    return response.status(400).json({ status: 400, message: rpcError });
  }
}
